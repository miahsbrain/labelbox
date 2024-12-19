from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
import uuid


from ..database import get_db
from ..models import Image, Annotation, Tag
from ..schemas import AnnotationSchema, AnnotationCreateSchema, TagSchema

router = APIRouter()


@router.get("/{image_id}/annotations", response_model=List[AnnotationSchema])
async def get_image_annotations(image_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Annotation).where(Annotation.image_id == image_id).options(selectinload(Annotation.tag))
    )
    annotations = result.scalars().all()
    return [
        AnnotationSchema(
            id=annotation.id,
            image_id=annotation.image_id,
            x=annotation.x,
            y=annotation.y,
            width=annotation.width,
            height=annotation.height,
            tag=TagSchema.model_validate(annotation.tag).model_dump()  # Convert Tag to TagSchema
        )
        for annotation in annotations
    ]

@router.post("/{image_id}/annotations", response_model=AnnotationSchema)
async def create_image_annotation(image_id: str, annotation: AnnotationCreateSchema, db: AsyncSession = Depends(get_db)):
    # Check if the image exists
    result = await db.execute(select(Image).where(Image.id == image_id))
    image = result.scalars().first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Check if the tag exists or create a new one
    tag_result = await db.execute(select(Tag).where(Tag.name == annotation.tag.name.lower()))
    tag = tag_result.scalars().first()
    if not tag:
        tag = Tag(name=annotation.tag.name.lower())
        db.add(tag)
        await db.commit()
        await db.refresh(tag)

    # Create a new annotation
    new_annotation = Annotation(
        id=str(uuid.uuid4()),
        image_id=image_id,
        tag_id=tag.id,  # Link the tag by ID
        x=annotation.x,
        y=annotation.y,
        width=annotation.width,
        height=annotation.height
    )
    db.add(new_annotation)
    await db.commit()
    await db.refresh(new_annotation)

    # Convert the annotation to the expected schema
    return AnnotationSchema(
        id=new_annotation.id,
        image_id=new_annotation.image_id,
        x=new_annotation.x,
        y=new_annotation.y,
        width=new_annotation.width,
        height=new_annotation.height,
        tag=TagSchema.model_validate(tag).model_dump()  # Convert the Tag model to TagSchema
    )


@router.delete("/{image_id}/annotations/{annotation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_annotation_from_image(image_id: str, annotation_id: str, db: AsyncSession = Depends(get_db)):
    # Check if the annotation exists and belongs to the specified image
    result = await db.execute(
        select(Annotation)
        .where(Annotation.id == annotation_id)
        .where(Annotation.image_id == image_id)
    )
    annotation = result.scalars().first()

    if not annotation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Annotation not found for the specified image",
        )

    # Delete the annotation
    await db.delete(annotation)
    await db.commit()

    return {"message": "Annotation deleted successfully"}
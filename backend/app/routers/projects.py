from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from typing import List
import uuid
from pathlib import Path

from ..database import get_db
from ..models import Project, Image, Tag, Annotation
from ..schemas import ProjectSchema, ProjectCreateSchema, ImageSchema, TagSchema, TagCreateSchema, AnnotationSchema

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.get("/", response_model=List[ProjectSchema])
async def get_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Project, func.count(Image.id).label("image_count"))
        .outerjoin(Image)
        .group_by(Project.id)
    )
    projects = []
    for project, image_count in result:
        project_dict = ProjectSchema.model_validate(project).model_dump()
        project_dict["image_count"] = image_count
        projects.append(ProjectSchema(**project_dict))
    return projects

@router.post("/", response_model=ProjectSchema)
async def create_project(project: ProjectCreateSchema, db: AsyncSession = Depends(get_db)):
    db_project = Project(
        id=str(uuid.uuid4()),
        name=project.name,
        description=project.description
    )
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    return ProjectSchema(
        **db_project.__dict__,
        image_count=0
    )

@router.get("/{project_id}", response_model=ProjectSchema)
async def get_project(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Project, func.count(Image.id).label("image_count"))
        .outerjoin(Image)
        .where(Project.id == project_id)
        .group_by(Project.id)
    )
    project_data = result.first()
    if not project_data:
        raise HTTPException(status_code=404, detail="Project not found")
    project, image_count = project_data
    project_dict = ProjectSchema.model_validate(project).model_dump()
    project_dict["image_count"] = image_count
    return ProjectSchema(**project_dict)

@router.get("/{project_id}/images", response_model=List[ImageSchema])
async def get_project_images(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Image).where(Image.project_id == project_id).options(joinedload(Image.annotations).joinedload(Annotation.tag))
    )
    images_with_annotations = result.unique().scalars().all()

    # Format the response
    return [
        ImageSchema(
            id=image.id,
            url=image.url,
            filename=image.filename,
            project_id=image.project_id,
            created_at=image.created_at,
            annotations=[
                AnnotationSchema(
                    id=annotation.id,
                    image_id=image.id,
                    x=annotation.x,
                    y=annotation.y,
                    width=annotation.width,
                    height=annotation.height,
                    tag=TagSchema(
                        id=annotation.tag.id,
                        name=annotation.tag.name,
                    ) if annotation.tag else None,
                )
                for annotation in image.annotations
            ],
        )
        for image in images_with_annotations
    ]

@router.post("/{project_id}/images", response_model=List[ImageSchema])
async def upload_project_images(project_id: str, files: List[UploadFile] = File(...), db: AsyncSession = Depends(get_db)):
    # Verify project exists
    project = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    if not project.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")

    for file in files:
        # Save file
        file_id = str(uuid.uuid4())
        extension = Path(file.filename).suffix
        file_path = UPLOAD_DIR / f"{file_id}{extension}"
        
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        # Create database record
        db_image = Image(
            id=file_id,
            filename=file.filename,
            url=f"/uploads/{file_path.name}",
            project_id=project_id
        )
        db.add(db_image)

    await db.commit()
    
    result = await db.execute(
        select(Image).where(Image.project_id == project_id).options(joinedload(Image.annotations).joinedload(Annotation.tag))
    )
    images_with_annotations = result.unique().scalars().all()

    # Format the response
    return [
        ImageSchema(
            id=image.id,
            url=image.url,
            filename=image.filename,
            project_id=image.project_id,
            created_at=image.created_at,
            annotations=[
                AnnotationSchema(
                    id=annotation.id,
                    image_id=image.id,
                    x=annotation.x,
                    y=annotation.y,
                    width=annotation.width,
                    height=annotation.height,
                    tag=TagSchema(
                        id=annotation.tag.id,
                        name=annotation.tag.name,
                    ) if annotation.tag else None,
                )
                for annotation in image.annotations
            ],
        )
        for image in images_with_annotations
    ]

@router.get("/{project_id}/tags", response_model=List[TagSchema])
async def get_project_tags(project_id: str, db: AsyncSession=Depends(get_db)):
    # Query the project by ID with its tags
    result = await db.execute(
        select(Project).where(Project.id == project_id).options(joinedload(Project.tags))
    )
    project = result.scalars().first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Extract the tags
    # tags = [tag.name for tag in project.tags]

    return project.tags

@router.post("/{project_id}/tags", response_model=List[TagSchema])
async def add_new_tag(project_id: str, new_tag: TagCreateSchema, db: AsyncSession=Depends(get_db)):
    # Fetch the project by ID
    result = await db.execute(select(Project).where(Project.id == project_id).options(joinedload(Project.tags)))
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if the tag already exists
    result = await db.execute(select(Tag).where(Tag.name == new_tag.name.lower()))
    tag = result.scalars().first()

    if not tag:
        tag_id = str(uuid.uuid4())
        # If the tag doesn't exist, create it
        tag = Tag(id=tag_id, name=new_tag.name.lower())
        db.add(tag)
        await db.commit()
        await db.refresh(tag)

    # Add the tag to the project if it's not already associated
    if tag not in project.tags:
        project.tags.append(tag)
        await db.commit()
        await db.refresh(project)

    # tags = [tag.name for tag in project.tags]

    return project.tags
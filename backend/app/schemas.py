from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# Project schemas
class ProjectBaseSchema(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreateSchema(ProjectBaseSchema):
    pass

class ProjectSchema(ProjectBaseSchema):
    id: str
    created_at: datetime
    image_count: int = 0

    class Config:
        from_attributes = True

# Tag schemas
class TagBaseSchema(BaseModel):
    name: str

class TagCreateSchema(TagBaseSchema):
    pass

class TagSchema(TagBaseSchema):
    id: str
    name: str

    class Config:
        from_attributes = True


# Annotation schemas
class AnnotationBaseSchema(BaseModel):
    x: float
    y: float
    width: float
    height: float

class AnnotationCreateSchema(AnnotationBaseSchema):
    tag: TagCreateSchema
    pass

class AnnotationSchema(AnnotationBaseSchema):
    id: str
    image_id: str
    tag: TagSchema

    class Config:
        from_attributes = True

# Image schemas
class ImageBaseSchema(BaseModel):
    filename: str
    url: str

class ImageSchema(ImageBaseSchema):
    id: str
    project_id: str
    created_at: datetime
    annotations: List[AnnotationSchema] = []

    class Config:
        from_attributes = True
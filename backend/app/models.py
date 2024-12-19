from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, Table
from datetime import datetime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Project(Base):
    __tablename__ = 'projects'
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    
    # Relationships
    images = relationship("Image", back_populates="project")
    tags = relationship("Tag", secondary="project_tags", back_populates="projects")
    
class Image(Base):
    __tablename__ = 'images'
    
    id = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey('projects.id'), nullable=False)
    url = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="images")
    annotations = relationship("Annotation", back_populates="image")
    
class Annotation(Base):
    __tablename__ = 'annotations'
    
    id = Column(String, primary_key=True)
    image_id = Column(String, ForeignKey('images.id'), nullable=False)
    tag_id = Column(String, ForeignKey('tags.id'), nullable=False)
    x = Column(Float, nullable=False)
    y = Column(Float, nullable=False)
    width = Column(Float, nullable=False)
    height = Column(Float, nullable=False)
    
    # Relationships
    image = relationship("Image", back_populates="annotations")
    tag = relationship("Tag", back_populates="annotations")
    
class Tag(Base):
    __tablename__ = 'tags'
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    
    # Relationships
    annotations = relationship("Annotation", back_populates="tag")
    projects = relationship("Project", secondary="project_tags", back_populates="tags")

# Association table for Project ↔ Tag many-to-many relationship
project_tags = Table(
    'project_tags',
    Base.metadata,
    Column('project_id', String, ForeignKey('projects.id'), primary_key=True),
    Column('tag_id', String, ForeignKey('tags.id'), primary_key=True)
)
'use client'

import Canvas from '@/components/Canvas'
import Toolbar from '@/components/Toolbar'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Image, Tag } from '@/types'
import { api, API_URL } from '@/api/api'
import LoadingSpinner from '@/components/LoadingSpinner'
import AnnotationList from '@/components/AnnotationList'
import TagSelector from '@/components/TagSelector'

const AnnotationPage: React.FC = () => {
    const router = useRouter()
    const { projectId, imageId } = useParams()
    const [selectedTool, setSelectedTool] = useState<'box' | 'select'>('box')
    const [images, setImages] = useState<Image[]>([])
    const [image, setImage] = useState<Image>()
    const [tags, setTags] = useState<Tag[]>([])
    const [selectedTag, setSelectedTag] = useState<Tag | undefined>()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isAdding, setIsAdding] = useState(false);
    

    useEffect(() => {
        loadProject(projectId as string);
    
    }, [projectId, imageId])

    useEffect(() => {
        // Set the current image
        if (images.length > 0) {
            const currentImage = images.find(img => img.id === imageId);
            if (currentImage) {
                setImage(currentImage);
            }
        }
    }, [images, imageId])

    

    // Load the project images
    const loadProject = async (projectId: string) => {
        try {
            const projectDataResponse = await api.getProjectImages(projectId)
            setImages(projectDataResponse.data)
            const projectTagsResponse = await api.getProjectTags(projectId)
            setTags(projectTagsResponse.data)
            // Set a default selected tag if any
            if (projectTagsResponse.data.length > 0) {
                setSelectedTag(projectTagsResponse.data[0])
            }
        } catch (error) {
            console.error('There was an error fetching project data', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Add annotation to database
    const handleAddAnnotation = async (data: {x: number, y: number, height: number, width: number}) => {
        if (!image || !selectedTag) return;

        // Save annotation to database
        try {
            console.log(selectedTag)
            const response = await api.saveAnnotation(image.id, {
                x: data.x,
                y: data.y,
                width: data.width,
                height: data.height,
                tag: selectedTag
            })
            
            if (image) {
                setImage({...image, annotations: [...image.annotations, response.data]})
            }
        } catch (error) {
            console.error('Failed to save annotation:', error);
        }
    }

    // Delete annotation from image and database
    const handleDeleteAnnotation = async (annotationId: string) => {
        if (!image) return;
        
        // Remove annotation from database
        try {
            await api.deleteAnnotation(image.id, annotationId);

            if (image) {
                setImage({...image, annotations: image.annotations.filter(annot => annot.id !== annotationId)})
            }

        } catch (error) {
            console.error('Failed to delete annotation:', error);
        }
    };

    // Handle add tag
    const handleAddTag = async (tag: string) => {
        if (!projectId) return;

        try {
            const response = await api.addProjectTag(projectId as string, tag);
            setTags(response.data);
            const newTag = response.data.find(res_tag => res_tag.name == tag)
            setSelectedTag(newTag)
        } catch (error) {
            console.error('Failed to add tag:', error);
        }
    };

    // Navigate images in project
    const navigateToImage = (direction: 'prev' | 'next') => {
        const currentIndex = images.findIndex(img => img.id === imageId);
        if (currentIndex === -1) return;
    
        const newIndex = direction === 'next' 
          ? (currentIndex + 1) % images.length
          : (currentIndex - 1 + images.length) % images.length;
    
        router.push(`/projects/${projectId}/annotate/${images[newIndex].id}`);
      };

    // Loader before page renders
    if ( isLoading || !image ) {
        return <LoadingSpinner />
    }

    return (
        <div className="space-y-6 container mx-auto mt-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Image Annotation</h1>
                <div className="flex items-center space-x-4">
                    <button
                    onClick={() => navigateToImage('prev')}
                    className="p-2 rounded-full hover:bg-gray-100"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <span className="text-sm text-gray-600">
                        Image {images.findIndex(img => img.id === imageId) + 1} of {images.length}
                    </span>
                    <button
                    onClick={() => navigateToImage('next')}
                    className="p-2 rounded-full hover:bg-gray-100"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 flex gap-2">
                    <div className="flex-none">
                        <Toolbar
                        selectedTool={selectedTool}
                        onToolSelect={setSelectedTool}
                        />
                    </div>
                    {image && <Canvas
                        imageUrl={`${API_URL}${image.url}`}
                        annotations={image.annotations}
                        selectedTool={selectedTool}
                        onAddAnnotation={handleAddAnnotation}
                    />}
                </div>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                        <TagSelector
                            tags={tags}
                            selectedTag={selectedTag}
                            onSelectTag={setSelectedTag}
                            onAddTag={handleAddTag}
                            isAdding={isAdding}
                            setIsAdding={setIsAdding}
                        />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Annotations</h3>
                        <AnnotationList
                            annotations={image.annotations}
                            onDelete={handleDeleteAnnotation}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnnotationPage
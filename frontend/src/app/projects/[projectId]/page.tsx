'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Project, Image } from '@/types'
import { api } from '@/api/api'
import LoadingSpinner from '@/components/LoadingSpinner'
import ImageUploader from '@/components/projectDetails/ImageUploader'
import ImageGrid from '@/components/projectDetails/ImageGrid'

const ProjectDetail = () => {

    const [currentProject, setCurrentProject] = useState<Project>()
    const [images, setImages] = useState<Image[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const { projectId } = useParams()

    useEffect(() => {
        loadProject(projectId as string);
    }, [projectId])

    // Load the project
    const loadProject = async (projectId: string) => {
        try {
            const projectResponse = await api.getProjectById(projectId)
            setCurrentProject(projectResponse.data)
            const projectDataResponse = await api.getProjectImages(projectId)
            setImages(projectDataResponse.data)
        } catch (error) {
            console.error('There was an error fetching project or project data', error)
        } finally {
            setIsLoading(false)
        }
    }

    if ( isLoading ) {
        return <LoadingSpinner />
    }

    return (
        <div className="space-y-8 container mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{currentProject?.name || 'Project Details'}</h1>
            </div>

            <ImageUploader projectId={projectId! as string} onUploadComplete={loadProject} />

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Images</h2>
                <ImageGrid images={images} projectId={projectId as string} />
            </div>
        </div>
    )
}

export default ProjectDetail
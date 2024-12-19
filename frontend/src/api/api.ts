import { Project, Image, Annotation, Tag } from "@/types"
import axios from "axios"

export const API_URL = 'http://localhost:8000'

export const api = {
    // Project endpoints
    getProjects: () => axios.get<Project[]>(`${API_URL}/projects`),
    createProject: (data: Partial<Project>) => axios.post<Project>(`${API_URL}/projects`, data),
    getProjectById: (projectId: string) => axios.get<Project>(`${API_URL}/projects/${projectId}`),

    // Image endpoints
    getProjectImages: (projectId: string) => axios.get<Image[]>(`${API_URL}/projects/${projectId}/images`),
    uploadImage: (projectId: string, files: File[]) => {
        const formData = new FormData()
        // Add all images to the form
        files.forEach((file) => {
            formData.append('files', file)
        })
        return axios.post<Image[]>(`${API_URL}/projects/${projectId}/images`, formData)
    },

    // Annotation endpoints
    saveAnnotation: (imageId: string, annotation: Partial<Annotation>) => axios.post<Annotation>(`${API_URL}/images/${imageId}/annotations`, annotation),
    deleteAnnotation: (imageId: string, annotationId: string) => axios.delete(`${API_URL}/images/${imageId}/annotations/${annotationId}`),

    // Tag endpoints
    getProjectTags: (projectId: string) => axios.get<Tag[]>(`${API_URL}/projects/${projectId}/tags`),
    addProjectTag: (projectId: string, tag: string) => axios.post<Tag[]>(`${API_URL}/projects/${projectId}/tags`, { name: tag }),
}
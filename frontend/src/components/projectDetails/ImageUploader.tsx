import { api } from '@/api/api'
import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'

interface ImageUploaderProps {
    projectId: string,
    onUploadComplete: (projectId: string) => Promise<void>
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ projectId, onUploadComplete }) => {

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        try {
            await api.uploadImage(projectId, acceptedFiles)
            onUploadComplete(projectId)

        } catch (error) {
            console.error('Failed to upload images:', error);
        }
    }, [projectId, onUploadComplete])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
        
    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
            >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
                {isDragActive ? 'Drop the files here...' : 'Drag & drop images here, or click to select files'}
            </p>
        </div>
    )
}

export default ImageUploader
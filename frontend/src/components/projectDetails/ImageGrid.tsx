import React from 'react'
import Link from 'next/link'
import { Image as ImageProp } from '@/types'
import { Tag } from 'lucide-react'
import Image from 'next/image'
import { API_URL } from '@/api/api'

interface ImageGridProps {
    projectId: string,
    images: ImageProp[]
}

const ImageGrid: React.FC<ImageGridProps> = ({ projectId, images }) => {

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
                <Link
                key={image.id}
                href={`/projects/${projectId}/annotate/${image.id}`}
                className="relative group cursor-pointer"
                >
                    <Image
                        src={`${API_URL}${image.url}`}
                        alt={image.filename}
                        className="w-full h-48 object-cover rounded-lg"
                        width={400}
                        height={300}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity rounded-lg" />
                    <div className="absolute bottom-2 left-2 flex items-center space-x-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tag className="h-4 w-4" />
                        <span className="text-sm">{image.annotations.length} annotations</span>
                    </div>
                </Link>
            ))}
        </div>
    )
}

export default ImageGrid
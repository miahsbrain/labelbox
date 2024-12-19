export interface Project {
    id: string
    name: string
    description: string
    created_at: string
    image_count: number
    tags: string[]
}
  
export interface Image {
	id: string
	project_id: string
	url: string
	filename: string
	annotations: Annotation[];
}
  
export interface Annotation {
	id: string
	x: number
	y: number
	width: number
	height: number
	tag: Tag
	imageId: string
}

export interface Tag {
	id: string
	name: string
}
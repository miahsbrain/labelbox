import React, { useState } from 'react';
import { Tag as TagIcon, Plus } from 'lucide-react';
import { Tag } from '@/types';

interface TagSelectorProps {
    tags: Tag[];
    onSelectTag: (tag: Tag) => void
    onAddTag: (tag: string) => void
    selectedTag: Tag | undefined
	isAdding: boolean
	setIsAdding: React.Dispatch<React.SetStateAction<boolean>>
}

const TagSelector: React.FC<TagSelectorProps> = ({ tags, onSelectTag, onAddTag, selectedTag, isAdding, setIsAdding }) => {
	const [newTag, setNewTag] = useState<string>('');

	const handleAddTag = () => {
		if (newTag.trim()) {
			onAddTag(newTag.trim());
			setNewTag('');
			setIsAdding(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-2">
				{tags && tags.map((tag) => (
					<button
						key={tag.id}
						onClick={() => onSelectTag(tag)}
						className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1
						${selectedTag?.name === tag.name 
							? 'bg-indigo-600 text-white' 
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
					>
						<TagIcon className="h-3 w-3" />
						<span>{tag.name}</span>
					</button>
				))}
				<button
				onClick={() => setIsAdding(true)}
				className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center space-x-1"
				>
					<Plus className="h-3 w-3" />
					<span>Add Tag</span>
				</button>
			</div>

			{isAdding && (
				<div className="flex items-center space-x-2">
					<input
						type="text"
						value={newTag}
						onChange={(e) => setNewTag(e.target.value)}
						className="flex-1 rounded-md border-gray-300 border px-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
						placeholder="Enter new tag"
					/>
					<button
						onClick={handleAddTag}
						className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
					>
						Add
					</button>
					<button
						onClick={() => setIsAdding(false)}
						className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
					>
						Cancel
					</button>
				</div>
			)}
		</div>
	);
}

export default TagSelector
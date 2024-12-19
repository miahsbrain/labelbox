import React from 'react';
import { Annotation } from '@/types';
import { Tag, Trash2 } from 'lucide-react';

interface AnnotationListProps {
  annotations: Annotation[];
  onDelete: (id: string) => void;
}

export default function AnnotationList({ annotations, onDelete }: AnnotationListProps) {
  return (
    <div className="space-y-2">
      {annotations.map((annotation) => (
        <div
          key={annotation.id}
          className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
        >
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium">{annotation.tag.name}</span>
          </div>
          <button
            onClick={() => onDelete(annotation.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
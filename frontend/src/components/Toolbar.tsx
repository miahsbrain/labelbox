import React from 'react';
import { MousePointer2, Square } from 'lucide-react';

interface ToolbarProps {
  selectedTool: 'box' | 'select';
  onToolSelect: (tool: 'box' | 'select') => void;
}

export default function Toolbar({ selectedTool, onToolSelect }: ToolbarProps) {
  return (
    <div className="flex flex-col gap-2 bg-white p-2 rounded-lg shadow-md">
      <button
        className={`p-2 rounded ${
          selectedTool === 'select' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
        }`}
        onClick={() => onToolSelect('select')}
        title="Select"
      >
        <MousePointer2 size={20} />
      </button>
      <button
        className={`p-2 rounded ${
          selectedTool === 'box' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
        }`}
        onClick={() => onToolSelect('box')}
        title="Draw Box"
      >
        <Square size={20} />
      </button>
    </div>
  );
}
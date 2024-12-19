'use client'

import React, { useRef, useState, useEffect } from 'react';
import { Annotation } from '@/types';

interface CanvasProps {
    imageUrl: string,
    annotations: Annotation[],
    selectedTool: 'box' | 'select',
    onAddAnnotation: (data: {x: number, y: number, height: number, width: number}) => void
}

const Canvas: React.FC<CanvasProps> = ({ imageUrl, annotations, selectedTool, onAddAnnotation }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState<boolean>()
    const [startPos, setStartPos] = useState<{x: number, y: number}>({x: 0, y: 0})
    const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null)

    useEffect(() => {
        if (!imageUrl || !canvasRef.current) return;
        
        // Check for canvas existence and create canvas context
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Load the image
        const img = new Image()
        img.src = imageUrl

        img.onload = () => {
            // Update canas width to match image
            canvas.width = img.width;
            canvas.height = img.height;

            setImageElement(img)
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0)
            
            // Draw each annotations
            annotations?.forEach(({x, y, width, height}) => {
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 3;
                ctx.strokeRect(x, y, width, height)
            })
        }

    }, [imageUrl, annotations])

    // Function to get the current mouse position
    const getMousePosition = (e: React.MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return {x: 0, y: 0}
        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height

        return {
            x: parseFloat(((e.clientX - rect.left) * scaleX).toFixed(4)),
            y: parseFloat(((e.clientY - rect.top) * scaleY).toFixed(4)),
        }
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        if (selectedTool != 'box') return
        setIsDrawing(true)
        setStartPos(getMousePosition(e))
    }

    const handleMouseUp = (e: React.MouseEvent) => {
        // Check if drawing state
        if (!isDrawing) return;
        setIsDrawing(false);

        const endPos = getMousePosition(e);
        const width = Math.abs(endPos.x - startPos.x);
        const height = Math.abs(endPos.y - startPos.y);
        
        // Ignore tiny boxes
        if (width < 5 || height < 5) return;

        // Save annotation to database
        onAddAnnotation({
            x: Math.min(startPos.x, endPos.x),
            y: Math.min(startPos.y, endPos.y),
            width,
            height,
        })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        // Check if drawing state
        if (!isDrawing || !canvasRef.current || !imageElement) return;

        // Get the current canvas and context to draw
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Get the current position
        const currentPos = getMousePosition(e);

        // Redraw image and all annotations
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageElement, 0, 0);
        
        // Draw existing annotations
        annotations.forEach(({ x, y, width, height }) => {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);
        });

        // Draw current box
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(
            startPos.x,
            startPos.y,
            currentPos.x - startPos.x,
            currentPos.y - startPos.y
        );
    }
    

    return (
        <div className="relative w-full h-full">
            <canvas
                ref={canvasRef}
                className={`max-w-full h-auto border border-gray-300 ${selectedTool == 'box' ? 'cursor-crosshair' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            />
        </div>
    )
}

export default Canvas
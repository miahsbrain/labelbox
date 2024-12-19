'use client'

import { Plus, Folder } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Project } from '@/types';
import { api } from '@/api/api';


const Home: React.FC = () => {
	const [projects, setProjects] = useState<Project[]>([]);
	const [isCreating, setIsCreating] = useState<boolean>(false);
	const [newProject, setNewProject] = useState({ name: '', description: '' });

	// Loads ecisting projects
	useEffect(() => {
		loadProjects()
	}, [])

	const loadProjects = async () => {
		try {
			const response = await api.getProjects()
			setProjects(response.data)
		} catch (error) {
			console.error('Failed to load projects', error)
		}
	}

	// Handle create project form
	const handleCreateProject = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			const response = await api.createProject(newProject)
			setIsCreating(false)
			setNewProject({ name: '', description: '' })
			setProjects(prev => ([...prev, response.data]))
		} catch (error) {
			console.error('Failed to create projects', error)
		}
	}

	return (
		<div className='mx-auto container'>
			{/* Head */}
			<div className="flex justify-between items-center pt-8">
				<h1 className="text-2xl font-bold text-gray-900">Projects</h1>
				<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700"
				onClick={() => setIsCreating(true)}
				>
					<Plus className="h-5 w-5" />
					<span>New Project</span>
				</button>
			</div>
			{/* Crete project form */}
			{isCreating && (
				<form className="bg-white p-6 rounded-lg shadow-md absolute inset-0 flex items-center justify-center" onSubmit={handleCreateProject}>
					<div className="space-y-4 w-full">
						<div>
							<label className="block text-sm font-medium text-gray-700">Project Name</label>
							<input
								type="text"
								value={newProject.name}
								onChange={(e) => setNewProject(prev => ({...prev, name:e.target.value}))}
								className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Description</label>
							<textarea
								value={newProject.description}
								onChange={(e) => setNewProject(prev => ({...prev, description:e.target.value}))}
								className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								rows={3}
							/>
						</div>
						<div className="flex justify-end space-x-3">
							<button
								type="button"
								onClick={() => setIsCreating(false)}
								className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								type="submit"
								className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
							>
								Create Project
							</button>
						</div>
					</div>
				</form>
			)}

			{/* Show projects list */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{projects && projects.map((project) => (
					<Link 
						key={project.id}
						href={`/projects/${project.id}`}
						className="bg-slate-100 p-6 rounded-md shadow-md hover:shadow-lg transition-shadow cursor-pointer"
					>
						<div className="flex items-center space-x-3">
						<Folder className="h-8 w-8 text-indigo-600" />
							<div>
								<h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
								<p className="text-sm text-gray-500">{project.image_count} images</p>
							</div>
						</div>
						<p className="mt-2 text-gray-600 text-sm">{project.description}</p>
					</Link>
				))}
			</div>
		</div>
	)
}

export default Home
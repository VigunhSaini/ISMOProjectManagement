import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  FolderKanban,
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../api/client';
import { ProjectDTO, ProjectStatus, PaginatedResponse } from '../shared/types';
import { ProjectStatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const Projects: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectDTO | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.NOT_STARTED);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Check URL query param for auto-opening create modal
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      handleOpenCreate();
      setSearchParams({});
    }
  }, [searchParams]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: Record<string, any> = {
        limit: 50,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.get<{ success: true; data: PaginatedResponse<ProjectDTO> }>(
        '/projects',
        { params }
      );
      setProjects(res.data.data.items);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setStatus(ProjectStatus.NOT_STARTED);
    setStartDate('');
    setEndDate('');
    setFormError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (project: ProjectDTO) => {
    setEditingProject(project);
    setName(project.name);
    setDescription(project.description || '');
    setStatus(project.status);
    setStartDate(project.startDate ? project.startDate.split('T')[0] : '');
    setEndDate(project.endDate ? project.endDate.split('T')[0] : '');
    setFormError(null);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Project name is required.');
      return;
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setFormError('End date cannot be earlier than start date.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        status,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
      };

      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, payload);
      } else {
        await api.post('/projects', payload);
      }

      setIsCreateOpen(false);
      setEditingProject(null);
      resetForm();
      fetchProjects();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;
    try {
      setIsSubmitting(true);
      await api.delete(`/projects/${deletingProject.id}`);
      setDeletingProject(null);
      fetchProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to delete project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, manage, and monitor progress across your project spaces.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn-primary shadow-sm">
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name..."
            className="input pl-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-full sm:w-44"
          >
            <option value="ALL">All Statuses</option>
            <option value={ProjectStatus.NOT_STARTED}>Not Started</option>
            <option value={ProjectStatus.IN_PROGRESS}>In Progress</option>
            <option value={ProjectStatus.COMPLETED}>Completed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchProjects} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {/* Project Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 space-y-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="pt-4 border-t border-gray-100 h-8" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900">No projects found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== 'ALL'
              ? 'Try adjusting your search query or status filter.'
              : 'Get started by creating your first project.'}
          </p>
          {!search && statusFilter === 'ALL' && (
            <button onClick={handleOpenCreate} className="btn-primary mt-4">
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const totalTasks = project.taskCount ?? 0;
            const completedTasks = project.completedTaskCount ?? 0;
            const progress =
              totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <div
                key={project.id}
                className="card p-5 flex flex-col justify-between hover:border-gray-300 transition-shadow hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <Link
                      to={`/projects/${project.id}`}
                      className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1"
                    >
                      {project.name}
                    </Link>
                    <ProjectStatusBadge status={project.status} />
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem] mb-4">
                    {project.description || (
                      <span className="text-gray-400 italic">No description provided</span>
                    )}
                  </p>

                  {/* Date range if set */}
                  {(project.startDate || project.endDate) && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        {project.startDate
                          ? new Date(project.startDate).toLocaleDateString()
                          : 'Anytime'}{' '}
                        —{' '}
                        {project.endDate
                          ? new Date(project.endDate).toLocaleDateString()
                          : 'Ongoing'}
                      </span>
                    </div>
                  )}

                  {/* Task completion progress bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Tasks: {completedTasks} / {totalTasks}</span>
                      <span className="font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    to={`/projects/${project.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
                  >
                    <span>View Tasks</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(project)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                      title="Edit project"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingProject(project)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingProject}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingProject(null);
          resetForm();
        }}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
      >
        <form onSubmit={handleSaveProject} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="label">Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Website Redesign"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of project goals..."
              rows={3}
              className="input resize-none"
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="input"
            >
              <option value={ProjectStatus.NOT_STARTED}>Not Started</option>
              <option value={ProjectStatus.IN_PROGRESS}>In Progress</option>
              <option value={ProjectStatus.COMPLETED}>Completed</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingProject(null);
                resetForm();
              }}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.name}"? All associated tasks will be permanently removed. This action cannot be undone.`}
        confirmText="Delete Project"
        isDangerous
        isLoading={isSubmitting}
      />
    </div>
  );
};

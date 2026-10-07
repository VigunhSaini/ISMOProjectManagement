import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react';
import { api } from '../api/client';
import {
  ProjectDTO,
  TaskDTO,
  TaskPriority,
  TaskStatus,
  ProjectStatus,
} from '../shared/types';
import { ProjectStatusBadge, TaskStatusBadge, PriorityBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Task filters
  const [taskSearch, setTaskSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Task modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDTO | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskFormError, setTaskFormError] = useState<string | null>(null);

  // Task form fields
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>(TaskStatus.PENDING);
  const [taskDueDate, setTaskDueDate] = useState('');

  const fetchProjectAndTasks = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get<{
        success: true;
        data: { project: ProjectDTO & { tasks: TaskDTO[] } };
      }>(`/projects/${id}`);
      setProject(res.data.data.project);
      setTasks(res.data.data.project.tasks || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load project details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const resetTaskForm = () => {
    setTaskName('');
    setTaskDescription('');
    setTaskPriority(TaskPriority.MEDIUM);
    setTaskStatus(TaskStatus.PENDING);
    setTaskDueDate('');
    setTaskFormError(null);
  };

  const handleOpenCreateTask = () => {
    resetTaskForm();
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: TaskDTO) => {
    setEditingTask(task);
    setTaskName(task.name);
    setTaskDescription(task.description || '');
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    setTaskDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setTaskFormError(null);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) {
      setTaskFormError('Task name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setTaskFormError(null);

      const payload = {
        name: taskName.trim(),
        description: taskDescription.trim() || undefined,
        priority: taskPriority,
        status: taskStatus,
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : null,
        projectId: id,
      };

      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }

      setIsTaskModalOpen(false);
      setEditingTask(null);
      resetTaskForm();
      fetchProjectAndTasks();
    } catch (err: any) {
      setTaskFormError(err.message || 'Failed to save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick toggle status: mark completed or back to pending
  const handleToggleTaskStatus = async (task: TaskDTO) => {
    try {
      const nextStatus =
        task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;
      await api.put(`/tasks/${task.id}`, { status: nextStatus });
      fetchProjectAndTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to update task status.');
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    try {
      setIsSubmitting(true);
      await api.delete(`/tasks/${deletingTask.id}`);
      setDeletingTask(null);
      fetchProjectAndTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to delete task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter tasks in memory based on current search & filter selections
  const filteredTasks = tasks.filter((t) => {
    if (taskSearch.trim()) {
      const q = taskSearch.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
  const progressPercent =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="card p-8 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-base font-semibold text-gray-900">{error || 'Project not found.'}</h3>
        <button onClick={() => navigate('/projects')} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Project Header Banner */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
            </div>
            {project.description && (
              <p className="text-sm text-gray-600 mt-2 max-w-2xl">{project.description}</p>
            )}

            {(project.startDate || project.endDate) && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-3">
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
          </div>

          <button onClick={handleOpenCreateTask} className="btn-primary shadow-sm flex-shrink-0">
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Progress Bar inside Project */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5 font-medium">
            <span>
              {completedCount} of {tasks.length} tasks completed
            </span>
            <span className="text-primary-700 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={taskSearch}
            onChange={(e) => setTaskSearch(e.target.value)}
            placeholder="Search tasks by name or description..."
            className="input pl-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-full sm:w-36 text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value={TaskStatus.PENDING}>Pending</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.COMPLETED}>Completed</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input w-full sm:w-36 text-xs"
          >
            <option value="ALL">All Priorities</option>
            <option value={TaskPriority.LOW}>Low Priority</option>
            <option value={TaskPriority.MEDIUM}>Medium Priority</option>
            <option value={TaskPriority.HIGH}>High Priority</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="card overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-gray-900">No tasks found</h4>
            <p className="text-xs text-gray-500 mt-1">
              {taskSearch || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                ? 'Try clearing the search or changing filters.'
                : 'Click "Add Task" to create your first task in this project.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTasks.map((task) => {
              const isCompleted = task.status === TaskStatus.COMPLETED;
              return (
                <div
                  key={task.id}
                  className={`p-4 flex items-start sm:items-center justify-between gap-4 hover:bg-gray-50/75 transition-colors ${
                    isCompleted ? 'bg-gray-50/40' : ''
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    {/* Inline Mark Completed Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleTaskStatus(task)}
                      className={`flex-shrink-0 mt-0.5 sm:mt-0 p-1 rounded-full transition-colors ${
                        isCompleted
                          ? 'text-green-600 hover:text-gray-400'
                          : 'text-gray-300 hover:text-green-500'
                      }`}
                      title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 fill-green-50 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            isCompleted ? 'line-through text-gray-400' : 'text-gray-900'
                          }`}
                        >
                          {task.name}
                        </span>
                        <TaskStatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                      </div>

                      {task.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Task action buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleOpenEditTask(task)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                      title="Edit task"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingTask(task)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Create / Edit Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
          resetTaskForm();
        }}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          {taskFormError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{taskFormError}</span>
            </div>
          )}

          <div>
            <label className="label">Task Name *</label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Set up database schema"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Details or acceptance criteria..."
              rows={3}
              className="input resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                className="input"
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
              </select>
            </div>

            <div>
              <label className="label">Status</label>
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                className="input"
              >
                <option value={TaskStatus.PENDING}>Pending</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.COMPLETED}>Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Due Date</label>
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="input"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setIsTaskModalOpen(false);
                setEditingTask(null);
                resetTaskForm();
              }}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Task Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.name}"? This action cannot be undone.`}
        confirmText="Delete Task"
        isDangerous
        isLoading={isSubmitting}
      />
    </div>
  );
};

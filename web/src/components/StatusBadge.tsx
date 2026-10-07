import React from 'react';
import { ProjectStatus, TaskStatus, TaskPriority } from '../shared/types';

export const ProjectStatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  switch (status) {
    case ProjectStatus.NOT_STARTED:
      return <span className="badge-status-not-started">Not Started</span>;
    case ProjectStatus.IN_PROGRESS:
      return <span className="badge-status-in-progress">In Progress</span>;
    case ProjectStatus.COMPLETED:
      return <span className="badge-status-completed">Completed</span>;
    default:
      return <span className="badge-status-not-started">{status}</span>;
  }
};

export const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  switch (status) {
    case TaskStatus.PENDING:
      return <span className="badge-status-not-started">Pending</span>;
    case TaskStatus.IN_PROGRESS:
      return <span className="badge-status-in-progress">In Progress</span>;
    case TaskStatus.COMPLETED:
      return <span className="badge-status-completed">Completed</span>;
    default:
      return <span className="badge-status-not-started">{status}</span>;
  }
};

export const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  switch (priority) {
    case TaskPriority.LOW:
      return <span className="badge-priority-low">Low</span>;
    case TaskPriority.MEDIUM:
      return <span className="badge-priority-medium">Medium</span>;
    case TaskPriority.HIGH:
      return <span className="badge-priority-high">High</span>;
    default:
      return <span className="badge-priority-low">{priority}</span>;
  }
};

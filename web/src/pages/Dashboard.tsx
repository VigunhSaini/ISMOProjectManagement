import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Activity,
  Plus,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { api } from '../api/client';
import { DashboardStats } from '../shared/types';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get<{ success: true; data: { stats: DashboardStats } }>('/dashboard');
      setStats(res.data.data.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome & actions header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here's an overview of your projects and task progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="btn-secondary p-2.5"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Link to="/projects?action=new" className="btn-primary shadow-sm">
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button onClick={fetchStats} className="text-xs font-semibold underline">
            Try again
          </button>
        </div>
      )}

      {/* 5 Core Metric Cards required by Assessment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Projects */}
        <div className="card p-5 relative overflow-hidden group hover:border-primary-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Projects
            </span>
            <div className="p-2 rounded-xl bg-primary-50 text-primary-600 group-hover:scale-110 transition-transform">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">
              {isLoading ? '—' : stats?.totalProjects ?? 0}
            </span>
          </div>
        </div>

        {/* Projects In Progress */}
        <div className="card p-5 relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Projects In Progress
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">
              {isLoading ? '—' : stats?.projectsInProgress ?? 0}
            </span>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="card p-5 relative overflow-hidden group hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
              Total Tasks
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">
              {isLoading ? '—' : stats?.totalTasks ?? 0}
            </span>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="card p-5 relative overflow-hidden group hover:border-green-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-green-600">
              Completed Tasks
            </span>
            <div className="p-2 rounded-xl bg-green-50 text-green-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">
              {isLoading ? '—' : stats?.completedTasks ?? 0}
            </span>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="card p-5 relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Pending Tasks
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">
              {isLoading ? '—' : stats?.pendingTasks ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Progress & Quick Links Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Breakdown Card */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Task Completion Rate</h2>
          {isLoading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : stats && stats.totalTasks > 0 ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-gray-700">Overall Progress</span>
                  <span className="text-primary-600">
                    {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
                  <div
                    className="bg-green-500 h-3"
                    style={{
                      width: `${(stats.completedTasks / stats.totalTasks) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-blue-500 h-3"
                    style={{
                      width: `${(stats.inProgressTasks / stats.totalTasks) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-amber-400 h-3"
                    style={{
                      width: `${(stats.pendingTasks / stats.totalTasks) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                    Completed
                  </div>
                  <span className="text-lg font-bold text-gray-900">{stats.completedTasks}</span>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                    In Progress
                  </div>
                  <span className="text-lg font-bold text-gray-900">{stats.inProgressTasks}</span>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                    Pending
                  </div>
                  <span className="text-lg font-bold text-gray-900">{stats.pendingTasks}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 text-sm">
              No tasks created yet. Create a project and add tasks to see completion stats!
            </div>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Quick Navigation</h2>
            <p className="text-xs text-gray-500 mb-6">
              Organize projects and track deliverables across your workspace.
            </p>

            <div className="space-y-3">
              <Link
                to="/projects"
                className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-primary-400 hover:bg-primary-50/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-primary-100 text-gray-700 group-hover:text-primary-700 transition-colors">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Manage Projects</p>
                    <p className="text-xs text-gray-500">View, create, and organize tasks</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Single unified database connected with mobile client.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

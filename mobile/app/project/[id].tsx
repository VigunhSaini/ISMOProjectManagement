import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../src/api/client';
import {
  ProjectDTO,
  TaskDTO,
  TaskStatus,
  TaskPriority,
} from '../../src/shared/types';
import { ProjectStatusBadge, TaskStatusBadge, PriorityBadge } from '../../src/components/StatusBadge';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Task creation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>(TaskStatus.PENDING);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjectDetails = async () => {
    if (!id) return;
    try {
      const res = await api.get<{
        success: true;
        data: { project: ProjectDTO & { tasks: TaskDTO[] } };
      }>(`/projects/${id}`);
      setProject(res.data.data.project);
      setTasks(res.data.data.project.tasks || []);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load project.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjectDetails();
  }, [id]);

  const handleCreateTask = async () => {
    if (!taskName.trim()) {
      Alert.alert('Validation Error', 'Task name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/tasks', {
        name: taskName.trim(),
        description: taskDesc.trim() || undefined,
        priority: taskPriority,
        status: taskStatus,
        projectId: id,
      });

      setIsModalOpen(false);
      setTaskName('');
      setTaskDesc('');
      setTaskPriority(TaskPriority.MEDIUM);
      setTaskStatus(TaskStatus.PENDING);
      fetchProjectDetails();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTaskStatus = async (task: TaskDTO) => {
    try {
      const nextStatus =
        task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;
      await api.put(`/tasks/${task.id}`, { status: nextStatus });
      fetchProjectDetails();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update task.');
    }
  };

  const handleDeleteTask = (task: TaskDTO) => {
    Alert.alert(
      'Delete Task',
      `Delete task "${task.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/tasks/${task.id}`);
              fetchProjectDetails();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete task.');
            }
          },
        },
      ]
    );
  };

  const filteredTasks = tasks.filter((t) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!t.name.toLowerCase().includes(q) && !t.description?.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      {isLoading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
          }
          ListHeaderComponent={
            <View style={styles.header}>
              {project && (
                <View style={styles.projectInfoCard}>
                  <View style={styles.projectTitleRow}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    <ProjectStatusBadge status={project.status} />
                  </View>
                  {project.description ? (
                    <Text style={styles.projectDesc}>{project.description}</Text>
                  ) : null}
                </View>
              )}

              {/* Task search and filters */}
              <TextInput
                style={styles.searchInput}
                placeholder="🔍 Search tasks in project..."
                placeholderTextColor="#9ca3af"
                value={search}
                onChangeText={setSearch}
              />

              {/* Filter chips */}
              <View style={styles.filterChipsRow}>
                {['ALL', TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED].map(
                  (st) => (
                    <TouchableOpacity
                      key={st}
                      style={[styles.chip, statusFilter === st && styles.chipActive]}
                      onPress={() => setStatusFilter(st)}
                    >
                      <Text style={[styles.chipText, statusFilter === st && styles.chipTextActive]}>
                        {st === 'ALL' ? 'All' : st === TaskStatus.PENDING ? 'Pending' : st === TaskStatus.IN_PROGRESS ? 'In Progress' : 'Completed'}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No tasks found</Text>
              <Text style={styles.emptySubtitle}>
                Tap the + button below to add your first task
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isCompleted = item.status === TaskStatus.COMPLETED;
            return (
              <View style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}>
                <TouchableOpacity
                  style={styles.checkButton}
                  onPress={() => handleToggleTaskStatus(item)}
                >
                  <Text style={styles.checkIcon}>{isCompleted ? '✅' : '⚪'}</Text>
                </TouchableOpacity>

                <View style={styles.taskContent}>
                  <Text
                    style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                  {item.description ? (
                    <Text style={styles.taskDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}

                  <View style={styles.taskMeta}>
                    <TaskStatusBadge status={item.status} />
                    <PriorityBadge priority={item.priority} />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteTask(item)}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* FAB to add task */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsModalOpen(true)}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Task to Project</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Task Name *"
              placeholderTextColor="#9ca3af"
              value={taskName}
              onChangeText={setTaskName}
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Description (optional)"
              placeholderTextColor="#9ca3af"
              value={taskDesc}
              onChangeText={setTaskDesc}
              multiline
              numberOfLines={3}
            />

            <View style={styles.optionGroup}>
              <Text style={styles.modalLabel}>Priority:</Text>
              <View style={styles.optionRow}>
                {[TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH].map((pr) => (
                  <TouchableOpacity
                    key={pr}
                    style={[styles.optionBtn, taskPriority === pr && styles.optionBtnActive]}
                    onPress={() => setTaskPriority(pr)}
                  >
                    <Text
                      style={[
                        styles.optionBtnText,
                        taskPriority === pr && styles.optionBtnTextActive,
                      ]}
                    >
                      {pr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleCreateTask}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Task</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    gap: 12,
  },
  projectInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 4,
  },
  projectTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  projectDesc: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 8,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
  },
  chipActive: {
    backgroundColor: '#2563eb',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingBottom: 80,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  taskCardCompleted: {
    backgroundColor: '#fafafa',
    borderColor: '#f3f4f6',
  },
  checkButton: {
    marginTop: 2,
  },
  checkIcon: {
    fontSize: 18,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  taskDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 14,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabIcon: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#111827',
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionGroup: {
    gap: 8,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  optionBtnActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  optionBtnText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '600',
  },
  optionBtnTextActive: {
    color: '#2563eb',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#4b5563',
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});

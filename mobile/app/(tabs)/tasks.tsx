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
  Alert,
} from 'react-native';
import { api } from '../../src/api/client';
import { TaskDTO, TaskStatus, TaskPriority, PaginatedResponse } from '../../src/shared/types';
import { TaskStatusBadge, PriorityBadge } from '../../src/components/StatusBadge';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const fetchTasks = async () => {
    try {
      const params: Record<string, any> = { limit: 100 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;

      const res = await api.get<{ success: true; data: PaginatedResponse<TaskDTO> }>(
        '/tasks',
        { params }
      );
      setTasks(res.data.data.items);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load tasks.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, priorityFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, [search, statusFilter, priorityFilter]);

  const handleToggleStatus = async (task: TaskDTO) => {
    try {
      const nextStatus =
        task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;
      await api.put(`/tasks/${task.id}`, { status: nextStatus });
      fetchTasks();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update task.');
    }
  };

  const handleDeleteTask = (task: TaskDTO) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/tasks/${task.id}`);
              fetchTasks();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete task.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Search and Filter Bar */}
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search tasks..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />

        {/* Status Filters */}
        <View style={styles.chipRow}>
          <Text style={styles.chipLabel}>Status:</Text>
          {['ALL', TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED].map((st) => {
            const isActive = statusFilter === st;
            return (
              <TouchableOpacity
                key={st}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setStatusFilter(st)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {st === 'ALL' ? 'All' : st === TaskStatus.PENDING ? 'Pending' : st === TaskStatus.IN_PROGRESS ? 'In Progress' : 'Completed'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Priority Filters */}
        <View style={styles.chipRow}>
          <Text style={styles.chipLabel}>Priority:</Text>
          {['ALL', TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH].map((pr) => {
            const isActive = priorityFilter === pr;
            return (
              <TouchableOpacity
                key={pr}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setPriorityFilter(pr)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {pr === 'ALL' ? 'All' : pr === TaskPriority.LOW ? 'Low' : pr === TaskPriority.MEDIUM ? 'Medium' : 'High'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Task List */}
      {isLoading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No tasks found</Text>
              <Text style={styles.emptySubtitle}>
                {search ? 'Try adjusting your filters' : 'Pull down to refresh or check your projects'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isCompleted = item.status === TaskStatus.COMPLETED;
            return (
              <View style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}>
                <View style={styles.taskMain}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => handleToggleStatus(item)}
                  >
                    <Text style={styles.checkboxIcon}>{isCompleted ? '✅' : '⚪'}</Text>
                  </TouchableOpacity>

                  <View style={styles.taskTextContent}>
                    <Text
                      style={[styles.taskName, isCompleted && styles.taskNameCompleted]}
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>

                    {item.description ? (
                      <Text style={styles.taskDesc} numberOfLines={2}>
                        {item.description}
                      </Text>
                    ) : null}

                    <View style={styles.badgesRow}>
                      <TaskStatusBadge status={item.status} />
                      <PriorityBadge priority={item.priority} />
                      {item.dueDate ? (
                        <Text style={styles.dueDateText}>
                          Due {new Date(item.dueDate).toLocaleDateString()}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteTask(item)}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 10,
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    marginRight: 2,
  },
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
  },
  chipActive: {
    backgroundColor: '#2563eb',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4b5563',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 14,
    gap: 10,
    paddingBottom: 40,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  taskCardCompleted: {
    backgroundColor: '#fafafa',
    borderColor: '#f3f4f6',
  },
  taskMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    marginTop: 2,
  },
  checkboxIcon: {
    fontSize: 18,
  },
  taskTextContent: {
    flex: 1,
  },
  taskName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  taskDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  dueDateText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  deleteButton: {
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
});

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
import { useRouter } from 'expo-router';
import { api } from '../../src/api/client';
import { ProjectDTO, ProjectStatus, PaginatedResponse } from '../../src/shared/types';
import { ProjectStatusBadge } from '../../src/components/StatusBadge';

export default function ProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Create Project Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStatus, setNewStatus] = useState<ProjectStatus>(ProjectStatus.NOT_STARTED);
  const [isCreating, setIsCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      const params: Record<string, any> = { limit: 50 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.get<{ success: true; data: PaginatedResponse<ProjectDTO> }>(
        '/projects',
        { params }
      );
      setProjects(res.data.data.items);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load projects.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects();
  }, [search, statusFilter]);

  const handleCreateProject = async () => {
    if (!newName.trim()) {
      Alert.alert('Validation Error', 'Project name is required.');
      return;
    }

    try {
      setIsCreating(true);
      await api.post('/projects', {
        name: newName.trim(),
        description: newDesc.trim() || undefined,
        status: newStatus,
      });
      setIsModalOpen(false);
      setNewName('');
      setNewDesc('');
      setNewStatus(ProjectStatus.NOT_STARTED);
      fetchProjects();
    } catch (err: any) {
      Alert.alert('Creation Failed', err.message || 'Failed to create project.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search and filter header */}
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search projects..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.filterRow}>
          {['ALL', ProjectStatus.NOT_STARTED, ProjectStatus.IN_PROGRESS, ProjectStatus.COMPLETED].map(
            (status) => {
              const isActive = statusFilter === status;
              const label =
                status === 'ALL'
                  ? 'All'
                  : status === ProjectStatus.NOT_STARTED
                  ? 'Not Started'
                  : status === ProjectStatus.IN_PROGRESS
                  ? 'In Progress'
                  : 'Completed';
              return (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setStatusFilter(status)}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>
      </View>

      {/* Projects list */}
      {isLoading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No projects found</Text>
              <Text style={styles.emptySubtitle}>
                {search ? 'Try another search term' : 'Pull down to refresh or create a project'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.projectCard}
              onPress={() => router.push(`/project/${item.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.projectName} numberOfLines={1}>
                  {item.name}
                </Text>
                <ProjectStatusBadge status={item.status} />
              </View>

              {item.description ? (
                <Text style={styles.projectDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              <View style={styles.cardFooter}>
                <Text style={styles.taskCountText}>
                  Tasks: {item.completedTaskCount ?? 0} / {item.taskCount ?? 0}
                </Text>
                <Text style={styles.viewTasksLink}>View tasks →</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsModalOpen(true)}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Create Project Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Project</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Project Name *"
              placeholderTextColor="#9ca3af"
              value={newName}
              onChangeText={setNewName}
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Description (optional)"
              placeholderTextColor="#9ca3af"
              value={newDesc}
              onChangeText={setNewDesc}
              multiline
              numberOfLines={3}
            />

            <View style={styles.statusSelectRow}>
              <Text style={styles.modalLabel}>Initial Status:</Text>
              <View style={styles.statusButtons}>
                {[ProjectStatus.NOT_STARTED, ProjectStatus.IN_PROGRESS].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.statusOption, newStatus === st && styles.statusOptionActive]}
                    onPress={() => setNewStatus(st)}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        newStatus === st && styles.statusOptionTextActive,
                      ]}
                    >
                      {st === ProjectStatus.NOT_STARTED ? 'Not Started' : 'In Progress'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsModalOpen(false)}
                disabled={isCreating}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleCreateProject}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.saveBtnText}>Create Project</Text>
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
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 80,
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  projectDesc: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  taskCountText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  viewTasksLink: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
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
  statusSelectRow: {
    gap: 8,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  statusOptionActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  statusOptionText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  statusOptionTextActive: {
    color: '#2563eb',
    fontWeight: '700',
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

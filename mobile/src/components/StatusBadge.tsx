import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProjectStatus, TaskStatus, TaskPriority } from '../shared/types';

export const ProjectStatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  let bg = '#f3f4f6';
  let text = '#4b5563';
  let label = 'Not Started';

  if (status === ProjectStatus.IN_PROGRESS) {
    bg = '#dbeafe';
    text = '#1d4ed8';
    label = 'In Progress';
  } else if (status === ProjectStatus.COMPLETED) {
    bg = '#dcfce7';
    text = '#15803d';
    label = 'Completed';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
};

export const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  let bg = '#f3f4f6';
  let text = '#4b5563';
  let label = 'Pending';

  if (status === TaskStatus.IN_PROGRESS) {
    bg = '#dbeafe';
    text = '#1d4ed8';
    label = 'In Progress';
  } else if (status === TaskStatus.COMPLETED) {
    bg = '#dcfce7';
    text = '#15803d';
    label = 'Completed';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
};

export const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  let bg = '#f3f4f6';
  let text = '#4b5563';
  let label = 'Low';

  if (priority === TaskPriority.MEDIUM) {
    bg = '#fef3c7';
    text = '#b45309';
    label = 'Medium';
  } else if (priority === TaskPriority.HIGH) {
    bg = '#fee2e2';
    text = '#b91c1c';
    label = 'High';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

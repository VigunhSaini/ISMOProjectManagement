import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { api } from '../../src/api/client';
import { DashboardStats } from '../../src/shared/types';
import { useAuth } from '../../src/context/AuthContext';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setError(null);
      const res = await api.get<{ success: true; data: { stats: DashboardStats } }>('/dashboard');
      setStats(res.data.data.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />}
    >
      <View style={styles.welcomeBox}>
        <Text style={styles.greeting}>Welcome, {user?.name} 👋</Text>
        <Text style={styles.subtitle}>Pull down anytime to sync latest changes</Text>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* 5 Core Assessment Metrics */}
      <Text style={styles.sectionTitle}>Overview Metrics</Text>
      <View style={styles.grid}>
        {/* Total Projects */}
        <View style={[styles.card, styles.cardBlue]}>
          <Text style={styles.cardLabel}>Total Projects</Text>
          <Text style={styles.cardNumber}>{stats?.totalProjects ?? 0}</Text>
        </View>

        {/* Projects In Progress */}
        <View style={[styles.card, styles.cardIndigo]}>
          <Text style={styles.cardLabel}>In Progress Projects</Text>
          <Text style={styles.cardNumber}>{stats?.projectsInProgress ?? 0}</Text>
        </View>

        {/* Total Tasks */}
        <View style={[styles.card, styles.cardPurple]}>
          <Text style={styles.cardLabel}>Total Tasks</Text>
          <Text style={styles.cardNumber}>{stats?.totalTasks ?? 0}</Text>
        </View>

        {/* Completed Tasks */}
        <View style={[styles.card, styles.cardGreen]}>
          <Text style={styles.cardLabel}>Completed Tasks</Text>
          <Text style={[styles.cardNumber, { color: '#16a34a' }]}>{stats?.completedTasks ?? 0}</Text>
        </View>

        {/* Pending Tasks */}
        <View style={[styles.card, styles.cardAmber]}>
          <Text style={styles.cardLabel}>Pending Tasks</Text>
          <Text style={[styles.cardNumber, { color: '#d97706' }]}>{stats?.pendingTasks ?? 0}</Text>
        </View>
      </View>

      {/* Completion progress */}
      {stats && stats.totalTasks > 0 && (
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Task Completion Rate</Text>
            <Text style={styles.progressPercent}>
              {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(stats.completedTasks / stats.totalTasks) * 100}%` },
              ]}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  welcomeBox: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: '48%',
  },
  cardBlue: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  cardIndigo: {
    borderLeftWidth: 4,
    borderLeftColor: '#4f46e5',
  },
  cardPurple: {
    borderLeftWidth: 4,
    borderLeftColor: '#9333ea',
  },
  cardGreen: {
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  cardAmber: {
    borderLeftWidth: 4,
    borderLeftColor: '#d97706',
    width: '100%',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  cardNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginTop: 6,
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#16a34a',
    borderRadius: 4,
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ 
  icon = '📭',
  title = 'Aucune donnée', 
  subtitle,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    paddingVertical: theme.spacing.xxl, 
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
    opacity: 0.5
  },
  title: { 
    ...theme.typography.subtitle,
    color: '#6b7280',
    marginBottom: theme.spacing.xs
  },
  subtitle: { 
    ...theme.typography.caption,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xl
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  }
});

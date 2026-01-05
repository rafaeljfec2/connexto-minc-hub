import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Card } from '@/components'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface ActivityItem {
  id: string
  title: string
  description: string
  time?: string
  icon: keyof typeof Ionicons.glyphMap
  color?: string
}

interface ActivityFeedProps {
  activities?: ActivityItem[]
}

export function ActivityFeed({ activities = [] }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Atividades Recentes</Text>
        <Text style={styles.emptyText}>Nenhuma atividade recente</Text>
      </Card>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Atividades Recentes</Text>
      <Card style={styles.card}>
        {activities.map((item, index) => (
          <View key={item.id} style={styles.itemContainer}>
            <View style={styles.timelineContainer}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: item.color || themeColors.primary[500] },
                ]}
              >
                <Ionicons name={item.icon} size={14} color="#fff" />
              </View>
              {index < activities.length - 1 && <View style={styles.line} />}
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
              {item.time && <Text style={styles.itemTime}>{item.time}</Text>}
            </View>
          </View>
        ))}
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: themeSpacing.lg,
  },
  sectionTitle: {
    fontSize: themeTypography.sizes.md,
    fontWeight: themeTypography.weights.semibold,
    color: themeColors.text.default,
    marginBottom: themeSpacing.md,
    paddingHorizontal: themeSpacing.md,
  },
  card: {
    padding: themeSpacing.md,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: themeSpacing.md,
  },
  timelineContainer: {
    alignItems: 'center',
    marginRight: themeSpacing.md,
    width: 24,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: themeColors.card.border,
    marginVertical: 4,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: themeTypography.sizes.sm,
    fontWeight: themeTypography.weights.semibold,
    color: themeColors.text.default,
  },
  itemDescription: {
    fontSize: themeTypography.sizes.xs,
    color: themeColors.dark[400],
    marginTop: 2,
  },
  itemTime: {
    fontSize: 10,
    color: themeColors.dark[400], // Using dark gray for time
    marginTop: 4,
  },
  emptyText: {
    fontSize: themeTypography.sizes.sm,
    color: themeColors.dark[400],
  },
})

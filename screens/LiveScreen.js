import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native'
import { getLiveMatches } from '../api/footballApi'
import { getFavoriteTeams } from '../helpers/storage'
import { colors, fonts, spacing } from '../constants/theme'

function LiveMatchCard({ match }) {
  const home = match.homeTeam
  const away = match.awayTeam

  return (
    <View style={styles.card}>
      <View style={styles.liveIndicator}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>
          {match.elapsed > 90 ? `${match.elapsed}'` : `${match.elapsed}'`}
        </Text>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.teamCol}>
          <Text style={styles.teamName}>{home.name}</Text>
        </View>
        <View style={styles.scoreCol}>
          <Text style={styles.scoreText}>{match.score.home}</Text>
          <Text style={styles.scoreDash}>-</Text>
          <Text style={styles.scoreText}>{match.score.away}</Text>
        </View>
        <View style={styles.teamCol}>
          <Text style={styles.teamName}>{away.name}</Text>
        </View>
      </View>

      {match.goals.length > 0 && (
        <View style={styles.goalsSection}>
          {match.goals.map((g, i) => (
            <Text key={i} style={styles.goalText}>
              ⚽ {g.scorer} {g.minute}'
            </Text>
          ))}
        </View>
      )}
    </View>
  )
}

export default function LiveScreen() {
  const [matches, setMatches] = useState([])
  const [favorites, setFavorites] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [filterFavorites, setFilterFavorites] = useState(false)

  const loadMatches = useCallback(async () => {
    try {
      const data = await getLiveMatches()
      setMatches(data)
      const favs = await getFavoriteTeams()
      setFavorites(favs)
    } catch (e) {
      console.warn(e)
    }
  }, [])

  useEffect(() => {
    loadMatches()
    const interval = setInterval(loadMatches, 60000)
    return () => clearInterval(interval)
  }, [loadMatches])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadMatches()
    setRefreshing(false)
  }

  const displayMatches = favorites.length > 0 && filterFavorites
    ? matches.filter(m =>
        favorites.some(f =>
          m.homeTeam.name.toLowerCase().includes(f.toLowerCase()) ||
          m.awayTeam.name.toLowerCase().includes(f.toLowerCase())
        )
      )
    : matches

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={displayMatches}
      keyExtractor={item => String(item.id)}
      renderItem={({ item }) => <LiveMatchCard match={item} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>🔴 Scores en Direct</Text>
          {matches.length > 0 ? (
            <Text style={styles.subtitle}>{matches.length} match(s) en cours</Text>
          ) : (
            <Text style={styles.emptyText}>Aucun match en cours pour le moment.</Text>
          )}
          {favorites.length > 0 && (
            <Text
              style={styles.filterToggle}
              onPress={() => setFilterFavorites(!filterFavorites)}
            >
              {filterFavorites ? 'Afficher tous les matchs' : 'Favoris uniquement'}
            </Text>
          )}
        </View>
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.live]} />
      }
    />
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  header: { marginBottom: spacing.lg, alignItems: 'center' },
  title: { fontSize: fonts.header, fontWeight: 'bold', color: colors.live },
  subtitle: { fontSize: fonts.regular, color: colors.textSecondary, marginTop: spacing.xs },
  emptyText: { fontSize: fonts.regular, color: colors.textSecondary, marginTop: spacing.lg },
  filterToggle: {
    fontSize: fonts.small, color: colors.primary, marginTop: spacing.sm,
    textDecorationLine: 'underline',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.live,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  liveIndicator: {
    flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm,
  },
  liveDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: colors.live, marginRight: spacing.sm,
  },
  liveText: { fontSize: fonts.small, fontWeight: 'bold', color: colors.live },
  scoreRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  teamCol: { flex: 1, alignItems: 'center' },
  teamName: { fontSize: fonts.regular, fontWeight: '600', color: colors.text, textAlign: 'center' },
  scoreCol: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  scoreText: { fontSize: fonts.score, fontWeight: 'bold', color: colors.text },
  scoreDash: { fontSize: fonts.score, fontWeight: 'bold', color: colors.textSecondary, marginHorizontal: spacing.xs },
  goalsSection: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  goalText: { fontSize: fonts.small, color: colors.text, marginLeft: spacing.sm },
})

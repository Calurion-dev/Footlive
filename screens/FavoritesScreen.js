import React, { useState, useEffect } from 'react'
import {
  View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert,
} from 'react-native'
import { getFavoriteTeams, addFavoriteTeam, removeFavoriteTeam } from '../helpers/storage'
import { colors, fonts, spacing } from '../constants/theme'

const WORLD_CUP_TEAMS = [
  'France', 'Brésil', 'Argentine', 'Portugal', 'Angleterre', 'Allemagne',
  'Espagne', 'Italie', 'Pays-Bas', 'Belgique', 'Croatie', 'Uruguay',
  'Maroc', 'Japon', 'Corée du Sud', 'Sénégal', 'Nigeria', 'États-Unis',
  'Mexique', 'Australie', 'Suisse', 'Danemark', 'Pologne', 'Suede',
]

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    const data = await getFavoriteTeams()
    setFavorites(data)
  }

  const toggleTeam = async (teamName) => {
    const isFav = favorites.includes(teamName)
    if (isFav) {
      const updated = await removeFavoriteTeam(teamName)
      setFavorites(updated)
    } else {
      if (favorites.length >= 3) {
        Alert.alert('Limite atteinte', 'Tu peux sélectionner jusqu\'à 3 équipes favorites maximum.')
        return
      }
      const updated = await addFavoriteTeam(teamName)
      setFavorites(updated)
    }
  }

  const filteredTeams = WORLD_CUP_TEAMS.filter(t =>
    t.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⭐ Équipes favorites</Text>
        <Text style={styles.subtitle}>
          {favorites.length}/3 sélectionnées — Reçois les notifications live de tes équipes
        </Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher une équipe..."
        placeholderTextColor={colors.textSecondary}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredTeams}
        keyExtractor={item => item}
        renderItem={({ item }) => {
          const isFav = favorites.includes(item)
          return (
            <TouchableOpacity
              style={[styles.teamRow, isFav && styles.teamRowActive]}
              onPress={() => toggleTeam(item)}
            >
              <Text style={[styles.teamName, isFav && styles.teamNameActive]}>
                {item}
              </Text>
              <View style={[styles.checkbox, isFav && styles.checkboxActive]}>
                {isFav && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          )
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune équipe trouvée</Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.md, paddingBottom: 0 },
  title: { fontSize: fonts.header, fontWeight: 'bold', color: colors.primary, textAlign: 'center' },
  subtitle: { fontSize: fonts.small, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.md },
  searchInput: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    fontSize: fonts.regular,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: 3,
    padding: spacing.md,
    borderRadius: 8,
    elevation: 1,
  },
  teamRowActive: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  teamName: { fontSize: fonts.regular, color: colors.text },
  teamNameActive: { fontWeight: 'bold', color: colors.primary },
  checkbox: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xl, fontSize: fonts.regular },
})

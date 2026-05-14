import React, { useMemo, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Platform, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppData } from '../contexts/AppContext';
import { BUDGET_TIERS, PERSONALITY_OPTIONS } from '../hooks/useStyleProfile';
import { getRankTitle } from '../hooks/useConsultStreak';
import { useWeatherBadges, BADGE_CATEGORY_LABELS, BADGE_CATEGORY_ORDER } from '../hooks/useWeatherBadges';
import { colors, fonts, spacing } from '../theme';

const PASSPORT_MILESTONES = [
  { cities: 50, title: 'The Nomad Oracle',  icon: 'earth' as const },
  { cities: 25, title: 'World Citizen',     icon: 'airplane' as const },
  { cities: 10, title: 'Globetrotter',      icon: 'map-marker-multiple-outline' as const },
];

const RANK_PROGRESS = [
  { title: "Oracle's Chosen", min: 100 },
  { title: 'Muse',            min: 50 },
  { title: 'Connoisseur',     min: 20 },
  { title: 'Devotee',         min: 5 },
  { title: 'Initiate',        min: 1 },
];

export function YouScreen() {
  const navigation = useNavigation<any>();
  const [lockedExpanded, setLockedExpanded] = useState(false);
  const { profileCtx, historyCtx, streakCtx, savedCtx } = useAppData();
  const profile   = profileCtx.profile;
  const { history, firstConsultAt } = historyCtx;
  const { streak, totalConsults } = streakCtx;

  const rankTitle     = getRankTitle(totalConsults);
  const uniqueCities  = [...new Set(history.map(e => e.city.toLowerCase()))];
  const cityCount     = uniqueCities.length;
  const nextMilestone = PASSPORT_MILESTONES.find(m => cityCount < m.cities);
  const earnedStamps  = PASSPORT_MILESTONES.filter(m => cityCount >= m.cities);

  const nextRank = RANK_PROGRESS.find(r => totalConsults < r.min);
  const personalityLabel = PERSONALITY_OPTIONS.find(p => p.id === profile?.personality)?.title ?? 'The Editor';

  const badges = useWeatherBadges(history, firstConsultAt, {
    totalConsults,
    streak,
    savedCount: savedCtx.saved.length,
  });
  const earnedBadges     = useMemo(() => badges.filter(b => b.earned), [badges]);
  const unearnedBadges   = useMemo(() => badges.filter(b => !b.earned), [badges]);
  const isFoundingMember = useMemo(() => history.some(e => e.verdict.foundingMember === true), [history]);
  const badgesByCategory = useMemo(
    () => Object.fromEntries(BADGE_CATEGORY_ORDER.map(cat => [cat, earnedBadges.filter(b => b.category === cat)])),
    [earnedBadges],
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── RANK HERO ── */}
        <View style={styles.rankHero}>
          <Pressable
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Settings')}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
          >
            <MaterialCommunityIcons name="cog-outline" size={20} color="rgba(250,249,246,0.35)" />
          </Pressable>
          <Text style={styles.rankEyebrow}>ORACLE RANK</Text>
          <Text style={styles.rankTitle}>{rankTitle}</Text>
          <View style={styles.rankMeta}>
            <Text style={styles.rankConsults}>{totalConsults} consults</Text>
            {nextRank && (
              <Text style={styles.rankNext}>
                {nextRank.min - totalConsults} until {nextRank.title}
              </Text>
            )}
          </View>
          {isFoundingMember && (
            <View style={styles.foundingChip}>
              <MaterialCommunityIcons name="seal" size={12} color={colors.bg} />
              <Text style={styles.foundingChipText}>FOUNDING MEMBER</Text>
            </View>
          )}
          {streak > 0 && (
            <View style={styles.streakChip}>
              <MaterialCommunityIcons name="fire" size={12} color={colors.scarlet} />
              <Text style={styles.streakChipText}>{streak}-DAY STREAK</Text>
            </View>
          )}
        </View>

        {/* ── STYLE PASSPORT ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>STYLE PASSPORT</Text>
          </View>
          <View style={styles.passportHero}>
            <Text style={styles.passportCount}>{cityCount}</Text>
            <Text style={styles.passportLabel}>
              {cityCount === 1 ? 'city consulted' : 'cities consulted'}
            </Text>
          </View>
          <Pressable
            style={styles.mapLink}
            onPress={() => navigation.navigate('Map')}
            accessibilityRole="button"
            accessibilityLabel="View your city map"
          >
            <MaterialCommunityIcons name="map-outline" size={12} color={colors.scarlet} />
            <Text style={styles.mapLinkText}>VIEW ON MAP</Text>
          </Pressable>

          {nextMilestone && (
            <Text style={styles.passportNext}>
              {nextMilestone.cities - cityCount} more until "{nextMilestone.title}"
            </Text>
          )}
          {earnedStamps.length > 0 && (
            <View style={styles.stamps}>
              {earnedStamps.map(stamp => (
                <View key={stamp.title} style={styles.stamp}>
                  <MaterialCommunityIcons name={stamp.icon} size={14} color={colors.textSecondary} />
                  <Text style={styles.stampText}>{stamp.title}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── ACHIEVEMENTS ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>ACHIEVEMENTS</Text>
            <Text style={styles.badgeCount}>
              {earnedBadges.length}/{badges.length}
            </Text>
          </View>

          {earnedBadges.length === 0 && (
            <Text style={styles.badgeEmpty}>
              Consult the Oracle to begin earning achievements.
            </Text>
          )}

          {earnedBadges.length > 0 && BADGE_CATEGORY_ORDER.map(cat => {
            const catBadges = badgesByCategory[cat] ?? [];
            if (catBadges.length === 0) return null;
            return (
              <View key={cat} style={styles.badgeCategory}>
                <Text style={styles.badgeCategoryLabel}>{BADGE_CATEGORY_LABELS[cat]}</Text>
                <View style={styles.badgeGrid}>
                  {catBadges.map(b => (
                    <View key={b.id} style={styles.badge}>
                      <MaterialCommunityIcons name={b.icon as any} size={18} color={colors.textPrimary} />
                      <Text style={styles.badgeTitle}>{b.title}</Text>
                      <Text style={styles.badgeDesc}>{b.desc}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}

          {unearnedBadges.length > 0 && (
            <View style={earnedBadges.length > 0 ? styles.badgeGridDivider : undefined}>
              <Pressable
                style={styles.lockedHeader}
                onPress={() => setLockedExpanded(e => !e)}
                accessibilityRole="button"
                accessibilityLabel={lockedExpanded ? 'Collapse locked achievements' : 'Expand locked achievements'}
              >
                <Text style={styles.badgeCategoryLabel}>LOCKED — {unearnedBadges.length} remaining</Text>
                <MaterialCommunityIcons
                  name={lockedExpanded ? 'chevron-up' : 'chevron-down'}
                  size={12}
                  color={colors.textMuted}
                />
              </Pressable>
              {lockedExpanded && (
                <View style={styles.badgeGrid}>
                  {unearnedBadges.map(b => (
                    <View key={b.id} style={[styles.badge, styles.badgeLocked]}>
                      <MaterialCommunityIcons name={b.icon as any} size={18} color={colors.border} />
                      <Text style={styles.badgeTitleLocked}>{b.title}</Text>
                      <Text style={styles.badgeDesc}>{b.desc}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* ── YOUR STYLE ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>YOUR STYLE</Text>
            <Pressable
              onPress={() => navigation.navigate('ProfileEdit')}
              accessibilityRole="button"
              accessibilityLabel="Edit style profile"
            >
              <Text style={styles.editBtn}>Edit →</Text>
            </Pressable>
          </View>
          {profile ? (
            <>
              {profile.name ? (
                <Text style={styles.profileName}>{profile.name}</Text>
              ) : null}
              <View style={styles.keywordRow}>
                {profile.keywords.map(k => (
                  <View key={k} style={styles.keyword}>
                    <Text style={styles.keywordText}>{k}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.profileMeta}>
                <View style={styles.profileMetaRow}>
                  <Text style={styles.profileMetaLabel}>BUDGET</Text>
                  <Text style={styles.profileMetaVal}>
                    {BUDGET_TIERS.find(b => b.id === profile.budget)?.label ?? profile.budget}
                  </Text>
                </View>
                <View style={styles.profileMetaRow}>
                  <Text style={styles.profileMetaLabel}>ORACLE VOICE</Text>
                  <Text style={styles.profileMetaVal}>{personalityLabel}</Text>
                </View>
              </View>
            </>
          ) : (
            <Pressable
              style={styles.setupProfile}
              onPress={() => navigation.navigate('ProfileEdit')}
            >
              <Text style={styles.setupProfileText}>Set up your style profile →</Text>
            </Pressable>
          )}
        </View>

        {/* ── SAVED LOOKS ── */}
        {savedCtx.saved.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>SAVED LOOKS</Text>
              <Text style={styles.badgeCount}>{savedCtx.saved.length}</Text>
            </View>
            {savedCtx.saved.map(s => (
              <View key={`${s.item.item}-${s.savedAt}`} style={styles.savedRow}>
                <View style={styles.savedLeft}>
                  <Text style={styles.savedCategory}>{s.item.category.toUpperCase()}</Text>
                  <Text style={styles.savedItem}>{s.item.item}</Text>
                  <Text style={styles.savedMeta}>{s.city} · {s.vibe}</Text>
                </View>
                <Pressable
                  onPress={() => savedCtx.removeOutfit(s.item, s.city)}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${s.item.item} from saved looks`}
                >
                  <MaterialCommunityIcons name="heart" size={16} color={colors.scarlet} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* ── ORACLE ARCHIVES ── */}
        {history.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>ORACLE ARCHIVES</Text>
            </View>
            {history.map(entry => (
              <View key={entry.id} style={styles.archiveRow}>
                <View style={styles.archiveDate}>
                  <Text style={styles.archiveDateDay}>
                    {new Date(entry.consultedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={styles.archiveDateTime}>
                    {new Date(entry.consultedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={styles.archiveCenter}>
                  <Text style={styles.archiveCity}>{entry.city}</Text>
                  <Text style={styles.archiveVibe}>{entry.verdict.vibe}</Text>
                </View>
                <Text style={styles.archiveTemp}>{entry.weather.temp}°</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingTop: Platform.OS === 'ios' ? 16 : 12,
    paddingBottom: 60,
  },

  /* Rank hero */
  rankHero: {
    backgroundColor: colors.bgDark,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  settingsBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: 8,
    zIndex: 1,
  },
  rankEyebrow: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 3,
    color: 'rgba(250,249,246,0.40)',
    marginBottom: spacing.sm,
  },
  rankTitle: {
    fontFamily: fonts.display,
    fontSize: 48,
    color: '#FAF9F6',
    lineHeight: 52,
    letterSpacing: -1,
  },
  rankMeta: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  rankConsults: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: 'rgba(250,249,246,0.50)',
    letterSpacing: 0.5,
  },
  rankNext: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: 'rgba(250,249,246,0.30)',
    letterSpacing: 0.3,
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.scarlet,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  streakChipText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.scarlet,
  },
  foundingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.scarlet,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  foundingChipText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.bg,
  },

  /* Sections */
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2.5,
    color: colors.textMuted,
  },
  editBtn: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },

  /* Passport */
  passportHero: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  passportCount: {
    fontFamily: fonts.display,
    fontSize: 52,
    color: colors.textPrimary,
    letterSpacing: -1,
    lineHeight: 56,
  },
  passportLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.scarlet,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  mapLinkText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.scarlet,
    letterSpacing: 1.5,
  },
  passportNext: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.3,
    marginBottom: spacing.md,
  },
  stamps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.borderMid,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  stampText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textSecondary,
    letterSpacing: 1,
  },

  /* Style profile */
  profileName: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },
  keywordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  keyword: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  keywordText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  profileMeta: { gap: 8 },
  profileMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileMetaLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 1.5,
  },
  profileMetaVal: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  setupProfile: { paddingVertical: spacing.sm },
  setupProfileText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.scarlet,
    letterSpacing: 0.5,
  },

  /* Achievement categories */
  badgeCategory: {
    marginBottom: spacing.md,
  },
  badgeCategoryLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.scarlet,
    marginBottom: spacing.sm,
  },

  /* Weather badges */
  badgeCount: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badgeGridDivider: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lockedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: spacing.sm,
  },
  badge: {
    width: '47%',
    borderWidth: 1,
    borderColor: colors.borderMid,
    padding: spacing.sm,
    gap: 4,
  },
  badgeLocked: {
    borderColor: colors.border,
    opacity: 0.45,
  },
  badgeTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: colors.textPrimary,
    letterSpacing: -0.1,
  },
  badgeTitleLocked: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },
  badgeDesc: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 0.3,
    lineHeight: 14,
  },
  badgeEmpty: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.3,
    lineHeight: 17,
  },

  /* Saved looks */
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  savedLeft: { flex: 1 },
  savedCategory: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 2,
    color: colors.textMuted,
    marginBottom: 2,
  },
  savedItem: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  savedMeta: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 0.3,
    marginTop: 2,
  },

  /* Archives */
  archiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  archiveDate: { width: 52, marginRight: spacing.md },
  archiveDateDay: { fontFamily: fonts.mono, fontSize: 10, color: colors.textPrimary, letterSpacing: 0.3 },
  archiveDateTime: { fontFamily: fonts.mono, fontSize: 9, color: colors.textMuted, marginTop: 2 },
  archiveCenter: { flex: 1 },
  archiveCity: { fontFamily: fonts.display, fontSize: 20, color: colors.textPrimary, letterSpacing: -0.3 },
  archiveVibe: { fontFamily: fonts.mono, fontSize: 10, color: colors.textMuted, letterSpacing: 0.3, marginTop: 1 },
  archiveTemp: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.textPrimary, marginLeft: spacing.sm },
});

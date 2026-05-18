import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, StatusBar, Image, Modal, Linking, TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppData } from '../contexts/AppContext';
import { BUDGET_TIERS, PERSONALITY_OPTIONS } from '../hooks/useStyleProfile';
import { getRankTitle } from '../hooks/useConsultStreak';
import { BADGE_CATEGORY_LABELS, BADGE_CATEGORY_ORDER } from '../hooks/useWeatherBadges';
import { AppColors, AppFonts, AppMetrics, ThemeName, isEditorialTheme, isMondrianTheme, isY2KTheme, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { MondrianYouScreen } from './mondrian/MondrianYouScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTempUnit } from '../contexts/TemperatureContext';
import type { ArchiveEntry, ArchiveImages, Reaction } from '../hooks/useArchive';

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

const ARCHIVE_IMAGE_SLOTS: Array<{ key: keyof ArchiveImages; label: string }> = [
  { key: 'day', label: 'DAY PHOTO' },
  { key: 'night', label: 'NIGHT PHOTO' },
  { key: 'daySketch', label: 'DAY SKETCH' },
  { key: 'nightSketch', label: 'NIGHT SKETCH' },
];

const NONE_NEEDED_RE = /\bnone\b|not needed|no outer|skip the|universe has gifted|weather permits|too warm|unnecessary/i;

function archiveImageUrl(entry: ArchiveEntry, key: keyof ArchiveImages): string | undefined {
  if (key === 'daySketch') return entry.images.daySketch ?? entry.images.sketch;
  return entry.images[key];
}

function splitShopItems(raw: string): string[] {
  return raw
    .split(/,\s*|\s+and\s+|\s*\+\s*/i)
    .map(s => s.trim())
    .filter(Boolean);
}

function openShop(itemName: string) {
  const query = encodeURIComponent(itemName);
  Linking.openURL(`https://www.google.com/search?tbm=shop&q=${query}`).catch(() => {});
}

export function YouScreen() {
  const { colors, fonts, metrics, isDark, themeName } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fonts, metrics, themeName), [colors, fonts, metrics, themeName]);
  const { formatTemp } = useTempUnit();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [lockedExpanded, setLockedExpanded] = useState(false);
  const [isFoundingMember, setIsFoundingMember] = useState(false);
  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(null);
  const [archiveSort, setArchiveSort] = useState<'recent' | 'oldest'>('recent');
  const [archiveFilter, setArchiveFilter] = useState<'all' | 'liked'>('all');
  const [archiveOccasionFilter, setArchiveOccasionFilter] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(BADGE_CATEGORY_ORDER),
  );
  const toggleCategory = useCallback((cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  }, []);
  const { profileCtx, historyCtx, streakCtx, savedCtx, archiveCtx, badges } = useAppData();
  const profile   = profileCtx.profile;
  const { history } = historyCtx;
  const { streak, totalConsults } = streakCtx;
  const selectedArchive = useMemo(
    () => archiveCtx.entries.find(entry => entry.id === selectedArchiveId) ?? null,
    [archiveCtx.entries, selectedArchiveId],
  );

  const rankTitle     = getRankTitle(totalConsults);
  const uniqueCities  = [...new Set(history.map(e => e.city.toLowerCase()))];
  const cityCount     = uniqueCities.length;
  const nextMilestone = PASSPORT_MILESTONES.find(m => cityCount < m.cities);
  const earnedStamps  = PASSPORT_MILESTONES.filter(m => cityCount >= m.cities);

  const nextRank = RANK_PROGRESS.find(r => totalConsults < r.min);
  const personalityLabel = PERSONALITY_OPTIONS.find(p => p.id === profile?.personality)?.title ?? 'The Editor';
  useEffect(() => {
    AsyncStorage.getItem('@outfit_oracle_founding_member')
      .then(val => setIsFoundingMember(val === '1'))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedArchiveId && !selectedArchive) {
      setSelectedArchiveId(null);
    }
  }, [selectedArchiveId, selectedArchive]);

  const earnedBadges     = useMemo(() => badges.filter(b => b.earned), [badges]);
  const unearnedBadges   = useMemo(() => badges.filter(b => !b.earned), [badges]);
  const badgesByCategory = useMemo(
    () => Object.fromEntries(BADGE_CATEGORY_ORDER.map(cat => [cat, earnedBadges.filter(b => b.category === cat)])),
    [earnedBadges],
  );

  const archiveOccasions = useMemo(() => {
    const set = new Set<string>();
    archiveCtx.entries.forEach(e => { if (e.occasion && e.occasion !== 'Any') set.add(e.occasion); });
    return [...set];
  }, [archiveCtx.entries]);

  const filteredLooks = useMemo(() => {
    let result = [...archiveCtx.entries];
    if (archiveFilter === 'liked') result = result.filter(e => e.reaction === 'liked');
    if (archiveOccasionFilter) result = result.filter(e => e.occasion === archiveOccasionFilter);
    if (archiveSort === 'oldest') result = result.reverse();
    return result;
  }, [archiveCtx.entries, archiveFilter, archiveOccasionFilter, archiveSort]);

  if (isMondrianTheme(themeName)) return <MondrianYouScreen />;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDark} translucent={false} />
      <ScrollView
        style={styles.scrollBg}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ── RANK HERO ── */}
        <View style={[styles.rankHero, { paddingTop: spacing.xl + insets.top }]}>
          <Pressable
            style={[styles.settingsBtn, { top: insets.top + spacing.md }]}
            onPress={() => navigation.navigate('Settings')}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
          >
            <MaterialCommunityIcons name="cog-outline" size={22} color="#FAF9F6" />
          </Pressable>
          <Text style={styles.rankEyebrow}>ORACLE RANK</Text>
          {profile?.name ? (
            <Text style={styles.rankGreeting}>Welcome back, {profile.name}.</Text>
          ) : null}
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
              <MaterialCommunityIcons name="seal" size={12} color="#FAF9F6" />
              <Text style={styles.foundingChipText}>FOUNDING MEMBER</Text>
            </View>
          )}
          {streak > 0 && (
            <View style={styles.streakChip}>
              <MaterialCommunityIcons name="fire" size={12} color={colors.scarletFg} />
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
            <MaterialCommunityIcons name="map-outline" size={12} color={!isEditorialTheme(themeName) ? colors.scarletFg : colors.textSecondary} />
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
            const isExpanded = expandedCategories.has(cat);
            return (
              <View key={cat} style={styles.badgeCategory}>
                <Pressable
                  style={styles.badgeCategoryHeader}
                  onPress={() => toggleCategory(cat)}
                  accessibilityRole="button"
                  accessibilityLabel={`${isExpanded ? 'Collapse' : 'Expand'} ${BADGE_CATEGORY_LABELS[cat]}`}
                >
                  <Text style={styles.badgeCategoryLabel}>{BADGE_CATEGORY_LABELS[cat]}</Text>
                  <View style={styles.badgeCategoryRight}>
                    <Text style={styles.badgeCategoryCount}>{catBadges.length}</Text>
                    <MaterialCommunityIcons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={12}
                      color={colors.textMuted}
                    />
                  </View>
                </Pressable>
                {isExpanded && (
                  <View style={styles.badgeGrid}>
                    {catBadges.map(b => (
                      <View key={b.id} style={styles.badge}>
                        <MaterialCommunityIcons name={b.icon as any} size={18} color={metrics.cardGap === 32 ? '#000000' : colors.textPrimary} />
                        <Text style={styles.badgeTitle}>{b.title}</Text>
                        <Text style={styles.badgeDesc}>{b.desc}</Text>
                      </View>
                    ))}
                  </View>
                )}
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

        {/* ── SAVED ITEMS ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>SAVED ITEMS</Text>
            {savedCtx.saved.length > 0 && <Text style={styles.badgeCount}>{savedCtx.saved.length}</Text>}
          </View>
          {savedCtx.saved.length === 0 ? (
            <Text style={styles.emptyState}>No items saved. The wardrobe is a blank canvas.</Text>
          ) : savedCtx.saved.map(s => (
              <View key={`${s.item.item}-${s.savedAt}`} style={styles.savedRow}>
                <View style={styles.savedLeft}>
                  <Text style={styles.savedCategory}>{s.item.category.toUpperCase()}</Text>
                  <Text style={styles.savedItem}>{s.item.item}</Text>
                  <Text style={styles.savedMeta}>{s.city} · {s.vibe}</Text>
                </View>
                <View style={styles.savedRight}>
                  <View style={styles.savedReactionRow}>
                    <Pressable
                      hitSlop={8}
                      onPress={() => savedCtx.setReaction(s.item, s.city, s.reaction === 'liked' ? null : 'liked')}
                      accessibilityRole="button"
                      accessibilityLabel="Like item"
                    >
                      <MaterialCommunityIcons
                        name={s.reaction === 'liked' ? 'heart' : 'heart-outline'}
                        size={16}
                        color={s.reaction === 'liked' ? colors.scarletFg : colors.textMuted}
                      />
                    </Pressable>
                    <Pressable
                      hitSlop={8}
                      onPress={() => savedCtx.setReaction(s.item, s.city, s.reaction === 'disliked' ? null : 'disliked')}
                      accessibilityRole="button"
                      accessibilityLabel="Dislike item"
                    >
                      <MaterialCommunityIcons
                        name={s.reaction === 'disliked' ? 'thumb-down' : 'thumb-down-outline'}
                        size={14}
                        color={s.reaction === 'disliked' ? colors.textSecondary : colors.textMuted}
                      />
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={() => savedCtx.removeOutfit(s.item, s.city)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${s.item.item} from saved items`}
                  >
                    <MaterialCommunityIcons name="close" size={14} color={colors.textMuted} />
                  </Pressable>
                </View>
              </View>
            ))}
        </View>

        {/* ── SAVED LOOKS ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>SAVED LOOKS</Text>
            <View style={styles.archiveSortRow}>
              {archiveCtx.entries.length > 0 && (
                <Text style={styles.badgeCount}>{archiveCtx.entries.length}</Text>
              )}
              {archiveCtx.entries.length > 1 && (
                <Pressable
                  style={styles.archiveSortBtn}
                  onPress={() => setArchiveSort(s => s === 'recent' ? 'oldest' : 'recent')}
                  accessibilityRole="button"
                  accessibilityLabel={`Sort ${archiveSort === 'recent' ? 'oldest first' : 'newest first'}`}
                >
                  <MaterialCommunityIcons
                    name={archiveSort === 'recent' ? 'sort-descending' : 'sort-ascending'}
                    size={13}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.archiveSortBtnText}>
                    {archiveSort === 'recent' ? 'RECENT' : 'OLDEST'}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
          {archiveCtx.entries.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.archiveFilterRow}
            >
              <Pressable
                style={[styles.archiveFilterChip, archiveFilter === 'all' && !archiveOccasionFilter && styles.archiveFilterChipActive]}
                onPress={() => { setArchiveFilter('all'); setArchiveOccasionFilter(null); }}
                accessibilityRole="radio"
                accessibilityState={{ selected: archiveFilter === 'all' && !archiveOccasionFilter }}
                accessibilityLabel="Show all saved looks"
              >
                <Text style={[styles.archiveFilterText, archiveFilter === 'all' && !archiveOccasionFilter && styles.archiveFilterTextActive]}>All</Text>
              </Pressable>
              <Pressable
                style={[styles.archiveFilterChip, archiveFilter === 'liked' && styles.archiveFilterChipActive]}
                onPress={() => { setArchiveFilter(f => f === 'liked' ? 'all' : 'liked'); setArchiveOccasionFilter(null); }}
                accessibilityRole="radio"
                accessibilityState={{ selected: archiveFilter === 'liked' }}
                accessibilityLabel="Show liked looks only"
              >
                <MaterialCommunityIcons
                  name="heart"
                  size={11}
                  color={archiveFilter === 'liked' ? '#FAF9F6' : colors.textMuted}
                />
                <Text style={[styles.archiveFilterText, archiveFilter === 'liked' && styles.archiveFilterTextActive]}>Liked</Text>
              </Pressable>
              {archiveOccasions.map(occ => (
                <Pressable
                  key={occ}
                  style={[styles.archiveFilterChip, archiveOccasionFilter === occ && styles.archiveFilterChipActive]}
                  onPress={() => { setArchiveOccasionFilter(f => f === occ ? null : occ); setArchiveFilter('all'); }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: archiveOccasionFilter === occ }}
                  accessibilityLabel={`Filter by ${occ}`}
                >
                  <Text style={[styles.archiveFilterText, archiveOccasionFilter === occ && styles.archiveFilterTextActive]}>{occ}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
          {archiveCtx.entries.length === 0 ? (
            <Text style={styles.emptyState}>
              Like or save an outfit from the Oracle to build your archive.
            </Text>
          ) : filteredLooks.length === 0 ? (
            <Text style={styles.emptyState}>No looks match the current filter.</Text>
          ) : filteredLooks.map(entry => {
            const thumb = entry.images.daySketch ?? entry.images.sketch ?? entry.images.day ?? entry.images.night ?? entry.images.nightSketch;
            const savedDate = new Date(entry.savedAt);
            const dateStr = savedDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
            const timeStr = savedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <Pressable
                key={entry.id}
                style={({ pressed }) => [styles.lookCard, pressed && styles.lookCardPressed]}
                onPress={() => setSelectedArchiveId(entry.id)}
                accessibilityRole="button"
                accessibilityLabel={`Open saved look ${entry.verdict.vibe}`}
              >
                {/* Thumbnail */}
                {thumb ? (
                  <Image source={{ uri: thumb }} style={styles.lookThumb} resizeMode="cover" />
                ) : (
                  <View style={[styles.lookThumb, styles.lookThumbEmpty]}>
                    <MaterialCommunityIcons name="eye-outline" size={18} color={colors.textMuted} />
                  </View>
                )}
                {/* Info */}
                <View style={styles.lookInfo}>
                  <Text style={styles.lookVibe} numberOfLines={1}>{entry.verdict.vibe}</Text>
                  <Text style={styles.lookMeta}>
                    {entry.city}
                    {entry.occasion && entry.occasion !== 'Any' ? ` · ${entry.occasion}` : ''}
                  </Text>
                  <Text style={styles.lookDate}>{dateStr} · {timeStr} · {entry.weather.temp}°C · {entry.weather.conditionLabel}</Text>
                  {entry.note ? (
                    <Text style={styles.lookNote} numberOfLines={2}>{entry.note}</Text>
                  ) : null}
                  <Text style={styles.lookOpen}>OPEN FULL CARD →</Text>
                  <View style={styles.lookReactionRow}>
                    <Pressable
                      hitSlop={8}
                      onPress={() => archiveCtx.setReaction(entry.id, entry.reaction === 'liked' ? null : 'liked')}
                      accessibilityRole="button"
                      accessibilityLabel="Like"
                    >
                      <MaterialCommunityIcons
                        name={entry.reaction === 'liked' ? 'heart' : 'heart-outline'}
                        size={15}
                        color={entry.reaction === 'liked' ? colors.scarletFg : colors.textMuted}
                      />
                    </Pressable>
                    <Pressable
                      hitSlop={8}
                      onPress={() => archiveCtx.setReaction(entry.id, entry.reaction === 'disliked' ? null : 'disliked')}
                      accessibilityRole="button"
                      accessibilityLabel="Dislike"
                    >
                      <MaterialCommunityIcons
                        name={entry.reaction === 'disliked' ? 'thumb-down' : 'thumb-down-outline'}
                        size={15}
                        color={entry.reaction === 'disliked' ? colors.textSecondary : colors.textMuted}
                      />
                    </Pressable>
                  </View>
                </View>
                {/* Delete */}
                <Pressable
                  hitSlop={12}
                  onPress={() => {
                    archiveCtx.removeEntry(entry.id);
                    if (selectedArchiveId === entry.id) setSelectedArchiveId(null);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Remove from archive"
                  style={styles.lookDelete}
                >
                  <MaterialCommunityIcons name="close" size={14} color={colors.textMuted} />
                </Pressable>
              </Pressable>
            );
          })}
        </View>

        {/* ── ORACLE ARCHIVES ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>ORACLE ARCHIVES</Text>
          </View>
          {history.length === 0 ? (
            <Text style={styles.emptyState}>The Oracle awaits your first inquiry.</Text>
          ) : history.map(entry => (
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
              <Text style={styles.archiveTemp}>{formatTemp(entry.weather.temp)}°</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      <ArchiveDetailModal
        visible={!!selectedArchive}
        entry={selectedArchive}
        styles={styles}
        colors={colors}
        fonts={fonts}
        formatTemp={formatTemp}
        topInset={insets.top}
        onClose={() => setSelectedArchiveId(null)}
        onRemove={id => {
          archiveCtx.removeEntry(id);
          setSelectedArchiveId(null);
        }}
        onReact={(id, reaction) => archiveCtx.setReaction(id, reaction)}
        onSetNote={(id, note) => archiveCtx.setNote(id, note)}
      />
    </View>
  );
}

interface ArchiveDetailModalProps {
  visible: boolean;
  entry: ArchiveEntry | null;
  styles: ReturnType<typeof makeStyles>;
  colors: AppColors;
  fonts: AppFonts;
  formatTemp: (celsius: number) => string;
  topInset: number;
  onClose: () => void;
  onRemove: (id: string) => void;
  onReact: (id: string, reaction: Reaction) => void;
  onSetNote: (id: string, note: string) => void;
}

function ArchiveDetailModal({
  visible,
  entry,
  styles,
  colors,
  fonts,
  formatTemp,
  topInset,
  onClose,
  onRemove,
  onReact,
  onSetNote,
}: ArchiveDetailModalProps) {
  const [noteText, setNoteText] = React.useState('');

  React.useEffect(() => {
    setNoteText(entry?.note ?? '');
  }, [entry?.id, entry?.note]);

  if (!entry) return null;

  const savedDate = new Date(entry.savedAt);
  const dayLooks = entry.verdict.outfits;
  const nightLooks = entry.verdict.outfitsAlt ?? [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.detailRoot}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bgDark} />
        <View style={[styles.detailHeader, { paddingTop: topInset + spacing.sm }]}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close saved look detail"
            style={styles.detailHeaderBtn}
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color="#FAF9F6" />
          </Pressable>
          <Text style={styles.detailHeaderTitle}>SAVED LOOK</Text>
          <Pressable
            onPress={() => onRemove(entry.id)}
            accessibilityRole="button"
            accessibilityLabel="Remove saved look"
            style={styles.detailHeaderBtn}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={18} color="#FAF9F6" />
          </Pressable>
        </View>

        <ScrollView
          style={styles.detailScroll}
          contentContainerStyle={styles.detailContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.detailCity}>{entry.city}</Text>
          <Text style={styles.detailVibe}>{entry.verdict.vibe}</Text>
          <View style={styles.detailMetaRow}>
            <Text style={styles.detailMetaText}>
              {formatTemp(entry.weather.temp)}° · {entry.weather.conditionLabel}
            </Text>
            <Text style={styles.detailMetaText}>
              {savedDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} · {savedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          <View style={styles.detailImageGrid}>
            {ARCHIVE_IMAGE_SLOTS.map(slot => {
              const url = archiveImageUrl(entry, slot.key);
              return (
                <View key={slot.key} style={styles.detailImageCell}>
                  {url ? (
                    <Image source={{ uri: url }} style={styles.detailImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.detailImage, styles.detailImageMissing]}>
                      <MaterialCommunityIcons name="image-outline" size={18} color={colors.textMuted} />
                      <Text style={styles.detailImageMissingText}>PENDING</Text>
                    </View>
                  )}
                  <Text style={styles.detailImageLabel}>{slot.label}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.detailVerdictCard}>
            <View style={styles.detailVerdictTop}>
              <Text style={styles.detailCardLabel}>VERDICT</Text>
              <Text style={styles.detailRating}>{'★'.repeat(entry.verdict.rating)}</Text>
            </View>
            <Text style={styles.detailVerdictText}>{entry.verdict.verdict}</Text>
          </View>

          <ArchivedLookSection title="DAY LOOK" items={dayLooks} styles={styles} colors={colors} />
          {nightLooks.length > 0 ? (
            <ArchivedLookSection title="NIGHT LOOK" items={nightLooks} styles={styles} colors={colors} />
          ) : null}

          {entry.verdict.avoid.length > 0 ? (
            <View style={styles.detailVerdictCard}>
              <Text style={styles.detailCardLabel}>AVOID</Text>
              {entry.verdict.avoid.map(item => (
                <Text key={item} style={styles.detailAvoidText}>• {item}</Text>
              ))}
            </View>
          ) : null}

          {/* Note editor */}
          <View style={styles.detailNoteWrap}>
            <Text style={styles.detailNoteLabel}>YOUR NOTE</Text>
            <TextInput
              style={[styles.detailNoteInput, { fontFamily: fonts.serif, color: colors.textPrimary }]}
              value={noteText}
              onChangeText={setNoteText}
              onBlur={() => onSetNote(entry.id, noteText)}
              onSubmitEditing={() => onSetNote(entry.id, noteText)}
              placeholder="Wore to Sarah's wedding. Got three compliments."
              placeholderTextColor={colors.textMuted}
              multiline
              returnKeyType="done"
              blurOnSubmit
              accessibilityLabel="Add a personal note to this saved look"
            />
          </View>

          <View style={styles.detailReactionRow}>
            <Pressable
              style={styles.detailReactionBtn}
              onPress={() => onReact(entry.id, entry.reaction === 'liked' ? null : 'liked')}
              accessibilityRole="button"
              accessibilityLabel="Like saved look"
            >
              <MaterialCommunityIcons
                name={entry.reaction === 'liked' ? 'heart' : 'heart-outline'}
                size={18}
                color={entry.reaction === 'liked' ? colors.scarletFg : colors.textMuted}
              />
              <Text style={[styles.detailReactionText, entry.reaction === 'liked' && { color: colors.scarletFg }]}>LIKE</Text>
            </Pressable>
            <Pressable
              style={styles.detailReactionBtn}
              onPress={() => onReact(entry.id, entry.reaction === 'disliked' ? null : 'disliked')}
              accessibilityRole="button"
              accessibilityLabel="Dislike saved look"
            >
              <MaterialCommunityIcons
                name={entry.reaction === 'disliked' ? 'thumb-down' : 'thumb-down-outline'}
                size={18}
                color={entry.reaction === 'disliked' ? colors.textSecondary : colors.textMuted}
              />
              <Text style={[styles.detailReactionText, entry.reaction === 'disliked' && { color: colors.textSecondary }]}>PASS</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function ArchivedLookSection({
  title,
  items,
  styles,
  colors,
}: {
  title: string;
  items: ArchiveEntry['verdict']['outfits'];
  styles: ReturnType<typeof makeStyles>;
  colors: AppColors;
}) {
  return (
    <View style={styles.detailVerdictCard}>
      <Text style={styles.detailCardLabel}>{title}</Text>
      {items.map(item => {
        const shopItems = NONE_NEEDED_RE.test(item.item) ? [] : splitShopItems(item.item);
        return (
          <View key={`${title}-${item.category}`} style={styles.detailOutfitRow}>
            <Text style={styles.detailOutfitCategory}>{item.category.toUpperCase()}</Text>
            <Text style={styles.detailOutfitItem}>{item.item}</Text>
            <Text style={styles.detailOutfitDetail}>{item.detail}</Text>
            {shopItems.length > 0 ? (
              <View style={styles.detailShopRow}>
                {shopItems.map(piece => (
                  <Pressable
                    key={`${title}-${item.category}-${piece}`}
                    style={({ pressed }) => [styles.detailShopBtn, pressed && styles.detailShopBtnPressed]}
                    onPress={() => openShop(piece)}
                    accessibilityRole="link"
                    accessibilityLabel={`Shop similar ${piece}`}
                    accessibilityHint="Opens Google Shopping in your browser"
                  >
                    <Text style={styles.detailShopText} numberOfLines={1}>
                      {shopItems.length > 1 ? `SHOP ${piece.toUpperCase()}` : 'SHOP SIMILAR'}
                    </Text>
                    <MaterialCommunityIcons
                      name="open-in-new"
                      size={11}
                      color={colors.textSecondary}
                      style={styles.detailShopIcon}
                    />
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function makeStyles(colors: AppColors, fonts: AppFonts, metrics: AppMetrics, themeName: ThemeName) {
  const isY2K = isY2KTheme(themeName);

  return StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgDark },
  scrollBg: { backgroundColor: colors.bg },
  content: {
    paddingBottom: 60,
  },

  /* Rank hero */
  rankHero: {
    backgroundColor: colors.bgDark,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    marginBottom: spacing.md,
  },
  settingsBtn: {
    position: 'absolute',
    right: spacing.md,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(250,249,246,0.22)',
    backgroundColor: 'rgba(250,249,246,0.10)',
    zIndex: 1,
  },
  rankEyebrow: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 3,
    color: 'rgba(250,249,246,0.40)',
    marginBottom: spacing.sm,
  },
  rankGreeting: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 0.5,
    color: 'rgba(250,249,246,0.52)',
    marginBottom: spacing.xs,
  },
  rankTitle: {
    fontFamily: fonts.display,
    fontSize: 48,
    color: '#FAF9F6',
    lineHeight: isY2K ? 64 : 52,
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
    fontSize: 12,
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
    borderColor: !isEditorialTheme(themeName) ? colors.scarletFg : 'rgba(250,249,246,0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  streakChipText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: !isEditorialTheme(themeName) ? colors.scarletFg : 'rgba(250,249,246,0.50)',
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
    fontSize: 11,
    letterSpacing: 1.5,
    color: '#FAF9F6',
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
    fontSize: 12,
    letterSpacing: 2.5,
    color: colors.textMuted,
  },
  editBtn: {
    fontFamily: fonts.mono,
    fontSize: 12,
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
    lineHeight: isY2K ? 68 : 58,
    color: colors.textPrimary,
    letterSpacing: -1,
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
    borderColor: !isEditorialTheme(themeName) ? colors.scarletFg : colors.borderMid,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  mapLinkText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: !isEditorialTheme(themeName) ? colors.scarletFg : colors.textSecondary,
    letterSpacing: 1.5,
  },
  passportNext: {
    fontFamily: fonts.mono,
    fontSize: 12,
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
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 1,
  },

  /* Style profile */
  profileName: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: isY2K ? 38 : 34,
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
    fontSize: 12,
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
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1.5,
  },
  profileMetaVal: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  setupProfile: { paddingVertical: spacing.sm },
  setupProfileText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: !isEditorialTheme(themeName) ? colors.scarletFg : colors.textSecondary,
    letterSpacing: 0.5,
  },

  /* Achievement categories */
  badgeCategory: {
    marginBottom: spacing.sm,
  },
  badgeCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  badgeCategoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeCategoryCount: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  badgeCategoryLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: !isEditorialTheme(themeName) ? colors.scarletFg : colors.textMuted,
  },

  /* Weather badges */
  badgeCount: {
    fontFamily: fonts.mono,
    fontSize: 12,
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
    borderWidth: metrics.borderWidth > 1 ? metrics.borderWidth : 1,
    borderColor: metrics.borderWidth > 1 ? colors.borderHard : colors.borderMid,
    padding: spacing.sm,
    gap: 4,
    borderRadius: metrics.radius,
    backgroundColor: metrics.cardGap === 32 ? colors.scarlet : (metrics.borderWidth > 1 ? colors.bgCard : 'transparent'),
    ...(metrics.shadowOpacity > 0 ? {
      shadowColor: metrics.shadowColor,
      shadowOffset: { width: metrics.shadowOffset, height: metrics.shadowOffset },
      shadowOpacity: metrics.shadowOpacity,
      shadowRadius: 0,
    } : {}),
  },
  badgeLocked: {
    borderColor: colors.border,
    backgroundColor: metrics.cardGap === 32 ? colors.bgCard : 'transparent',
    opacity: 0.45,
  },
  badgeTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    lineHeight: isY2K ? 21 : 18,
    color: metrics.cardGap === 32 ? '#000000' : colors.textPrimary,
    letterSpacing: -0.1,
  },
  badgeTitleLocked: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    lineHeight: isY2K ? 21 : 18,
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },
  badgeDesc: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: metrics.cardGap === 32 ? '#000000' : colors.textMuted,
    letterSpacing: 0.3,
    lineHeight: 14,
  },
  badgeEmpty: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.3,
    lineHeight: 17,
  },
  emptyState: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 24,
    fontStyle: 'italic',
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
  savedRight: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  savedReactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  savedCategory: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textMuted,
    marginBottom: 2,
  },
  savedItem: {
    fontFamily: fonts.display,
    fontSize: 18,
    lineHeight: isY2K ? 27 : 22,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  savedMeta: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.3,
    marginTop: 2,
  },

  /* Look Archive cards */
  lookCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  lookCardPressed: {
    backgroundColor: colors.bgSurface,
  },
  lookThumb: {
    width: 60,
    height: 80,
    flexShrink: 0,
  },
  lookThumbEmpty: {
    backgroundColor: colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lookInfo: {
    flex: 1,
    gap: 3,
  },
  lookVibe: {
    fontFamily: fonts.display,
    fontSize: 18,
    lineHeight: isY2K ? 27 : 22,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  lookMeta: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  lookDate: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
  lookOpen: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: !isEditorialTheme(themeName) ? colors.scarletFg : colors.textSecondary,
    letterSpacing: 1.5,
    marginTop: 3,
  },
  lookNote: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: 3,
  },
  lookReactionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 6,
  },
  lookDelete: {
    paddingLeft: spacing.sm,
    paddingTop: 2,
  },

  /* Look archive filter / sort controls */
  archiveSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  archiveSortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  archiveSortBtnText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textSecondary,
  },
  archiveFilterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  archiveFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  archiveFilterChipActive: {
    borderColor: colors.bgDark,
    backgroundColor: colors.bgDark,
  },
  archiveFilterText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.textSecondary,
  },
  archiveFilterTextActive: {
    color: '#FAF9F6',
  },

  /* Archive detail */
  detailRoot: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  detailHeader: {
    backgroundColor: colors.bgDark,
    paddingTop: 54,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailHeaderBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailHeaderTitle: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 2.5,
    color: 'rgba(250,249,246,0.72)',
  },
  detailScroll: {
    flex: 1,
  },
  detailContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 72,
  },
  detailCity: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  detailVibe: {
    fontFamily: fonts.display,
    fontSize: 42,
    color: colors.textPrimary,
    lineHeight: isY2K ? 56 : 45,
    letterSpacing: -0.8,
    marginBottom: spacing.md,
  },
  detailMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  detailMetaText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  detailImageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  detailImageCell: {
    width: '48%',
  },
  detailImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: colors.bgSurface,
  },
  detailImageMissing: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailImageMissingText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textMuted,
  },
  detailImageLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  detailVerdictCard: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: metrics.borderWidth > 1 ? colors.bgCard : 'transparent',
    borderRadius: metrics.radius,
  },
  detailVerdictTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailCardLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  detailRating: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: !isEditorialTheme(themeName) ? colors.scarletFg : colors.textSecondary,
  },
  detailVerdictText: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.textPrimary,
    lineHeight: 26,
  },
  detailOutfitRow: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailOutfitCategory: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.textMuted,
    marginBottom: 4,
  },
  detailOutfitItem: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: isY2K ? 30 : 24,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  detailOutfitDetail: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  detailShopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  detailShopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  detailShopBtnPressed: {
    backgroundColor: colors.bgSurface,
  },
  detailShopText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.4,
    color: colors.textSecondary,
    maxWidth: 210,
  },
  detailShopIcon: {
    marginLeft: 5,
  },
  detailAvoidText: {
    fontFamily: fonts.serif,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  detailNoteWrap: {
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  detailNoteLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2.5,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  detailNoteInput: {
    fontSize: 17,
    lineHeight: 26,
    letterSpacing: -0.1,
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  detailReactionRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  detailReactionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  detailReactionText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.textMuted,
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
  archiveDateDay: { fontFamily: fonts.mono, fontSize: 12, color: colors.textPrimary, letterSpacing: 0.3 },
  archiveDateTime: { fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  archiveCenter: { flex: 1 },
  archiveCity: { fontFamily: fonts.display, fontSize: 20, lineHeight: isY2K ? 30 : 24, color: colors.textPrimary, letterSpacing: -0.3 },
  archiveVibe: { fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted, letterSpacing: 0.3, marginTop: 1 },
  archiveTemp: { fontFamily: fonts.displayBold, fontSize: 20, lineHeight: isY2K ? 30 : 24, color: colors.textPrimary, marginLeft: spacing.sm },
}); }

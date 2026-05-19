import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Platform, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppData } from '../../contexts/AppContext';
import { BUDGET_TIERS, PERSONALITY_OPTIONS } from '../../hooks/useStyleProfile';
import { getRankTitle } from '../../hooks/useConsultStreak';
import { BADGE_CATEGORY_LABELS, BADGE_CATEGORY_ORDER } from '../../hooks/useWeatherBadges';
import { mondrianTokens, spacing } from '../../theme';
import { useTempUnit } from '../../contexts/TemperatureContext';
import { formatLocationDate, formatLocationTime } from '../../utils/locationTime';

const { red, blue, yellow, black, white, gridLine } = mondrianTokens;

// ─── Memphis pattern ──────────────────────────────────────────────────────────

const DASHES: Array<{ top: number; left: number; angle: number; len: number }> = [
  { top: 8,  left: 18,  angle: -45, len: 10 },
  { top: 22, left: 60,  angle: 30,  len: 8  },
  { top: 5,  left: 110, angle: 90,  len: 7  },
  { top: 18, left: 155, angle: -20, len: 9  },
  { top: 30, left: 200, angle: 55,  len: 8  },
  { top: 7,  left: 248, angle: -70, len: 10 },
  { top: 25, left: 290, angle: 15,  len: 7  },
  { top: 12, left: 335, angle: -35, len: 9  },
  { top: 40, left: 40,  angle: 80,  len: 8  },
  { top: 45, left: 88,  angle: -55, len: 7  },
  { top: 38, left: 135, angle: 40,  len: 10 },
  { top: 50, left: 178, angle: -10, len: 8  },
  { top: 42, left: 225, angle: 65,  len: 7  },
  { top: 55, left: 270, angle: -30, len: 9  },
  { top: 44, left: 315, angle: 50,  len: 8  },
];

const DOTS: Array<{ top: number; left: number }> = [
  { top: 15, left: 42  },
  { top: 28, left: 94  },
  { top: 10, left: 136 },
  { top: 33, left: 185 },
  { top: 8,  left: 232 },
  { top: 20, left: 278 },
  { top: 35, left: 320 },
  { top: 48, left: 55  },
  { top: 52, left: 100 },
  { top: 46, left: 150 },
];

function MemphisStrip() {
  return (
    <View style={{ height: 56, width: '100%', backgroundColor: white, overflow: 'hidden' }}>
      {DASHES.map((d, i) => (
        <View key={`d${i}`} style={{
          position: 'absolute', top: d.top, left: d.left,
          width: d.len, height: 1.5, backgroundColor: black,
          transform: [{ rotate: `${d.angle}deg` }],
        }} />
      ))}
      {DOTS.map((d, i) => (
        <View key={`dot${i}`} style={{
          position: 'absolute', top: d.top, left: d.left,
          width: 2.5, height: 2.5, borderRadius: 1.25, backgroundColor: black,
        }} />
      ))}
    </View>
  );
}

function GridLine() {
  return <View style={{ height: gridLine, backgroundColor: black, width: '100%' }} />;
}

function SectionBar({ label, bg, textColor }: { label: string; bg: string; textColor: string }) {
  return (
    <View>
      <GridLine />
      <View style={{ backgroundColor: bg, paddingHorizontal: 14, paddingVertical: 8 }}>
        <Text style={{ fontFamily: 'Montserrat_900Black', fontSize: 12, letterSpacing: 3, color: textColor }}>
          {label}
        </Text>
      </View>
      <GridLine />
    </View>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PASSPORT_MILESTONES = [
  { cities: 50, title: 'The Nomad Oracle',  icon: 'earth' as const },
  { cities: 25, title: 'World Citizen',     icon: 'airplane' as const },
  { cities: 10, title: 'Globetrotter',      icon: 'map-marker-multiple-outline' as const },
];

const RANK_PROGRESS = [
  { title: 'Front Row',       min: 100 },
  { title: 'Muse',            min: 50 },
  { title: 'Connoisseur',     min: 20 },
  { title: 'Regular',         min: 5 },
  { title: 'New Arrival',     min: 1 },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export function MondrianYouScreen() {
  const navigation = useNavigation<any>();
  const { formatTemp } = useTempUnit();
  const [lockedExpanded, setLockedExpanded] = useState(false);
  const [isFoundingMember, setIsFoundingMember] = useState(false);
  const { profileCtx, historyCtx, streakCtx, savedCtx, badges } = useAppData();
  const profile        = profileCtx.profile;
  const { history }    = historyCtx;
  const { streak, totalConsults } = streakCtx;

  const rankTitle      = getRankTitle(totalConsults);
  const uniqueCities   = [...new Set(history.map(e => e.city.toLowerCase()))];
  const cityCount      = uniqueCities.length;
  const nextMilestone  = PASSPORT_MILESTONES.find(m => cityCount < m.cities);
  const earnedStamps   = PASSPORT_MILESTONES.filter(m => cityCount >= m.cities);
  const nextRank       = RANK_PROGRESS.find(r => totalConsults < r.min);
  const personalityLabel = PERSONALITY_OPTIONS.find(p => p.id === profile?.personality)?.title ?? 'The Editor';

  useEffect(() => {
    AsyncStorage.getItem('@outfit_oracle_founding_member')
      .then(val => setIsFoundingMember(val === '1'))
      .catch(() => {});
  }, []);

  const earnedBadges   = useMemo(() => badges.filter(b => b.earned), [badges]);
  const unearnedBadges = useMemo(() => badges.filter(b => !b.earned), [badges]);
  const badgesByCategory = useMemo(
    () => Object.fromEntries(BADGE_CATEGORY_ORDER.map(cat => [cat, earnedBadges.filter(b => b.category === cat)])),
    [earnedBadges],
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={black} />

      {/* ── Memphis strip ── */}
      <MemphisStrip />
      <GridLine />

      {/* ── Black header bar ── */}
      <View style={s.header}>
        <Text style={s.wordmark}>YOU.</Text>
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          style={{ padding: 6 }}
          accessibilityLabel="Settings"
        >
          <MaterialCommunityIcons name="cog-outline" size={20} color={yellow} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── RANK HERO ── */}
        <SectionBar label="ORACLE RANK" bg={red} textColor={white} />
        <View style={s.rankHero}>
          <Text style={s.rankTitle}>{rankTitle}</Text>
          <View style={s.rankMetaRow}>
            <Text style={s.rankMeta}>{totalConsults} CONSULTS</Text>
            {nextRank && (
              <Text style={s.rankMeta}>
                {nextRank.min - totalConsults} UNTIL {nextRank.title.toUpperCase()}
              </Text>
            )}
          </View>
          {streak > 0 && (
            <View style={s.streakChip}>
              <MaterialCommunityIcons name="fire" size={12} color={yellow} />
              <Text style={s.streakText}>{streak}-DAY STREAK</Text>
            </View>
          )}
          {isFoundingMember && (
            <View style={s.foundingChip}>
              <MaterialCommunityIcons name="seal" size={12} color={white} />
              <Text style={s.foundingText}>FOUNDING MEMBER</Text>
            </View>
          )}
        </View>

        {/* ── STYLE PASSPORT ── */}
        <SectionBar label="STYLE PASSPORT" bg={blue} textColor={white} />
        <View style={s.panel}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <Text style={s.passportCount}>{cityCount}</Text>
            <Text style={s.passportLabel}>
              {cityCount === 1 ? 'city consulted' : 'cities consulted'}
            </Text>
          </View>
          <Pressable
            style={s.mapLink}
            onPress={() => navigation.navigate('Map')}
            accessibilityLabel="View your city map"
          >
            <MaterialCommunityIcons name="map-outline" size={12} color={blue} />
            <Text style={s.mapLinkText}>VIEW ON MAP</Text>
          </Pressable>
          {nextMilestone && (
            <Text style={s.passportNext}>
              {nextMilestone.cities - cityCount} more until "{nextMilestone.title}"
            </Text>
          )}
          {earnedStamps.length > 0 && (
            <View style={s.stamps}>
              {earnedStamps.map(stamp => (
                <View key={stamp.title} style={s.stamp}>
                  <MaterialCommunityIcons name={stamp.icon} size={14} color={black} />
                  <Text style={s.stampText}>{stamp.title.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── ACHIEVEMENTS ── */}
        <SectionBar
          label={`ACHIEVEMENTS  ${earnedBadges.length}/${badges.length}`}
          bg={yellow}
          textColor={black}
        />
        <View style={s.panel}>
          {earnedBadges.length === 0 && (
            <Text style={s.emptyText}>Consult the Oracle to begin earning achievements.</Text>
          )}

          {BADGE_CATEGORY_ORDER.map(cat => {
            const catBadges = badgesByCategory[cat] ?? [];
            if (catBadges.length === 0) return null;
            return (
              <View key={cat} style={{ marginBottom: 16 }}>
                <Text style={s.catLabel}>{BADGE_CATEGORY_LABELS[cat]}</Text>
                <View style={s.badgeGrid}>
                  {catBadges.map(b => (
                    <View key={b.id} style={s.badge}>
                      <MaterialCommunityIcons name={b.icon as any} size={18} color={red} />
                      <Text style={s.badgeTitle}>{b.title}</Text>
                      <Text style={s.badgeDesc}>{b.desc}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}

          {unearnedBadges.length > 0 && (
            <View style={earnedBadges.length > 0 ? s.lockedDivider : undefined}>
              <Pressable
                style={s.lockedHeader}
                onPress={() => setLockedExpanded(e => !e)}
                accessibilityRole="button"
              >
                <Text style={s.catLabel}>LOCKED — {unearnedBadges.length} remaining</Text>
                <MaterialCommunityIcons
                  name={lockedExpanded ? 'chevron-up' : 'chevron-down'}
                  size={12}
                  color={black}
                />
              </Pressable>
              {lockedExpanded && (
                <View style={s.badgeGrid}>
                  {unearnedBadges.map(b => (
                    <View key={b.id} style={[s.badge, s.badgeLocked]}>
                      <MaterialCommunityIcons name={b.icon as any} size={18} color="#BBBBBB" />
                      <Text style={[s.badgeTitle, { color: '#888888' }]}>{b.title}</Text>
                      <Text style={s.badgeDesc}>{b.desc}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* ── YOUR STYLE ── */}
        <SectionBar label="YOUR STYLE" bg={red} textColor={white} />
        <View style={s.panel}>
          <Pressable
            onPress={() => navigation.navigate('ProfileEdit')}
            style={s.editBtn}
            accessibilityLabel="Edit style profile"
          >
            <Text style={s.editBtnText}>EDIT PROFILE →</Text>
          </Pressable>
          {profile ? (
            <>
              {profile.name ? (
                <Text style={s.profileName}>{profile.name.toUpperCase()}</Text>
              ) : null}
              <View style={s.keywordRow}>
                {profile.keywords.map(k => (
                  <View key={k} style={s.keyword}>
                    <Text style={s.keywordText}>{k.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
              <View style={{ gap: 8, marginTop: 8 }}>
                <View style={s.metaRow}>
                  <Text style={s.metaLabel}>BUDGET</Text>
                  <Text style={s.metaVal}>
                    {BUDGET_TIERS.find(b => b.id === profile.budget)?.label ?? profile.budget}
                  </Text>
                </View>
                <View style={s.metaRow}>
                  <Text style={s.metaLabel}>ORACLE VOICE</Text>
                  <Text style={s.metaVal}>{personalityLabel}</Text>
                </View>
              </View>
            </>
          ) : (
            <Pressable
              onPress={() => navigation.navigate('ProfileEdit')}
              style={{ paddingTop: 8 }}
            >
              <Text style={s.setupText}>Set up your style profile →</Text>
            </Pressable>
          )}
        </View>

        {/* ── SAVED LOOKS ── */}
        <SectionBar
          label={`SAVED LOOKS${savedCtx.saved.length > 0 ? `  ·  ${savedCtx.saved.length}` : ''}`}
          bg={black}
          textColor={white}
        />
        <View style={{ backgroundColor: white }}>
          {savedCtx.saved.length === 0 ? (
            <View style={s.panel}>
              <Text style={s.emptyText}>No looks saved yet. The archive is empty.</Text>
            </View>
          ) : savedCtx.saved.map(sv => (
            <View key={`${sv.item.item}-${sv.savedAt}`}>
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
                <View style={{ width: 6, alignSelf: 'stretch', backgroundColor: blue, marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={s.savedCategory}>{sv.item.category.toUpperCase()}</Text>
                  <Text style={s.savedItem}>{sv.item.item}</Text>
                  <Text style={s.savedMeta}>{sv.city} · {sv.vibe}</Text>
                </View>
                <Pressable
                  onPress={() => savedCtx.removeOutfit(sv.item, sv.city)}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${sv.item.item} from saved looks`}
                >
                  <MaterialCommunityIcons name="heart" size={18} color={red} />
                </Pressable>
              </View>
              <GridLine />
            </View>
          ))}
        </View>

        {/* ── ORACLE ARCHIVES ── */}
        <SectionBar label="ORACLE ARCHIVES" bg={blue} textColor={white} />
        <View style={{ backgroundColor: white }}>
          {history.length === 0 ? (
            <View style={s.panel}>
              <Text style={s.emptyText}>The Oracle awaits your first inquiry.</Text>
            </View>
          ) : history.map(entry => (
            <View key={entry.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
                <View style={{ width: 6, alignSelf: 'stretch', backgroundColor: red, marginRight: 12 }} />
                <View style={{ width: 52, marginRight: 12 }}>
                  <Text style={s.archiveDay}>
                    {formatLocationDate(entry.consultedAt, entry.weather.utcOffsetSeconds)}
                  </Text>
                  <Text style={s.archiveTime}>
                    {formatLocationTime(entry.consultedAt, entry.weather.utcOffsetSeconds)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.archiveCity}>{entry.city}</Text>
                  <Text style={s.archiveVibe}>{entry.verdict.vibe}</Text>
                </View>
                <Text style={s.archiveTemp}>{formatTemp(entry.weather.temp)}°</Text>
              </View>
              <GridLine />
            </View>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: white,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },

  header: {
    backgroundColor: black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  wordmark: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 24,
    color: white,
    letterSpacing: 3,
  },

  content: { paddingBottom: 20 },

  // Rank hero
  rankHero: {
    backgroundColor: '#1A1714',
    padding: 20,
  },
  rankTitle: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 36,
    color: white,
    letterSpacing: 1,
    lineHeight: 40,
  },
  rankMetaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  rankMeta: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.50)',
    letterSpacing: 1.5,
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 12,
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: yellow,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: yellow,
    letterSpacing: 1.5,
  },
  foundingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: red,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  foundingText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: white,
    letterSpacing: 1.5,
  },

  // Generic panel
  panel: {
    backgroundColor: white,
    padding: 16,
  },

  // Passport
  passportCount: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 52,
    color: black,
    letterSpacing: -1,
  },
  passportLabel: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: '#555555',
    letterSpacing: 0.5,
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: blue,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  mapLinkText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: blue,
    letterSpacing: 1.5,
  },
  passportNext: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: '#555555',
    letterSpacing: 0.3,
    marginBottom: spacing.md,
  },
  stamps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  stamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderColor: black,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  stampText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: black,
    letterSpacing: 1,
  },

  // Achievements
  catLabel: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 11,
    letterSpacing: 2.5,
    color: black,
    marginBottom: 8,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    width: '47%',
    borderWidth: gridLine,
    borderColor: black,
    padding: 10,
    gap: 4,
    backgroundColor: white,
  },
  badgeLocked: {
    borderColor: '#CCCCCC',
    opacity: 0.55,
  },
  badgeTitle: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 13,
    color: black,
    letterSpacing: 0.3,
  },
  badgeDesc: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: '#555555',
    letterSpacing: 0.3,
    lineHeight: 14,
  },
  lockedDivider: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: gridLine,
    borderTopColor: black,
  },
  lockedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 8,
  },

  // Your style
  editBtn: {
    alignSelf: 'flex-end',
    borderWidth: 1.5,
    borderColor: black,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
  },
  editBtnText: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 11,
    color: black,
    letterSpacing: 2,
  },
  profileName: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 24,
    color: black,
    letterSpacing: 1,
    marginBottom: 12,
  },
  keywordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  keyword: {
    borderWidth: 1.5,
    borderColor: black,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  keywordText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: black,
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: '#777777',
    letterSpacing: 1.5,
  },
  metaVal: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: black,
    letterSpacing: 0.3,
  },
  setupText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: red,
    letterSpacing: 0.5,
  },

  // Saved looks
  savedCategory: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 11,
    letterSpacing: 2,
    color: '#777777',
    marginBottom: 2,
  },
  savedItem: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 16,
    color: black,
    letterSpacing: 0.3,
  },
  savedMeta: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: '#555555',
    letterSpacing: 0.3,
    marginTop: 2,
  },

  // Archives
  archiveDay: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: black,
    letterSpacing: 0.3,
  },
  archiveTime: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: '#777777',
    marginTop: 2,
  },
  archiveCity: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 18,
    color: black,
    letterSpacing: -0.3,
  },
  archiveVibe: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: '#555555',
    letterSpacing: 0.3,
    marginTop: 1,
  },
  archiveTemp: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 20,
    color: black,
    marginLeft: 8,
  },

  // Empty
  emptyText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: '#555555',
    lineHeight: 18,
    letterSpacing: 0.3,
  },
});

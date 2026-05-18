import React, { useState, useRef } from 'react';
import {
  View, Pressable, StyleSheet, Animated,
  Modal, Image, Dimensions, ActivityIndicator, Text,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { OracleImageState } from '../hooks/useOracleImage';
import { spacing } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');
const IMAGE_HEIGHT = Math.round(SCREEN_W * (4 / 3)); // portrait_4_3 ratio (768×1024)

interface Props {
  imageState: OracleImageState;
}

export function OracleImage({ imageState }: Props) {
  const { colors, fonts } = useTheme();
  const { status, url, error, regenerate } = imageState;

  const [fullscreen, setFullscreen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const onLoad = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  };

  if (status === 'idle') return null;

  return (
    <>
      <View style={[styles.container, { height: IMAGE_HEIGHT }]}>

        {/* Shimmer while loading */}
        {status === 'loading' && (
          <View style={[styles.placeholder, { backgroundColor: colors.bgSurface }]}>
            <ActivityIndicator color={colors.textMuted} size="small" />
            <Text style={[styles.placeholderText, { fontFamily: fonts.mono, color: colors.textMuted }]}>
              COMPOSING THE LOOK…
            </Text>
          </View>
        )}

        {/* Error state */}
        {status === 'error' && (
          <View style={[styles.placeholder, { backgroundColor: colors.bgSurface }]}>
            <Text style={[styles.placeholderText, { fontFamily: fonts.mono, color: colors.textMuted }]}>
              {error ?? 'Unknown error'}
            </Text>
            <Pressable
              onPress={regenerate}
              style={styles.regenBtn}
              accessibilityRole="button"
              accessibilityLabel="Regenerate outfit image"
            >
              <Text style={[styles.regenText, { fontFamily: fonts.mono, color: colors.textSecondary }]}>
                Try Again →
              </Text>
            </Pressable>
          </View>
        )}

        {/* Image */}
        {status === 'done' && url ? (
          <Pressable
            onPress={() => setFullscreen(true)}
            accessibilityRole="imagebutton"
            accessibilityLabel="Outfit editorial image — tap to view fullscreen"
          >
            <Animated.Image
              source={{ uri: url }}
              style={[styles.image, { width: SCREEN_W, height: IMAGE_HEIGHT, opacity: fadeAnim }]}
              resizeMode="cover"
              onLoad={onLoad}
            />
            {/* Subtle regenerate affordance */}
            <View style={styles.regenOverlay} pointerEvents="none">
              <View style={[styles.regenPill, { backgroundColor: 'rgba(13,11,8,0.55)' }]}>
                <Text style={[styles.regenPillText, { fontFamily: fonts.mono }]}>TAP TO EXPAND</Text>
              </View>
            </View>
          </Pressable>
        ) : null}
      </View>

      {/* Fullscreen modal */}
      <Modal
        visible={fullscreen}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreen(false)}
      >
        <Pressable
          style={styles.modalBg}
          onPress={() => setFullscreen(false)}
          accessibilityRole="button"
          accessibilityLabel="Close fullscreen image"
        >
          <Image
            source={{ uri: url ?? '' }}
            style={styles.modalImage}
            resizeMode="contain"
          />
          <Pressable
            style={[styles.modalRegenBtn, { borderColor: 'rgba(250,249,246,0.3)' }]}
            onPress={() => { setFullscreen(false); regenerate(); }}
            accessibilityRole="button"
            accessibilityLabel="Regenerate outfit image"
          >
            <Text style={[styles.modalRegenText, { fontFamily: fonts.mono }]}>↻  REGENERATE</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  placeholderText: {
    fontSize: 11,
    letterSpacing: 2,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  image: {
    // dimensions applied dynamically
  },
  regenOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  regenPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  regenPillText: {
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(250,249,246,0.7)',
  },
  regenBtn: {
    marginTop: spacing.sm,
  },
  regenText: {
    fontSize: 12,
    letterSpacing: 1,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(13,11,8,0.94)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    flex: 1,
  },
  modalRegenBtn: {
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    marginBottom: spacing.xxl,
    marginTop: spacing.lg,
  },
  modalRegenText: {
    fontSize: 11,
    letterSpacing: 2.5,
    color: 'rgba(250,249,246,0.6)',
  },
});

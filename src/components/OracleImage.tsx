import React, { useState, useRef } from 'react';
import {
  View, Pressable, StyleSheet, Animated,
  Modal, Image, Dimensions, ActivityIndicator, Text,
  PanResponder,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { OracleImageState } from '../hooks/useOracleImage';
import { spacing } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');
const IMAGE_HEIGHT = Math.round(SCREEN_W * (4 / 3)); // portrait_4_3 ratio (768×1024)
const SWIPE_THRESHOLD = 50;

interface Props {
  photoState: OracleImageState;
  sketchState: OracleImageState;
  activeView: 'photo' | 'sketch';
  onViewChange: (view: 'photo' | 'sketch') => void;
}

function ImageSlot({
  imageState,
  label,
  isActive,
  colors,
  fonts,
  onPress,
}: {
  imageState: OracleImageState;
  label: string;
  isActive: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
  fonts: ReturnType<typeof useTheme>['fonts'];
  onPress: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const onLoad = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  };

  const { status, url, error, regenerate } = imageState;

  if (status === 'idle') return null;

  return (
    <View style={[StyleSheet.absoluteFillObject, { opacity: isActive ? 1 : 0 }]} pointerEvents={isActive ? 'auto' : 'none'}>
      {status === 'loading' && (
        <View style={[styles.placeholder, { backgroundColor: colors.bgSurface }]}>
          <ActivityIndicator color={colors.textMuted} size="small" />
          <Text style={[styles.placeholderText, { fontFamily: fonts.mono, color: colors.textMuted }]}>
            {label === 'sketch' ? 'SKETCHING THE LOOK…' : 'COMPOSING THE LOOK…'}
          </Text>
        </View>
      )}

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

      {status === 'done' && url ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="imagebutton"
          accessibilityLabel={`${label === 'sketch' ? 'Editorial sketch' : 'Outfit photo'} — tap to view fullscreen`}
        >
          <Animated.Image
            source={{ uri: url }}
            style={[styles.image, { width: SCREEN_W, height: IMAGE_HEIGHT, opacity: fadeAnim }]}
            resizeMode="cover"
            onLoad={onLoad}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

export function OracleImage({ photoState, sketchState, activeView, onViewChange }: Props) {
  const { colors, fonts } = useTheme();
  const [fullscreen, setFullscreen] = useState(false);

  const activeState = activeView === 'sketch' ? sketchState : photoState;
  const { url: activeUrl, regenerate: activeRegenerate } = activeState;

  // Refs keep PanResponder callbacks current without re-creating the responder.
  // PanResponder.create runs once; closures over props/state would be stale.
  const activeViewRef = useRef(activeView);
  const onViewChangeRef = useRef(onViewChange);
  activeViewRef.current = activeView;
  onViewChangeRef.current = onViewChange;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      // Capture phase fires top-down before child Pressables can claim the touch.
      // This is necessary because Pressable inside ImageSlot would otherwise block
      // the swipe gesture on the bubbling (non-capture) onMoveShouldSetPanResponder.
      onMoveShouldSetPanResponderCapture: (_, { dx, dy }) =>
        Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.5,
      onPanResponderRelease: (_, { dx }) => {
        if (dx < -SWIPE_THRESHOLD && activeViewRef.current === 'photo') {
          onViewChangeRef.current('sketch');
        } else if (dx > SWIPE_THRESHOLD && activeViewRef.current === 'sketch') {
          onViewChangeRef.current('photo');
        }
      },
    }),
  ).current;

  const showPhoto = photoState.status !== 'idle';
  const showSketch = sketchState.status !== 'idle';
  const showContainer = showPhoto || showSketch;

  if (!showContainer) return null;

  const showDots = showPhoto && showSketch;

  return (
    <>
      <View
        style={[styles.container, { height: IMAGE_HEIGHT }]}
        {...panResponder.panHandlers}
      >
        <ImageSlot
          imageState={photoState}
          label="photo"
          isActive={activeView === 'photo'}
          colors={colors}
          fonts={fonts}
          onPress={() => setFullscreen(true)}
        />
        <ImageSlot
          imageState={sketchState}
          label="sketch"
          isActive={activeView === 'sketch'}
          colors={colors}
          fonts={fonts}
          onPress={() => setFullscreen(true)}
        />

        {/* Tap-to-expand hint + view label */}
        {activeState.status === 'done' && (
          <View style={styles.overlayRow} pointerEvents="none">
            <View style={[styles.pill, { backgroundColor: 'rgba(13,11,8,0.55)' }]}>
              <Text style={[styles.pillText, { fontFamily: fonts.mono }]}>
                {activeView === 'sketch' ? 'EDITORIAL SKETCH' : 'PHOTO'} · TAP TO EXPAND
              </Text>
            </View>
          </View>
        )}

        {/* Swipe indicator dots */}
        {showDots && (
          <View style={styles.dotsRow} pointerEvents="none">
            <View style={[styles.dot, activeView === 'photo' ? styles.dotActive : styles.dotInactive]} />
            <View style={[styles.dot, activeView === 'sketch' ? styles.dotActive : styles.dotInactive]} />
          </View>
        )}

        {/* Swipe hint on first photo load — only when sketch hasn't been triggered yet */}
        {activeView === 'photo' && photoState.status === 'done' && sketchState.status === 'idle' && (
          <View style={styles.swipeHintRow} pointerEvents="none">
            <Text style={[styles.swipeHint, { fontFamily: fonts.mono, color: 'rgba(250,249,246,0.45)' }]}>
              SWIPE ← FOR SKETCH
            </Text>
          </View>
        )}
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
            source={{ uri: activeUrl ?? '' }}
            style={styles.modalImage}
            resizeMode="contain"
          />
          <Pressable
            style={[styles.modalRegenBtn, { borderColor: 'rgba(250,249,246,0.3)' }]}
            onPress={() => { setFullscreen(false); activeRegenerate(); }}
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
    position: 'relative',
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
  overlayRow: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  pillText: {
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(250,249,246,0.7)',
  },
  dotsRow: {
    position: 'absolute',
    bottom: spacing.xl + 4,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotActive: {
    backgroundColor: 'rgba(250,249,246,0.85)',
  },
  dotInactive: {
    backgroundColor: 'rgba(250,249,246,0.28)',
  },
  swipeHintRow: {
    position: 'absolute',
    bottom: spacing.xl + 4,
    right: spacing.md,
  },
  swipeHint: {
    fontSize: 9,
    letterSpacing: 1.5,
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

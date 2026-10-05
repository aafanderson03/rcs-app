import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RcsColors } from '@/constants/theme';

export default function AnnouncementsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;
  const [tickerOffset] = useState(() => new Animated.Value(0));
  const [tickerCopyWidth, setTickerCopyWidth] = useState(0);
  const tickerMessage = 'Company announcements and memorandums will appear here when available.';

  useEffect(() => {
    if (tickerCopyWidth <= 0) return;
    tickerOffset.setValue(0);
    const distance = tickerCopyWidth + 32;
    const animation = Animated.loop(
      Animated.timing(tickerOffset, {
        toValue: -distance,
        duration: Math.max(9000, distance * 30),
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [tickerCopyWidth, tickerOffset]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={[styles.content, isDesktop && styles.desktopContent]}>
        <Link href="/" asChild>
          <Pressable accessibilityRole="button" style={styles.backButton}>
            <Text style={styles.backButtonText}>‹  Home</Text>
          </Pressable>
        </Link>

        <Text style={styles.eyebrow}>STAY IN THE LOOP</Text>
        <Text style={styles.title}>Announcements</Text>
        <Text style={styles.subtitle}>Company announcements and memorandums.</Text>

        <View
          accessible
          accessibilityLabel={tickerMessage}
          accessibilityRole="text"
          style={styles.ticker}
        >
          <Animated.View style={[styles.tickerTrack, { transform: [{ translateX: tickerOffset }] }]}>
            {Array.from({ length: 5 }, (_, index) => (
              <Text
                key={index}
                numberOfLines={1}
                onLayout={
                  index === 0
                    ? (event) => setTickerCopyWidth(event.nativeEvent.layout.width)
                    : undefined
                }
                style={styles.tickerText}
              >
                {tickerMessage}
              </Text>
            ))}
          </Animated.View>
        </View>

        <View style={styles.announcementList}>
          <Text style={styles.listTitle}>Announcements &amp; memorandums</Text>
          <View style={styles.listRow}>
            <View style={styles.listBullet} />
            <View style={styles.listCopy}>
              <Text style={styles.emptyTitle}>No announcements yet</Text>
              <Text style={styles.emptyDescription}>
                New company updates will appear in this list when the official feed is connected.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: RcsColors.background },
  content: { width: '100%', maxWidth: 620, alignSelf: 'center', padding: 24, paddingBottom: 36 },
  desktopContent: { maxWidth: 1180, padding: 32, paddingBottom: 40 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 12, marginBottom: 26 },
  backButtonText: { color: RcsColors.brownLight, fontSize: 14, fontWeight: '700' },
  eyebrow: { color: RcsColors.brownLight, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { marginTop: 8, color: RcsColors.brownDark, fontSize: 30, lineHeight: 36, fontWeight: '800' },
  subtitle: { marginTop: 8, marginBottom: 18, color: RcsColors.gray, fontSize: 15, lineHeight: 22 },
  ticker: {
    height: 44,
    justifyContent: 'center',
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: RcsColors.brown,
  },
  tickerTrack: { alignSelf: 'flex-start', flexDirection: 'row' },
  tickerText: {
    marginRight: 32,
    color: RcsColors.yellowLight,
    fontSize: 12,
    fontWeight: '700',
  },
  announcementList: {
    padding: 17,
    borderRadius: 14,
    backgroundColor: RcsColors.surface,
    borderWidth: 1,
    borderColor: RcsColors.border,
  },
  listTitle: { marginBottom: 4, color: RcsColors.brownDark, fontSize: 15, fontWeight: '800' },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: RcsColors.border,
  },
  listBullet: {
    width: 8,
    height: 8,
    marginTop: 5,
    marginRight: 11,
    borderRadius: 4,
    backgroundColor: RcsColors.yellow,
  },
  listCopy: { flex: 1 },
  emptyTitle: { color: RcsColors.brownDark, fontSize: 13, fontWeight: '700' },
  emptyDescription: { marginTop: 4, color: RcsColors.gray, fontSize: 12, lineHeight: 18 },
});

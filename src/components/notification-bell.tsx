import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ResponsiveText as Text } from '@/components/responsive-text';
import { getPaletteForScheme } from '@/constants/theme';
import { useDemoSubmissions } from '@/contexts/demo-submissions-context';
import { useAppTheme } from '@/contexts/theme-context';
import { demoAnnouncements, formatDemoDate, relativeDate } from '@/data/demo-data';

const SEEN_KEY = 'rcs-seen-notifications';

type Notice = { id: string; title: string; detail: string; date: string; route: string };

function useNotifications() {
  const router = useRouter();
  const { applications } = useDemoSubmissions();
  const { colorScheme } = useAppTheme();
  const [seen, setSeen] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SEEN_KEY)
      .then((stored) => {
        if (!stored) return;
        const parsed: unknown = JSON.parse(stored);
        if (!Array.isArray(parsed) || !parsed.every((id) => typeof id === 'string')) {
          throw new Error('Stored notification state is invalid.');
        }
        setSeen(parsed);
      })
      .catch((error: unknown) => {
        console.error('Unable to load notification read state.', error);
      })
      .finally(() => setLoaded(true));
  }, []);

  const notices = useMemo<Notice[]>(() => {
    const requestCutoff = relativeDate(-14);
    const newsCutoff = relativeDate(-7);

    const decided = applications
      .filter((item) => (item.status === 'Approved' || item.status === 'Disapproved'))
      .map((item) => {
        const lastAction = item.approvers
          ?.map((approver) => approver.actedAt)
          .filter((value): value is string => Boolean(value))
          .sort()
          .pop();
        return { item, date: lastAction ?? item.submittedAt };
      })
      .filter(({ date }) => date >= requestCutoff)
      .map(({ item, date }): Notice => ({
        id: `app-${item.id}-${item.status}`,
        title: `${item.type} request ${item.status.toLowerCase()}`,
        detail: item.summary,
        date,
        route: '/applications',
      }));

    const news = demoAnnouncements
      .filter((item) => item.date >= newsCutoff)
      .map((item): Notice => ({
        id: `news-${item.id}`,
        title: 'New announcement',
        detail: item.title,
        date: item.date,
        route: '/announcements',
      }));

    return [...decided, ...news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  }, [applications]);

  const unreadIds = loaded ? notices.filter((notice) => !seen.includes(notice.id)).map((n) => n.id) : [];
  const persistSeen = (next: string[]) => {
    setSeen(next);
    AsyncStorage.setItem(SEEN_KEY, JSON.stringify(next)).catch((error: unknown) => {
      console.error('Unable to save notification read state.', error);
    });
  };
  const markRead = (id: string) => {
    if (!seen.includes(id)) persistSeen([...seen, id]);
  };
  const markAllRead = () => {
    const next = Array.from(new Set([...seen, ...notices.map((notice) => notice.id)]));
    if (next.length !== seen.length) persistSeen(next);
  };

  return { notices, unreadIds, markRead, markAllRead, router, colorScheme };
}

export function NotificationBell() {
  const { notices, unreadIds, markRead, markAllRead, router, colorScheme } = useNotifications();
  const { width } = useWindowDimensions();
  const colors = useMemo(() => getPaletteForScheme(colorScheme), [colorScheme]);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          unreadIds.length ? `Notifications, ${unreadIds.length} unread` : 'Notifications, none unread'
        }
        accessibilityState={{ expanded: open }}
        onPress={() => (open ? close() : setOpen(true))}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Image 
          source={require('../../assets/images/bell.png')} 
          style={styles.bellImage} 
        />
        {unreadIds.length ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadIds.length > 9 ? '9+' : unreadIds.length}</Text>
          </View>
        ) : null}
      </Pressable>

      {open ? (
        <View style={[styles.panel, { width: Math.min(330, width - 40) }]}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Notifications</Text>
            {unreadIds.length ? (
              <Pressable
                accessibilityRole="button"
                onPress={markAllRead}
                style={({ pressed }) => [styles.markAllButton, pressed && styles.pressed]}
              >
                <Text style={styles.markAllText}>Mark all read</Text>
              </Pressable>
            ) : null}
          </View>
          {notices.length ? (
            notices.map((notice, index) => (
              <Pressable
                key={notice.id}
                accessibilityRole="link"
                onPress={() => {
                  markRead(notice.id);
                  close();
                  router.push(notice.route as never);
                }}
                style={({ pressed }) => [
                  styles.notice,
                  index > 0 && styles.noticeDivider,
                  unreadIds.includes(notice.id) && styles.unreadNotice,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.dot, !unreadIds.includes(notice.id) && styles.dotRead]} />
                <View style={styles.noticeCopy}>
                  <Text style={styles.noticeTitle}>{notice.title}</Text>
                  <Text style={styles.noticeDetail} numberOfLines={2}>{notice.detail}</Text>
                  <Text style={styles.noticeDate}>
                    {formatDemoDate(notice.date, { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              </Pressable>
            ))
          ) : (
            <Text style={styles.empty}>You’re all caught up.</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof getPaletteForScheme>) => StyleSheet.create({
  wrap: { alignItems: 'flex-end' },
  button: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.grayLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bellImage: { 
    width: 20, 
    height: 20,
    resizeMode: 'contain',
   },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.danger,
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '800' },
  panel: {
    position: 'absolute',
    top: 52,
    right: 0,
    padding: 8,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  panelTitle: { paddingHorizontal: 8, paddingVertical: 8, color: colors.text, fontSize: 14, fontWeight: '800' },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  markAllButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 8 },
  markAllText: { color: colors.brown, fontSize: 11, fontWeight: '700' },
  notice: { flexDirection: 'row', gap: 8, paddingHorizontal: 5, paddingVertical: 10, borderRadius: 10 },
  unreadNotice: { backgroundColor: colors.yellowLight },
  noticeDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  dot: { width: 8, height: 8, marginTop: 5, borderRadius: 4, backgroundColor: colors.brown },
  dotRead: { backgroundColor: 'transparent' },
  noticeCopy: { flex: 1, minWidth: 0, gap: 2 },
  noticeTitle: { color: colors.text, fontSize: 12, fontWeight: '700' },
  noticeDetail: { color: colors.grayMuted, fontSize: 12, lineHeight: 17 },
  noticeDate: { marginTop: 2, color: colors.grayMuted, fontSize: 10 },
  empty: { padding: 12, color: colors.grayMuted, fontSize: 12 },
  pressed: { opacity: 0.75 },
});

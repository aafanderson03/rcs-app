import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ResponsiveText as Text } from '@/components/responsive-text';
import { getPaletteForScheme } from '@/constants/theme';
import { useDemoSubmissions } from '@/contexts/demo-submissions-context';
import { useAppTheme } from '@/contexts/theme-context';
import { demoAnnouncements, formatDemoDate, relativeDate } from '@/data/demo-data';

const SEEN_KEY = 'rcs-seen-notifications';

type Notice = { id: string; title: string; detail: string; date: string; route: string };

/**
 * Bell with an unread badge. Notices are built from your demo data:
 * requests that were approved/disapproved in the last 14 days, and announcements from the
 * last 7 days. Opening the bell shows them; closing it marks them as read (saved on device).
 * Place it inside a positioned wrapper, e.g. { position: 'absolute', top: 14, right: 14 }.
 */
export function NotificationBell() {
  const router = useRouter();
  const { applications } = useDemoSubmissions();
  const { colorScheme } = useAppTheme();
  const { width } = useWindowDimensions();
  const colors = useMemo(() => getPaletteForScheme(colorScheme), [colorScheme]);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SEEN_KEY)
      .then((stored) => {
        if (stored) setSeen(JSON.parse(stored) as string[]);
      })
      .catch(() => undefined)
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

  const close = () => {
    setOpen(false);
    const next = Array.from(new Set([...seen, ...notices.map((notice) => notice.id)]));
    if (next.length !== seen.length) {
      setSeen(next);
      AsyncStorage.setItem(SEEN_KEY, JSON.stringify(next)).catch(() => undefined);
    }
  };

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
        <Text style={styles.bell}>🔔</Text>
        {unreadIds.length ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadIds.length > 9 ? '9+' : unreadIds.length}</Text>
          </View>
        ) : null}
      </Pressable>

      {open ? (
        <View style={[styles.panel, { width: Math.min(330, width - 40) }]}>
          <Text style={styles.panelTitle}>Notifications</Text>
          {notices.length ? (
            notices.map((notice, index) => (
              <Pressable
                key={notice.id}
                accessibilityRole="link"
                onPress={() => {
                  close();
                  router.push(notice.route as never);
                }}
                style={({ pressed }) => [
                  styles.notice,
                  index > 0 && styles.noticeDivider,
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bell: { fontSize: 19 },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
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
    borderRadius: 6,
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
  notice: { flexDirection: 'row', gap: 10, padding: 10, borderRadius: 4 },
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

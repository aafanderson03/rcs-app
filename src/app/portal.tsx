import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { getPaletteForScheme, type RcsPalette } from '@/constants/theme';
import { ResponsiveText as Text } from '@/components/responsive-text';
import { useAppTheme } from '@/contexts/theme-context';

const PORTAL_URL = 'http://161.49.223.6/RCS_ONLINE';
const PORTAL_ORIGIN = 'http://161.49.223.6';

export default function PortalScreen() {
  const { colorScheme } = useAppTheme();
  const palette = getPaletteForScheme(colorScheme);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const webViewRef = useRef<WebView>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isPortalUrl = (url: string) =>
    url === PORTAL_ORIGIN ||
    url.startsWith(`${PORTAL_ORIGIN}/`) ||
    url.startsWith(`${PORTAL_ORIGIN}?`) ||
    url.startsWith(`${PORTAL_ORIGIN}#`);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>RCS Employee System</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reload employee system"
          onPress={() => {
            setLoadError(null);
            webViewRef.current?.reload();
          }}
          style={styles.reloadButton}
        >
          <Text style={styles.reloadText}>Reload</Text>
        </Pressable>
      </View>

      <View style={styles.warning}>
        <Text style={styles.warningTitle}>Prototype — connection is not secure</Text>
        <Text style={styles.warningText}>
          This portal uses HTTP. Login details are not encrypted. Use only on a trusted company
          network with test credentials; never use public Wi-Fi or real passwords. Enable HTTPS
          before wider testing or release.
        </Text>
      </View>

      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: PORTAL_URL }}
          originWhitelist={[PORTAL_ORIGIN]}
          onShouldStartLoadWithRequest={({ url }) => isPortalUrl(url)}
          onLoadStart={() => setLoadError(null)}
          onError={() =>
            setLoadError(
              'Could not load the portal. Check your connection to the company network and try again.'
            )
          }
          onHttpError={(event) =>
            setLoadError(`The portal returned an HTTP ${event.nativeEvent.statusCode} error.`)
          }
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={palette.brown} />
              <Text style={styles.loadingText}>Connecting to the employee system…</Text>
            </View>
          )}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          style={styles.webView}
        />
        {loadError ? (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorTitle}>Portal unavailable</Text>
            <Text style={styles.errorText}>{loadError}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setLoadError(null);
                webViewRef.current?.reload();
              }}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function createStyles(RcsColors: Record<keyof RcsPalette, string>) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: RcsColors.background },
  header: {
    minHeight: 56,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: RcsColors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: RcsColors.border,
  },
  title: { color: RcsColors.brownDark, fontSize: 17, fontWeight: '700' },
  reloadButton: { paddingHorizontal: 10, paddingVertical: 8 },
  reloadText: { color: RcsColors.brownLight, fontSize: 14, fontWeight: '600' },
  warning: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: RcsColors.yellowLight,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: RcsColors.yellow,
  },
  warningTitle: { color: RcsColors.brown, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  warningText: { color: RcsColors.grayDark, fontSize: 12, lineHeight: 17 },
  webViewContainer: { flex: 1, backgroundColor: RcsColors.surface },
  webView: { flex: 1 },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RcsColors.surface,
    gap: 12,
  },
  loadingText: { color: RcsColors.gray, fontSize: 14 },
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: RcsColors.surface,
  },
  errorTitle: { color: RcsColors.brownDark, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  errorText: { color: RcsColors.gray, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  retryButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: RcsColors.brownSurface,
  },
  retryText: { color: RcsColors.white, fontSize: 14, fontWeight: '700' },
  });
}

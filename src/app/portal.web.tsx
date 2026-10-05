import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { RcsColors } from '@/constants/theme';

const PORTAL_URL = 'http://161.49.223.6/RCS_ONLINE';

export default function PortalScreen() {
  const [openError, setOpenError] = useState<string | null>(null);

  const openPortal = async () => {
    try {
      await Linking.openURL(PORTAL_URL);
      setOpenError(null);
    } catch {
      setOpenError('Could not open the portal. Check your connection and try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RCS Employee System</Text>
      <View style={styles.warning}>
        <Text style={styles.warningTitle}>Prototype — connection is not secure</Text>
        <Text style={styles.warningText}>
          This portal uses HTTP. Login details are not encrypted. Use only on a trusted company
          network with test credentials; never use public Wi-Fi or real passwords. Enable HTTPS
          before wider testing or release.
        </Text>
      </View>
      <Text style={styles.description}>
        Open the existing Employee Online System in a new browser tab.
      </Text>
      <Pressable accessibilityRole="button" onPress={openPortal} style={styles.button}>
        <Text style={styles.buttonText}>Open employee system</Text>
      </Pressable>
      {openError ? <Text style={styles.error}>{openError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: RcsColors.background,
  },
  title: { color: RcsColors.brownDark, fontSize: 22, fontWeight: '700', marginBottom: 18 },
  warning: {
    padding: 16,
    backgroundColor: RcsColors.yellowLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: RcsColors.yellow,
  },
  warningTitle: { color: RcsColors.brown, fontSize: 14, fontWeight: '700', marginBottom: 6 },
  warningText: { color: RcsColors.grayDark, fontSize: 13, lineHeight: 19 },
  description: { color: RcsColors.gray, fontSize: 15, lineHeight: 22, marginTop: 22 },
  button: {
    alignSelf: 'flex-start',
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: RcsColors.brown,
  },
  buttonText: { color: RcsColors.white, fontSize: 14, fontWeight: '700' },
  error: { color: RcsColors.brownDark, fontSize: 13, marginTop: 12 },
});

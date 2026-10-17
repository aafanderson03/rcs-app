import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ResponsiveText as Text, ResponsiveTextInput as TextInput } from '@/components/responsive-text';
import { getCompanyBranding } from '@/constants/company-branding';
import { getPaletteForScheme } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { demoEmployeeNames } from '@/data/demo-data';

const demoUsers = [
  { username: 'demo', name: demoEmployeeNames[0], company: 'RCS' },
  { username: 'demo-brilliant', name: demoEmployeeNames[1], company: 'Brilliant' },
  { username: 'demo-tlz', name: demoEmployeeNames[2], company: 'TLZ' },
  { username: 'demo-fsi', name: demoEmployeeNames[3], company: 'Friendship' },
  { username: 'demo-mfsc', name: demoEmployeeNames[4], company: 'Metro Federal Steel' },
  { username: 'demo-cgci', name: demoEmployeeNames[5], company: 'Core Gateway Colleges' },
  { username: 'demo-spf', name: demoEmployeeNames[6], company: 'Sweetpack Foods' },
];

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { colorScheme } = useAppTheme();
  const loginBrand = getCompanyBranding();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 800;
  const isMobile = width < 600;
  const isCompact = width < 380;
  const colors = useMemo(() => getPaletteForScheme(colorScheme), [colorScheme]);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!username.trim() || !password) {
      setMessage('Enter your username and password.');
      return;
    }
    setMessage('');
    setSubmitting(true);
    try {
      await signIn(username.trim(), password);
      router.replace('/home');
    } catch (error) {
      setMessage(error instanceof TypeError ? 'Cannot reach the local sign-in service. Keep “npm run auth:dev” running and connect your phone and computer to the same Wi-Fi. A published app needs a hosted HTTPS sign-in service.' : error instanceof Error ? error.message : 'Sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={[styles.page, isCompact && styles.compactPage, isDesktop && styles.desktopPage]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={[styles.loginShell, isDesktop && styles.desktopLoginShell]}>
          <View style={[styles.brandPanel, isCompact && styles.compactBrandPanel]}>
            <View style={styles.brandTopLine} />
            <Image source={loginBrand.logo} contentFit="contain" style={[styles.logo, isCompact && styles.compactLogo]} accessibilityLabel={loginBrand.name} />
            <View style={styles.brandDivider} />
            <Text style={styles.brandLabel}>EMPLOYEE PORTAL</Text>
          </View>
          <View style={[styles.card, isCompact && styles.compactCard]}>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.description}>Sign in with your employee account.</Text>

          <View style={styles.notice}>
            <Text style={styles.noticeText}>Local prototype · Not connected to production systems</Text>
          </View>
          {__DEV__ ? (
            <View style={styles.demoCredentials}>
              <Text style={styles.demoCredentialsTitle}>Demo accounts</Text>
              {demoUsers.map((demoUser) => (
                <Text key={demoUser.username} style={styles.demoCredentialRow}>
                  {demoUser.name} · {demoUser.company} — {demoUser.username}
                </Text>
              ))}
              <Text style={styles.demoCredentialsHint}>
                Shared demo password: demo1234. For local setup, AUTH_TEST_PASSWORD can be changed in .env.local.
              </Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
              <TextInput accessibilityLabel="Username" autoComplete="off" importantForAutofill="no" autoCapitalize="none" autoCorrect={false} onChangeText={setUsername} placeholder="Enter your username" placeholderTextColor={colors.grayMuted} returnKeyType="next" style={[styles.input, isMobile && styles.mobileInput]} value={username} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput accessibilityLabel="Password" autoComplete="off" importantForAutofill="no" autoCapitalize="none" autoCorrect={false} onChangeText={setPassword} onSubmitEditing={submit} placeholder="Enter your password" placeholderTextColor={colors.grayMuted} returnKeyType="done" secureTextEntry={!showPassword} style={[styles.input, styles.passwordInput, isMobile && styles.mobileInput]} value={password} />
              <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} onPress={() => setShowPassword((shown) => !shown)} style={({ pressed }) => [styles.showPassword, pressed && styles.pressed]}>
                <Text style={styles.showPasswordText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>
          </View>

          <Pressable accessibilityRole="button" accessibilityState={{ disabled: submitting }} disabled={submitting} onPress={submit} style={({ pressed }) => [styles.submitButton, pressed && styles.pressed, (submitting) && styles.disabled]}>
            {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitButtonText}>Sign in</Text>}
          </Pressable>

          {message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null}
          <Text style={styles.footer}>Need help signing in? Contact your HR or system administrator.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof getPaletteForScheme>) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    page: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: colors.background },
    compactPage: { padding: 14 },
    desktopPage: { padding: 36 },
    loginShell: { width: '100%', maxWidth: 470, alignSelf: 'center', overflow: 'hidden', borderRadius: 4, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    desktopLoginShell: { maxWidth: 470 },
    brandPanel: { minHeight: 92, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingTop: 9, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    compactBrandPanel: { minHeight: 78, paddingHorizontal: 14 },
    brandTopLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: colors.brown },
    logo: { width: 112, height: 64, marginRight: 16, borderRadius: 4 },
    compactLogo: { width: 112, height: 64, marginRight: 10 },
    brandDivider: { width: 1, height: 34, marginRight: 16, backgroundColor: colors.border },
    brandLabel: { color: colors.grayDark, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
    card: { width: '100%', paddingHorizontal: 28, paddingTop: 25, paddingBottom: 22, backgroundColor: colors.surface },
    compactCard: { paddingHorizontal: 19, paddingTop: 22 },
    title: { color: colors.text, fontSize: 25, fontWeight: '700', letterSpacing: -0.5 },
    description: { marginTop: 5, marginBottom: 18, color: colors.grayMuted, fontSize: 13, lineHeight: 19 },
    notice: { paddingVertical: 8, paddingHorizontal: 10, marginBottom: 18, borderRadius: 5, backgroundColor: colors.yellowLight, borderLeftWidth: 2, borderLeftColor: colors.yellow },
    noticeText: { color: colors.grayDark, fontSize: 10, lineHeight: 15 },
    demoCredentials: { marginTop: -8, marginBottom: 16, padding: 10, borderRadius: 4, backgroundColor: colors.background },
    demoCredentialsTitle: { marginBottom: 4, color: colors.brownDark, fontSize: 11, fontWeight: '800' },
    demoCredentialRow: { color: colors.brownLight, fontSize: 10, lineHeight: 16, fontWeight: '600' },
    demoCredentialsHint: { marginTop: 5, color: colors.grayMuted, fontSize: 9, lineHeight: 13 },
    field: { marginBottom: 15 },
    label: { marginBottom: 7, color: colors.grayDark, fontSize: 12, fontWeight: '700' },
    input: { minHeight: 50, paddingHorizontal: 14, borderRadius: 4, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 14 },
    mobileInput: { fontSize: 16 },
    passwordRow: { flexDirection: 'row', alignItems: 'center' },
    passwordInput: { flex: 1, paddingRight: 64 },
    showPassword: { position: 'absolute', right: 4, minWidth: 56, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    showPasswordText: { color: colors.brown, fontSize: 11, fontWeight: '700' },
    submitButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 3, borderRadius: 4, backgroundColor: colors.brown },
    submitButtonText: { color: colors.white, fontSize: 13, fontWeight: '800' },
    disabled: { opacity: 0.6 },
    message: { marginTop: 13, color: colors.danger, fontSize: 12, lineHeight: 18 },
    footer: { marginTop: 18, color: colors.grayMuted, fontSize: 11, lineHeight: 17, textAlign: 'center' },
    pressed: { opacity: 0.75 },
  });
}

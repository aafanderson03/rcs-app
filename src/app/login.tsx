import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ResponsiveText as Text, ResponsiveTextInput as TextInput } from '@/components/responsive-text';
import { getCompanyBranding } from '@/constants/company-branding';
import { getPaletteForScheme } from '@/constants/theme';
import { isStandaloneDemoMode, useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { DEMO_PASSWORD, demoCompanies } from '@/data/demo-accounts';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { colorScheme } = useAppTheme();
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
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const desktopWeb = Platform.OS === 'web' && isDesktop;
  const selectedDemoAccount = demoCompanies
    .flatMap((company) => company.accounts)
    .find((account) => account.username === username);

  const chooseDemoAccount = (selectedUsername: string) => {
    setUsername(selectedUsername);
    setPassword(isStandaloneDemoMode ? DEMO_PASSWORD : '');
    setMessage('');
    setAccountMenuOpen(false);
  };

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
          <View style={[styles.brandPanel, isCompact && styles.compactBrandPanel, isDesktop && styles.desktopBrandPanel]}>
            <View style={styles.brandTopLine} />
            <View style={styles.brandIdentity}>
              <Text style={[styles.brandLabel, isDesktop && styles.desktopBrandLabel]}>EMPLOYEE PORTAL</Text>
            </View>
            {desktopWeb ? (
              <View nativeID="company-logo-viewport" accessibilityLabel="Company logos" style={styles.desktopLogoViewport}>
                <View nativeID="company-logo-track" style={styles.desktopLogoTrack}>
                  <View style={styles.desktopLogoSequence}>
                    {demoCompanies.map((company) => {
                      const companyLogo = getCompanyBranding(company.slug, company.name);
                      return (
                        <View key={company.slug} style={[styles.companyLogoFrame, styles.desktopCompanyLogoFrame]}>
                          <Image
                            source={companyLogo.logo}
                            contentFit="contain"
                            style={styles.companyLogo}
                            accessibilityLabel={`${company.name} logo`}
                          />
                        </View>
                      );
                    })}
                  </View>
                  <View style={styles.desktopLogoSequence} accessible={false} importantForAccessibility="no-hide-descendants">
                    {demoCompanies.map((company) => {
                      const companyLogo = getCompanyBranding(company.slug, company.name);
                      return (
                        <View key={company.slug} style={[styles.companyLogoFrame, styles.desktopCompanyLogoFrame]}>
                          <Image
                            source={companyLogo.logo}
                            contentFit="contain"
                            style={styles.companyLogo}
                            accessibilityLabel={`${company.name} logo`}
                          />
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            ) : (
              <ScrollView
                accessibilityLabel="Company logos"
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.companyLogoStrip}
                contentContainerStyle={styles.companyLogoStripContent}
              >
                {demoCompanies.map((company) => {
                  const companyLogo = getCompanyBranding(company.slug, company.name);
                  return (
                    <View key={company.slug} style={styles.companyLogoFrame}>
                      <Image
                        source={companyLogo.logo}
                        contentFit="contain"
                        style={styles.companyLogo}
                        accessibilityLabel={`${company.name} logo`}
                      />
                    </View>
                  );
                })}
              </ScrollView>
            )}
            {isDesktop ? (
              <View style={styles.brandMessage}>
                <Text style={styles.brandHeroTitle}>Your work, in one place.</Text>
                <Text style={styles.brandHeroDescription}>
                  Check your time, manage requests, and stay up to date with your team.
                </Text>
              </View>
            ) : null}
          </View>
          <View style={[styles.card, isCompact && styles.compactCard, isDesktop && styles.desktopCard]}>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.description}>{isStandaloneDemoMode ? 'Sign in with a sample demo account.' : 'Sign in with your employee account.'}</Text>

          <View style={styles.notice}>
            <Text style={styles.noticeText}>{isStandaloneDemoMode ? 'Standalone demo · Sample data is stored on this device' : 'Local prototype · Not connected to production systems'}</Text>
          </View>
          {__DEV__ || isStandaloneDemoMode ? (
            <View style={[styles.demoCredentials, accountMenuOpen && styles.demoCredentialsOpen]}>
              <Text style={styles.demoCredentialsTitle}>Demo account</Text>
              <View style={[styles.accountDropdownAnchor, accountMenuOpen && styles.accountDropdownAnchorOpen]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={selectedDemoAccount ? `Selected ${selectedDemoAccount.label}. Choose another account` : 'Choose a company and account type'}
                  accessibilityState={{ expanded: accountMenuOpen }}
                  onPress={() => setAccountMenuOpen((open) => !open)}
                  style={({ pressed }) => [styles.accountDropdown, accountMenuOpen && styles.accountDropdownOpen, pressed && styles.pressed]}
                >
                  <View style={styles.accountDropdownText}>
                    <Text style={styles.accountDropdownLabel} numberOfLines={1}>
                      {selectedDemoAccount?.label ?? 'Choose a company and account type'}
                    </Text>
                    <Text style={styles.accountDropdownHint} numberOfLines={1}>
                      {selectedDemoAccount
                        ? `${selectedDemoAccount.displayName} · ${selectedDemoAccount.companyName}`
                        : 'Select a demo account'}
                    </Text>
                  </View>
                  <Text style={styles.accountDropdownChevron}>{accountMenuOpen ? '⌃' : '⌄'}</Text>
                </Pressable>
                {accountMenuOpen ? (
                  <ScrollView
                    accessibilityLabel="Company and account type options"
                    style={styles.accountDropdownMenu}
                    contentContainerStyle={styles.accountDropdownMenuContent}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                  >
                    {demoCompanies.map((company) => {
                      const companyLogo = getCompanyBranding(company.slug, company.name);
                      return (
                        <View key={company.slug} style={styles.demoCompany}>
                          <View style={styles.demoCompanyHeader}>
                            <View style={styles.demoLogoFrame}>
                              <Image source={companyLogo.logo} contentFit="contain" style={styles.demoLogo} accessibilityLabel={`${company.name} logo`} />
                            </View>
                            <Text style={styles.demoCompanyName}>{company.name}</Text>
                          </View>
                          {company.accounts.map((account) => (
                            <Pressable
                              key={account.username}
                              accessibilityRole="button"
                              accessibilityLabel={`Select ${account.label} account`}
                              accessibilityState={{ selected: username === account.username }}
                              onPress={() => chooseDemoAccount(account.username)}
                              style={({ pressed }) => [
                                styles.demoRoleLink,
                                username === account.username && styles.demoAccountSelected,
                                pressed && styles.pressed,
                              ]}
                            >
                              <Text style={styles.demoRoleLabel}>{account.label}</Text>
                              <Text style={styles.demoAccountUsername}>{account.displayName} · {account.username}</Text>
                            </Pressable>
                          ))}
                        </View>
                      );
                    })}
                  </ScrollView>
                ) : null}
              </View>
              <Text style={styles.demoCredentialsHint}>
                Demo password: {DEMO_PASSWORD}.{isStandaloneDemoMode ? ' Sign-in works offline.' : ''}
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
    loginShell: { width: '100%', maxWidth: 520, alignSelf: 'center', overflow: 'visible', borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    desktopLoginShell: { maxWidth: 1060, flexDirection: 'row', minHeight: 610 },
    brandPanel: { minHeight: 92, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 22, paddingVertical: 14, backgroundColor: colors.yellowLight, borderBottomWidth: 1, borderBottomColor: colors.border, borderTopLeftRadius: 23, borderTopRightRadius: 23 },
    compactBrandPanel: { minHeight: 88, paddingHorizontal: 14 },
    desktopBrandPanel: { flex: 1, minHeight: 610, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 52, paddingTop: 0, backgroundColor: colors.yellowLight, borderBottomWidth: 0 },
    brandIdentity: { flexDirection: 'column', alignItems: 'center', gap: 8 },
    companyLogoStrip: { width: '100%', flexGrow: 0, flexShrink: 1 },
    companyLogoStripContent: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 1 },
    desktopLogoViewport: { width: '100%', overflow: 'hidden' },
    desktopLogoTrack: { flexDirection: 'row', alignSelf: 'flex-start', gap: 0 },
    desktopLogoSequence: { flexDirection: 'row', flexGrow: 0, flexShrink: 0, alignItems: 'center', gap: 7 },
    companyLogoFrame: { width: 48, height: 48, flexGrow: 0, flexShrink: 0, alignItems: 'center', justifyContent: 'center', padding: 4, borderRadius: 7, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    desktopCompanyLogoFrame: { width: 88, height: 88, padding: 8, borderRadius: 12 },
    companyLogo: { width: '100%', height: '100%' },
    brandTopLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 5, backgroundColor: colors.yellow },
    brandLabel: { color: colors.grayDark, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
    desktopBrandLabel: { marginTop: 18, color: colors.brown },
    brandMessage: { marginTop: 42, gap: 12 },
    brandHeroTitle: { maxWidth: 360, color: colors.brownDark, fontSize: 36, lineHeight: 42, fontWeight: '800', letterSpacing: -1.2 },
    brandHeroDescription: { maxWidth: 340, color: colors.grayDark, fontSize: 14, lineHeight: 23 },
    card: { width: '100%', paddingHorizontal: 28, paddingTop: 25, paddingBottom: 22, backgroundColor: colors.surface, borderBottomLeftRadius: 23, borderBottomRightRadius: 23 },
    desktopCard: { flex: 1, justifyContent: 'center', paddingHorizontal: 54, paddingTop: 52, paddingBottom: 52 },
    compactCard: { paddingHorizontal: 19, paddingTop: 22 },
    title: { color: colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
    description: { marginTop: 5, marginBottom: 18, color: colors.grayMuted, fontSize: 13, lineHeight: 19 },
    notice: { paddingVertical: 10, paddingHorizontal: 12, marginBottom: 18, borderRadius: 10, backgroundColor: colors.yellowLight, borderLeftWidth: 3, borderLeftColor: colors.yellow },
    noticeText: { color: colors.grayDark, fontSize: 10, lineHeight: 15 },
    demoCredentials: { marginTop: -8, marginBottom: 16, padding: 12, borderRadius: 10, backgroundColor: colors.background, overflow: 'visible' },
    demoCredentialsOpen: { zIndex: 30, elevation: 20 },
    demoCredentialsTitle: { color: colors.brownDark, fontSize: 11, fontWeight: '800' },
    demoCredentialsHint: { marginTop: 7, color: colors.grayMuted, fontSize: 10, lineHeight: 14 },
    accountDropdown: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 7, paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    accountDropdownOpen: { borderColor: colors.brown },
    accountDropdownText: { flex: 1, minWidth: 0 },
    accountDropdownLabel: { color: colors.text, fontSize: 12, fontWeight: '700' },
    accountDropdownHint: { marginTop: 2, color: colors.grayMuted, fontSize: 10 },
    accountDropdownChevron: { color: colors.brown, fontSize: 18, fontWeight: '800' },
    accountDropdownAnchor: { position: 'relative', zIndex: 1 },
    accountDropdownAnchorOpen: { zIndex: 20, elevation: 10 },
    accountDropdownMenu: { position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: 250, marginTop: 6, borderRadius: 9, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, elevation: 20, zIndex: 30 },
    accountDropdownMenuContent: { paddingHorizontal: 8, paddingVertical: 3 },
    demoCompany: { paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: colors.border },
    demoCompanyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    demoLogoFrame: { width: 42, height: 36, alignItems: 'center', justifyContent: 'center', padding: 3, borderRadius: 7, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    demoLogo: { width: '100%', height: '100%' },
    demoCompanyName: { flex: 1, color: colors.brownDark, fontSize: 11, lineHeight: 15, fontWeight: '800' },
    demoRoleLink: { minHeight: 38, justifyContent: 'center', marginTop: 3, marginLeft: 49, paddingHorizontal: 8, borderRadius: 7 },
    demoRoleLabel: { color: colors.brownLight, fontSize: 11, lineHeight: 14, fontWeight: '700' },
    demoAccountUsername: { color: colors.grayMuted, fontSize: 10, lineHeight: 13 },
    demoAccountSelected: { backgroundColor: colors.yellowLight },
    field: { marginBottom: 15 },
    label: { marginBottom: 7, color: colors.grayDark, fontSize: 12, fontWeight: '700' },
    input: { minHeight: 54, paddingHorizontal: 16, borderRadius: 14, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 14 },
    mobileInput: { fontSize: 16 },
    passwordRow: { flexDirection: 'row', alignItems: 'center' },
    passwordInput: { flex: 1, paddingRight: 64 },
    showPassword: { position: 'absolute', right: 4, minWidth: 56, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    showPasswordText: { color: colors.brown, fontSize: 11, fontWeight: '700' },
    submitButton: { minHeight: 54, alignItems: 'center', justifyContent: 'center', marginTop: 3, borderRadius: 14, backgroundColor: colors.brown },
    submitButtonText: { color: colors.white, fontSize: 13, fontWeight: '800' },
    disabled: { opacity: 0.6 },
    message: { marginTop: 13, color: colors.danger, fontSize: 12, lineHeight: 18 },
    footer: { marginTop: 18, color: colors.grayMuted, fontSize: 11, lineHeight: 17, textAlign: 'center' },
    pressed: { opacity: 0.75 },
  });
}

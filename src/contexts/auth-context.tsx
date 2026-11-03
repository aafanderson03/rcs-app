import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform, type ImageSourcePropType } from 'react-native';
import { DEMO_PASSWORD, demoAccounts } from '@/data/demo-accounts';

export type ProfilePictureSource = ImageSourcePropType;

export type EmployeeType = 'employee' | 'merchandiser' | 'guard' | 'subcontractor';
export type Company = { slug: string; name: string };
export type AuthUser = {
  id: string;
  username: string;
  displayName: string;
  employeeType: EmployeeType;
  company: Company;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  profilePicture: ProfilePictureSource | null;
  hasCustomProfilePicture: boolean;
  profilePictureError: string | null;
  setProfilePicture: (dataUri: string | null) => Promise<void>;
  signIn: (username: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const configuredApiUrl = process.env.EXPO_PUBLIC_AUTH_API_URL;
export const isStandaloneDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
const profilePictureStorageKey = (userId: string) => `@rcs/profile-picture/${userId}`;
const rcsDemoProfilePhoto: ProfilePictureSource = require('@/assets/images/2X2.png');

function withDemoDisplayName(user: AuthUser): AuthUser {
  if (user.company.slug === 'rcs-eastern-intertrade' && user.username === 'demo') {
    return { ...user, displayName: 'Aaron Anthony Anderson' };
  }
  return user;
}

function getAuthApiUrl() {
  const isAndroidEmulator = Platform.OS === 'android' && !Device.isDevice;

  if (Platform.OS === 'web') {
    if (!configuredApiUrl) return 'http://localhost:4100';

    const configuredUrl = new URL(configuredApiUrl);
    const configuredHost = configuredUrl.hostname.toLowerCase();
    const isLoopback = ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(configuredHost);
    const pageHost = typeof window === 'undefined' ? '' : window.location.hostname.toLowerCase();
    const isPageLoopback = ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(pageHost);

    if (isLoopback && pageHost && !isPageLoopback) {
      return `${configuredUrl.protocol}//${pageHost}:${configuredUrl.port || '4100'}`;
    }
    return configuredApiUrl;
  }

  if (configuredApiUrl) {
    const configuredHost = new URL(configuredApiUrl).hostname.toLowerCase();
    const isLoopback = ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(configuredHost);
    if (!isLoopback) return configuredApiUrl;
    if (isAndroidEmulator) {
      const configuredUrl = new URL(configuredApiUrl);
      return `${configuredUrl.protocol}//10.0.2.2:${configuredUrl.port || '4100'}`;
    }
  }

  if (isAndroidEmulator) return 'http://10.0.2.2:4100';

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = new URL(hostUri.includes('://') ? hostUri : `http://${hostUri}`).hostname;
    if (host && !['localhost', '127.0.0.1', '::1'].includes(host.toLowerCase())) {
      return `http://${host}:4100`;
    }
  }

  return Platform.OS === 'android' ? 'http://10.0.2.2:4100' : 'http://localhost:4100';
}

const apiUrl = getAuthApiUrl();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profilePicture, setProfilePictureUri] = useState<string | null>(null);
  const [profilePictureError, setProfilePictureError] = useState<string | null>(null);
  const userId = user?.id;
  const isRcsDemoAccount =
    user?.company.slug === 'rcs-eastern-intertrade' && user.username === 'demo';
  useEffect(() => {
    let active = true;
    if (!userId) return;

    AsyncStorage.getItem(profilePictureStorageKey(userId))
      .then((storedPicture) => {
        if (active) setProfilePictureUri(storedPicture);
      })
      .catch((error: unknown) => {
        console.error('Unable to load the saved profile picture.', error);
        if (active) setProfilePictureError('Could not load the saved profile picture.');
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    profilePicture: profilePicture
      ? { uri: profilePicture }
      : isRcsDemoAccount
        ? rcsDemoProfilePhoto
        : null,
    hasCustomProfilePicture: profilePicture !== null,
    profilePictureError,
    async setProfilePicture(dataUri) {
      if (!user) throw new Error('Sign in before saving a profile picture.');
      const key = profilePictureStorageKey(user.id);
      if (dataUri) await AsyncStorage.setItem(key, dataUri);
      else await AsyncStorage.removeItem(key);
      setProfilePictureUri(dataUri);
      setProfilePictureError(null);
    },
    async signIn(username, password) {
      if (isStandaloneDemoMode) {
        const account = demoAccounts.find((candidate) => candidate.username === username.trim().toLowerCase());
        if (!account || password !== DEMO_PASSWORD) throw new Error('Demo sign-in failed. Check the demo username and password.');
        setToken(null);
        setProfilePictureUri(null);
        setUser(account.user);
        return account.user;
      }

      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Sign-in failed.');
      setToken(data.token as string);
      const authenticatedUser = withDemoDisplayName(data.user as AuthUser);
      setProfilePictureUri(null);
      setUser(authenticatedUser);
      return authenticatedUser;
    },
    async signOut() {
      if (token) {
        try {
          await fetch(`${apiUrl}/api/auth/logout`, {
            method: 'POST',
            headers: { authorization: `Bearer ${token}` },
          });
        } finally {
          setToken(null);
          setUser(null);
          setProfilePictureUri(null);
          setProfilePictureError(null);
        }
      } else {
        setToken(null);
        setUser(null);
        setProfilePictureUri(null);
        setProfilePictureError(null);
      }
    },
  }), [isRcsDemoAccount, profilePicture, profilePictureError, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}

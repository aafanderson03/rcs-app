import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

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
  signIn: (username: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const configuredApiUrl = process.env.EXPO_PUBLIC_AUTH_API_URL;
const isProduction = process.env.NODE_ENV === 'production';

function getAuthApiUrl() {
  const isAndroidEmulator = Platform.OS === 'android' && !Device.isDevice;
  const configuredUrl = configuredApiUrl?.trim().replace(/\/+$/, '');

  if (Platform.OS === 'web') {
    if (!configuredUrl) {
      if (isProduction && typeof window !== 'undefined') return window.location.origin;
      return 'http://localhost:4100';
    }

    const parsedUrl = new URL(configuredUrl);
    const configuredHost = parsedUrl.hostname.toLowerCase();
    const isLoopback = ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(configuredHost);
    const pageHost = typeof window === 'undefined' ? '' : window.location.hostname.toLowerCase();
    const isPageLoopback = ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(pageHost);

    if (isLoopback && pageHost && !isPageLoopback) {
      return `${parsedUrl.protocol}//${pageHost}:${parsedUrl.port || '4100'}`;
    }
    return configuredUrl;
  }

  if (configuredUrl) {
    const configuredHost = new URL(configuredUrl).hostname.toLowerCase();
    const isLoopback = ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(configuredHost);
    if (!isLoopback) return configuredUrl;
    if (isAndroidEmulator) {
      const parsedUrl = new URL(configuredUrl);
      return `${parsedUrl.protocol}//10.0.2.2:${parsedUrl.port || '4100'}`;
    }
  }

  if (isProduction) return '';

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

async function readApiJson(response: Response) {
  const responseText = await response.text();
  let data: { error?: string; token?: string; user?: AuthUser };

  try {
    data = JSON.parse(responseText) as typeof data;
  } catch {
    throw new Error(
      `The server returned an unexpected response (HTTP ${response.status}). Check the Vercel function logs.`,
    );
  }

  if (!response.ok) throw new Error(data.error || 'The request could not be completed.');
  return data;
}

export function authApiEndpoint(path: string) {
  if (!apiUrl) throw new Error('Set EXPO_PUBLIC_AUTH_API_URL in the production app build.');
  return `${apiUrl}${path}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    async signIn(username, password) {
      const response = await fetch(authApiEndpoint('/api/auth/login'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await readApiJson(response);
      if (!data.token || !data.user) throw new Error('The server response was missing login information.');
      setToken(data.token);
      const authenticatedUser = data.user;
      setUser(authenticatedUser);
      return authenticatedUser;
    },
    async signOut() {
      if (token) {
        try {
          await fetch(authApiEndpoint('/api/auth/logout'), {
            method: 'POST',
            headers: { authorization: `Bearer ${token}` },
          });
        } finally {
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }
    },
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}

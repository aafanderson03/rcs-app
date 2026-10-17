import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { authApiEndpoint, useAuth } from '@/contexts/auth-context';
import { type DemoApplication } from '@/data/demo-data';

type DemoSubmissionContextValue = {
  applications: DemoApplication[];
  isLoading: boolean;
  error: string | null;
  submitDemoApplication: (transaction: string, values: Record<string, string>) => Promise<DemoApplication>;
  cancelDemoApplication: (applicationId: string, reason: string) => Promise<boolean>;
};

const DemoSubmissionContext = createContext<DemoSubmissionContextValue | null>(null);

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({})) as { error?: string } & T;
  if (!response.ok) throw new Error(data.error || 'Unable to contact the application service.');
  return data;
}

export function DemoSubmissionsProvider({ children }: PropsWithChildren) {
  const { token } = useAuth();
  const [applications, setApplications] = useState<DemoApplication[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadedToken, setLoadedToken] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    const loadApplications = async () => {
      try {
      const response = await fetch(authApiEndpoint('/api/applications'), {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await parseResponse<{ applications: DemoApplication[] }>(response);
        if (active) {
          setApplications(data.applications);
          setError(null);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load applications.');
          setApplications([]);
        }
      } finally {
        if (active) setLoadedToken(token);
      }
    };
    void loadApplications();
    return () => { active = false; };
  }, [token]);

  const submitDemoApplication = useCallback(async (transaction: string, values: Record<string, string>) => {
    if (!token) throw new Error('Sign in before submitting an application.');
    const response = await fetch(authApiEndpoint('/api/applications'), {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ type: transaction, values }),
    });
    const data = await parseResponse<{ application: DemoApplication }>(response);
    setApplications((current) => [data.application, ...current]);
    setError(null);
    setLoadedToken(token);
    return data.application;
  }, [token]);

  const cancelDemoApplication = useCallback(async (applicationId: string, reason: string) => {
    if (!token || !reason.trim()) return false;
    const response = await fetch(authApiEndpoint('/api/applications/cancel'), {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ applicationId, reason }),
    });
    if (response.status === 409) return false;
    const data = await parseResponse<{ application: DemoApplication }>(response);
    setApplications((current) => current.map((item) => item.id === data.application.id ? data.application : item));
    setError(null);
    setLoadedToken(token);
    return true;
  }, [token]);

  const value = useMemo(() => ({
    applications: token ? applications : [],
    isLoading: Boolean(token && loadedToken !== token),
    error: token && loadedToken === token ? error : null,
    cancelDemoApplication,
    submitDemoApplication,
  }), [applications, cancelDemoApplication, error, loadedToken, submitDemoApplication, token]);

  return <DemoSubmissionContext.Provider value={value}>{children}</DemoSubmissionContext.Provider>;
}

export function useDemoSubmissions() {
  const context = useContext(DemoSubmissionContext);
  if (!context) throw new Error('useDemoSubmissions must be used within DemoSubmissionsProvider.');
  return context;
}

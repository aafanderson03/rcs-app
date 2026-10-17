import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { demoApplications, relativeDate, type DemoApplication } from '@/data/demo-data';

type DemoSubmissionContextValue = {
  applications: DemoApplication[];
  submitDemoApplication: (transaction: string, values: Record<string, string>) => DemoApplication;
  cancelDemoApplication: (applicationId: string, reason: string) => boolean;
};

const STORAGE_KEY = 'rcs-demo-submissions';
const DemoSubmissionContext = createContext<DemoSubmissionContextValue | null>(null);

type StoredDemoApplications = {
  submissions: DemoApplication[];
  cancelledSeedIds: string[];
  cancellationReasons?: Record<string, string>;
};

export function DemoSubmissionsProvider({ children }: PropsWithChildren) {
  const [submissions, setSubmissions] = useState<DemoApplication[]>([]);
  const [cancelledSeedIds, setCancelledSeedIds] = useState<string[]>([]);
  const [cancellationReasons, setCancellationReasons] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (!mounted) return;
      if (stored) {
        const saved = JSON.parse(stored) as DemoApplication[] | StoredDemoApplications;
        if (Array.isArray(saved)) {
          setSubmissions(saved);
        } else if (saved && Array.isArray(saved.submissions)) {
          setSubmissions(saved.submissions);
          setCancelledSeedIds(Array.isArray(saved.cancelledSeedIds) ? saved.cancelledSeedIds : []);
          setCancellationReasons(saved.cancellationReasons ?? {});
        }
      }
      setIsLoaded(true);
    }).catch((error: unknown) => {
      console.error('Unable to load saved demo submissions.', error);
      if (mounted) setIsLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const saved: StoredDemoApplications = { submissions, cancelledSeedIds, cancellationReasons };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved)).catch((error: unknown) => {
      console.error('Unable to save demo submissions.', error);
    });
  }, [cancelledSeedIds, cancellationReasons, isLoaded, submissions]);

  const applications = useMemo(() => [
    ...submissions,
    ...demoApplications.map((item) => cancelledSeedIds.includes(item.id) && item.status === 'Pending'
      ? { ...item, status: 'Cancelled' as const, cancellationReason: cancellationReasons[item.id] }
      : item),
  ], [cancellationReasons, cancelledSeedIds, submissions]);

  const submitDemoApplication = useCallback((transaction: string, values: Record<string, string>) => {
    const details = Object.entries(values)
      .filter(([, value]) => value.trim())
      .map(([label, value]) => ({ label: label.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase()), value: value === 'true' ? 'Yes' : value }));
    const key = `DEMO-APP-${Date.now().toString().slice(-8)}`;
    const item: DemoApplication = {
      id: key,
      type: transaction,
      summary: `${transaction} request${details.length ? ` · ${details.slice(0, 2).map((detail) => detail.value).join(' · ')}` : ''}`,
      submittedAt: relativeDate(0),
      status: 'Pending',
      details,
    };
    setSubmissions((current) => [item, ...current]);
    return item;
  }, []);

  const cancelDemoApplication = useCallback((applicationId: string, reason: string) => {
    const cancellationReason = reason.trim();
    if (!cancellationReason) return false;

    const submitted = submissions.find((item) => item.id === applicationId);
    if (submitted) {
      if (submitted.status !== 'Pending') return false;
      setSubmissions((current) => current.map((item) => item.id === applicationId
        ? { ...item, status: 'Cancelled', cancellationReason }
        : item));
      return true;
    }

    const seeded = demoApplications.find((item) => item.id === applicationId);
    if (!seeded || seeded.status !== 'Pending' || cancelledSeedIds.includes(applicationId)) return false;
    setCancelledSeedIds((current) => [...current, applicationId]);
    setCancellationReasons((current) => ({ ...current, [applicationId]: cancellationReason }));
    return true;
  }, [cancelledSeedIds, submissions]);

  const value = useMemo(() => ({ applications, cancelDemoApplication, submitDemoApplication }), [applications, cancelDemoApplication, submitDemoApplication]);
  return <DemoSubmissionContext.Provider value={value}>{children}</DemoSubmissionContext.Provider>;
}

export function useDemoSubmissions() {
  const context = useContext(DemoSubmissionContext);
  if (!context) throw new Error('useDemoSubmissions must be used within DemoSubmissionsProvider.');
  return context;
}

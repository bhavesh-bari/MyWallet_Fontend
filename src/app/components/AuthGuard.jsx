'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuthSession, hasValidAuthSession } from '../lib/auth';

function subscribeToAuthSession(callback) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getServerSessionSnapshot() {
  return null;
}

export default function AuthGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthorized = useSyncExternalStore(
    subscribeToAuthSession,
    hasValidAuthSession,
    getServerSessionSnapshot,
  );

  useEffect(() => {
    if (pathname === '/auth' || isAuthorized !== false) {
      return;
    }

    clearAuthSession();
    router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
  }, [isAuthorized, pathname, router]);

  if (pathname === '/auth' || isAuthorized === true) {
    return children;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
      <p role="status" aria-live="polite" className="text-sm">
        Checking your session...
      </p>
    </main>
  );
}

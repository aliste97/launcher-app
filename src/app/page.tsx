
"use client"; // Make this a client component to use hooks

import type { Metadata } from 'next';
import { firebaseApps } from '@/data/apps';
import AppCard from '@/components/AppCard';
import { Sparkles, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth hook
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import { useEffect } from 'react'; // Import useEffect
import { Button } from '@/components/ui/button'; // Import Button for logout
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton for loading state

// Note: Metadata export is still valid in client components for App Router
// export const metadata: Metadata = { 
//   title: 'Firebase Zephyr - App Launcher',
//   description: 'Your personal launchpad for Firebase applications. Access all your tools in one place.',
// };
// However, dynamic metadata based on auth state would need a different approach or be set in layout.tsx
// For now, we keep the static metadata or remove it if it causes issues in client component.
// Let's keep it simple and assume static metadata from layout.tsx is sufficient.

export default function HomePage() {
  const { user, loading, signOutUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <div className="space-y-8 w-full max-w-4xl">
          <Skeleton className="h-20 w-1/2 mx-auto" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mt-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // This state should ideally be brief due to the redirect effect.
    // Or, show a more explicit "Redirecting to login..." message.
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <p className="text-xl text-muted-foreground">Please log in to continue.</p>
        <Button onClick={() => router.push('/login')} className="mt-4">
          <LogIn className="mr-2 h-4 w-4" /> Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="py-10 sm:py-16 text-center border-b border-border/80 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Firebase Zephyr
            </h1>
          </div>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Welcome, {user.displayName || user.email}! Launch your Firebase applications.
          </p>
          <Button onClick={signOutUser} variant="outline" className="mt-6">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {firebaseApps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {firebaseApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground mt-20">
            <Sparkles className="h-16 w-16 mb-6 text-primary/70" />
            <p className="text-2xl font-semibold mb-2">No Applications Found</p>
            <p className="text-md max-w-md">
              It looks like there are no applications configured yet. Please add your Firebase apps to the 
              <code className="mx-1 px-1.5 py-0.5 rounded bg-muted text-sm font-mono">src/data/apps.ts</code> file.
            </p>
          </div>
        )}
      </main>

      <footer className="text-center py-8 border-t border-border/80 mt-12">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Firebase Zephyr. Crafted with ❤️.
        </p>
      </footer>
    </div>
  );
}

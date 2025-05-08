
"use client";

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChromeIcon } from 'lucide-react'; // Using ChromeIcon as a generic browser/Google icon
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (user) {
     // Already logged in, effect will redirect
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Welcome Back!</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to access your Firebase Zephyr dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={signInWithGoogle}
            className="w-full text-base py-6"
            variant="outline"
            disabled={loading}
          >
            <ChromeIcon className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
          {loading && <p className="text-center text-sm text-muted-foreground">Connecting...</p>}
        </CardContent>
      </Card>
    </div>
  );
}

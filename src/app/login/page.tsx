
"use client";

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChromeIcon } from 'lucide-react'; // Using ChromeIcon as a generic browser/Google icon
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const { signInWithGoogle, handleAuthentication, user, email, password, setEmail, setPassword, isLoginMode, setIsLoginMode, signInError, loading } = useAuth();
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
            Sign in to access your Wise Launcher dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {signInError && <p className="text-red-500 text-sm">{signInError}</p>}
            <Button className="w-full" onClick={handleAuthentication}>
              {isLoginMode ? 'Sign In' : 'Sign Up'}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsLoginMode(!isLoginMode)}>
              Switch to {isLoginMode ? 'Sign Up' : 'Sign In'}
            </Button>
            <Button
              variant="outline"
                          className="w-full"
            onClick={signInWithGoogle}>
                          Sign in with Google
            </Button>
          </div>
        </CardContent>
        {/* <CardContent className="space-y-6">
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
        </CardContent> */}
      </Card>
    </div>
  );
}

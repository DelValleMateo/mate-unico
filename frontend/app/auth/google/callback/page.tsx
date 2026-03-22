'use client';
import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const effectRan = useRef(false);

  useEffect(() => {
    // Prevent double execution in React 18 Strict Mode
    if (effectRan.current) return;
    
    const accessToken = searchParams.get('access_token');
    if (accessToken) {
      effectRan.current = true;
      fetch(`http://localhost:1337/api/auth/google/callback?access_token=${accessToken}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.jwt && data.user) {
            login(data.user, data.jwt);
            router.push('/');
          } else {
            console.error('Error in Google logic:', data);
            router.push('/login?error=true');
          }
        })
        .catch((error) => {
          console.error('Failed to exchange Google token:', error);
          router.push('/login?error=true');
        });
    } else {
      // Allow minor delay to ensure query params parsed
      setTimeout(() => {
        if (!searchParams.get('access_token')){
           router.push('/login');
        }
      }, 500);
    }
  }, [searchParams, router, login]);

  return (
    <div className="flex justify-center items-center h-64 text-gray-500 text-lg">
      Autenticando con Google...
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64 text-gray-500">Cargando...</div>}>
      <GoogleCallback />
    </Suspense>
  );
}

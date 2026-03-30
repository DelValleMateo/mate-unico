// frontend/app/(auth)/login/page.tsx

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);

      const response = await fetch(
        'http://localhost:1337/api/auth/local',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            identifier: email, // ⚠️ Strapi usa identifier
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Error al iniciar sesión');
      }

      // 🔐 Guardamos JWT y usuario a nivel global en React
      login(data.user, data.jwt);

      // 🧪 Logs para verificar
      console.log('JWT guardado:', data.jwt);
      console.log('Usuario guardado:', data.user);
      console.log('LocalStorage ahora:', localStorage.getItem('jwt'));

      // 🚀 Redirigir al home
      router.push('/');

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-gray-900">
      <h1 className="text-2xl font-bold mb-1">
        Bienvenido
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        Iniciar con email
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:border-black focus:ring-black"
            placeholder="Email"
          />
        </div>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-gray-900 focus:border-black focus:ring-black"
            placeholder="Contraseña"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-black text-white py-3 mt-6 rounded-md font-semibold hover:bg-gray-800 transition duration-200 disabled:opacity-50"
        >
          <LogIn className="h-5 w-5" />
          <span>{loading ? 'Ingresando...' : 'Iniciar Sesión'}</span>
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          window.location.href = 'http://localhost:1337/api/connect/google';
        }}
        className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-800 py-3 mt-3 rounded-md font-semibold hover:bg-gray-50 transition duration-200"
      >
        <span className="text-lg font-google-sans">G</span>
        <span>Continuar con Google</span>
      </button>

      <div className="mt-4 flex justify-between items-center text-xs">
        <div className="flex items-center space-x-1">
          <input
            type="checkbox"
            id="remember-me"
            className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
          />
          <label htmlFor="remember-me" className="text-gray-600">
            Recuérdame
          </label>
        </div>

        <Link
          href="/recuperar"
          className="text-gray-600 hover:text-black hover:underline"
        >
          Forgot Password?
        </Link>
      </div>

      <div className="mt-4 text-center text-xs text-gray-600">
        Or{' '}
        <Link
          href="/registro"
          className="text-black font-semibold hover:underline"
        >
          create an account
        </Link>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

function NuevaContrasenaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setCode(codeParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!code) {
      setError('El código de recuperación no es válido. Revisá el link del email.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        'http://localhost:1337/api/auth/reset-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            password,
            passwordConfirmation: confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Error al restablecer la contraseña');
      }

      setExito(true);
      setTimeout(() => router.push('/login'), 3000);
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

  if (!code) {
    return (
      <div className="text-gray-900 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-14 w-14 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Link inválido</h1>
        <p className="text-sm text-gray-600 mb-6">
          El link de recuperación no es válido o expiró.
        </p>
        <Link
          href="/recuperar"
          className="inline-block bg-black text-white py-2 px-6 rounded-md font-semibold hover:bg-gray-800 transition duration-200"
        >
          Pedir un nuevo link
        </Link>
      </div>
    );
  }

  if (exito) {
    return (
      <div className="text-gray-900 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-14 w-14 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">¡Contraseña actualizada!</h1>
        <p className="text-sm text-gray-600 mb-2">
          Tu contraseña fue restablecida correctamente.
        </p>
        <p className="text-xs text-gray-500 mb-6">
          Serás redirigido al login en unos segundos...
        </p>
        <Link
          href="/login"
          className="inline-block bg-black text-white py-2 px-6 rounded-md font-semibold hover:bg-gray-800 transition duration-200"
        >
          Ir al login
        </Link>
      </div>
    );
  }

  return (
    <div className="text-gray-900">
      <div className="flex justify-center mb-5">
        <div className="p-3 bg-black rounded-full">
          <KeyRound className="h-6 w-6 text-white" />
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-1 text-center">Nueva contraseña</h1>
      <p className="text-sm text-gray-600 mb-6 text-center">
        Ingresá tu nueva contraseña para restablecer el acceso.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-gray-900 focus:border-black focus:ring-black focus:outline-none focus:ring-1"
            placeholder="Nueva contraseña"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-gray-900 focus:border-black focus:ring-black focus:outline-none focus:ring-1"
            placeholder="Repetir contraseña"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Indicador de fortaleza */}
        {password && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    password.length >= i * 4
                      ? i === 1
                        ? 'bg-red-400'
                        : i === 2
                        ? 'bg-yellow-400'
                        : 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {password.length < 4
                ? 'Muy corta'
                : password.length < 8
                ? 'Débil'
                : 'Fuerte'}
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-black text-white py-3 mt-2 rounded-md font-semibold hover:bg-gray-800 transition duration-200 disabled:opacity-50"
        >
          <span>{loading ? 'Guardando...' : 'Restablecer contraseña'}</span>
        </button>
      </form>
    </div>
  );
}

export default function NuevaContrasenaPage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-500 py-8">Cargando...</div>}>
      <NuevaContrasenaForm />
    </Suspense>
  );
}

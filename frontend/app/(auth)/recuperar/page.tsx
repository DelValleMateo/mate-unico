'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);

      const response = await fetch(
        'http://localhost:1337/api/auth/forgot-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Error al enviar el email');
      }

      setEnviado(true);
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

  if (enviado) {
    return (
      <div className="text-gray-900 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-14 w-14 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">¡Email enviado!</h1>
        <p className="text-sm text-gray-600 mb-6">
          Revisá tu bandeja de entrada en{' '}
          <span className="font-semibold text-black">{email}</span>. Te enviamos
          un link para restablecer tu contraseña.
        </p>
        <p className="text-xs text-gray-500 mb-6">
          Si no lo ves, revisá la carpeta de spam.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-black hover:underline transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio de sesión</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="text-gray-900">
      <Link
        href="/login"
        className="inline-flex items-center space-x-1 text-xs text-gray-500 hover:text-black transition-colors mb-6"
      >
        <ArrowLeft className="h-3 w-3" />
        <span>Volver al login</span>
      </Link>

      <h1 className="text-2xl font-bold mb-1">Recuperar contraseña</h1>
      <p className="text-sm text-gray-600 mb-6">
        Ingresá tu email y te enviaremos un link para restablecer tu contraseña.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:border-black focus:ring-black focus:outline-none focus:ring-1"
            placeholder="tu@email.com"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-black text-white py-3 mt-2 rounded-md font-semibold hover:bg-gray-800 transition duration-200 disabled:opacity-50"
        >
          <span>{loading ? 'Enviando...' : 'Enviar link de recuperación'}</span>
        </button>
      </form>
    </div>
  );
}

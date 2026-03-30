"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginDropdownProps {
  onClose: () => void;
}

export default function LoginDropdown({ onClose }: LoginDropdownProps) {
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

      const response = await fetch('http://localhost:1337/api/auth/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Error al iniciar sesión');
      }

      login(data.user, data.jwt);
      onClose(); // Cerrar el dropdown
      
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
    <div 
        className="absolute right-0 mt-3 w-[340px] bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 z-50 animate-in fade-in slide-in-from-top-2 text-gray-900 cursor-default"
        onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-2xl font-bold mb-1">Bienvenido</h2>
      <p className="text-[13px] text-[#8e8e93] font-medium mb-5">Iniciar con email</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            id="dropdown-email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-300 bg-[#e5e5ea] rounded-xl text-[14px] text-black focus:border-black focus:ring-black focus:bg-white transition-colors placeholder:text-gray-500"
            placeholder="Email"
          />
        </div>

        <div className="relative">
          <input
            id="dropdown-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 bg-[#e5e5ea] rounded-xl text-[14px] text-black focus:border-black focus:ring-black focus:bg-white transition-colors placeholder:text-gray-500"
            placeholder="Contraseña"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center bg-black text-white py-3 mt-1 rounded-xl font-bold text-sm hover:bg-gray-800 transition duration-200 disabled:opacity-50"
        >
          {loading ? <span>Ingresando...</span> : <span>Iniciar Sesion</span>}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          window.location.href = 'http://localhost:1337/api/connect/google';
        }}
        className="w-full flex items-center justify-center space-x-2 border border-gray-300 bg-[#e5e5ea] text-black py-3 mt-3 rounded-xl font-bold text-sm hover:bg-gray-300 transition duration-200"
      >
        <span className="text-lg font-bold">G</span>
        <span>Continuar con Google</span>
      </button>

      <div className="mt-5 flex justify-between items-center text-[12px]">
        <label className="flex items-center space-x-2 cursor-pointer text-[#8e8e93] font-medium transition">
          <input type="checkbox" className="w-3.5 h-3.5 text-black border-gray-300 rounded focus:ring-black" />
          <span>Recuérdame</span>
        </label>
        <Link href="/recuperar" onClick={onClose} className="text-[#8e8e93] font-bold hover:text-black transition">
          Forgot Password?
        </Link>
      </div>

      <div className="mt-4 text-center text-[13px] text-[#8e8e93] font-medium">
        Or create an{' '}
        <Link href="/registro" onClick={onClose} className="text-[#8e8e93] font-bold hover:text-black transition">
          account
        </Link>
      </div>
    </div>
  );
}

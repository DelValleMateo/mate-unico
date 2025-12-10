// frontend/app/(auth)/login/page.tsx - ¡CON PLACEHOLDERS!

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LogIn } from 'lucide-react'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('UI: Login con:', { email, password });
  };
  
  return (
    // Texto principal en Negro para contrastar con el fondo Blanco del layout
    <div className="text-gray-900"> 
      
      {/* Título "BIENVENIDO" */}
      <h1 className="text-2xl font-bold mb-1">
        Bienvenido
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        Iniciar con email
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Campo Email - MODIFICADO */}
        <div>
          {/* Eliminamos <label> y usamos placeholder */}
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:border-black focus:ring-black"
            placeholder="Email" // PLACEHOLDER
          />
        </div>

        {/* Campo Contraseña - MODIFICADO */}
        <div>
          {/* Eliminamos <label> y usamos placeholder */}
          <input
            id="password"
            name="password"
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:border-black focus:ring-black"
            placeholder="Contraseña" // PLACEHOLDER
          />
        </div>

        {/* Botón Principal: INICIAR SESIÓN (Negro) */}
        <button
          type="submit"
          className="w-full flex items-center justify-center space-x-2 bg-black text-white py-3 mt-6 rounded-md font-semibold hover:bg-gray-800 transition duration-200"
        >
          <span>Iniciar Sesión</span>
        </button>
      </form>

      {/* Botón de Google */}
      <button
        type="button"
        className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-800 py-3 mt-3 rounded-md font-semibold hover:bg-gray-50 transition duration-200"
      >
        <span className="text-lg font-google-sans">G</span> 
        <span>Continuar con Google</span>
      </button>

      {/* Opciones Adicionales */}
      <div className="mt-4 flex justify-between items-center text-xs">
        {/* Checkbox Recuérdame */}
        <div className="flex items-center space-x-1">
          <input type="checkbox" id="remember-me" className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black" />
          <label htmlFor="remember-me" className="text-gray-600">Recuérdame</label>
        </div>

        {/* Enlace Forgot Password */}
        <Link 
          href="/recuperar" 
          className="text-gray-600 hover:text-black hover:underline"
        >
          Forgot Password?
        </Link>
      </div>
      
      {/* Opción de Crear Cuenta / O create an account */}
      <div className="mt-4 text-center text-xs text-gray-600">
        Or <Link 
          href="/registro" 
          className="text-black font-semibold hover:underline"
        >
          create an account
        </Link>
      </div>
    </div>
  );
}
// frontend/app/(auth)/registro/page.tsx - ¡CON PLACEHOLDERS!

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Send } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '', 
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('UI: Registro con:', formData);
  };

  return (
    <div className="text-gray-900"> 
      
      {/* Título */}
      <h1 className="text-2xl font-bold mb-1">
        Bienvenido
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        Registrarse
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Campo Nombre */}
        <div>
          {/* Eliminamos <label> y usamos placeholder */}
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            value={formData.nombre}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:border-black focus:ring-black"
            placeholder="Nombre" // PLACEHOLDER
          />
        </div>
        
        {/* Campo Apellido */}
        <div>
          {/* Eliminamos <label> y usamos placeholder */}
          <input
            id="apellido"
            name="apellido"
            type="text"
            required
            value={formData.apellido}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:border-black focus:ring-black"
            placeholder="Apellido" // PLACEHOLDER
          />
        </div>

        {/* Campo Email */}
        <div>
          {/* Eliminamos <label> y usamos placeholder */}
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:border-black focus:ring-black"
            placeholder="Email" // PLACEHOLDER
          />
        </div>

        {/* Campo Contraseña */}
        <div>
          {/* Eliminamos <label> y usamos placeholder */}
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:border-black focus:ring-black"
            placeholder="Contraseña" // PLACEHOLDER
          />
        </div>
        
        {/* Campo Repita Contraseña */}
        <div>
          {/* Eliminamos <label> y usamos placeholder */}
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:border-black focus:ring-black"
            placeholder="Repita Contraseña" // PLACEHOLDER
          />
        </div>

        {/* Botón Principal: Registrarse (Negro) */}
        <button
          type="submit"
          className="w-full flex items-center justify-center space-x-2 bg-black text-white py-3 mt-6 rounded-md font-semibold hover:bg-gray-800 transition duration-200"
        >
          <Send className="h-5 w-5" />
          <span>Registrarse</span>
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
      
      {/* Opción de Ya tienes cuenta? Iniciar Sesión */}
      <div className="mt-4 text-center text-xs text-gray-600">
        Ya tienes una cuenta? 
        <Link 
          href="/login" 
          className="text-black font-semibold hover:underline"
        >
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}
'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Send } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        'http://localhost:1337/api/auth/local/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.email,
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Error al registrarse');
      }

      await fetch(
        `http://localhost:1337/api/users/${data.user.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.jwt}`,
          },
          body: JSON.stringify({
            nombre: formData.nombre,
            apellido: formData.apellido,
            dni: formData.dni,
            telefono: formData.telefono,
          }),
        }
      );

      alert('Registro completo 🎉');

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
      <h1 className="text-2xl font-bold mb-1">Bienvenido</h1>
      <p className="text-sm text-gray-600 mb-6">Registrarse</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
        <input name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
        <input name="dni" placeholder="DNI" value={formData.dni} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
        <input name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
        <input name="password" type="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
        <input name="confirmPassword" type="password" placeholder="Repetir contraseña" value={formData.confirmPassword} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-black text-white py-3 mt-6 rounded-md font-semibold hover:bg-gray-800 transition duration-200 disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
          <span>{loading ? 'Registrando...' : 'Registrarse'}</span>
        </button>
      </form>

      <div className="mt-4 text-center text-xs text-gray-600">
        Ya tienes una cuenta?
        <Link href="/login" className="text-black font-semibold hover:underline ml-1">
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}

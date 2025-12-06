// frontend/app/(auth)/layout.tsx - MODIFICADO

import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "MateÚnico | Acceso",
  description: "Página de inicio de sesión y registro de usuarios.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-16rem)] py-12">
      {/* Contenedor MODIFICADO: más ancho (max-w-lg) y bordes más redondos (rounded-2xl) */}
      <div className="w-full max-w-lg p-8 rounded-2xl shadow-2xl bg-white">
        {children}
      </div>
    </div>
  );
}
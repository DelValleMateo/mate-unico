"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link'; 
import { Search, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../context/CartContext'; 

export default function Header() {
    const { totalItems } = useCart(); 

    // Clases unificadas para todos los elementos del menú principal
    const navLinkClasses = "hover:text-white transition-colors uppercase text-xs";

    return (
        <header className="flex flex-col items-center pt-6 pb-4 px-8 md:px-12 w-full border-b border-white/5 gap-6">

            {/* 1. LOGO (Arriba y Centrado) */}
            <div className="flex justify-center w-full">
    <Link href="/" className="relative w-[280px] h-[90px] cursor-pointer block">
        <Image
            src="/iconomateunico.png"
            alt="Ícono MateÚnico"
            fill
            className="object-contain hover:opacity-90 transition-opacity"
            priority
        />
    </Link>
</div>

            {/* 2. BARRA DE NAVEGACIÓN (Ocupa todo el ancho) */}
            <div className="w-full flex flex-col md:flex-row justify-between items-center">

                {/* IZQUIERDA: Buscador */}
                <div className="w-full md:w-1/3 flex justify-start">
                    <div className="relative w-full max-w-[300px]">
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full bg-transparent border-b border-gray-600 rounded-none py-1 pl-2 pr-8 text-sm focus:outline-none focus:border-white transition-colors placeholder-gray-500"
                        />
                        <Search className="absolute right-0 top-1.5 text-gray-400 w-4 h-4" />
                    </div>
                </div>

                {/* CENTRO: Menú */}
                    <nav className="w-full md:w-1/3 flex justify-center gap-10 text-sm text-gray-300 font-medium tracking-widest my-4 md:my-0">
    
                        <Link href="/" className={navLinkClasses}>
                            Inicio
                        </Link>
    
                        <Link href="/catalogo" className={navLinkClasses}>
                            Productos
                        </Link>
                        <a href="#contacto" className={navLinkClasses}>
                            Contacto
                        </a>
                    </nav> 
                {/* DERECHA: Iconos (Navegación al Carrito) */}
<div className="w-full md:w-1/3 flex justify-end gap-8 text-gray-300">

    {/* ÍCONO CARRITO - Ahora es un Link a la página de carrito */}
    <Link 
        href="/carrito" 
        className="relative cursor-pointer hover:text-white transition-colors group"
    >
        <ShoppingCart className="w-5 h-5" />
        
        {/* Círculo Rojo (Badge) */}
        {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-[#0f0f0f]">
                {totalItems}
            </span>
        )}
    </Link>

    {/* ÍCONO USUARIO (Login/Perfil) */}
    <Link href="/login" className="hover:text-white transition-colors">
        <User className="w-5 h-5 cursor-pointer" />
    </Link>
</div>

            </div>
        </header>
    );
}
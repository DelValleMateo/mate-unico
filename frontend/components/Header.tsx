"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link'; 
import { Search, ShoppingCart, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext'; 
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
    const { totalItems } = useCart(); 
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Cierra el menú de usuario si se cliquea afuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        router.push('/');
    };

    // Validación de rol administrador estática para el layout
    const isAdmin = user?.email === 'mateunico359@gmail.com';

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

                {/* IZQUIERDA: Espacio vacío para balancear el flex center del nav */}
                <div className="hidden md:flex w-full md:w-1/3 justify-start">
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

                {/* DERECHA: Iconos (Navegación al Carrito y Perfil) */}
                <div className="w-full md:w-1/3 flex justify-end gap-8 text-gray-300">

                    {/* ÍCONO CARRITO */}
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

                    {/* ÍCONO USUARIO (Inteligente con useAuth) */}
                    {user ? (
                        <div className="relative" ref={menuRef}>
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                                className="flex items-center gap-2 hover:text-white transition-colors bg-[#111] px-3 py-1 rounded-full border border-gray-800 shadow-lg"
                            >
                                <span className="text-[10px] uppercase tracking-widest font-bold">{user.username}</span>
                                <ChevronDown className="w-3 h-3 text-gray-400" />
                            </button>
                            
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-3 w-48 bg-[#0a0a0a] border border-gray-800 rounded-lg shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                    {isAdmin && (
                                        <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest text-amber-500 hover:bg-gray-900 transition-colors border-b border-gray-800 font-bold">
                                            <LayoutDashboard className="w-4 h-4" />
                                            Dashboard
                                        </Link>
                                    )}
                                    <Link href="/perfil" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:text-white hover:bg-gray-900 transition-colors border-b border-gray-800">
                                        <User className="w-4 h-4" />
                                        Mi Perfil
                                    </Link>
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 hover:bg-gray-900 transition-colors text-left">
                                        <LogOut className="w-4 h-4" />
                                        Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="hover:text-white transition-colors">
                            <User className="w-5 h-5 cursor-pointer" />
                        </Link>
                    )}

                </div>
            </div>
        </header>
    );
}
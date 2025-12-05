"use client";

import React from 'react';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="mt-20 py-12 px-8 border-t border-white/10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="flex flex-col items-start w-full md:w-auto">
                    <div className="mb-6 relative w-[200px] h-[60px]">
                        <Image
                            src="/iconomateunico.png"
                            alt="Ícono MateÚnico"
                            fill
                            className="object-contain object-left opacity-90"
                        />
                    </div>
                    <div className="flex flex-col gap-3 text-gray-300 font-medium text-sm">
                        <a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a>
                        <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
                    </div>
                </div>
                <div className="text-left md:text-right w-full md:w-auto mt-4 md:mt-0">
                    <p className="text-xl font-medium text-white mb-6">Teléfono: 3442-000000</p>
                    <p className="text-gray-500 text-sm">© 2025 MateÚnico – Hecho en Argentina</p>
                </div>
            </div>
        </footer>
    );
}
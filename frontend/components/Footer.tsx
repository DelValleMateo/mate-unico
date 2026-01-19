"use client";

import React from 'react';
import Image from 'next/image';

export default function Footer() {
    return (
        /* Agregamos id="contacto" y scroll-mt-20 para que al bajar no quede pegado al techo */
        <footer id="contacto" className="mt-20 py-12 px-8 border-t border-white/10 scroll-mt-20">
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
                        {/* Ejemplo de link a Instagram que podrías sumar luego */}
                        <a href="https://instagram.com" target="_blank" className="hover:text-white transition-colors">Instagram</a>
                    </div>
                </div>

                <div className="text-left md:text-right w-full md:w-auto mt-4 md:mt-0">
                    {/* Link de WhatsApp real usando el teléfono */}
                    <a 
                        href="https://wa.me/543442000000" 
                        target="_blank" 
                        className="text-xl font-medium text-white mb-6 block hover:text-green-400 transition-colors"
                    >
                        Teléfono: 3442-000000
                    </a>
                    <p className="text-gray-500 text-sm">© 2025 MateÚnico – Hecho en Argentina</p>
                </div>
            </div>
        </footer>
    );
}
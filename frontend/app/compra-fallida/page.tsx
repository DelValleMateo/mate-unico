"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { XCircle, ArrowLeft, ShoppingBag } from "lucide-react";

export default function CompraFallida() {

    // =========================================================================
    // 🚨 SEGURIDAD: REDIRECCIÓN AUTOMÁTICA A LOCALHOST
    // =========================================================================
    // Igual que en compra-exitosa: si caemos en Ngrok, saltamos a Localhost
    // para evitar problemas de CORS o visualización.
    useEffect(() => {
        if (typeof window !== "undefined") {
            if (window.location.hostname.includes("ngrok")) {
                console.log("🔄 Detectado Ngrok en Fallo, volviendo a Localhost...");
                const currentParams = window.location.search;
                const targetUrl = `http://localhost:3000/compra-fallida${currentParams}`;
                window.location.href = targetUrl;
            }
        }
    }, []);

    return (
        <div className="w-full min-h-[60vh] flex items-center justify-center py-12 px-4">

            {/* TARJETA DE ERROR */}
            <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl overflow-hidden text-center p-8 border border-gray-200 animate-fade-in-up">

                {/* ÍCONO ROJO GRANDE */}
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-50 mb-6 border border-red-100">
                    <XCircle className="h-12 w-12 text-red-500" />
                </div>

                {/* TÍTULO Y MENSAJE */}
                <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Ups! Algo salió mal</h2>

                <div className="space-y-2 mb-8">
                    <p className="text-gray-500">
                        El proceso de pago no se completó o fue cancelado.
                    </p>
                    <p className="text-sm text-gray-400">
                        No te preocupes, <strong>no se ha realizado ningún cargo</strong> en tu cuenta.
                        Tu carrito sigue guardado para que puedas intentarlo de nuevo.
                    </p>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex flex-col gap-3 justify-center">

                    {/* Botón Principal: Volver al Inicio (donde podrán abrir el carrito) */}
                    <Link href="/">
                        <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-all font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                            <ArrowLeft size={18} />
                            Volver a la Tienda e Intentar de Nuevo
                        </button>
                    </Link>

                    {/* Botón Secundario: Ayuda */}
                    <Link href="/contacto">
                        <button className="w-full px-6 py-3 text-gray-500 hover:text-black transition-colors text-sm underline">
                            ¿Tuviste un problema técnico? Contáctanos
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
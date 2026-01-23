"use client";

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function MercadoPagoButton() {
    const { cart } = useCart();
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        try {
            setLoading(true);

            // ============================================================
            // 💾 GUARDA EL CARRITO EN MEMORIA (Para la foto del recibo)
            // ============================================================
            // Esto permite que al volver de Mercado Pago, sepamos qué producto mostrar
            localStorage.setItem("ultimaCompra", JSON.stringify(cart));
            // ============================================================

            // 1. Enviamos el carrito a nuestra API para validar stock y generar preferencia
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ items: cart }),
            });

            const data = await response.json();

            // 2. MANEJO DE ERRORES (Ej: Falta de Stock)
            if (!response.ok) {
                alert(data.error || "Hubo un problema al procesar el pedido.");
                setLoading(false);
                return; // Cortamos la ejecución aquí
            }

            // 3. ÉXITO: Redirección a Mercado Pago
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Error: No se recibió el link de pago.");
                setLoading(false);
            }

        } catch (error) {
            console.error("Error en el checkout:", error);
            alert("Ocurrió un error de conexión. Intenta nuevamente.");
            setLoading(false);
        }
    };

    // Renderizado condicional: Si el carrito está vacío
    if (cart.length === 0) {
        return (
            <button
                disabled
                className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-md opacity-50 cursor-not-allowed"
            >
                Carrito Vacío
            </button>
        );
    }

    // Renderizado normal
    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full font-bold py-3 px-6 rounded-md transition-all duration-200 flex justify-center items-center gap-2 text-white
        ${loading
                    ? 'bg-gray-500 cursor-wait'
                    : 'bg-[#009EE3] hover:bg-[#0081B9] shadow-md hover:shadow-lg'
                }`}
        >
            {loading ? (
                <span>Procesando...</span>
            ) : (
                <>
                    Pagar con Mercado Pago
                </>
            )}
        </button>
    );
}
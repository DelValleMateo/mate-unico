"use client";

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext'; // Importamos tu carrito

export default function MercadoPagoButton() {
    const { cart } = useCart(); // Leemos los productos que el usuario tiene
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        try {
            setLoading(true);

            // 1. Llamamos a nuestra API Route
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // Le mandamos el carrito completo
                body: JSON.stringify({ items: cart }),
            });

            const data = await response.json();

            // 2. Si todo sale bien, Mercado Pago nos da una URL
            if (data.url) {
                // Redirigimos al usuario a Mercado Pago
                window.location.href = data.url;
            } else {
                alert("Error al generar el link de pago");
            }

        } catch (error) {
            console.error(error);
            alert("Ocurrió un error inesperado");
        } finally {
            setLoading(false);
        }
    };

    // Si el carrito está vacío, deshabilitamos el botón
    if (cart.length === 0) {
        return (
            <button disabled className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-md opacity-50 cursor-not-allowed">
                Carrito Vacío
            </button>
        );
    }

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-[#009EE3] hover:bg-[#0081B9] text-white font-bold py-3 px-6 rounded-md transition-colors flex justify-center items-center gap-2"
        >
            {loading ? "Procesando..." : "Pagar con Mercado Pago"}
            {/* Icono simple de MP opcional */}
        </button>
    );
}
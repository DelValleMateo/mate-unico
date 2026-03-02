"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';

export default function CarritoPage() {
    const {
        cart,
        removeFromCart,
        updateQuantity,
        subtotal,
        shippingCost,
        total,
        hasFreeShipping,
        amountToFreeShipping
    } = useCart();

    const [isLoading, setIsLoading] = useState(false);
    const UMBRAL_ENVIO_GRATIS = 50000;
    const porcentajeProgreso = Math.min(100, (subtotal / UMBRAL_ENVIO_GRATIS) * 100);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cart })
            });
            const data = await res.json();

            if (data.url) {
                // 👇 ESTA ES LA MAGIA QUE FALTABA 👇
                // Guardamos el carrito actual para que la página de éxito sepa exactamente qué compraste
                localStorage.setItem("ultimaCompra", JSON.stringify(cart));

                // Redirigimos a Mercado Pago
                window.location.href = data.url;
            } else {
                alert("Hubo un error al procesar el pago: " + (data.error || "Desconocido"));
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error en checkout:", error);
            alert("Error de conexión al servidor.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen text-white p-4 md:p-12 flex justify-center items-start pt-32 bg-transparent">
            <div className="w-full max-w-7xl bg-black/30 backdrop-blur-xl border border-white/5 p-8 md:p-12 rounded-sm relative overflow-hidden">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* COLUMNA IZQUIERDA: Productos */}
                    <div className="lg:col-span-8">
                        <h1 className="text-4xl font-light mb-2 tracking-tight text-gray-100">Tu carrito</h1>
                        <p className="text-gray-500 text-sm mb-12 font-light">¿No estás listo para pagar? seguí explorando</p>

                        <div className="space-y-10">
                            {cart.length === 0 ? (
                                <div className="py-20 text-center">
                                    <Link href="/catalogo" className="text-sm border-b border-white/20 pb-1 hover:border-white transition-all uppercase tracking-widest text-gray-400">
                                        Seguir comprando
                                    </Link>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.cartItemId} className="flex gap-8 pb-10 border-b border-white/5 relative items-center">
                                        <div className="relative w-36 h-36 bg-[#1a1a1a] rounded-lg p-4">
                                            <Image
                                                src={item.img || '/placeholder.png'}
                                                alt={item.name || 'Producto'}
                                                fill
                                                className="object-contain p-2"
                                                unoptimized
                                            />
                                        </div>

                                        <div className="flex-1 flex flex-col h-36 justify-between py-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-2xl font-medium tracking-tight">{item.name}</h3>
                                                    {item.color && <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mt-2 font-semibold">Color: {item.color}</p>}
                                                    {item.grabado && <p className="text-amber-500 text-[10px] uppercase tracking-[0.2em] mt-1 font-bold">Grabado: "{item.grabado}"</p>}

                                                    <div className="flex items-center gap-4 mt-3 bg-[#1a1a1a] w-fit rounded-sm border border-white/5 px-2 py-1">
                                                        <button
                                                            onClick={() => updateQuantity(item.cartItemId!, 'decrease')}
                                                            className="text-gray-500 hover:text-white px-2 transition-colors text-lg"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.cartItemId!, 'increase')}
                                                            className="text-gray-500 hover:text-white px-2 transition-colors text-lg"
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    <p className="text-2xl font-bold mt-4 text-gray-100">${(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-gray-500 text-[10px] uppercase mb-16">by MateUnico</p>
                                                    <button
                                                        onClick={() => removeFromCart(item.cartItemId!)}
                                                        className="text-gray-400 hover:text-white text-[10px] uppercase tracking-widest border-b border-gray-600 pb-0.5"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Barra de Envío Progresiva */}
                        {cart.length > 0 && (
                            <div className="mt-16 max-w-3xl">
                                <h3 className="text-xs uppercase tracking-[0.3em] font-semibold mb-5">Envío</h3>
                                <div className="w-full bg-white/5 h-[3px] rounded-full overflow-hidden mb-4">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-in-out ${hasFreeShipping ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]'}`}
                                        style={{ width: `${porcentajeProgreso}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-gray-400 text-xs tracking-wide">
                                        {!hasFreeShipping
                                            ? `Agregá $${amountToFreeShipping.toLocaleString()} para tener envío gratis`
                                            : "¡Felicidades! Tenés envío gratis 🚚✨"}
                                    </p>
                                    <p className={`font-bold text-[10px] uppercase tracking-[0.2em] ${hasFreeShipping ? 'text-green-500' : 'text-white'}`}>
                                        Envío Gratis
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* COLUMNA DERECHA: Resumen Dinámico */}
                    {cart.length > 0 && (
                        <div className="lg:col-span-4 self-start mt-4">
                            <h2 className="text-xl font-light mb-12 tracking-wide uppercase">Resumen de Compra</h2>

                            <div className="space-y-6 text-xs tracking-widest uppercase">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="text-sm font-medium tracking-tighter">${subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-500">Envío</span>
                                    {hasFreeShipping ? (
                                        <span className="text-sm font-bold text-green-500 tracking-tighter">¡GRATIS!</span>
                                    ) : (
                                        <span className="text-sm font-medium tracking-tighter">${shippingCost.toLocaleString()}</span>
                                    )}
                                </div>

                                <div className="pt-10 border-t border-white/5 flex justify-between items-end">
                                    <span className="text-[10px] text-gray-100 font-bold tracking-[0.3em]">Total</span>
                                    <span className="text-2xl font-bold tracking-tighter">${total.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={isLoading}
                                className={`w-full py-5 mt-12 font-bold uppercase tracking-[0.25em] text-[10px] transition-all hover:tracking-[0.3em] ${isLoading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-100'
                                    }`}
                            >
                                {isLoading ? 'Procesando...' : 'Pagar con mercado pago'}
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
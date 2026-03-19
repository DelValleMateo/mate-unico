"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface CartItem {
    id: number;
    documentId?: string;
    name: string;
    price: number;
    img: string;
    quantity: number;
    color: string;
}

export default function CarritoPage() {
    const { cart = [], removeFromCart } = useCart();
    const totalPrice = cart.reduce((acc: number, item: CartItem) => acc + (item.price * item.quantity), 0);
    const { user } = useAuth();
    const [loading, setLoading] = React.useState(false);

    // Estados para el cupón
    const [cuponInput, setCuponInput] = React.useState("");
    const [descuentoPorcentaje, setDescuentoPorcentaje] = React.useState(0);
    const [mensajeCupon, setMensajeCupon] = React.useState("");
    const [aplicandoCupon, setAplicandoCupon] = React.useState(false);
    const [mostrarInputCupon, setMostrarInputCupon] = React.useState(false);

    const safeCartItems = Array.isArray(cart) ? cart : [];

    const aplicarCupon = async () => {
        if (!cuponInput.trim()) return;
        setAplicandoCupon(true);
        setMensajeCupon("");
        try {
            const response = await fetch(`http://127.0.0.1:1337/api/cupons?filters[codigo][$eq]=${cuponInput.trim()}`);
            if (!response.ok) throw new Error("Error en el servidor");

            const data = await response.json();
            const cuponEncontrado = data?.data?.[0];

            if (!cuponEncontrado) {
                setMensajeCupon("Cupón inválido");
                setDescuentoPorcentaje(0);
            } else {
                // Compatible con Strapi v4 (attributes) o v5 (directo)
                const cuponDatos = cuponEncontrado.attributes || cuponEncontrado;
                if (cuponDatos.activo) {
                    setDescuentoPorcentaje(cuponDatos.descuento_porcentaje);
                    setMensajeCupon(`Descuento del ${cuponDatos.descuento_porcentaje}% aplicado`);
                } else {
                    setMensajeCupon("El cupón ya no es válido");
                    setDescuentoPorcentaje(0);
                }
            }
        } catch (error) {
            setMensajeCupon("Error al validar cupón");
            setDescuentoPorcentaje(0);
        } finally {
            setAplicandoCupon(false);
        }
    };

    const handleCheckout = async () => {
        try {
            setLoading(true);

            localStorage.setItem("ultimaCompra", JSON.stringify(safeCartItems));

            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    items: safeCartItems,
                    userId: user?.id,
                    descuentoPorcentaje // Enviamos el descuento al backend para que modifique el precio de MP
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Hubo un problema al procesar el pedido.");
                setLoading(false);
                return;
            }

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

    const envioGratisMeta = 50000;
    const currentTotal = totalPrice || 0;
    const montoDescuento = (currentTotal * descuentoPorcentaje) / 100;
    const totalFinal = currentTotal - montoDescuento;

    const faltanteEnvio = Math.max(0, envioGratisMeta - totalFinal);
    const porcentajeProgreso = Math.min(100, (totalFinal / envioGratisMeta) * 100);

    return (
        <div className="min-h-screen text-white p-4 md:p-12 flex justify-center items-start pt-32 bg-transparent">
            {/* Contenedor Principal: Borde fino y desenfoque como el mockup */}
            <div className="w-full max-w-7xl bg-black/30 backdrop-blur-xl border border-white/5 p-8 md:p-12 rounded-sm relative overflow-hidden">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* COLUMNA IZQUIERDA: Productos (Col-span 8) */}
                    <div className="lg:col-span-8">
                        <h1 className="text-4xl font-light mb-2 tracking-tight text-gray-100">Tu carrito</h1>
                        <p className="text-gray-500 text-sm mb-12 font-light">No estas listo para pagar? segui explorando</p>

                        <div className="space-y-10">
                            {safeCartItems.length === 0 ? (
                                <div className="py-20 text-center">
                                    <Link href="/catalogo" className="text-sm border-b border-white/20 pb-1 hover:border-white transition-all uppercase tracking-widest text-gray-400">
                                        Seguir comprando
                                    </Link>
                                </div>
                            ) : (
                                safeCartItems.map((item: CartItem) => (
                                    <div key={item.id} className="flex gap-8 pb-10 border-b border-white/5 relative items-center">
                                        {/* Imagen estilo Mockup */}
                                        <div className="relative w-36 h-36 bg-[#1a1a1a] rounded-lg p-4">
                                            <Image
                                                src={item.img || '/placeholder.png'}
                                                alt={item.name || 'Producto'}
                                                fill
                                                className="object-contain p-2"
                                                unoptimized
                                            />
                                        </div>

                                        {/* Info detallada */}
                                        <div className="flex-1 flex flex-col h-36 justify-between py-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-2xl font-medium tracking-tight">{item.name}</h3>
                                                    <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mt-2 font-semibold">color: {item.color}</p>
                                                    <p className="text-gray-400 text-xs mt-1 font-light italic">cantidad: {item.quantity}</p>
                                                    <p className="text-2xl font-bold mt-2 text-gray-100">${(item.price || 0).toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-gray-500 text-[10px] uppercase mb-16">by MateUnico</p>
                                                    <button
                                                        onClick={() => removeFromCart?.(item.id)}
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
                        <div className="mt-16 max-w-3xl">
                            <h3 className="text-xs uppercase tracking-[0.3em] font-semibold mb-5">Envio</h3>
                            <div className="w-full bg-white/5 h-[3px] rounded-full overflow-hidden mb-4">
                                <div
                                    className="bg-blue-600 h-full transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                                    style={{ width: `${porcentajeProgreso}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-gray-400 text-xs tracking-wide">
                                    {faltanteEnvio > 0
                                        ? `Agrega $${faltanteEnvio.toLocaleString()} para tener envio gratis`
                                        : "¡Envio gratis disponible!"}
                                </p>
                                <p className="font-bold text-[10px] uppercase tracking-[0.2em] text-white">Envio Gratis</p>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: Resumen (Col-span 4) */}
                    <div className="lg:col-span-4 self-start mt-4">
                        <h2 className="text-xl font-light mb-12 tracking-wide uppercase">Resumen de Compra</h2>

                        <div className="space-y-6 text-xs tracking-widest uppercase">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="text-sm font-medium tracking-tighter">${currentTotal.toLocaleString()}</span>
                            </div>

                            {descuentoPorcentaje > 0 && (
                                <div className="flex justify-between items-center text-green-400">
                                    <span>Descuento ({descuentoPorcentaje}%)</span>
                                    <span className="text-sm font-medium tracking-tighter">-${montoDescuento.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-start">
                                <span className="text-gray-500">Envío</span>
                                <span className="text-[9px] text-gray-600 text-right italic leading-relaxed">Se calcula segun codigo postal</span>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setMostrarInputCupon(!mostrarInputCupon)}
                                    className="text-blue-500 text-left text-[10px] hover:text-blue-400 transition-colors tracking-widest uppercase"
                                >
                                    {mostrarInputCupon ? 'Ocultar Cupones' : 'Tengo un cupón de descuento'}
                                </button>

                                {mostrarInputCupon && (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={cuponInput}
                                                onChange={(e) => setCuponInput(e.target.value.toUpperCase())}
                                                placeholder="CÓDIGO"
                                                className="bg-white/5 border border-white/10 px-3 py-3 text-white text-xs outline-none focus:border-white/30 flex-1 uppercase tracking-widest placeholder:text-gray-600 rounded-sm"
                                            />
                                            <button
                                                onClick={aplicarCupon}
                                                disabled={aplicandoCupon || !cuponInput.trim()}
                                                className="bg-white/10 text-white px-5 py-3 hover:bg-white/20 transition-colors disabled:opacity-50 text-[10px] tracking-[0.2em] font-bold rounded-sm"
                                            >
                                                {aplicandoCupon ? '...' : 'Aplicar'}
                                            </button>
                                        </div>
                                        {mensajeCupon && (
                                            <span className={`text-[10px] uppercase tracking-widest ${descuentoPorcentaje > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {mensajeCupon}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="pt-10 border-t border-white/5 flex justify-between items-end">
                                <span className="text-[10px] text-gray-100 font-bold tracking-[0.3em]">Total + envio</span>
                                <span className="text-2xl font-bold tracking-tighter">${totalFinal.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={loading || safeCartItems.length === 0}
                            className={`w-full py-5 mt-12 font-bold uppercase tracking-[0.25em] text-[10px] transition-all hover:tracking-[0.3em] ${loading || safeCartItems.length === 0
                                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                : 'bg-white text-black hover:bg-gray-100'
                                }`}
                        >
                            {loading ? 'Procesando...' : 'Pagar con mercado pago'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
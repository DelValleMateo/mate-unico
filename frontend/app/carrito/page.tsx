"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { MapPin, ChevronDown, Check } from 'lucide-react';

interface CartItem {
    id: number;
    cartItemId?: string; 
    name: string;
    price: number;
    img: string;
    quantity: number;
    color?: string;
    grabado?: string;
}

const SHIPPING_ZONES = [
    { provincia: "Entre Ríos", cp: "3260", nombre: "Local - Concepción del Uruguay", costo: 1500 },
    { provincia: "CABA", cp: "1000", nombre: "CABA", costo: 4500 },
    { provincia: "Buenos Aires", cp: "1900", nombre: "Buenos Aires", costo: 4500 },
    { provincia: "Santa Fe", cp: "3000", nombre: "Santa Fe", costo: 6500 },
    { provincia: "Misiones", cp: "3300", nombre: "Misiones", costo: 6500 },
    { provincia: "Corrientes", cp: "3400", nombre: "Corrientes", costo: 6500 },
    { provincia: "Chaco", cp: "3500", nombre: "Chaco", costo: 6500 },
    { provincia: "Formosa", cp: "3600", nombre: "Formosa", costo: 6500 },
    { provincia: "Tucumán", cp: "4000", nombre: "Tucumán", costo: 6500 },
    { provincia: "Santiago del Estero", cp: "4200", nombre: "Santiago del Estero", costo: 6500 },
    { provincia: "Salta", cp: "4400", nombre: "Salta", costo: 6500 },
    { provincia: "Jujuy", cp: "4600", nombre: "Jujuy", costo: 6500 },
    { provincia: "Catamarca", cp: "4700", nombre: "Catamarca", costo: 6500 },
    { provincia: "Córdoba", cp: "5000", nombre: "Córdoba", costo: 6500 },
    { provincia: "La Rioja", cp: "5300", nombre: "La Rioja", costo: 6500 },
    { provincia: "San Juan", cp: "5400", nombre: "San Juan", costo: 6500 },
    { provincia: "Mendoza", cp: "5500", nombre: "Mendoza", costo: 6500 },
    { provincia: "San Luis", cp: "5700", nombre: "San Luis", costo: 6500 },
    { provincia: "La Pampa", cp: "6300", nombre: "La Pampa", costo: 6500 },
    { provincia: "Neuquén", cp: "8300", nombre: "Neuquén", costo: 6500 },
    { provincia: "Río Negro", cp: "8500", nombre: "Río Negro", costo: 6500 },
    { provincia: "Chubut", cp: "9103", nombre: "Chubut", costo: 8500 },
    { provincia: "Santa Cruz", cp: "9400", nombre: "Santa Cruz", costo: 8500 },
    { provincia: "Tierra del Fuego", cp: "9410", nombre: "Tierra del Fuego", costo: 8500 }
];

export default function CarritoPage() {
    const { cart = [], removeFromCart, updateQuantity } = useCart();
    const { user, jwt } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [cuponInput, setCuponInput] = useState("");
    const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);
    const [mensajeCupon, setMensajeCupon] = useState("");
    const [aplicandoCupon, setAplicandoCupon] = useState(false);
    const [mostrarInputCupon, setMostrarInputCupon] = useState(false);
    const [selectedCP, setSelectedCP] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const safeCartItems = Array.isArray(cart) ? cart : [];

    // Lógicas de Precios
    const totalPrice = safeCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const envioGratisMeta = 50000;
    const currentTotal = totalPrice || 0;
    const montoDescuento = (currentTotal * descuentoPorcentaje) / 100;
    const totalConDescuento = currentTotal - montoDescuento;

    const faltanteEnvio = Math.max(0, envioGratisMeta - totalConDescuento);
    const porcentajeProgreso = Math.min(100, (totalConDescuento / envioGratisMeta) * 100);

    const zonaSeleccionada = SHIPPING_ZONES.find(z => z.cp === selectedCP);
    const costoEnvioBase = zonaSeleccionada ? zonaSeleccionada.costo : null;
    const costoEnvioAplicado = totalConDescuento >= envioGratisMeta ? 0 : costoEnvioBase;

    const aplicarCupon = async () => {
        if (!cuponInput.trim()) return;
        
        if (!user || !jwt) {
            setMensajeCupon("Debes iniciar sesión para usar cupones.");
            setDescuentoPorcentaje(0);
            setMostrarInputCupon(false);
            return;
        }

        setAplicandoCupon(true);
        setMensajeCupon("");
        try {
            const response = await fetch('/api/validate-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cupon: cuponInput,
                    userId: user.id,
                    authHeader: `Bearer ${jwt}`
                })
            });
            const data = await response.json();

            if (data.valid) {
                setDescuentoPorcentaje(data.porcentaje);
                setMensajeCupon(data.message);
            } else {
                setDescuentoPorcentaje(0);
                setMensajeCupon(data.message || "Cupón inválido");
            }
        } catch (error) {
            setMensajeCupon("Error al validar cupón");
            setDescuentoPorcentaje(0);
        } finally {
            setAplicandoCupon(false);
        }
    };

    const handleCheckout = async () => {
        if (!user) {
            alert("Para comprar un mate, por favor iniciá sesión o registrate primero.");
            router.push('/login');
            return;
        }

        if (safeCartItems.length === 0) return;
        
        if (!selectedCP) {
            alert("Por favor, seleccioná una provincia válida para el envío antes de continuar.");
            return;
        }

        try {
            setLoading(true);
            localStorage.setItem("ultimaCompra", JSON.stringify(safeCartItems));

            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: safeCartItems,
                    userId: user?.id,
                    jwt: jwt,
                    cupon: cuponInput,
                    cpEnvio: selectedCP
                }),
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || "Error al generar link de pago.");
                setLoading(false);
            }
        } catch (error) {
            alert("Error de conexión.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen text-white p-4 md:p-12 flex justify-center items-start pt-32 bg-transparent">
            <div className="w-full max-w-7xl bg-black/30 backdrop-blur-xl border border-white/5 p-8 md:p-12 rounded-sm relative overflow-hidden">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* COLUMNA IZQUIERDA */}
                    <div className="lg:col-span-8">
                        <h1 className="text-4xl font-light mb-2 tracking-tight text-gray-100 uppercase">Tu carrito</h1>
                        <p className="text-gray-500 text-sm mb-12 font-light italic">¿No estás listo para pagar? seguí explorando</p>

                        <div className="space-y-10">
                            {safeCartItems.length === 0 ? (
                                <div className="py-20 text-center">
                                    <Link href="/catalogo" className="text-sm border-b border-white/20 pb-1 hover:border-white transition-all uppercase tracking-widest text-gray-400">
                                        Seguir comprando
                                    </Link>
                                </div>
                            ) : (
                                safeCartItems.map((item) => (
                                    <div key={item.cartItemId || item.id} className="flex gap-8 pb-10 border-b border-white/5 relative items-center">
                                        <div className="relative w-36 h-36 bg-[#1a1a1a] rounded-lg p-4">
                                            <Image
                                                src={item.img || '/placeholder.png'}
                                                alt={item.name}
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
                                                            onClick={() => updateQuantity(item.cartItemId || item.id.toString(), 'decrease')}
                                                            className="text-gray-500 hover:text-white px-2 transition-colors text-lg"
                                                            disabled={item.quantity <= 1}
                                                        > - </button>
                                                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.cartItemId || item.id.toString(), 'increase')}
                                                            className="text-gray-500 hover:text-white px-2 transition-colors text-lg"
                                                        > + </button>
                                                    </div>

                                                    <p className="text-2xl font-bold mt-4 text-gray-100">${(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-gray-500 text-[10px] uppercase mb-16">by MateUnico</p>
                                                    <button
                                                        onClick={() => removeFromCart(item.cartItemId || item.id.toString())}
                                                        className="text-gray-400 hover:text-white text-[10px] uppercase tracking-widest border-b border-gray-600 pb-0.5"
                                                    > Eliminar </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Barra de Envío Progresiva */}
                        {safeCartItems.length > 0 && (
                            <div className="mt-16 max-w-3xl">
                                <h3 className="text-xs uppercase tracking-[0.3em] font-semibold mb-5">Progreso de Envío</h3>
                                <div className="w-full bg-white/5 h-[3px] rounded-full overflow-hidden mb-4">
                                    <div
                                        className="bg-blue-600 h-full transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                                        style={{ width: `${porcentajeProgreso}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-gray-400 text-xs tracking-wide">
                                        {faltanteEnvio > 0
                                            ? `Agregá $${faltanteEnvio.toLocaleString()} para tener envío gratis`
                                            : "¡Tenés envío gratis disponible!"}
                                    </p>
                                    <p className="font-bold text-[10px] uppercase tracking-[0.2em] text-white">ENVIO GRATIS</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* COLUMNA DERECHA: Resumen */}
                    <div className="lg:col-span-4 self-start mt-4">
                        <div className="border border-white/5 p-8 rounded-sm bg-white/[0.02]">
                            <h2 className="text-xl font-light mb-12 tracking-wide uppercase">Resumen</h2>

                            <div className="space-y-6 text-xs tracking-widest uppercase">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="text-sm font-medium tracking-tighter">${currentTotal.toLocaleString()}</span>
                                </div>

                                {descuentoPorcentaje > 0 && (
                                    <div className="flex justify-between items-center text-green-400">
                                        <span>Cupón ({descuentoPorcentaje}%)</span>
                                        <span className="text-sm font-medium tracking-tighter">-${montoDescuento.toLocaleString()}</span>
                                    </div>
                                )}

                                {/* Selector de Envío Dinámico */}
                                <div className="flex justify-between items-start flex-col gap-3">
                                    <div className="flex justify-between w-full">
                                        <span className="text-gray-500 flex items-center gap-2">Destino (Envío)</span>
                                        <span className="text-[10px] font-bold text-gray-200 text-right italic leading-relaxed">
                                            {costoEnvioAplicado === 0 
                                                ? <span className="text-green-400">BONIFICADO</span> 
                                                : costoEnvioAplicado !== null 
                                                    ? `$${costoEnvioAplicado.toLocaleString()}` 
                                                    : <span className="text-gray-500 font-normal">A CALCULAR</span>}
                                        </span>
                                    </div>
                                    <div className="relative w-full" ref={dropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 p-3.5 text-[11px] text-gray-100 rounded-lg transition-all focus:outline-none uppercase tracking-wide cursor-pointer text-left"
                                        >
                                            <div className="flex items-center gap-3 font-medium text-gray-300">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                {zonaSeleccionada ? `${zonaSeleccionada.nombre} (CP: ${zonaSeleccionada.cp})` : 'SELECCIONA TU PROVINCIA...'}
                                            </div>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isDropdownOpen && (
                                            <ul className="absolute z-50 mt-2 w-full max-h-[300px] overflow-auto bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent text-left">
                                                {SHIPPING_ZONES.map((z) => {
                                                    const isSelected = z.cp === selectedCP;
                                                    return (
                                                        <li 
                                                            key={z.cp} 
                                                            onClick={() => {
                                                                setSelectedCP(z.cp);
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className={`flex justify-between items-center px-4 py-4 cursor-pointer transition-colors text-[11px] uppercase tracking-wide ${isSelected ? 'bg-white/10 text-white font-bold border-l-2 border-white' : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}
                                                        >
                                                            <span>{z.nombre} <span className="text-gray-500 font-normal ml-1">({z.cp})</span></span>
                                                            {isSelected && <Check className="w-4 h-4 text-green-500" />}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                {/* Lógica de Cupón */}
                                <div className="pt-4 flex flex-col gap-3">
                                    {descuentoPorcentaje > 0 ? (
                                        <div className="flex justify-between items-center bg-green-500/10 border border-green-500/20 p-4 rounded-sm">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest mb-0.5">Cupón de {descuentoPorcentaje}% Aplicado</span>
                                                <span className="text-[13px] text-white font-medium uppercase tracking-widest">{cuponInput}</span>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setCuponInput("");
                                                    setDescuentoPorcentaje(0);
                                                    setMensajeCupon("");
                                                }}
                                                className="text-[10px] uppercase tracking-widest text-[#8e8e93] hover:text-red-400 transition"
                                            >
                                                Quitar
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setMostrarInputCupon(!mostrarInputCupon)}
                                                className="text-white text-left text-[10px] hover:text-gray-300 transition-colors tracking-widest uppercase font-bold"
                                            >
                                                {mostrarInputCupon ? '▲ Ocultar Cupones' : '▼ ¿Tenés un código de descuento?'}
                                            </button>

                                            {mostrarInputCupon && (
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={cuponInput}
                                                            onChange={(e) => setCuponInput(e.target.value.toUpperCase())}
                                                            placeholder="CÓDIGO"
                                                            className="bg-white/5 border border-white/10 px-4 py-3 text-white text-xs outline-none focus:border-white/30 flex-1 uppercase tracking-widest placeholder:text-gray-600 rounded-sm"
                                                        />
                                                        <button
                                                            onClick={aplicarCupon}
                                                            disabled={aplicandoCupon || !cuponInput.trim()}
                                                            className="bg-white/10 text-white px-6 py-3 hover:bg-white/20 transition-colors disabled:opacity-50 text-[10px] tracking-[0.2em] font-bold rounded-sm"
                                                        >
                                                            {aplicandoCupon ? '...' : 'APLICAR'}
                                                        </button>
                                                    </div>
                                                    {mensajeCupon && (
                                                        <span className="text-[10px] uppercase tracking-widest text-red-400 mt-1">
                                                            {mensajeCupon}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="pt-10 border-t border-white/5 flex justify-between items-end">
                                    <span className="text-[10px] text-gray-100 font-bold tracking-[0.3em]">Total estimado</span>
                                    <span className="text-2xl font-bold tracking-tighter">${(totalConDescuento + (costoEnvioAplicado || 0)).toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={loading || safeCartItems.length === 0 || !selectedCP}
                                className={`w-full py-5 mt-12 font-bold uppercase tracking-[0.25em] text-[10px] transition-all ${loading || safeCartItems.length === 0 || !selectedCP
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-white text-black hover:bg-gray-200 hover:tracking-[0.3em]'
                                    }`}
                            >
                                {loading ? 'CONECTANDO...' : !selectedCP ? 'ELIGE TU PROVINCIA' : 'Pagar con Mercado Pago'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
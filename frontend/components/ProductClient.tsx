"use client";

import React, { useState, useEffect } from 'react';
import { Minus, Plus, Check } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

const STRAPI_URL = "http://localhost:1337";
const PRECIO_POR_LETRA = 500; // 👈 Nuestra nueva regla de negocio

interface ProductProps {
    id: number;
    documentId: string;
    nombreProducto: string;
    descripcion: string;
    precio: number;
    precioAnterior?: number;
    stock?: number;
    imagenes: any[];
    tp_producto?: string;
    tiene_Grabado?: boolean;
}

interface ProductClientProps {
    product: ProductProps;
    averageRating?: number | string;
    reviewCount?: number;
}

export default function ProductClient({ product, averageRating, reviewCount }: ProductClientProps) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [grabadoText, setGrabadoText] = useState('');
    const [isAdded, setIsAdded] = useState(false);

    const { nombreProducto, precio, precioAnterior, descripcion, stock = 10, imagenes, tp_producto, tiene_Grabado } = product;

    const tpProductoReal = tp_producto || (product as any)?.attributes?.tp_producto;
    const tieneGrabadoReal = tiene_Grabado !== undefined ? tiene_Grabado : (product as any)?.attributes?.tiene_Grabado;

    // Evaluamos si el mate permite grabado.
    // Si la BD dice tiene_Grabado = false, o si es M_VIDRIO, entonces no se puede.
    const permiteGrabado = tieneGrabadoReal !== false && tpProductoReal !== 'M_VIDRIO';

    // Calculamos si hay descuento y el porcentaje
    const numPrecio = Number(precio);
    const numPrecioAnterior = Number(precioAnterior || 0);
    const hayDescuento = numPrecioAnterior > numPrecio;
    const porcentajeDescuento = hayDescuento ? Math.round(((numPrecioAnterior - numPrecio) / numPrecioAnterior) * 100) : 0;

    // Reseteamos el botón si el usuario cambia algo
    useEffect(() => {
        setIsAdded(false);
    }, [quantity, grabadoText]);

    const getImageUrl = (index: number) => {
        if (!imagenes || !imagenes[index]) return '/placeholder.png';
        const imgObj = imagenes[index];
        const url = imgObj.url || imgObj.attributes?.url;
        if (!url) return '/placeholder.png';
        return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
    };

    const mainImage = getImageUrl(0);
    const secondaryImage1 = getImageUrl(1) === '/placeholder.png' ? mainImage : getImageUrl(1);
    const secondaryImage2 = getImageUrl(2) === '/placeholder.png' ? mainImage : getImageUrl(2);

    const formatPrice = (amount: number) => amount.toLocaleString('es-AR');

    // 👇 CÁLCULO DE PRECIO DINÁMICO 👇
    const costoGrabado = grabadoText.length * PRECIO_POR_LETRA;
    const precioUnitarioFinal = precio + costoGrabado;
    const precioTotalFinal = precioUnitarioFinal * quantity;

    const handleQuantity = (type: 'inc' | 'dec') => {
        if (type === 'inc' && quantity < stock) setQuantity(quantity + 1);
        if (type === 'dec' && quantity > 1) setQuantity(quantity - 1);
    };

    const onAddToCart = () => {
        addToCart({
            id: product.id,
            documentId: product.documentId,
            name: nombreProducto,
            price: precioUnitarioFinal, // Mandamos el precio con el grabado incluido
            img: mainImage,
            quantity: quantity,
            color: "Estándar",
            grabado: grabadoText
        });

        setIsAdded(true);
    };

    return (
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start lg:h-[480px]">

                {/* GALERÍA */}
                <div className="w-full h-full grid grid-cols-5 gap-4">
                    <div className="col-span-2 flex flex-col gap-4 h-full">
                        <div className="relative flex-1 bg-gray-800 rounded-[15px] overflow-hidden border border-white/10 group cursor-pointer">
                            <img src={secondaryImage1} alt="Vista 1" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="relative flex-1 bg-gray-800 rounded-[15px] overflow-hidden border border-white/10 group cursor-pointer">
                            <img src={secondaryImage2} alt="Vista 2" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                    <div className="col-span-3 relative h-full bg-gray-800 rounded-[15px] overflow-hidden border border-white/10">
                        <img src={mainImage} alt={nombreProducto} className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* INFO PRODUCTO */}
                <div className="flex flex-col h-full py-1">
                    <div className="flex flex-col gap-4">
                        <div className="mb-1">
                            <h2 className="text-4xl font-bold text-white mb-1">{nombreProducto}</h2>
                            {hayDescuento ? (
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-xl font-light text-gray-500 line-through">${formatPrice(numPrecioAnterior + costoGrabado)}</span>
                                    <span className="text-3xl font-bold text-red-500">${formatPrice(precioUnitarioFinal)}</span>
                                    <span className="bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-sm shadow-lg animate-pulse">
                                        -{porcentajeDescuento}% OFF
                                    </span>
                                </div>
                            ) : (
                                <p className="text-2xl font-light text-gray-300 mt-2">${formatPrice(precioUnitarioFinal)}</p>
                            )}
                        </div>
                        <div className="space-y-3">
                            <p className="text-gray-400 leading-relaxed text-sm md:text-base">{descripcion}</p>
                            <p className="text-sm text-gray-500">by <span className="text-gray-300 font-medium">MateUnico</span></p>
                        </div>

                        <div className="space-y-4 pt-1">
                            {/* RESEÑAS / OPINIONES */}
                            {reviewCount !== undefined && (
                                <div className="py-2 inline-flex items-center">
                                    <span className="text-amber-500 font-bold text-[10px] uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                                        ⭐ {reviewCount > 0 ? averageRating : '0.0'} ({reviewCount} opiniones)
                                    </span>
                                </div>
                            )}

                            {/* GRABADO */}
                            <div className="mt-3">
                                {permiteGrabado ? (
                                    <>
                                        <div className="flex justify-between items-end mb-2">
                                            <label className="text-sm text-gray-500 block">Grabado Personalizado</label>
                                            <span className="text-[10px] font-mono text-gray-600">{grabadoText.length}/10 max.</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={grabadoText}
                                            onChange={(e) => e.target.value.length <= 10 && setGrabadoText(e.target.value)}
                                            placeholder="Ej: JM (Opcional)"
                                            className="w-full bg-transparent border border-gray-700 px-4 py-3 text-white text-sm focus:outline-none focus:border-gray-500 rounded-md transition-all placeholder-gray-700"
                                        />
                                        <p className="text-[10px] text-gray-500 mt-2 font-light tracking-wide">
                                            Añadí tu toque final. Costo extra: <span className="text-gray-400 font-medium">$500 por letra</span>.
                                        </p>
                                    </>
                                ) : (
                                    <div className="bg-white/5 border border-white/10 rounded-md p-4 flex flex-col items-center justify-center text-center mt-4">
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Grabado No Disponible</p>
                                        <p className="text-[10px] text-gray-500 mt-1">El material de este producto no permite grabado láser.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-2 pt-4">
                        <div className="flex flex-col md:flex-row gap-4">

                            {isAdded ? (
                                <div className="flex-1 flex gap-2">
                                    <button
                                        onClick={onAddToCart}
                                        className="flex-1 font-bold py-3 px-2 uppercase tracking-wide text-xs md:text-sm rounded-md transition-colors bg-green-600/20 text-green-500 border border-green-500/50 hover:bg-green-600/30 flex items-center justify-center gap-2"
                                    >
                                        <Check size={18} /> AÑADIDO
                                    </button>
                                    <Link
                                        href="/carrito"
                                        className="flex-1 font-bold py-3 px-2 uppercase tracking-wide text-xs md:text-sm rounded-md transition-colors bg-white text-black hover:bg-gray-200 flex items-center justify-center"
                                    >
                                        IR AL CARRITO
                                    </Link>
                                </div>
                            ) : (
                                <button
                                    onClick={onAddToCart}
                                    disabled={stock <= 0}
                                    className={`flex-1 font-bold py-3 px-6 uppercase tracking-wide text-sm rounded-md transition-colors ${stock > 0 ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                                >
                                    {stock > 0 ? `AÑADIR - $${formatPrice(precioTotalFinal)}` : 'SIN STOCK'}
                                </button>
                            )}

                            <div className="flex items-center justify-between border border-white/20 bg-white/5 w-32 px-4 py-3 rounded-md">
                                <button onClick={() => handleQuantity('dec')} className={`text-gray-400 hover:text-white ${quantity === 1 ? 'opacity-50' : ''}`}><Minus size={16} /></button>
                                <span className="text-white font-medium">{quantity}</span>
                                <button onClick={() => handleQuantity('inc')} className={`text-gray-400 hover:text-white ${quantity >= stock ? 'opacity-30' : ''}`} disabled={quantity >= stock}><Plus size={16} /></button>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 text-right mt-2">{stock > 0 ? `Stock disponible: ${stock} unidades` : 'Producto Agotado'}</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
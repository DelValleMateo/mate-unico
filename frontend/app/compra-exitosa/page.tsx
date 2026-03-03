"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star, X, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CompraExitosa() {
    const searchParams = useSearchParams();
    const paymentId = searchParams.get("payment_id");
    const { clearCart } = useCart();

    // Array de productos comprados y el índice actual del carrusel
    const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Estados del formulario de reseña
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");

    // Objeto que guarda qué índices ya fueron reseñados { 0: true, 1: false, etc. }
    const [reviewsSent, setReviewsSent] = useState<Record<number, boolean>>({});

    // Cada vez que cambiás de foto en el carrusel, limpiamos las estrellas y el texto
    useEffect(() => {
        setRating(0);
        setHoverRating(0);
        setComment("");
    }, [currentIndex]);

    // =========================================================================
    // 1. REDIRECCIÓN DE NGROK
    // =========================================================================
    useEffect(() => {
        if (typeof window !== "undefined") {
            if (window.location.hostname.includes("ngrok")) {
                console.log("🔄 Detectado Ngrok, volviendo a Localhost...");
                const currentParams = window.location.search;
                const targetUrl = `http://localhost:3001/compra-exitosa${currentParams}`;
                window.location.href = targetUrl;
            }
        }
    }, []);

    // =========================================================================
    // 2. RECUPERAR DATOS Y VACIAR CARRITO
    // =========================================================================
    useEffect(() => {
        const datosGuardados = localStorage.getItem("ultimaCompra") || localStorage.getItem("mateunico_cart");

        if (datosGuardados) {
            try {
                const items = JSON.parse(datosGuardados);
                if (Array.isArray(items) && items.length > 0) {
                    setPurchasedItems(items);
                }
            } catch (error) {
                console.error("Error leyendo datos:", error);
            }
        }

        // Vaciamos el carrito real para que empiece de cero!
        clearCart();

        // 👇 ESTA ES LA MAGIA: Corchetes vacíos para evitar el bucle infinito
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmitReview = () => {
        if (rating === 0) return alert("Por favor seleccioná una calificación");

        // Marcamos SOLO el producto actual como reseñado
        setReviewsSent((prev) => ({ ...prev, [currentIndex]: true }));
    };

    // Funciones del Carrusel
    const nextItem = () => {
        setCurrentIndex((prev) => (prev === purchasedItems.length - 1 ? 0 : prev + 1));
    };

    const prevItem = () => {
        setCurrentIndex((prev) => (prev === 0 ? purchasedItems.length - 1 : prev - 1));
    };

    const currentItem = purchasedItems.length > 0 ? purchasedItems[currentIndex] : {
        name: "Cargando producto...",
        price: 0,
        quantity: 0,
        img: "/placeholder.png",
        grabado: "",
        color: ""
    };

    // Verificamos si EL PRODUCTO ACTUAL ya tiene la reseña enviada
    const isCurrentReviewSent = reviewsSent[currentIndex] || false;

    return (
        <div className="w-full flex items-center justify-center py-12 px-4">
            <div className="bg-white w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden relative animate-fade-in-up border border-gray-200">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <div className="w-8"></div>
                    <h2 className="text-2xl font-semibold text-gray-800 text-center">¡Gracias por tu compra!</h2>
                    <Link href="/">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition duration-200">
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </Link>
                </div>

                {/* Cuerpo */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* FOTO DINÁMICA CON CARRUSEL */}
                    <div className="flex flex-col items-center justify-start">
                        <div className="w-full aspect-square relative rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-gray-50 group">

                            <img
                                src={currentItem.img || currentItem.image || "/placeholder.png"}
                                alt={currentItem.name || currentItem.nombreProducto}
                                className="object-cover w-full h-full transition-transform duration-500"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/placeholder.png";
                                }}
                            />

                            {/* Controles del Carrusel */}
                            {purchasedItems.length > 1 && (
                                <>
                                    <button
                                        onClick={prevItem}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={nextItem}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest">
                                        {currentIndex + 1} / {purchasedItems.length}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* RESEÑA */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg text-gray-800">Reseña</h3>
                            <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        disabled={isCurrentReviewSent}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => !isCurrentReviewSent && setHoverRating(star)}
                                        onMouseLeave={() => !isCurrentReviewSent && setHoverRating(0)}
                                        className={`focus:outline-none transition-transform ${isCurrentReviewSent ? 'cursor-default' : 'hover:scale-110'}`}
                                    >
                                        <Star className={`w-6 h-6 ${star <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {!isCurrentReviewSent ? (
                            <>
                                <textarea
                                    className="w-full border border-gray-300 rounded-md p-3 text-sm text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none h-32 bg-gray-50 placeholder-gray-500"
                                    placeholder="Dejá tu opinión sobre este producto..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <button onClick={handleSubmitReview} className="bg-black text-white py-2 px-6 rounded hover:bg-gray-800 transition shadow-lg text-sm font-medium self-end">
                                    Enviar Opinión
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-44 bg-green-50 rounded-md text-green-700 border border-green-200 animate-pulse">
                                <CheckCircle className="w-10 h-10 mb-2" />
                                <p className="font-medium text-lg">¡Gracias por opinar!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* TABLA DE DETALLES */}
                <div className="px-8 pb-8">
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <th className="px-4 py-3 font-bold text-gray-700 bg-gray-50 w-1/3">Nombre</th>
                                    <td className="px-4 py-3 text-gray-600 font-medium text-right truncate max-w-[200px]">
                                        {currentItem.name || currentItem.nombreProducto} {currentItem.color && `(${currentItem.color})`}
                                    </td>
                                </tr>

                                {currentItem.grabado && (
                                    <tr className="border-b border-gray-200 bg-amber-50/50">
                                        <th className="px-4 py-3 font-bold text-amber-800 bg-amber-100/50">Grabado Solicitado</th>
                                        <td className="px-4 py-3 text-amber-900 font-bold text-right italic uppercase tracking-wider">
                                            "{currentItem.grabado}"
                                        </td>
                                    </tr>
                                )}

                                <tr className="border-b border-gray-200">
                                    <th className="px-4 py-3 font-bold text-gray-700 bg-gray-50">Cantidad</th>
                                    <td className="px-4 py-3 text-gray-600 font-medium text-right">{currentItem.quantity}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <th className="px-4 py-3 font-bold text-gray-700 bg-gray-50">Precio Unitario</th>
                                    <td className="px-4 py-3 text-gray-600 font-medium text-right">${Number(currentItem.price || currentItem.precio || 0).toLocaleString("es-AR")}</td>
                                </tr>
                                <tr>
                                    <th className="px-4 py-3 font-bold text-gray-700 bg-gray-50">Fecha de Compra</th>
                                    <td className="px-4 py-3 text-gray-600 font-medium text-right">{new Date().toLocaleDateString("es-AR")}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
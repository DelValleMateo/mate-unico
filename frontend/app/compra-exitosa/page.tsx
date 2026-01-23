"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star, X, CheckCircle } from "lucide-react";

export default function CompraExitosa() {
    const searchParams = useSearchParams();
    const paymentId = searchParams.get("payment_id");

    // Estado para la reseña
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [reviewSent, setReviewSent] = useState(false);

    // Estado inicial (Placeholder por si falla la memoria)
    const [purchasedItem, setPurchasedItem] = useState({
        name: "Cargando producto...",
        price: 0,
        quantity: 0,
        image: "/placeholder.png",
        date: new Date().toLocaleDateString("es-AR"),
    });

    // =========================================================================
    // 1. REDIRECCIÓN DE NGROK (Tu truco de seguridad)
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
    // 2. RECUPERAR DATOS REALES DE LA COMPRA (LocalStorage)
    // =========================================================================
    useEffect(() => {
        // Buscamos qué guardamos antes de ir a pagar
        const datosGuardados = localStorage.getItem("ultimaCompra");

        if (datosGuardados) {
            try {
                const items = JSON.parse(datosGuardados);
                if (items && items.length > 0) {
                    // Tomamos el primer item para mostrar en el recibo (demo)
                    // Si tu carrito tiene muchos, mostramos el principal
                    const itemReal = items[0];

                    setPurchasedItem({
                        name: itemReal.name || itemReal.nombreProducto || "Producto",
                        price: itemReal.price || itemReal.precio || 0,
                        quantity: itemReal.quantity || 1,
                        // Usamos la imagen que guardaste en el carrito.
                        // Si guardaste la URL completa, genial. Si no, ajustamos.
                        image: itemReal.img || itemReal.image || "/placeholder.png",
                        date: new Date().toLocaleDateString("es-AR"),
                    });
                }
            } catch (error) {
                console.error("Error leyendo ultimaCompra:", error);
            }
        }
    }, []);

    // Resto de lógica (reviews, etc...)
    useEffect(() => {
        if (paymentId) console.log("Procesando pago ID:", paymentId);
    }, [paymentId]);

    const handleSubmitReview = () => {
        if (rating === 0) return alert("Por favor selecciona una calificación");
        setReviewSent(true);
    };

    return (
        <div className="w-full flex items-center justify-center py-12 px-4">
            <div className="bg-white w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden relative animate-fade-in-up border border-gray-200">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <div className="w-8"></div>
                    <h2 className="text-2xl font-semibold text-gray-800 text-center">Gracias por tu compra!</h2>
                    <Link href="/">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition duration-200">
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </Link>
                </div>

                {/* Cuerpo */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* FOTO DINÁMICA */}
                    <div className="flex flex-col items-center justify-start">
                        <div className="w-full aspect-square relative rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-gray-50">
                            <img
                                src={purchasedItem.image}
                                alt={purchasedItem.name}
                                className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                    // Fallback si la imagen falla
                                    (e.target as HTMLImageElement).src = "/placeholder.png";
                                }}
                            />
                        </div>
                    </div>

                    {/* RESEÑA & DATOS */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg text-gray-800">Reseña</h3>
                            <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star className={`w-6 h-6 ${star <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {!reviewSent ? (
                            <>
                                <textarea
                                    className="w-full border border-gray-300 rounded-md p-3 text-sm text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none h-32 bg-gray-50 placeholder-gray-500"
                                    placeholder="Deja tu opinion sobre el producto..."
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
                                    <td className="px-4 py-3 text-gray-600 font-medium text-right truncate max-w-[200px]">{purchasedItem.name}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <th className="px-4 py-3 font-bold text-gray-700 bg-gray-50">Cantidad</th>
                                    <td className="px-4 py-3 text-gray-600 font-medium text-right">{purchasedItem.quantity}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <th className="px-4 py-3 font-bold text-gray-700 bg-gray-50">Precio</th>
                                    <td className="px-4 py-3 text-gray-600 font-medium text-right">${purchasedItem.price.toLocaleString("es-AR")}</td>
                                </tr>
                                <tr>
                                    <th className="px-4 py-3 font-bold text-gray-700 bg-gray-50">Fecha</th>
                                    <td className="px-4 py-3 text-gray-600 font-medium text-right">{purchasedItem.date}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
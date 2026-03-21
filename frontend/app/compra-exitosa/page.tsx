"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star, X, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext"; // <--- Importamos el contexto de Nacho

function CompraExitosaContent() {
    const searchParams = useSearchParams();
    const { clearCart } = useCart();
    const { user, jwt } = useAuth(); // <--- Traemos el usuario y el token

    // Array de productos comprados y el índice actual del carrusel
    const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Estados del formulario de reseña
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");

    // Objeto que guarda qué índices ya fueron reseñados
    const [reviewsSent, setReviewsSent] = useState<Record<number, boolean>>({});

    // Cada vez que cambiás de foto, limpiamos las estrellas y el texto
    useEffect(() => {
        setRating(0);
        setHoverRating(0);
        setComment("");
    }, [currentIndex]);

    // =========================================================================
    // LÓGICA INTELIGENTE: Redirección Ngrok + Vaciado de Carrito
    // =========================================================================
    useEffect(() => {
        if (typeof window !== "undefined") {
            // 1. Si detecta Ngrok, HUYE a localhost sin tocar nada
            if (window.location.hostname.includes("ngrok")) {
                const currentParams = window.location.search;
                const targetUrl = `http://localhost:3000/compra-exitosa${currentParams}`;
                window.location.href = targetUrl;
                return; // 🛑 Cortamos la ejecución acá para que NO vacíe el carrito por error
            }

            // 2. Si ya llegó a salvo a localhost, RECUPERA DATOS Y VACÍA EL CARRITO
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

            console.log("🛒 Vaciando el carrito...");
            clearCart(); // Vaciamos el carrito real para que empiece de cero
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // =========================================================================
    // 3. ENVIAR RESEÑA A STRAPI (La lógica nueva)
    // =========================================================================
    const handleSubmitReview = async () => {
        if (rating === 0) return alert("Por favor seleccioná una calificación");
        
        // Verificamos si hay sesión iniciada (Paso 5.2 de Nacho)
        if (!user || !jwt) {
            return alert("Debes estar logueado para dejar una reseña");
        }

        const currentItem = purchasedItems[currentIndex];

        // Estructura para Strapi V5 STRICT (requiere connect para relaciones numéricas y string IDs)
        const reviewData = {
            data: {
                estrellas: rating,
                comentario: comment,
                users_permissions_user: { connect: [user.id] }, 
                producto: { connect: [currentItem.documentId || currentItem.id] }, 
            }
        };

        try {
            const tokenToUse = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || jwt;
            const res = await fetch('http://localhost:1337/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenToUse}` // Usamos el token maestro si está disponible para evitar bloqueos por permisos
                },
                body: JSON.stringify(reviewData),
            });

            if (res.ok) {
                // Si Strapi confirma, marcamos como enviado en la UI
                setReviewsSent((prev) => ({ ...prev, [currentIndex]: true }));
            } else {
                alert("Hubo un error al guardar la reseña en la base de datos.");
            }
        } catch (error) {
            console.error("Error enviando reseña:", error);
        }
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
        img: "https://via.placeholder.com/400?text=Cargando",
        grabado: "",
        color: ""
    };

    const isCurrentReviewSent = reviewsSent[currentIndex] || false;

    return (
        <div className="w-full flex items-center justify-center py-12 px-4">
            <div className="bg-white w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden relative border border-gray-200 animate-in fade-in zoom-in duration-500">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <div className="w-8"></div>
                    <h2 className="text-2xl font-semibold text-gray-800 text-center uppercase tracking-tighter">¡Compra Realizada!</h2>
                    <Link href="/">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition duration-200">
                            <X className="w-6 h-6 text-gray-400" />
                        </button>
                    </Link>
                </div>

                {/* Cuerpo */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* FOTO DINÁMICA CON CARRUSEL */}
                    <div className="flex flex-col items-center justify-start">
                        <div className="w-full aspect-square relative rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-gray-50 group">
                            <img
                                src={currentItem.img || currentItem.image || "https://via.placeholder.com/400?text=Mate"}
                                alt={currentItem.name || currentItem.nombreProducto}
                                className="object-cover w-full h-full transition-transform duration-500"
                            />

                            {purchasedItems.length > 1 && (
                                <>
                                    <button onClick={prevItem} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-md transition-all">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button onClick={nextItem} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-md transition-all">
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
                            <h3 className="font-bold text-lg text-gray-800 uppercase tracking-tight">Tu Calificación</h3>
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
                                    className="w-full border border-gray-300 rounded-md p-3 text-sm text-gray-900 focus:ring-1 focus:ring-black outline-none resize-none h-32 bg-gray-50 placeholder-gray-400"
                                    placeholder="Contanos qué te pareció el mate..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <button 
                                    onClick={handleSubmitReview} 
                                    className="bg-black text-white py-2 px-6 rounded-full hover:bg-gray-800 transition shadow-lg text-[10px] font-bold uppercase tracking-widest self-end"
                                >
                                    Enviar Reseña
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-44 bg-green-50 rounded-md text-green-700 border border-green-200">
                                <CheckCircle className="w-10 h-10 mb-2" />
                                <p className="font-bold uppercase text-xs tracking-widest text-center">¡Reseña guardada con éxito!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* TABLA DE DETALLES */}
                <div className="px-8 pb-8">
                    <div className="border border-gray-100 rounded-md overflow-hidden shadow-sm">
                        <table className="w-full text-xs text-left">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <th className="px-4 py-3 font-bold text-gray-500 bg-gray-50/50 uppercase tracking-widest w-1/3">Producto</th>
                                    <td className="px-4 py-3 text-gray-800 font-bold text-right truncate">
                                        {currentItem.name || currentItem.nombreProducto} {currentItem.color && `(${currentItem.color})`}
                                    </td>
                                </tr>
                                {currentItem.grabado && (
                                    <tr className="border-b border-gray-100 bg-amber-50/30">
                                        <th className="px-4 py-3 font-bold text-amber-700 bg-amber-50">Grabado Personalizado</th>
                                        <td className="px-4 py-3 text-amber-900 font-black text-right italic uppercase">
                                            "{currentItem.grabado}"
                                        </td>
                                    </tr>
                                )}
                                <tr className="border-b border-gray-100">
                                    <th className="px-4 py-3 font-bold text-gray-500 bg-gray-50/50 uppercase tracking-widest">Cantidad</th>
                                    <td className="px-4 py-3 text-gray-800 font-bold text-right">{currentItem.quantity}</td>
                                </tr>
                                <tr>
                                    <th className="px-4 py-3 font-bold text-gray-500 bg-gray-50/50 uppercase tracking-widest">Total Abonado</th>
                                    <td className="px-4 py-3 text-green-600 font-bold text-right text-sm">
                                        ${Number(currentItem.price || 0).toLocaleString("es-AR")}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Envolvemos el componente en un Suspense para que Next.js compile feliz
export default function CompraExitosa() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando detalles de tu compra...</div>}>
            <CompraExitosaContent />
        </Suspense>
    );
}
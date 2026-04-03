"use client";

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface ProductReviewsProps {
    reviews: any[];
    averageRating: string | number;
    starCounts: { [key: number]: number };
}

export default function ProductReviews({ reviews, averageRating, starCounts }: ProductReviewsProps) {
    const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

    const toggleRating = (rating: number) => {
        setSelectedRatings(prev => 
            prev.includes(rating) 
                ? prev.filter(r => r !== rating) 
                : [...prev, rating]
        );
    };

    const filteredReviews = selectedRatings.length > 0 
        ? reviews.filter((r: any) => selectedRatings.includes(Math.round(r.attributes?.estrellas || r.estrellas || 0)))
        : reviews;

    return (
        <section className="max-w-7xl mx-auto px-6 md:px-8 pb-32 mt-10 pt-16 border-t border-white/10">
            <h3 className="text-white text-3xl font-light uppercase tracking-tighter mb-12">
                Opiniones de la comunidad Mate Único
            </h3>
            <div className="flex flex-col-reverse md:flex-row gap-16 lg:gap-32">
                
                {/* COLUMNA IZQUIERDA: Lista de Reseñas */}
                <div className="w-full md:w-2/3 flex flex-col gap-12">
                    {filteredReviews.length > 0 ? (
                        filteredReviews.map((r: any) => {
                            const rating = r.attributes?.estrellas || r.estrellas || 0;
                            const dateStr = r.attributes?.createdAt || r.createdAt;
                            const dateFormatted = dateStr 
                                ? new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                : '';
                            const comment = r.attributes?.comentario || r.comentario;

                            return (
                                <div key={r.id} className="flex flex-col border-b border-white/5 pb-8 last:border-0">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    className={`w-3.5 h-3.5 ${i < rating ? "fill-white text-white" : "text-gray-700"}`} 
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[11px] text-gray-400">
                                            {dateFormatted}
                                        </span>
                                    </div>

                                    <p className="text-gray-300 text-[13px] leading-relaxed max-w-3xl">
                                        "{comment}"
                                    </p>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-10 text-left">
                            <p className="text-gray-500 italic text-sm">
                                {selectedRatings.length > 0 ? `No hay reseñas para los filtros seleccionados.` : 'Este mate todavía no tiene reseñas. ¡Sé el primero en dejar la tuya!'}
                            </p>
                        </div>
                    )}
                </div>

                {/* COLUMNA DERECHA: Resumen de Reseñas y Filtros */}
                <div className="w-full md:w-1/3">
                    <div className="sticky top-28">
                        <h3 className="text-white text-3xl font-semibold tracking-tight mb-4">
                            Reviews
                        </h3>
                        <div className="flex gap-1.5 mb-5">
                            {[...Array(5)].map((_, i) => (
                                <Star 
                                    key={i} 
                                    className={`w-5 h-5 ${i < Math.round(Number(averageRating)) ? "fill-white text-white" : "text-gray-700"}`} 
                                />
                            ))}
                        </div>
                        <p className="text-white text-[15px] font-medium mb-8 flex justify-between items-center">
                            <span>{reviews.length} reviews</span>
                            {selectedRatings.length > 0 && (
                                <button onClick={() => setSelectedRatings([])} className="text-[10px] uppercase text-gray-400 hover:text-white transition underline">
                                    Quitar filtros
                                </button>
                            )}
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = starCounts[star as keyof typeof starCounts];
                                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                const isSelected = selectedRatings.includes(star);

                                return (
                                    <button 
                                        key={star} 
                                        onClick={() => toggleRating(star)}
                                        className={`flex items-center gap-4 text-[13px] transition w-full text-left outline-none ${isSelected ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        <div className={`w-3.5 h-3.5 border flex items-center justify-center rounded-[1px] flex-shrink-0 transition-colors ${isSelected ? 'bg-white border-white' : 'border-gray-400'}`}>
                                            {isSelected && (
                                                <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="w-12 whitespace-nowrap">{star} stars</span>
                                        <div className="flex-1 h-[2px] bg-gray-800 relative">
                                            <div 
                                                className={`absolute top-0 left-0 h-full transition-all duration-300 ${isSelected ? 'bg-white' : 'bg-gray-400'}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="w-6 text-right">({count})</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

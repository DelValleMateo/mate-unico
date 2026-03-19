"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// --- DATOS (Puedes moverlos a un archivo de datos después) ---
const slides = [
  { id: 1, image: '/banner-home.png', title: 'No es solo un mate', subtitle: 'es tu Mate Unico' },
  { id: 2, image: '/home-banner.png', title: 'Tradición y Diseño', subtitle: 'Hecho en Argentina' }
];

const destacados = [
  { id: 1, name: 'Imperial', img: '/imperialnegro3.png' },
  { id: 2, name: 'Tradicional', img: '/mate-tradicional.png' },
  { id: 3, name: 'Imperial Madera', img: '/mate-imperialmadera.png' },
];

const novedades = [
  { id: 1, name: 'Imperial + Bombilla', img: '/mate-imperial+bombilla.png' },
  { id: 2, name: 'Imperial Rojo', img: '/mate-imperialrojo.png' },
  { id: 3, name: 'Metalico', img: '/mate-metalicoblanco.png' },
];

const variedad = [
  { id: 1, name: 'Imperial de cuero', img: '/mate-imperial1.png' },
  { id: 2, name: 'Imperial con bombilla', img: '/mate-imperial+bombilla2.png' },
  { id: 3, name: 'Tradicional+Bombilla', img: '/mate-tradicional+bombilla.png' },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => nextSlide(), 5000);
    return () => clearInterval(slideInterval);
  }, [currentSlide]);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <>
      {/* --- HERO SECTION (CARRUSEL) --- */}
      <section className="relative w-full h-[600px] overflow-hidden">
        {slides.map((slide, index) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <Image src={slide.image} alt={slide.title} fill className="object-cover" priority={index === 0} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent"></div>
          </div>
        ))}

        <div className="absolute inset-0 flex items-center px-8 md:px-16 max-w-7xl mx-auto w-full">
          <div className="max-w-2xl space-y-2 animate-in slide-in-from-left duration-700 fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-lg">
              {slides[currentSlide].title} <br />
              <span className="text-[#d4af37]">{slides[currentSlide].subtitle}</span>
            </h1>
          </div>
        </div>

        {/* Controles Carrusel */}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"><ChevronLeft size={32} /></button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"><ChevronRight size={32} /></button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          {slides.map((_, index) => (
            <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'}`} />
          ))}
        </div>
      </section>

      {/* --- SECCIONES DE PRODUCTOS --- */}
      <SectionGrid
        title="Destacados"
        subtitle="Los productos mas destacados actualmente en nuestro sitio"
        products={destacados}
      />

      {/* SECCIÓN NOVEDADES: AHORA ENVÍA EL FILTRO PARA ORDENAR POR FECHA MÁS RECIENTE */}
      <SectionGrid
        title="Novedades"
        subtitle="Los Productos mas recientes que lanzamos a la venta"
        products={novedades}
        linkHref="/catalogo?ordenar=fecha_desc" // RUTA CON EL FILTRO
      />

      <SectionGrid
        title="Mas Variedad"
        subtitle="Aca vas a encontrar todo tipo de producto"
        products={variedad}
      />
    </>
  );
}

// Componente auxiliar local para esta página
// MODIFICADO: Ahora acepta 'linkHref' como propiedad
function SectionGrid({ title, subtitle, products, linkHref = '/catalogo' }: { title: string, subtitle: string, products: any[], linkHref?: string }) {
  return (
    <section className="max-w-7xl mx-auto px-8 py-16 text-center">
      <div className="mb-12 space-y-2">
        <h3 className="text-4xl font-bold text-white capitalize">{title}</h3>
        <p className="text-gray-400 font-light">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {products.map((product) => (
          <Link href="/producto/imperial-negro" key={product.id} className="group flex flex-col items-center">
            <div className="relative w-full aspect-square bg-[#1a1a1a]/60 rounded-xl overflow-hidden border border-white/5 group-hover:border-white/20 transition-all duration-300">
              <Image src={product.img} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <h4 className="mt-4 text-white font-bold text-lg tracking-wide group-hover:text-gray-300 transition-colors">{product.name}</h4>
          </Link>
        ))}
      </div>

      <Link
        href={linkHref} // Usa la URL dinámica con el filtro
        className="inline-block px-8 py-2 border border-white/30 text-white text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all rounded-sm"
      >
        Ver Todos
      </Link>
    </section>
  );
}
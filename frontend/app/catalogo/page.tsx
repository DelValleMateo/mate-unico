"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Filter, Search, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// --- Esquema Real de Strapi ---
interface Product {
    id: number;
    documentId: string;
    nombreProducto: string;
    slug: string;
    precio: number;
    precioAnterior?: number; // Precio original sin descuento
    stock: number;
    imagenes: any[];
    tp_producto?: string;
}

// Consulta a Strapi
async function getProductosReales(): Promise<Product[]> {
    try {
        const res = await fetch(`${STRAPI_URL}/api/productos?populate=*`);
        if (!res.ok) throw new Error("Error fetching products");
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error("No se pudo conectar con el catálogo:", error);
        return [];
    }
}
// ----------------------------------------------------------------------------

export default function CatalogoPage() {
    const [productosOriginales, setProductosOriginales] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [ordenar, setOrdenar] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

    useEffect(() => {
        getProductosReales().then(data => {
            setProductosOriginales(data);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, []);

    // --- MOTOR DE FILTROS ---
    let productosFiltrados = [...productosOriginales];

    if (searchTerm.trim() !== "") {
        productosFiltrados = productosFiltrados.filter(p =>
            p.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    if (selectedFilter) {
        productosFiltrados = productosFiltrados.filter(p => p.tp_producto === selectedFilter);
    }

    if (ordenar === "promociones") {
        productosFiltrados = productosFiltrados.filter(p => p.precioAnterior && Number(p.precioAnterior) > Number(p.precio));
    } else if (ordenar === "precio_asc") {
        productosFiltrados.sort((a, b) => Number(a.precio) - Number(b.precio));
    } else if (ordenar === "precio_desc") {
        productosFiltrados.sort((a, b) => Number(b.precio) - Number(a.precio));
    } else if (ordenar === "destacados") {
        // Asumiendo que el stock inicial es parejo, menor stock = más ventas
        productosFiltrados.sort((a, b) => Number(a.stock) - Number(b.stock));
    }

    return (
        <div className="min-h-screen text-gray-200 p-8 md:px-16">
            <h1 className="text-4xl font-extrabold mb-8 pb-2">Productos</h1>

            {/* Layout principal: Filtros (1/4) y Grid (3/4) */}
            <div className="flex flex-col md:flex-row gap-8">

                {/* -------------------- Columna de Filtros (Sidebar) -------------------- */}
                <aside className="w-full md:w-1/4 md:mt-14 self-start bg-black/10 backdrop-blur-md p-6 rounded-2xl border border-white/5">

                    {/* BÚSQUEDA DIRECTA EN EL CATÁLOGO */}
                    <div className="relative w-full mb-8">
                        <input
                            type="text"
                            placeholder="Buscar nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-b border-gray-600 rounded-none py-2 pl-1 pr-8 text-sm focus:outline-none focus:border-white transition-colors placeholder-gray-500 text-white"
                        />
                        <Search className="absolute right-0 top-2 text-gray-500 w-4 h-4 pointer-events-none" />
                    </div>

                    <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                        <h3 className="text-xl font-extrabold tracking-wide text-white">Filtros</h3>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedFilter(null);
                            }}
                            className="text-xs font-semibold text-gray-500 hover:text-white uppercase tracking-wider transition-colors"
                        >
                            Limpiar
                        </button>
                    </div>

                    {/* Filtro por Tipo de Mate / Material */}
                    <div className="mb-8">
                        <h4 className="font-semibold text-gray-400 uppercase tracking-widest text-xs mb-4">Tipos de Mate</h4>
                        {[
                            { label: 'Calabaza', value: 'M_CALABAZA' },
                            { label: 'Madera', value: 'M_MADERA' },
                            { label: 'Metal', value: 'M_METAL' },
                            { label: 'Vidrio', value: 'M_VIDRIO' }
                        ].map(material => (
                            <label key={material.value} htmlFor={material.value} className="flex items-center mb-3 group cursor-pointer">
                                <div className="relative flex items-center justify-center w-5 h-5 rounded border border-gray-600 bg-gray-800/80 group-hover:border-gray-400 transition-colors">
                                    <input
                                        id={material.value}
                                        type="checkbox"
                                        className="absolute w-full h-full opacity-0 cursor-pointer peer"
                                        checked={selectedFilter === material.value}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedFilter(material.value);
                                            } else {
                                                setSelectedFilter(null);
                                            }
                                        }}
                                    />
                                    <div className="w-3 h-3 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
                                </div>
                                <span className="ml-3 text-sm font-medium text-gray-300 group-hover:text-white cursor-pointer select-none transition-colors">{material.label}</span>
                            </label>
                        ))}
                    </div>

                    {/* Filtro por Combos */}
                    <div className="mb-8">
                        <h4 className="font-semibold text-gray-400 uppercase tracking-widest text-xs mb-4">Combos</h4>
                        {[
                            { label: 'Mate + Bombilla', value: 'COMBO1' },
                            { label: 'Mate + Bombilla + Termera', value: 'COMBO2' }
                        ].map((combo) => (
                            <label key={combo.value} htmlFor={combo.value} className="flex items-center mb-3 group cursor-pointer">
                                <div className="relative flex items-center justify-center w-5 h-5 rounded border border-gray-600 bg-gray-800/80 group-hover:border-gray-400 transition-colors">
                                    <input
                                        id={combo.value}
                                        type="checkbox"
                                        className="absolute w-full h-full opacity-0 cursor-pointer peer"
                                        checked={selectedFilter === combo.value}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedFilter(combo.value);
                                            } else {
                                                setSelectedFilter(null);
                                            }
                                        }}
                                    />
                                    <div className="w-3 h-3 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
                                </div>
                                <span className="ml-3 text-sm font-medium text-gray-300 group-hover:text-white cursor-pointer select-none transition-colors">{combo.label}</span>
                            </label>
                        ))}
                    </div>
                </aside>

                {/* -------------------- Grid de Productos -------------------- */}
                <section className="w-full md:w-3/4">

                    {/* Selector de Ordenar (INCLUYE PROMOCIONES) */}
                    <div className="flex justify-end mb-4">
                        <div className="relative inline-block">
                            <select
                                value={ordenar}
                                onChange={(e) => setOrdenar(e.target.value)}
                                className="appearance-none cursor-pointer pl-4 pr-10 py-2 border border-gray-700 bg-gray-900/60 text-white rounded-md text-sm focus:outline-none focus:border-gray-500 transition-colors"
                            >
                                <option value="destacados">Destacados (Más Vendidos)</option>
                                <option value="">Todos</option>
                                <option value="promociones">Promociones (SALE 🔥)</option>
                                <option value="precio_asc">Precio (Menor a Mayor)</option>
                                <option value="precio_desc">Precio (Mayor a Menor)</option>
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <p className="text-lg text-center py-10 opacity-50">Cargando catálogo...</p>
                    ) : productosFiltrados.length === 0 ? (
                        <p className="text-lg text-center py-10 opacity-50">No se encontraron productos para tu búsqueda.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {productosFiltrados.map((producto) => (
                                <ProductCard key={producto.id} producto={producto} />
                            ))}
                        </div>
                    )}

                    {!loading && productosFiltrados.length > 0 && (
                        <div className="text-center mt-10">
                            <button
                                type="button"
                                className="px-8 py-2 border border-gray-400 text-white text-sm uppercase tracking-widest hover:bg-gray-800 transition-all rounded-sm font-bold"
                            >
                                Cargar más productos
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

// Componente Auxiliar para la Card de Producto
function ProductCard({ producto }: { producto: Product }) {
    const { nombreProducto, slug, precio, precioAnterior, stock, imagenes } = producto;

    // Calculamos si hay descuento y el porcentaje
    const numPrecio = Number(precio);
    const numPrecioAnterior = Number(precioAnterior || 0);
    const hayDescuento = numPrecioAnterior > numPrecio;
    const porcentajeDescuento = hayDescuento ? Math.round(((numPrecioAnterior - numPrecio) / numPrecioAnterior) * 100) : 0;

    // Extractor dinámico de imagen principal Strapi
    let mainImage = '/placeholder.png';
    if (imagenes && imagenes.length > 0) {
        const imgObj = imagenes[0];
        const url = imgObj.url || imgObj.attributes?.url;
        if (url) {
            mainImage = url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
        }
    }

    return (
        <Link
            href={`/producto/${slug}`}
            className="block group bg-transparent p-1 rounded-xl transition duration-300 ease-in-out border border-gray-700 hover:border-white/50 relative"
        >
            <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-lg bg-gray-900/50">
                <Image
                    src={mainImage}
                    alt={nombreProducto || "Mate"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                />

                {/* Etiqueta de STOCK o DESCUENTO dinámica */}
                {stock <= 0 ? (
                    <div className="absolute top-3 right-3 bg-gray-600 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-sm shadow-lg z-10">
                        SIN STOCK
                    </div>
                ) : hayDescuento ? (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-lg shadow-lg shadow-red-900/40 z-10 animate-pulse border border-red-400/40">
                        -{porcentajeDescuento}%
                    </div>
                ) : null}
            </div>

            <div className="text-left px-2">
                <h4 className="text-lg font-semibold truncate text-white group-hover:text-gray-300 transition-colors">
                    {nombreProducto}
                </h4>
                <div className="flex flex-col gap-0.5 mt-1">
                    {hayDescuento ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 line-through">${numPrecioAnterior.toLocaleString('es-AR')}</span>
                            <span className="text-sm font-bold text-red-500">${numPrecio.toLocaleString('es-AR')}</span>
                        </div>
                    ) : (
                        <span className="text-sm font-normal text-gray-400">
                            ${numPrecio.toLocaleString('es-AR')}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
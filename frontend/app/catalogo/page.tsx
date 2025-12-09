// frontend/app/catalogo/page.tsx - DISEÑO FINAL SIMPLIFICADO

import Link from 'next/link';
import Image from 'next/image';
import { Filter, Search } from 'lucide-react';

// --- MOCK Data (Se mantiene para la UI) ---
interface Product {
    id: number;
    attributes: {
        nombre: string;
        slug: string;
        precio: number;
        imagen_url: string; 
        color: string; 
    };
}

async function getProductosMock(): Promise<Product[]> {
    // Datos MOCK
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    return [
        { id: 1, attributes: { nombre: 'Imperial', slug: 'imperial-negro', precio: 25000, imagen_url: '/imperialnegro3.png', color: 'Negro' } },
        { id: 2, attributes: { nombre: 'Combo 1', slug: 'combo-clasico', precio: 25000, imagen_url: '/mate-tradicional.png', color: 'Marrón' } },
        { id: 3, attributes: { nombre: 'Mate', slug: 'mate-rojo', precio: 99, imagen_url: '/mate-imperialrojo.png', color: 'Rojo' } },
        { id: 4, attributes: { nombre: 'Mate', slug: 'mate-negro', precio: 99, imagen_url: '/mate-negro.png', color: 'Negro' } },
        { id: 5, attributes: { nombre: 'Mate', slug: 'mate-blanco', precio: 99, imagen_url: '/mate-metalicoblanco.png', color: 'Blanco' } },
        { id: 6, attributes: { nombre: 'Mate', slug: 'mate-metalico', precio: 99, imagen_url: '/mate-metalico.png', color: 'Metal' } },
    ] as Product[];
}
// ----------------------------------------------------------------------------


export default async function CatalogoPage() {
    let productos: Product[] = [];
    let error: string | null = null;

    try {
        productos = await getProductosMock(); 
    } catch (e: any) {
        error = "No pudimos cargar los productos.";
    }

    return (
        <div className="min-h-screen text-gray-200 p-8 md:px-16">
            
            <h1 className="text-4xl font-extrabold mb-8 pb-2">
                Productos
            </h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            {/* Layout principal: Filtros (1/4) y Grid (3/4) */}
            <div className="flex flex-col md:flex-row gap-8">
                
                {/* -------------------- Columna de Filtros (Sidebar) -------------------- */}
                <aside className="w-full md:w-1/4 self-start">
                    
                    <h3 className="text-xl font-bold mb-4">Filtros <span className="text-sm font-normal text-gray-400 ml-2 cursor-pointer hover:text-white">Limpiar filtros</span></h3>
                    
                    {/* Filtro por Material */}
                    <div className="mb-6">
                        <h4 className="font-semibold mb-2">Material</h4>
                        {['Calabaza', 'Madera', 'Metal', 'Vidrio'].map(material => (
                            <div key={material} className="flex items-center mb-1">
                                <input id={material} type="checkbox" className="h-4 w-4 text-white bg-transparent border-gray-400 rounded focus:ring-white" />
                                <label htmlFor={material} className="ml-2 text-sm">{material}</label>
                            </div>
                        ))}
                    </div>

                    {/* Filtro por Color */}
                    <div className="mb-6">
                        <h4 className="font-semibold mb-2">Color</h4>
                        {['Negro', 'Rojo', 'Marrón', 'Blanco'].map(color => (
                            <div key={color} className="flex items-center mb-1">
                                <input id={color} type="checkbox" className="h-4 w-4 text-white bg-transparent border-gray-400 rounded focus:ring-white" />
                                <label htmlFor={color} className="ml-2 text-sm">{color}</label>
                            </div>
                        ))}
                    </div>
                    
                    {/* Filtro por Combos */}
                    <div className="mb-6">
                        <h4 className="font-semibold mb-2">Combos</h4>
                        {['Mate + bombilla + cartera', 'Mate + bombilla'].map((combo, index) => (
                            <div key={index} className="flex items-center mb-1">
                                <input id={`combo-${index}`} type="checkbox" className="h-4 w-4 text-white bg-transparent border-gray-400 rounded focus:ring-white" />
                                <label htmlFor={`combo-${index}`} className="ml-2 text-sm">{combo}</label>
                            </div>
                        ))}
                    </div>

                </aside>
                
                {/* -------------------- Grid de Productos -------------------- */}
                <section className="w-full md:w-3/4">
                    
                    {/* Selector de Ordenar (TAMAÑO MODIFICADO) */}
<div className="flex justify-end mb-4">
    <select 
        // CLASES MODIFICADAS: text-base, py-2, y px-4
        className="px-4 py-2 border border-gray-700 bg-gray-800 text-white rounded-sm text-base"
    >
        <option value="todos">Todos</option> 
        <option value="novedades">Novedades</option> 
        <option value="combos">Combos</option> 
    </select>
</div>

                    {productos.length === 0 && !error ? (
                         <p className="text-lg text-center py-10">No se encontraron productos.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {productos.map((producto) => (
                                <ProductCard key={producto.id} producto={producto} />
                            ))}
                        </div>
                    )}
                    
                    {/* Botón de Cargar Más Productos (Único botón de acción, se mantiene) */}
                    <div className="text-center mt-10">
                         <button
                            type="button"
                            className="px-8 py-2 border border-gray-400 text-white text-sm uppercase tracking-widest hover:bg-gray-800 transition-all rounded-sm"
                        >
                            Cargar más productos
                        </button>
                    </div>
                </section>
                
            </div>
        </div>
    );
}

// Componente Auxiliar para la Card de Producto (SIMPLIFICADO: Solo Imagen y Nombre)
function ProductCard({ producto }: { producto: Product }) {
    // Desestructuramos el nombre, slug y AHORA el precio
    const { nombre, slug, precio } = producto.attributes; 
    
    return (
        <Link 
            // La tarjeta completa es el link de "Ver Más"
            href={`/producto/${slug}`} 
            className="block group bg-transparent p-1 rounded-xl transition duration-300 ease-in-out border border-gray-700 hover:border-white/50"
        >
            {/* Imagen del Producto */}
            <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-lg bg-gray-900/50">
                <Image 
                    src={producto.attributes.imagen_url} 
                    alt={nombre} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized 
                />
            </div>
            
            {/* Información del Producto: NOMBRE Y PRECIO */}
            <div className="text-left px-2">
                <h4 className="text-lg font-semibold truncate text-white group-hover:text-gray-300 transition-colors">
                    {nombre}
                </h4>
                {/* ¡PRECIO REINTRODUCIDO! */}
                <p className="text-sm font-normal text-gray-400 mt-1">
                    ${precio.toLocaleString('es-AR')} 
                </p>
                {/* Botón de "Ver Más" ELIMINADO (solo se usa el de abajo) */}
            </div>
        </Link>
    );
}
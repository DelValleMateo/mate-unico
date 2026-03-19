import ProductClient from '@/components/ProductClient';
import { Star } from 'lucide-react'; // No te olvides de importar el ícono

// 1. Nueva función para traer las reseñas de este producto
async function getReviews(productId: number) {
    try {
        const res = await fetch(
            `http://localhost:1337/api/resenas?filters[producto][id][$eq]=${productId}&populate=users_permissions_user`,
            { cache: 'no-store' }
        );
        if (!res.ok) return [];
        const { data } = await res.json();
        return data;
    } catch (error) {
        console.error("Error cargando reseñas:", error);
        return [];
    }
}

async function getProduct(slug: string) {
    try {
        const res = await fetch(`http://localhost:1337/api/productos?filters[slug][$eq]=${slug}&populate=*`, {
            cache: 'no-store',
        });
        if (!res.ok) return null;
        const { data } = await res.json();
        return data[0];
    } catch (error) {
        console.error("Error conectando con Strapi:", error);
        return null;
    }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const product = await getProduct(resolvedParams.slug);

    if (!product) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center gap-4">
                <h1 className="text-3xl font-bold">Producto no encontrado</h1>
            </div>
        );
    }

    // 2. Traemos las reseñas usando el ID del producto encontrado
    const reviews = await getReviews(product.id);

    return (
        <div className="bg-[#0f0f0f] min-h-screen">
            {/* Componente original de la foto y el botón de compra */}
            <ProductClient product={product} />

            {/* 3. Bloque de Reseñas (Sección de Servidor) */}
            <section className="max-w-7xl mx-auto px-8 pb-20 mt-10 border-t border-gray-900 pt-16">
                <h3 className="text-white text-3xl font-light uppercase tracking-tighter mb-10">
                    Opiniones de la comunidad
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.length > 0 ? (
                        reviews.map((r: any) => (
                            <div key={r.id} className="bg-[#141414] p-6 rounded-2xl border border-gray-800 shadow-xl transition hover:border-gray-600">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                        {r.attributes.users_permissions_user?.data?.attributes?.username || "Comprador Anónimo"}
                                    </span>
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                className={`w-3 h-3 ${i < r.attributes.estrellas ? "fill-yellow-500 text-yellow-500" : "text-gray-800"}`} 
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-300 italic text-sm leading-relaxed">
                                    "{r.attributes.comentario}"
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-10 border border-dashed border-gray-800 rounded-2xl text-center">
                            <p className="text-gray-500 italic text-sm">Este mate todavía no tiene reseñas. ¡Sé el primero en dejar la tuya!</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
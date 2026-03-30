import ProductClient from '@/components/ProductClient';
import { Star } from 'lucide-react'; // No te olvides de importar el ícono

// 1. Nueva función para traer las reseñas de este producto
async function getReviews(productId: number) {
    try {
        const res = await fetch(
            `http://localhost:1337/api/reviews?filters[producto][id][$eq]=${productId}&populate=users_permissions_user`,
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
            <div className="min-h-screen text-white flex flex-col items-center justify-center gap-4">
                <h1 className="text-3xl font-bold">Producto no encontrado</h1>
            </div>
        );
    }

    // 2. Traemos las reseñas usando el ID del producto encontrado
    const reviews = await getReviews(product.id);

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc: number, r: any) => acc + (r.attributes?.estrellas || r.estrellas || 0), 0) / reviews.length).toFixed(1)
        : 0;

    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r: any) => {
        const rating = Math.round(r.attributes?.estrellas || r.estrellas || 0);
        if (rating >= 1 && rating <= 5) {
            starCounts[rating as keyof typeof starCounts]++;
        }
    });

    return (
        <div className="min-h-screen">
            {/* Componente original de la foto y el botón de compra */}
            <div className="pt-24 pb-4"></div>
            <ProductClient product={product} averageRating={averageRating} reviewCount={reviews.length} />

            {/* 3. Bloque de Reseñas (Sección de Servidor) */}
            <section className="max-w-7xl mx-auto px-6 md:px-8 pb-32 mt-10 pt-16 border-t border-white/10">
                <h3 className="text-white text-3xl font-light uppercase tracking-tighter mb-12">
                    Opiniones de la comunidad Mate Único
                </h3>
                <div className="flex flex-col-reverse md:flex-row gap-16 lg:gap-32">
                    
                    {/* COLUMNA IZQUIERDA: Lista de Reseñas */}
                    <div className="w-full md:w-2/3 flex flex-col gap-12">
                        {reviews.length > 0 ? (
                            reviews.map((r: any) => {
                                const rating = r.attributes?.estrellas || r.estrellas || 0;
                                const dateStr = r.attributes?.createdAt || r.createdAt;
                                const dateFormatted = dateStr 
                                    ? new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                    : '';
                                const username = r.attributes?.users_permissions_user?.data?.attributes?.username || r.users_permissions_user?.username || "Comprador Anónimo";
                                const comment = r.attributes?.comentario || r.comentario;

                                return (
                                    <div key={r.id} className="flex flex-col">
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
                                        {/* Titulo usando el nombre (Mockup) */}
                                        <h4 className="text-white text-lg font-semibold mb-3">
                                            {username}
                                        </h4>
                                        <p className="text-gray-300 text-[13px] leading-relaxed max-w-3xl">
                                            "{comment}"
                                        </p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-10 text-left">
                                <p className="text-gray-500 italic text-sm">Este mate todavía no tiene reseñas. ¡Sé el primero en dejar la tuya!</p>
                            </div>
                        )}
                    </div>

                    {/* COLUMNA DERECHA: Resumen de Reseñas */}
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
                            <p className="text-white text-[15px] font-medium mb-8">
                                {reviews.length} reviews
                            </p>
                            
                            <div className="flex flex-col gap-3">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = starCounts[star as keyof typeof starCounts];
                                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-4 text-[13px] text-white">
                                            <div className="w-3.5 h-3.5 border border-gray-400 rounded-[1px] flex-shrink-0"></div>
                                            <span className="w-12 whitespace-nowrap">{star} stars</span>
                                            <div className="flex-1 h-[2px] bg-gray-800 relative">
                                                <div 
                                                    className="absolute top-0 left-0 h-full bg-gray-400" 
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="w-6 text-right">({count})</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
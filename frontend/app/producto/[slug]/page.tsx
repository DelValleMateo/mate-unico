import ProductClient from '@/components/ProductClient';
import ProductReviews from '@/components/ProductReviews';
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
            {/* 3. Bloque interactivo de Reseñas */}
            <ProductReviews reviews={reviews} averageRating={averageRating} starCounts={starCounts} />
        </div>
    );
}
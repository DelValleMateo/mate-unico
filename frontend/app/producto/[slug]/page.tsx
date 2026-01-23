import ProductClient from '@/components/ProductClient';

// Esta función se ejecuta en el SERVIDOR (Backend del Frontend)
async function getProduct(slug: string) {
    try {
        // Busca en Strapi por el slug
        const res = await fetch(`http://localhost:1337/api/productos?filters[slug][$eq]=${slug}&populate=*`, {
            cache: 'no-store',
        });

        if (!res.ok) return null;

        const { data } = await res.json();
        return data[0]; // Retorna el primer producto encontrado
    } catch (error) {
        console.error("Error conectando con Strapi:", error);
        return null;
    }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    // En Next.js 15 params es una promesa, por seguridad usamos await
    const resolvedParams = await params;
    const product = await getProduct(resolvedParams.slug);

    if (!product) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center gap-4">
                <h1 className="text-3xl font-bold">Producto no encontrado</h1>
                <p className="text-gray-400">Revisa que el SLUG en la URL coincida con el de Strapi.</p>
            </div>
        );
    }
    console.log("📸 DATOS DEL PRODUCTO (Verificar nombre de imagen):", JSON.stringify(product, null, 2));
    // Le pasamos los datos al componente Cliente (que sí tiene useState)
    return <ProductClient product={product} />;
}
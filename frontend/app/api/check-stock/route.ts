import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { items } = await request.json();

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: "Items requeridos" }, { status: 400 });
        }

        const resultados = await Promise.all(
            items.map(async (item: { id: number; cartItemId?: string; documentId?: string; name: string; quantity: number }) => {
                const url = item.documentId
                    ? `http://127.0.0.1:1337/api/productos/${item.documentId}?fields=stock,nombreProducto`
                    : `http://127.0.0.1:1337/api/productos?filters[id][$eq]=${item.id}&fields=stock,nombreProducto`;

                try {
                    const res = await fetch(url, { cache: 'no-store' });
                    if (!res.ok) return { ...item, stockActual: 0, tieneStock: false };

                    const data = await res.json();
                    const productoDB = Array.isArray(data.data) ? data.data[0] : data.data;

                    const stockActual = productoDB?.stock ?? 0;
                    const tieneStock = stockActual >= item.quantity;

                    return {
                        cartItemId: item.cartItemId,
                        id: item.id,
                        documentId: item.documentId,
                        name: item.name,
                        quantity: item.quantity,
                        stockActual,
                        tieneStock,
                    };
                } catch {
                    return { ...item, stockActual: 0, tieneStock: false };
                }
            })
        );

        return NextResponse.json({ resultados });
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Error desconocido";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

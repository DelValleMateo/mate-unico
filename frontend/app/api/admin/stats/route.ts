import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const url = `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337'}/api/ordens?filters[estado][$eq]=pagado&populate[item_ordens][populate][0]=producto&pagination[pageSize]=5000`;
        const res = await fetch(url, { cache: 'no-store' });

        if (!res.ok) {
            throw new Error(`Error fetching from Strapi: ${res.statusText}`);
        }

        const json = await res.json();
        const ordenes = json.data || [];

        let totalCaja = 0;
        const rankingMap = new Map();
        const enviosPendientes = [];

        for (const ordenData of ordenes) {
            const orden = ordenData.attributes || ordenData;
            
            // 1. Cálculo de Caja (Suma de órdenes pagadas)
            totalCaja += Number(orden.total || 0);

            // 2. Listado de Envíos
            // Guardamos las órdenes que tienen código postal (indicando envío físico pendiente)
            if (orden.direccion_envio_cp) {
                enviosPendientes.push({
                    id: ordenData.documentId || ordenData.id,
                    fecha: orden.fecha,
                    cp: orden.direccion_envio_cp,
                    costo_envio: orden.costo_envio,
                    total: orden.total
                });
            }

            // 3. Ranking de ventas
            const items = orden.item_ordens?.data || orden.item_ordens || [];
            for (const itemData of items) {
                const item = itemData.attributes || itemData;
                const prodRef = item.producto?.data || item.producto;
                if (!prodRef) continue;

                const producto = prodRef.attributes || prodRef;
                const nombre = producto.nombreProducto || 'Producto Desconocido';
                const cantidad = Number(item.cantidad || 0);

                rankingMap.set(nombre, (rankingMap.get(nombre) || 0) + cantidad);
            }
        }

        // Ordenamos el ranking para el dashboard de mayor a menor cantidad vendida
        const rankingVentas = Array.from(rankingMap.entries())
            .map(([nombre, cantidad]) => ({ nombre, cantidad }))
            .sort((a, b) => b.cantidad - a.cantidad);

        return NextResponse.json({
            cajaTotal: totalCaja,
            ventasTotales: ordenes.length,
            ranking: rankingVentas,
            enviosPendientes
        });

    } catch (error) {
        console.error("❌ Error CRÍTICO en las métricas de administrador:", error);
        return NextResponse.json({ error: "Error calculando las métricas" }, { status: 500 });
    }
}

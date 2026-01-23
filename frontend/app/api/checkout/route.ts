import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { items } = await request.json();

        // Array para guardar los productos validados y no hacer doble búsqueda
        const productosValidados = [];

        // ============================================================
        // 1. PRIMERA VUELTA: VALIDAR QUE HAYA STOCK DE TODO
        // (No restamos nada todavía por si falla algún producto)
        // ============================================================
        for (const item of items) {
            const idProducto = item.id;

            // Buscamos el producto en Strapi
            const response = await fetch(`http://127.0.0.1:1337/api/productos?filters[id][$eq]=${idProducto}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store'
            });

            if (!response.ok) {
                return NextResponse.json({ error: `Error conectando con Strapi` }, { status: 500 });
            }

            const searchResult = await response.json();

            if (!searchResult.data || searchResult.data.length === 0) {
                return NextResponse.json({ error: `Producto ID ${idProducto} no encontrado.` }, { status: 400 });
            }

            // Datos del producto en Strapi
            const productoStrapi = searchResult.data[0];
            const stockReal = productoStrapi.stock ?? 0;

            // Validación
            if (stockReal < item.quantity) {
                return NextResponse.json(
                    { error: `Sin stock. Solo quedan ${stockReal} de ${item.name}` },
                    { status: 409 }
                );
            }

            // Guardamos el producto y su stock actual para usarlo en el paso 2
            productosValidados.push({
                strapiId: productoStrapi.documentId, // IMPORTANTE: Strapi v5 usa documentId para actualizar
                currentStock: stockReal,
                qtyToBuy: item.quantity,
                name: item.name
            });
        }

        // ============================================================
        // 2. SEGUNDA VUELTA: RESTAR EL STOCK (¡AQUÍ OCURRE LA MAGIA!)
        // ============================================================
        console.log("✅ Stock validado. Procediendo a descontar...");

        for (const prod of productosValidados) {
            const nuevoStock = prod.currentStock - prod.qtyToBuy;

            // Llamada a Strapi para actualizar (PUT)
            const updateResponse = await fetch(`http://127.0.0.1:1337/api/productos/${prod.strapiId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: {
                        stock: nuevoStock
                    }
                })
            });

            if (updateResponse.ok) {
                console.log(`📉 STOCK ACTUALIZADO: ${prod.name} bajó de ${prod.currentStock} a ${nuevoStock}`);
            } else {
                console.error(`⚠️ Error al actualizar stock de ${prod.name}`);
                // Nota: En un sistema real aquí haríamos un "rollback", pero para la demo está bien.
            }
        }

        // ============================================================
        // 3. GENERAR LINK DE MERCADO PAGO
        // ============================================================
        const formattedItems = items.map((item: any) => ({
            id: item.id.toString(),
            title: item.name,
            unit_price: Number(item.price),
            quantity: Number(item.quantity),
            currency_id: "ARS",
        }));

        const preferenceData = {
            items: formattedItems,
            back_urls: {
                // Asegúrate que esta URL sea la correcta de tu NGROK o Localhost
                success: "https://unpercolated-intramarginal-tony.ngrok-free.dev/compra-exitosa",
                failure: "https://unpercolated-intramarginal-tony.ngrok-free.dev/compra-fallida",
                pending: "https://unpercolated-intramarginal-tony.ngrok-free.dev/compra-pendiente"
            },
            auto_return: "approved",
        };

        const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`
            },
            body: JSON.stringify(preferenceData),
        });

        const data = await mpResponse.json();

        if (!mpResponse.ok) {
            return NextResponse.json({ error: "Error al generar pago" }, { status: 400 });
        }

        return NextResponse.json({ url: data.init_point });

    } catch (error: any) {
        console.error("❌ ERROR SERVIDOR:", error);
        return NextResponse.json(
            { error: "Error interno", details: error.message },
            { status: 500 }
        );
    }
}
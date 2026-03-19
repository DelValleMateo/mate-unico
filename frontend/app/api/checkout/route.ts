import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { items, userId } = await request.json();

        // --- 1. CONFIGURACIÓN DE REGLAS ---
        const UMBRAL_ENVIO_GRATIS = 50000;
        const COSTO_ENVIO_FIJO = 5000;
        const PRECIO_POR_LETRA_GRABADO = 500;

        const productosValidados = [];
        let totalProductos = 0;

        // --- 2. VALIDACIÓN DE STOCK Y PRECIOS ---
        for (const item of items) {
            const url = item.documentId
                ? `http://127.0.0.1:1337/api/productos/${item.documentId}`
                : `http://127.0.0.1:1337/api/productos?filters[id][$eq]=${item.id}`;

            const res = await fetch(url, { cache: 'no-store' });

            if (!res.ok) continue;

            const data = await res.json();
            const productoDB = Array.isArray(data.data) ? data.data[0] : data.data;

            if (!productoDB || productoDB.stock < item.quantity) {
                return NextResponse.json({ error: `Sin stock suficiente para: ${item.name}` }, { status: 409 });
            }

            // Cálculo seguro del precio desde el backend
            const precioBaseReal = Number(productoDB.precio);
            const textoGrabado = item.grabado || "";
            const costoGrabado = textoGrabado.length * PRECIO_POR_LETRA_GRABADO;

            const precioFinalValido = precioBaseReal + costoGrabado;
            const nombreReal = productoDB.nombreProducto || item.name;

            productosValidados.push({
                strapiId: productoDB.documentId,
                nombre: nombreReal,
                precio: precioFinalValido,
                cantidad: item.quantity,
                grabado: textoGrabado,
                stockActual: productoDB.stock
            });

            totalProductos += (precioFinalValido * item.quantity);
        }

        // --- 3. CÁLCULO DE ENVÍO ---
        let costoEnvioFinal = 0;
        if (totalProductos < UMBRAL_ENVIO_GRATIS) {
            costoEnvioFinal = COSTO_ENVIO_FIJO;
        }

        const totalA_Pagar = totalProductos + costoEnvioFinal;

        // --- 4. GUARDAR ORDEN EN STRAPI (PostgreSQL) ---
        const datosParaStrapi: Record<string, any> = {
            fecha: new Date().toISOString(),
            total: totalA_Pagar,
            estado: 'pendiente',
            costo_envio: costoEnvioFinal,
        };

        if (userId) {
            datosParaStrapi.users_permissions_user = userId;
        }

        const ordenRes = await fetch(`http://127.0.0.1:1337/api/ordens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: datosParaStrapi
            })
        });

        const ordenData = await ordenRes.json();

        if (!ordenRes.ok) {
            throw new Error(ordenData.error?.message || "Error guardando la orden en Strapi");
        }

        const ordenId = ordenData.data.documentId;

        // --- 5. GUARDAR ITEMS DE LA ORDEN ---
        for (const prod of productosValidados) {
            await fetch(`http://127.0.0.1:1337/api/item-ordens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: {
                        orden: ordenId,
                        producto: prod.strapiId,
                        cantidad: prod.cantidad,
                        precio_unitario: prod.precio,
                        d_grabado: prod.grabado
                    }
                })
            });

            // --- 6. DESCONTAR STOCK ---
            await fetch(`http://127.0.0.1:1337/api/productos/${prod.strapiId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: { stock: prod.stockActual - prod.cantidad }
                })
            });
        }

        // --- 7. MERCADO PAGO ---
        const itemsMP = productosValidados.map(prod => ({
            id: prod.strapiId,
            title: prod.nombre,
            description: prod.grabado ? `Grabado: "${prod.grabado}"` : "Sin grabado",
            unit_price: prod.precio,
            quantity: prod.cantidad,
            currency_id: "ARS",
        }));

        if (costoEnvioFinal > 0) {
            itemsMP.push({
                id: "costo-envio",
                title: "Envío a domicilio",
                description: "Costo de envío fijo",
                unit_price: costoEnvioFinal,
                quantity: 1,
                currency_id: "ARS"
            });
        }

        const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
                items: itemsMP,
                external_reference: ordenId,
                back_urls: {
                    success: "https://unpercolated-intramarginal-tony.ngrok-free.dev/compra-exitosa",
                    failure: "https://unpercolated-intramarginal-tony.ngrok-free.dev/compra-fallida",
                    pending: "https://unpercolated-intramarginal-tony.ngrok-free.dev/compra-pendiente"
                },
                auto_return: "approved",
                // 👇 REEMPLAZAR ESTO CON TU URL DE NGROK DE HOY 👇
                notification_url: "https://unpercolated-intramarginal-tony.ngrok-free.dev/api/webhook",
            }),
        });

        const mpData = await mpRes.json();

        if (!mpRes.ok || !mpData.init_point) {
            console.error("❌ ERROR DE MERCADO PAGO:", JSON.stringify(mpData, null, 2));
            throw new Error(mpData.message || "Mercado Pago rechazó la preferencia");
        }

        return NextResponse.json({ url: mpData.init_point });

    } catch (error) {
        console.error("❌ Error Checkout:", error);
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
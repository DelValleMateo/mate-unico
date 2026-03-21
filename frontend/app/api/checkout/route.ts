import { NextResponse } from "next/server";

const SHIPPING_ZONES = [
    { provincia: "Entre Ríos", cp: "3260", nombre: "Local - Concepción del Uruguay", costo: 1500 },
    { provincia: "CABA", cp: "1000", nombre: "CABA", costo: 4500 },
    { provincia: "Buenos Aires", cp: "1900", nombre: "Buenos Aires", costo: 4500 },
    { provincia: "Santa Fe", cp: "3000", nombre: "Santa Fe", costo: 6500 },
    { provincia: "Misiones", cp: "3300", nombre: "Misiones", costo: 6500 },
    { provincia: "Corrientes", cp: "3400", nombre: "Corrientes", costo: 6500 },
    { provincia: "Chaco", cp: "3500", nombre: "Chaco", costo: 6500 },
    { provincia: "Formosa", cp: "3600", nombre: "Formosa", costo: 6500 },
    { provincia: "Tucumán", cp: "4000", nombre: "Tucumán", costo: 6500 },
    { provincia: "Santiago del Estero", cp: "4200", nombre: "Santiago del Estero", costo: 6500 },
    { provincia: "Salta", cp: "4400", nombre: "Salta", costo: 6500 },
    { provincia: "Jujuy", cp: "4600", nombre: "Jujuy", costo: 6500 },
    { provincia: "Catamarca", cp: "4700", nombre: "Catamarca", costo: 6500 },
    { provincia: "Córdoba", cp: "5000", nombre: "Córdoba", costo: 6500 },
    { provincia: "La Rioja", cp: "5300", nombre: "La Rioja", costo: 6500 },
    { provincia: "San Juan", cp: "5400", nombre: "San Juan", costo: 6500 },
    { provincia: "Mendoza", cp: "5500", nombre: "Mendoza", costo: 6500 },
    { provincia: "San Luis", cp: "5700", nombre: "San Luis", costo: 6500 },
    { provincia: "La Pampa", cp: "6300", nombre: "La Pampa", costo: 6500 },
    { provincia: "Neuquén", cp: "8300", nombre: "Neuquén", costo: 6500 },
    { provincia: "Río Negro", cp: "8500", nombre: "Río Negro", costo: 6500 },
    { provincia: "Chubut", cp: "9103", nombre: "Chubut", costo: 8500 },
    { provincia: "Santa Cruz", cp: "9400", nombre: "Santa Cruz", costo: 8500 },
    { provincia: "Tierra del Fuego", cp: "9410", nombre: "Tierra del Fuego", costo: 8500 }
];

export async function POST(request: Request) {
    try {
        const { items, userId, jwt, cupon, cpEnvio } = await request.json();

        if (!cpEnvio) {
            return NextResponse.json({ error: "Debe seleccionar un destino de envío válido" }, { status: 400 });
        }
        
        const zonaSeleccionada = SHIPPING_ZONES.find(z => z.cp === cpEnvio);
        if (!zonaSeleccionada) {
            return NextResponse.json({ error: "Destino de envío no permitido" }, { status: 400 });
        }

        // --- 1. CONFIGURACIÓN DE REGLAS ---
        const UMBRAL_ENVIO_GRATIS = 50000;
        const PRECIO_POR_LETRA_GRABADO = 500;

        const productosValidados = [];
        let totalProductos = 0;

        let descuentoManual = 0;
        if (cupon && userId && process.env.NEXT_PUBLIC_STRAPI_API_TOKEN) {
            const tokenMaestro = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
            const configStrapi = { headers: { Authorization: `Bearer ${tokenMaestro}` }, cache: 'no-store' as RequestCache };
            
            // 0.1 Verificar que NO haya usado el cupón antes
            const ordenHistRes = await fetch(`http://127.0.0.1:1337/api/ordens?filters[usuario][id][$eq]=${userId}&filters[cupon][$eq]=${cupon.trim()}`, configStrapi);
            const ordenHistData = await ordenHistRes.json();
            if (ordenHistData?.data && ordenHistData.data.length > 0) {
                return NextResponse.json({ error: "Ya utilizaste este cupón en una compra anterior. Quita el cupón para continuar." }, { status: 409 });
            }

            // 0.2 Validar cupón válido
            const resCupon = await fetch(`http://127.0.0.1:1337/api/cupons?filters[codigo][$eq]=${cupon.trim()}`, configStrapi);
            if (resCupon.ok) {
                const dataCupon = await resCupon.json();
                const cuponEncontrado = dataCupon?.data?.[0];
                if (cuponEncontrado) {
                    const cuponDatos = cuponEncontrado.attributes || cuponEncontrado;
                    if (cuponDatos.activo !== false) {
                        descuentoManual = cuponDatos.descuento_porcentaje || cuponDatos.descuento || 0;
                    } else {
                        return NextResponse.json({ error: "El cupón expiró o no está activo." }, { status: 400 });
                    }
                } else {
                    return NextResponse.json({ error: "El cupón aplicado es inválido." }, { status: 404 });
                }
            }
        }

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

            const precioBaseReal = Number(productoDB.precio);
            const textoGrabado = item.grabado || "";
            const costoGrabado = textoGrabado.length * PRECIO_POR_LETRA_GRABADO;

            const precioFinalValido = precioBaseReal + costoGrabado;
            // Aplicamos el descuento real
            const precioConDescuento = descuentoManual > 0 
                ? (precioFinalValido * (1 - descuentoManual / 100))
                : precioFinalValido;

            const nombreReal = productoDB.nombreProducto || item.name;

            productosValidados.push({
                strapiId: productoDB.documentId,
                nombre: nombreReal,
                precio: precioConDescuento,
                cantidad: item.quantity,
                grabado: textoGrabado,
                stockActual: productoDB.stock
            });

            totalProductos += (precioConDescuento * item.quantity);
        }

        // --- 3. CÁLCULO DE ENVÍO DINÁMICO ---
        let costoEnvioFinal = 0;
        if (totalProductos < UMBRAL_ENVIO_GRATIS) {
            costoEnvioFinal = zonaSeleccionada.costo;
        }

        const totalA_Pagar = totalProductos + costoEnvioFinal;

        const strapiHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
        // Usamos el API Token maestro si existe, sino caemos al JWT del usuario
        if (process.env.NEXT_PUBLIC_STRAPI_API_TOKEN) {
            strapiHeaders['Authorization'] = `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`;
        } else if (jwt) {
            strapiHeaders['Authorization'] = `Bearer ${jwt}`;
        }

        // --- 4. GUARDAR ORDEN EN STRAPI (MODO SEGURO SIN RELACIÓN RIESGOSA) ---
        const datosParaStrapi: Record<string, any> = {
            fecha: new Date().toISOString(),
            total: totalA_Pagar,
            estado: 'pendiente',
            costo_envio: costoEnvioFinal,
            direccion_envio_cp: zonaSeleccionada.cp,
            cupon: cupon ? cupon.trim() : null
        };

        if (userId) {
            datosParaStrapi.usuario = userId;
        }

        let ordenRes = await fetch(`http://127.0.0.1:1337/api/ordens`, {
            method: 'POST',
            headers: strapiHeaders,
            body: JSON.stringify({
                data: datosParaStrapi
            })
        });

        // 🛑 NUEVO: Si el JWT expiró (o es erróneo), la API tirará 401 o 403. 
        // Desactivamos la autenticación forzada y dejamos crear la orden como INVITADO para que el cliente no pierda la compra.
        if (!ordenRes.ok && strapiHeaders['Authorization']) {
            delete strapiHeaders['Authorization'];
            delete datosParaStrapi.usuario; // public user can't link to a user relation
            ordenRes = await fetch(`http://127.0.0.1:1337/api/ordens`, {
                method: 'POST',
                headers: strapiHeaders,
                body: JSON.stringify({ data: datosParaStrapi })
            });
        }

        const ordenData = await ordenRes.json();

        if (!ordenRes.ok) {
            throw new Error(ordenData.error?.message || "Error guardando la orden en Strapi");
        }

        const ordenId = ordenData.data.documentId;

        // --- 4.5 ENLACE DE USUARIO COMPLETADO EN CREACION ---

        // --- 5. GUARDAR ITEMS DE LA ORDEN ---
        for (const prod of productosValidados) {
            await fetch(`http://127.0.0.1:1337/api/item-ordens`, {
                method: 'POST',
                headers: strapiHeaders,
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
                headers: strapiHeaders,
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
                title: `Envío a ${zonaSeleccionada.nombre} (CP: ${zonaSeleccionada.cp})`,
                description: "Costo de logística",
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
                // 👇 RECORDATORIO NGROK 👇
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
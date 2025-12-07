import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { items } = await request.json();

        // 1. Formateamos los productos
        const formattedItems = items.map((item: any) => ({
            id: item.id.toString(),
            title: item.name,
            unit_price: Number(item.price),
            quantity: Number(item.quantity),
            currency_id: "ARS",
        }));

        // 2. Definimos el cuerpo (USAMOS GOOGLE PARA PROBAR)
        // Mercado Pago a veces rechaza localhost:3001 en modo estricto
        const body = {
            items: formattedItems,
            back_urls: {
                success: "https://www.google.com",
                failure: "https://www.google.com",
                pending: "https://www.google.com",
            },
            auto_return: "approved",
        };

        // CHIVATO: Muestra en la terminal QUÉ estamos enviando
        console.log("📤 ENVIANDO A MP:", JSON.stringify(body, null, 2));

        // 3. Hacemos el POST directo
        const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`
            },
            body: JSON.stringify(body),
        });

        const data = await mpResponse.json();

        if (!mpResponse.ok) {
            console.error("❌ RESPUESTA DE MP:", data);
            return NextResponse.json({ error: "Error en MP", details: data }, { status: 500 });
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
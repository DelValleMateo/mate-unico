import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const authHeader = request.headers.get('Authorization');

    if (!userId || !authHeader) {
        return NextResponse.json({ error: "Parámetros faltantes" }, { status: 400 });
    }

    // Validamos el JWT del cliente contra Strapi para garantizar seguridad
    const userRes = await fetch("http://127.0.0.1:1337/api/users/me", {
        headers: { Authorization: authHeader },
        cache: 'no-store'
    });

    if (!userRes.ok) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const user = await userRes.json();
    
    if (user.id.toString() !== userId) {
        return NextResponse.json({ error: "Forbidden: No puedes ver órdenes de otro usuario" }, { status: 403 });
    }

    // El usuario es válido. Usamos el Token Maestro para saltarnos los conflictos de roles de Strapi
    const tokenMaestro = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    
    const url = `http://127.0.0.1:1337/api/ordens?filters[usuario][id][$eq]=${userId}&populate[item_ordens][populate]=producto&sort=id:desc`;
    try {
        const ordenRes = await fetch(url, {
            headers: { Authorization: `Bearer ${tokenMaestro}` },
            cache: 'no-store'
        });
        
        const data = await ordenRes.json();
        return NextResponse.json(data);
    } catch (e) {
        console.error("Error al buscar órdenes:", e);
        return NextResponse.json({ error: "Fallo interno" }, { status: 500 });
    }
}

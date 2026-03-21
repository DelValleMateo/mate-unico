import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { cupon, userId, authHeader } = await request.json();

        if (!cupon || !userId || !authHeader) {
            return NextResponse.json({ valid: false, message: "Debes iniciar sesión para usar cupones" }, { status: 400 });
        }

        // Validar seguridad de sesión contra Strapi
        const userRes = await fetch("http://127.0.0.1:1337/api/users/me", {
            headers: { Authorization: authHeader },
            cache: 'no-store'
        });

        if (!userRes.ok) {
            return NextResponse.json({ valid: false, message: "Sesión inválida" }, { status: 401 });
        }
        const user = await userRes.json();
        if (user.id.toString() !== userId.toString()) {
            return NextResponse.json({ valid: false, message: "No autorizado" }, { status: 403 });
        }

        const tokenMaestro = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
        const configStrapi = {
            headers: { Authorization: `Bearer ${tokenMaestro}` },
            cache: 'no-store' as RequestCache
        };

        // 1. Verificamos si existe el cupón activo
        const cuponRes = await fetch(`http://127.0.0.1:1337/api/cupons?filters[codigo][$eq]=${cupon.trim()}`, configStrapi);
        const cuponData = await cuponRes.json();
        const cuponEncontrado = cuponData?.data?.[0];

        if (!cuponEncontrado) {
            return NextResponse.json({ valid: false, message: "Cupón inválido" }, { status: 404 });
        }

        const cuponAttrs = cuponEncontrado.attributes || cuponEncontrado;
        if (cuponAttrs.activo === false) {
            return NextResponse.json({ valid: false, message: "El cupón ha expirado o no está activo" }, { status: 400 });
        }

        // 2. Verificamos si el usuario ya lo usó
        const ordenHistRes = await fetch(`http://127.0.0.1:1337/api/ordens?filters[usuario][id][$eq]=${userId}&filters[cupon][$eq]=${cupon.trim()}`, configStrapi);
        const ordenHistData = await ordenHistRes.json();

        if (ordenHistData?.data && ordenHistData.data.length > 0) {
            return NextResponse.json({ valid: false, message: "Ya utilizaste este cupón en una compra anterior" }, { status: 409 });
        }

        const porcentaje = cuponAttrs.descuento_porcentaje || cuponAttrs.descuento || 0;
        return NextResponse.json({ valid: true, porcentaje, message: `Descuento del ${porcentaje}% aplicado` });

    } catch (error) {
        console.error("Error al validar cupón:", error);
        return NextResponse.json({ valid: false, message: "Error interno del servidor" }, { status: 500 });
    }
}

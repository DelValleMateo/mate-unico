import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("🔔 [WEBHOOK] ¡Mercado Pago tocó la puerta!", body.type, body.action);

        if (body.type === 'payment' || body.action === 'payment.created' || body.action === 'payment.updated') {
            const paymentId = body.data?.id;

            if (paymentId) {
                const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                    headers: { "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}` }
                });

                const paymentData = await mpResponse.json();

                if (paymentData.status === 'approved') {
                    const ordenIdStrapi = paymentData.external_reference;

                    if (ordenIdStrapi) {
                        // Verificamos estado actual para NO descontar stock múltiples veces por reintentos de MP
                        const checkOrdenRes = await fetch(`http://127.0.0.1:1337/api/ordens/${ordenIdStrapi}`, { cache: 'no-store' });
                        if (checkOrdenRes.ok) {
                            const ordenPrevia = await checkOrdenRes.json();
                            const estadoActual = ordenPrevia?.data?.attributes?.estado || ordenPrevia?.data?.estado;
                            
                            if (estadoActual === 'pagado') {
                                console.log(`👉 La orden ${ordenIdStrapi} ya estaba PAGADA. Ignorando webhook repetido para no descontar stock 2 veces.`);
                                return NextResponse.json({ success: true, message: "Ignorado por repetido" }, { status: 200 });
                            }
                        }

                        console.log(`💰 ¡PAGO APROBADO NUEVO! Actualizando orden ${ordenIdStrapi}...`);

                        // 1. Actualizamos Strapi
                        const strapiRes = await fetch(`http://127.0.0.1:1337/api/ordens/${ordenIdStrapi}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ data: { estado: 'pagado' } })
                        });

                        if (!strapiRes.ok) {
                            console.error("❌ Error al actualizar en Strapi");
                        } else {
                            console.log(`✅ Orden ${ordenIdStrapi} marcada como PAGADA.`);

                            // =========================================================
                            // 📉 NUEVO: DESCONTAR STOCK Y OBTENER DETALLE PARA EMAIL
                            // =========================================================
                            let detalleProductosHTML = "";
                            try {
                                const ordenConItemsRes = await fetch(`http://127.0.0.1:1337/api/ordens/${ordenIdStrapi}?populate[item_ordens][populate][0]=producto`, { cache: 'no-store' });
                                if (ordenConItemsRes.ok) {
                                    const ordenParseada = await ordenConItemsRes.json();
                                    const items = ordenParseada?.data?.item_ordens || ordenParseada?.data?.attributes?.item_ordens?.data || [];
                                    
                                    for (const item of items) {
                                        const itemData = item.attributes || item; // Maneja v4 o v5
                                        const productoRelacionado = itemData.producto?.data || itemData.producto;
                                        
                                        if (productoRelacionado) {
                                            const prodID = productoRelacionado.documentId || productoRelacionado.id;
                                            const prodAttr = productoRelacionado.attributes || productoRelacionado;
                                            
                                            detalleProductosHTML += `
                                                <li style="margin-bottom: 8px;">
                                                    <strong>${itemData.cantidad}x ${prodAttr.nombreProducto || 'Producto'}</strong>
                                                </li>`;

                                            // Descontar Stock
                                            const stockActual = prodAttr.stock || 0;
                                            const nuevoStock = Math.max(0, stockActual - itemData.cantidad);
                                            
                                            // Realizamos el PUT al producto para actualizar el stock
                                            await fetch(`http://127.0.0.1:1337/api/productos/${prodID}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ data: { stock: nuevoStock } })
                                            }).catch(err => console.error(`Error descontando stock de ${prodID}:`, err));
                                        }
                                    }
                                }
                            } catch (errorStock) {
                                console.error("❌ Error al descontar stock o armar detalle:", errorStock);
                            }

                            // =========================================================
                            // 📧 2. ENVÍO DE EMAIL AUTOMÁTICO CON RESEND
                            // =========================================================
                            try {
                                if (!process.env.RESEND_API_KEY) {
                                    console.warn("⚠️ No se configuró RESEND_API_KEY en .env. Saltando envío de email.");
                                } else {
                                    const resend = new Resend(process.env.RESEND_API_KEY);
                                    const { data: emailData, error: emailError } = await resend.emails.send({
                                        from: "onboarding@resend.dev", // En modo prueba DEBE ser exactamente este string sin nombre extra
                                        to: ["mateodelvalle100@gmail.com"], // 👈 Removí la variable de entorno, ahora va estrictamente a tu dirección verificada
                                        subject: "¡Pago exitoso! Preparando tus mates 🧉",
                                        html: `
                                        <div style="background-color: #f3f4f6; padding: 40px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                                            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                                                
                                                <div style="background-color: #1f2937; padding: 30px 20px; text-align: center;">
                                                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">MateÚnico 🧉</h1>
                                                </div>

                                                <div style="padding: 40px 30px;">
                                                    <h2 style="color: #111827; font-size: 24px; margin-top: 0; text-align: center;">¡Tu compra fue un éxito! 🎉</h2>
                                                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
                                                        Ya recibimos tu pago y empezamos a preparar tu pedido con mucho cuidado y dedicación.
                                                    </p>

                                                    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 30px 0;">
                                                        <h3 style="margin-top: 0; color: #374151; font-size: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; text-transform: uppercase;">Resumen de la Orden</h3>
                                                        <p style="margin: 12px 0; color: #4b5563; font-size: 16px;">
                                                            <strong>N° de Pedido:</strong> <span style="color: #111827;">#${ordenIdStrapi.slice(-8).toUpperCase()}</span>
                                                        </p>
                                                        <p style="margin: 12px 0 0 0; color: #4b5563; font-size: 16px;">
                                                            <strong>Total Abonado:</strong> <span style="color: #16a34a; font-weight: bold; font-size: 18px;">$${Number(paymentData.transaction_amount).toLocaleString('es-AR')}</span>
                                                        </p>

                                                        <h4 style="margin-top: 20px; margin-bottom: 10px; color: #374151; font-size: 14px;">Detalle de productos:</h4>
                                                        <ul style="color: #4b5563; font-size: 15px; padding-left: 20px; margin-top: 0;">
                                                            ${detalleProductosHTML || '<li>Tus productos seleccionados</li>'}
                                                        </ul>
                                                    </div>

                                                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
                                                        Si solicitaste un <strong>grabado personalizado</strong>, nuestros artesanos ya están trabajando en los detalles para que quede perfecto.
                                                    </p>

                                                    <div style="text-align: center; margin-top: 40px;">
                                                        <a href="http://localhost:3000" style="background-color: #1f2937; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; display: inline-block;">Volver a la tienda</a>
                                                    </div>
                                                </div>

                                                <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                                                    <p style="color: #9ca3af; font-size: 14px; margin: 0;">Gracias por confiar en la calidad de MateÚnico.</p>
                                                    <p style="color: #d1d5db; font-size: 12px; margin-top: 10px;">Concordia 1175, Concepción del Uruguay</p>
                                                </div>
                                            </div>
                                        </div>
                                    `
                                    });

                                    if (emailError) {
                                        console.error("❌ Error enviando el email Resend:", emailError);
                                    } else {
                                        console.log("📧 ¡Email de confirmación enviado con éxito a través de Resend:", emailData);
                                    }
                                }

                            } catch (emailError) {
                                console.error("❌ Excepción enviando el email:", emailError);
                            }
                        }
                    }
                }
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("❌ Error CRÍTICO en el Webhook:", error);
        return NextResponse.json({ error: "Error procesando el webhook" }, { status: 500 });
    }
}
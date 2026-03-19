import { NextResponse } from "next/server";
import nodemailer from "nodemailer"; // 👈 Importamos la librería de correos

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
                        console.log(`💰 ¡PAGO APROBADO! Actualizando orden ${ordenIdStrapi}...`);

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
                            // 📧 2. ENVÍO DE EMAIL AUTOMÁTICO
                            // =========================================================
                            try {
                                const transporter = nodemailer.createTransport({
                                    service: "gmail",
                                    auth: {
                                        user: process.env.EMAIL_USER,
                                        pass: process.env.EMAIL_PASS,
                                    },
                                    tls: {
                                        rejectUnauthorized: false
                                    }
                                });

                                const mailOptions = {
                                    from: `"MateÚnico" <${process.env.EMAIL_USER}>`,
                                    to: process.env.EMAIL_USER, // 👈 Nos lo mandamos a nosotros mismos para probar
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
                                                    <h3 style="margin-top: 0; color: #374151; font-size: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Resumen de la Orden</h3>
                                                    <p style="margin: 12px 0; color: #4b5563; font-size: 16px;">
                                                        <strong>N° de Pedido:</strong> <span style="color: #111827;">#${ordenIdStrapi.slice(-8).toUpperCase()}</span>
                                                    </p>
                                                    <p style="margin: 12px 0 0 0; color: #4b5563; font-size: 16px;">
                                                        <strong>Total Abonado:</strong> <span style="color: #16a34a; font-weight: bold; font-size: 18px;">$${Number(paymentData.transaction_amount).toLocaleString('es-AR')}</span>
                                                    </p>
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
                                `,
                                };

                                await transporter.sendMail(mailOptions);
                                console.log("📧 ¡Email de confirmación enviado con éxito!");

                            } catch (emailError) {
                                console.error("❌ Error enviando el email:", emailError);
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
const token = "0ec60aff52d09fa044d5f33dc15bea87ea714d8fb2470c37027a845b498540ec0032dfc88dd0c346a3f3c4a8d03378ac4088cf81f8a33297d2becf2fa45a848c5ab87e01e6745984a782dd7662af732c90fed996f1af2dd23406ea0eb97f74494af36d0cfc38e9026c474988c1fbe6a40f978f988a2a59de46d20291b830e643";

async function testOrder() {
    console.log("Testeando Orden POST con token...");
    const res = await fetch('http://127.0.0.1:1337/api/ordens', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            data: {
                fecha: new Date().toISOString(),
                total: 1000,
                estado: 'pendiente',
                usuario: 1, // ID del usuario de prueba (probablemente 1 o 2)
                direccion_envio_cp: "1000"
            }
        })
    });
    const data = await res.json();
    console.log("POST Orden Status:", res.status);
    console.log("POST Orden Response:", JSON.stringify(data, null, 2));
}

async function testReview() {
    console.log("\nTesteando Review POST con token...");
    try {
        const res = await fetch('http://127.0.0.1:1337/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                data: {
                    estrellas: 5,
                    comentario: "Test",
                    users_permissions_user: { connect: [1] },
                    producto: { connect: [1] } // Asegurarnos de usar algo válido
                }
            })
        });
        const data = await res.json();
        console.log("POST Review Status:", res.status);
        console.log("POST Review Response:", JSON.stringify(data, null, 2));
    } catch(err) {
        console.error("Test Review Fetch error:", err);
    }
}

async function run() {
    await testOrder();
    await testReview();
}

run();

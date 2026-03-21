const fs = require('fs');
const dotenv = require('dotenv');

// Lee el archivo .env.local de la ruta del frontend
const envConfig = dotenv.parse(fs.readFileSync('e:\\mate-unico\\frontend\\.env.local'));
const token = envConfig.NEXT_PUBLIC_STRAPI_API_TOKEN;

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
                usuario: 1 // o cambiar si usamos connect
            }
        })
    });
    const data = await res.json();
    console.log("POST Orden Status:", res.status);
    console.log("POST Orden Response:", JSON.stringify(data, null, 2));
}

async function testReview() {
    console.log("\nTesteando Review POST con token...");
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
}

async function run() {
    await testOrder();
    await testReview();
}

run();

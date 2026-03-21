const token = "03b6ca4f17c79f1becf3f51af26d37cf3c1add5cb32db9c085e0f5dc6ade8d3215df0fa3801bd44e0641d9e684e6c615698e359fb315aa5c1f7d8b871681270fdb54a01caba2205e73680a01e78d8fd85d9135cac12ca1c630cd50175130c0820d4dfef43be067346ab61c95511616602aa4babd040cdfe8e649abff6ea37ef6";

async function checkOrders() {
    console.log("Chequeando órdenes recientes...");
    try {
        const res = await fetch('http://127.0.0.1:1337/api/ordens?populate=*&sort=createdAt:desc&pagination[limit]=2', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();
        const fs = require('fs');
        fs.writeFileSync('output.json', JSON.stringify(data, null, 2));
        console.log("Órdenes escritas en output.json");
    } catch(err) {
        console.error(err);
    }
}

checkOrders();

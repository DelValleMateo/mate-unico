const token = "03b6ca4f17c79f1becf3f51af26d37cf3c1add5cb32db9c085e0f5dc6ade8d3215df0fa3801bd44e0641d9e684e6c615698e359fb315aa5c1f7d8b871681270fdb54a01caba2205e73680a01e78d8fd85d9135cac12ca1c630cd50175130c0820d4dfef43be067346ab61c95511616602aa4babd040cdfe8e649abff6ea37ef6";

async function run() {
    console.log("Testeando sintaxis: filters[usuario][id][$eq]=2");
    let res1 = await fetch(`http://127.0.0.1:1337/api/ordens?filters[usuario][id][$eq]=2`, { headers: { Authorization: `Bearer ${token}` } });
    let j1 = await res1.json();
    console.log("Result 1 length:", j1.data ? j1.data.length : j1);

    console.log("Testeando sintaxis: filters[usuario][$eq]=2");
    let res2 = await fetch(`http://127.0.0.1:1337/api/ordens?filters[usuario][$eq]=2`, { headers: { Authorization: `Bearer ${token}` } });
    let j2 = await res2.json();
    console.log("Result 2 length:", j2.data ? j2.data.length : j2);
}

run();

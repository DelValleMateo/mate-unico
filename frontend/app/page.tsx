import Image from "next/image";

// Función para obtener los datos de Strapi
async function getProductos() {
  // Usamos la variable de entorno o localhost por defecto
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337"

  // ¡Importante! El token que generaste en el paso anterior
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

  const res = await fetch(`${STRAPI_URL}/api/productos?populate=*`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store", // Para que no guarde caché en desarrollo
  });

  if (!res.ok) {
    throw new Error("Error al conectar con Strapi");
  }

  const { data } = await res.json();
  return data;
}

export default async function CatalogoPage() {
  const productos = await getProductos();
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Catálogo MateÚnico</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {productos.map((producto: any) => {
          // Extraemos la URL de la imagen si existe
          const imagenUrl = producto.imagenes?.[0]?.url
            ? `${STRAPI_URL}${producto.imagenes[0].url}`
            : "/placeholder.png";

          return (
            <div key={producto.id} className="border rounded-lg p-4 shadow-md hover:shadow-lg transition">
              <div className="relative w-full h-64 mb-4">
                <Image
                  src={imagenUrl}
                  alt={producto.nombreProducto}
                  fill
                  className="object-cover rounded"
                  unoptimized // <--- ¡AGREGA ESTO!
                />
              </div>
              <h2 className="text-xl font-semibold">{producto.nombreProducto}</h2>
              <p className="text-gray-600 text-sm mb-2">{producto.tp_producto}</p>
              <p className="text-gray-800 line-clamp-2">{producto.descripcion}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-2xl font-bold text-green-700">${producto.precio}</span>
                <button className="bg-black text-white px-4 py-2 rounded">
                  Ver Detalle
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
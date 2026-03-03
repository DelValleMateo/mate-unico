"use client";
import React, { useState, useEffect } from 'react';

// Interface para que TypeScript reconozca la estructura de Strapi
interface Order {
  id: number;
  attributes: {
    item_name: string;
    total: number;
    estado: string;
    fecha?: string;
  };
}

const PerfilPage = () => {
  const [tabActiva, setTabActiva] = useState('informacion');
  const [compras, setCompras] = useState<Order[]>([]);
  const [cargando, setCargando] = useState(false);

  // Datos mock del usuario para el diseño
  const usuario = {
    nombre: "Luca Saboredo",
    email: "luca.saboredo@email.com",
    telefono: "+54 3442 000000",
    id: "1212312313"
  };

  useEffect(() => {
    const obtenerHistorial = async () => {
      const token = localStorage.getItem('token'); 
      if (!token) {
        setCompras([]);
        return;
      }

      setCargando(true);
      try {
        const res = await fetch('http://localhost:1337/api/orders?populate=*', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const { data } = await res.json();
        if (data) setCompras(data);
      } catch (error) {
        console.error("Error al conectar con Strapi:", error);
      } finally {
        setCargando(false);
      }
    };

    if (tabActiva === 'compras') {
      obtenerHistorial();
    }
  }, [tabActiva]);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token'); // Borra la llave del navegador
    window.location.reload();        // Recarga para limpiar el estado
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative">
      {/* Fondo de cuero */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none bg-[url('/textura-cuero.jpg')] bg-cover bg-center"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-8 py-12">
        
        {/* Encabezado */}
        <section className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight">{usuario.nombre}</h1>
          <p className="text-gray-500 text-sm font-mono mt-1">User ID: {usuario.id}</p>
          <div className="w-full h-[1px] bg-gray-800 mt-4 mb-4"></div>
        </section>

        {/* Navegación */}
        <div className="flex gap-10 mb-8 border-b border-gray-900 text-sm font-medium">
          <button 
            onClick={() => setTabActiva('informacion')}
            className={`pb-3 transition ${tabActiva === 'informacion' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-white'}`}
          >
            Información del Usuario
          </button>
          <button 
            onClick={() => setTabActiva('compras')}
            className={`pb-3 transition ${tabActiva === 'compras' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-white'}`}
          >
            Historial de Compras
          </button>
        </div>

        {/* Contenido */}
        <section className="min-h-[400px]">
          {tabActiva === 'informacion' ? (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-3xl font-light mb-6">Datos Personales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div>
                  <p className="text-gray-500 uppercase tracking-widest text-[10px] mb-1 font-bold">Email de contacto</p>
                  <p className="text-lg border-b border-gray-900 pb-2">{usuario.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase tracking-widest text-[10px] mb-1 font-bold">Teléfono</p>
                  <p className="text-lg border-b border-gray-900 pb-2">{usuario.telefono}</p>
                </div>
              </div>

              {/* BOTÓN DE LOGOUT */}
              <button 
                onClick={handleLogout}
                className="mt-12 px-8 py-2 border border-red-900/50 text-red-500 rounded-full text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all font-bold"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-3xl font-light mb-6">Mis Pedidos</h2>
              <div className="w-full h-[1px] bg-gray-800 mb-10"></div>
              
              {cargando ? (
                <p className="text-gray-500 italic">Cargando historial...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {compras.length > 0 ? (
                    compras.map((order) => (
                      <div key={order.id} className="bg-[#111] rounded-xl border border-gray-800 p-6 hover:border-gray-600 transition shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] bg-gray-800 px-2 py-1 rounded text-gray-400 font-mono">#{order.id}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${order.attributes.estado === 'Entregado' ? 'bg-green-900/30 text-green-500' : 'bg-yellow-900/30 text-yellow-500'}`}>
                            {order.attributes.estado}
                          </span>
                        </div>
                        <h3 className="text-white font-bold uppercase tracking-tighter text-lg mb-1">{order.attributes.item_name}</h3>
                        <p className="text-green-500 font-mono text-xl">${order.attributes.total}</p>
                        <p className="text-gray-600 text-[10px] mt-4 uppercase tracking-widest">FECHA: {order.attributes.fecha || "Reciente"}</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-900 rounded-2xl">
                      <p className="text-gray-600 italic font-light">No hay pedidos registrados.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PerfilPage;
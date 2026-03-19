"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext'; 

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
  const { user, jwt, logout } = useAuth(); 
  const [tabActiva, setTabActiva] = useState('informacion');
  const [compras, setCompras] = useState<Order[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const obtenerHistorial = async () => {
      if (!user || !jwt) return;

      setCargando(true);
      try {
        const url = `http://localhost:1337/api/orders?filters[users_permissions_user][id][$eq]=${user.id}&populate=*`;
        
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${jwt}`
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

    if (tabActiva === 'compras' && user) {
      obtenerHistorial();
    }
  }, [tabActiva, user, jwt]);

  // Si no hay usuario, mostramos un aviso simple
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-500 italic uppercase tracking-widest text-xs">Iniciá sesión para ver tu perfil</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none bg-[url('/textura-cuero.jpg')] bg-cover bg-center"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-8 py-12">
        
        <section className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight uppercase">{user.username}</h1>
          <p className="text-gray-500 text-sm font-mono mt-1">ID: {user.id}</p>
          <div className="w-full h-[1px] bg-gray-800 mt-4 mb-4"></div>
        </section>

        <div className="flex gap-10 mb-8 border-b border-gray-900 text-sm font-medium">
          <button onClick={() => setTabActiva('informacion')} className={`pb-3 transition ${tabActiva === 'informacion' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-white'}`}>
            Información
          </button>
          <button onClick={() => setTabActiva('compras')} className={`pb-3 transition ${tabActiva === 'compras' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-white'}`}>
            Historial
          </button>
        </div>

        <section className="min-h-[400px]">
          {tabActiva === 'informacion' ? (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-3xl font-light mb-6 uppercase tracking-tighter">Datos de Cuenta</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div>
                  <p className="text-gray-500 uppercase tracking-widest text-[10px] mb-1 font-bold">Email</p>
                  <p className="text-lg border-b border-gray-900 pb-2">{user.email}</p>
                </div>
              </div>

              <button 
                onClick={logout}
                className="mt-12 px-8 py-2 border border-red-900/50 text-red-500 rounded-full text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all font-bold"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-3xl font-light mb-6 uppercase tracking-tighter">Mis Pedidos</h2>
              {cargando ? (
                <p className="text-gray-500 italic">Consultando base de datos...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {compras.length > 0 ? (
                    compras.map((order) => (
                      <div key={order.id} className="bg-[#111] rounded-xl border border-gray-800 p-6 hover:border-gray-500 transition shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] bg-gray-800 px-2 py-1 rounded text-gray-400">#{order.id}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${order.attributes.estado === 'Entregado' ? 'bg-green-900/30 text-green-500' : 'bg-yellow-900/30 text-yellow-500'}`}>
                            {order.attributes.estado}
                          </span>
                        </div>
                        <h3 className="text-white font-bold uppercase tracking-tighter text-lg mb-1">{order.attributes.item_name}</h3>
                        <p className="text-green-500 font-mono text-xl">${order.attributes.total}</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center border border-dashed border-gray-900 rounded-2xl">
                      <p className="text-gray-600 italic">No hay órdenes registradas.</p>
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
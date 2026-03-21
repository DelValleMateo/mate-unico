"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; 

interface Order {
  id: number;
  attributes: {
    total: number;
    estado: string;
    fecha?: string;
    item_ordens?: {
      data: any[];
    };
  };
}

const PerfilPage = () => {
  const { user, jwt, logout } = useAuth(); 
  const [tabActiva, setTabActiva] = useState('informacion');
  const [compras, setCompras] = useState<Order[]>([]);
  const [cargando, setCargando] = useState(false);
  const [perfil, setPerfil] = useState<any>(null);

  // Estados de Edición de Perfil
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    pais: '',
    provincia: '',
    ciudad: '',
    codigo_postal: ''
  });

  // Estados Modal de Reseña
  const [reviewingProduct, setReviewingProduct] = useState<{ id: string; name: string } | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const obtenerHistorial = async () => {
      if (!user || !jwt) return;

      setCargando(true);
      try {
        const url = `/api/orders?userId=${user.id}`;
        
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

    const obtenerDatosUsuario = async () => {
      if (!user || !jwt) return;
      try {
        const res = await fetch('http://localhost:1337/api/users/me', {
            headers: { 'Authorization': `Bearer ${jwt}` }
        });
        if (res.ok) {
            const data = await res.json();
            setPerfil(data);
            setFormData({
                nombre: data.nombre || '',
                apellido: data.apellido || '',
                pais: data.pais || '',
                provincia: data.provincia || '',
                ciudad: data.ciudad || '',
                codigo_postal: data.codigo_postal || ''
            });
        }
      } catch (e) {
          console.error(e);
      }
    };

    if (user && jwt) {
        obtenerDatosUsuario();
    }

    if (tabActiva === 'compras' && user) {
      obtenerHistorial();
    }
  }, [tabActiva, user, jwt]);

  const submitReview = async () => {
    if (rating === 0) return alert("Seleccioná una calificación.");
    if (!reviewingProduct) return;
    
    setSubmittingReview(true);
    const reviewData = {
        data: {
            estrellas: rating,
            comentario: comment,
            users_permissions_user: { connect: [user?.id] },
            producto: { connect: [reviewingProduct.id] },
        }
    };

    try {
        const res = await fetch('http://localhost:1337/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify(reviewData)
        });
        if (res.ok) {
            alert("¡Reseña guardada con éxito!");
            setReviewingProduct(null);
            setRating(0);
            setComment("");
        } else {
            alert("Error al guardar la reseña. Chequeá los permisos de tu Strapi.");
        }
    } catch {
        alert("Error de conexión.");
    } finally {
        setSubmittingReview(false);
    }
  };

  const handleGuardarPerfil = async () => {
    if (!user) return;
    setGuardando(true);
    try {
        const res = await fetch(`http://localhost:1337/api/users/${user.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify(formData)
        });
        
        if (res.ok) {
            const dataActualizada = await res.json();
            setPerfil(dataActualizada);
            setEditando(false);
            // Optionally dispatch update event to refetch 
        } else {
            alert("Error al guardar en el servidor. Revisa los permisos de rol de 'User' -> 'update'.");
        }
    } catch (e) {
        console.error(e);
        alert("Fallo de conexión.");
    } finally {
        setGuardando(false);
    }
  };

  // Si no hay usuario, mostramos un aviso simple
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-500 italic uppercase tracking-widest text-xs">Iniciá sesión para ver tu perfil</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative font-sans">
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        
        {/* Header con línea vertical */}
        <section className="mb-12 flex">
          <div className="pr-12 md:pr-24 border-r border-gray-600/50">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{perfil?.nombre && perfil?.apellido ? `${perfil.nombre} ${perfil.apellido}` : user.username}</h1>
            <p className="text-gray-400 text-xs mt-2 tracking-wider">User ID: {user.id}</p>
            <div className="w-full h-[1px] bg-gray-600/50 mt-5 mb-5"></div>
            <p className="text-gray-400 text-xs tracking-wide max-w-xs leading-relaxed">Introduction</p>
          </div>
        </section>

        {/* Tabs Menu */}
        <div className="flex gap-8 mb-10 text-xs md:text-sm font-medium tracking-wide">
          <button 
            onClick={() => setTabActiva('informacion')} 
            className={`pb-2 transition-all ${tabActiva === 'informacion' ? 'text-white border-b border-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Información del Usuario
          </button>
          <button 
            onClick={() => setTabActiva('compras')} 
            className={`pb-2 transition-all ${tabActiva === 'compras' ? 'text-white border-b border-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Historial de Compras
          </button>
        </div>

        {/* Contenedor Principal */}
        <section className="min-h-[400px]">
          {tabActiva === 'informacion' ? (
            <div className="animate-in fade-in duration-500 max-w-2xl">
              <h2 className="text-2xl font-medium mb-4 tracking-wide">Información Del Usuario</h2>
              <div className="w-full h-[1px] bg-gray-700/50 mb-8"></div>
              
              <div className="grid grid-cols-[140px_1fr] md:grid-cols-[180px_1fr] gap-y-8 text-sm md:text-base items-center">
                <div className="font-semibold text-gray-200">Email</div>
                <div className="text-gray-400">{user.email}</div>

                <div className="font-semibold text-gray-200">Nombre</div>
                <div className="text-gray-400">
                  {editando ? (
                    <input type="text" className="bg-[#1a1a1a] border border-gray-700 rounded focus:border-white focus:outline-none w-full p-2" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                  ) : (perfil?.nombre || user.username)}
                </div>

                <div className="font-semibold text-gray-200">Apellido</div>
                <div className="text-gray-400">
                  {editando ? (
                    <input type="text" className="bg-[#1a1a1a] border border-gray-700 rounded focus:border-white focus:outline-none w-full p-2" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} />
                  ) : (perfil?.apellido || '-')}
                </div>

                <div className="font-semibold text-gray-200">País</div>
                <div className="text-gray-400">
                  {editando ? (
                    <input type="text" className="bg-[#1a1a1a] border border-gray-700 rounded focus:border-white focus:outline-none w-full p-2" value={formData.pais} onChange={e => setFormData({...formData, pais: e.target.value})} />
                  ) : (perfil?.pais || 'Argentina')}
                </div>

                <div className="font-semibold text-gray-200">Provincia</div>
                <div className="text-gray-400">
                  {editando ? (
                    <input type="text" className="bg-[#1a1a1a] border border-gray-700 rounded focus:border-white focus:outline-none w-full p-2" value={formData.provincia} onChange={e => setFormData({...formData, provincia: e.target.value})} />
                  ) : (perfil?.provincia || 'Entre Ríos')}
                </div>

                <div className="font-semibold text-gray-200">Ciudad</div>
                <div className="text-gray-400">
                  {editando ? (
                    <input type="text" className="bg-[#1a1a1a] border border-gray-700 rounded focus:border-white focus:outline-none w-full p-2" value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} />
                  ) : (perfil?.ciudad || 'Colón')}
                </div>

                <div className="font-semibold text-gray-200">Código Postal</div>
                <div className="text-gray-400">
                  {editando ? (
                    <input type="text" className="bg-[#1a1a1a] border border-gray-700 rounded focus:border-white focus:outline-none w-full p-2" value={formData.codigo_postal} onChange={e => setFormData({...formData, codigo_postal: e.target.value})} />
                  ) : (perfil?.codigo_postal || '3280')}
                </div>
              </div>

              <div className="mt-14 flex gap-4">
                  {editando ? (
                    <button onClick={handleGuardarPerfil} disabled={guardando} className="bg-white text-black px-10 py-3 text-xs md:text-sm font-bold tracking-wider hover:bg-gray-200 transition-colors disabled:opacity-50">
                      {guardando ? 'Guardando...' : 'Guardar Información'}
                    </button>
                  ) : (
                    <button onClick={() => setEditando(true)} className="bg-white text-black px-10 py-3 text-xs md:text-sm font-bold tracking-wider hover:bg-gray-200 transition-colors">
                      Editar información
                    </button>
                  )}
                  <button 
                    onClick={editando ? () => setEditando(false) : logout}
                    className="border border-red-900/50 text-red-500 px-8 py-3 text-xs md:text-sm font-bold tracking-wider hover:bg-red-900/10 transition-colors"
                  >
                    {editando ? 'Cancelar' : 'Cerrar sesión'}
                  </button>
              </div>
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
                      <div key={order.id} className="bg-[#111] rounded-xl border border-gray-800 p-6 hover:border-gray-500 transition shadow-xl sm:col-span-2 md:col-span-3 lg:col-span-1">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] bg-gray-800 px-2 py-1 rounded text-gray-400">PEDIDO #{order.id}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${(order.attributes?.estado || (order as any).estado) === 'Entregado' ? 'bg-green-900/30 text-green-500' : 'bg-yellow-900/30 text-yellow-500'}`}>
                            {order.attributes?.estado || (order as any).estado}
                          </span>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                            {((order.attributes?.item_ordens?.data) || (order as any).item_ordens || []).map((itemO: any) => {
                                const prodRef = itemO.attributes?.producto?.data || itemO.producto?.data || itemO.producto;
                                if (!prodRef) return null;
                                const prodData = prodRef.attributes || prodRef;
                                
                                return (
                                    <div key={itemO.id} className="flex justify-between items-center border border-gray-800 bg-black/50 p-3 rounded-lg">
                                        <div>
                                            <p className="text-white text-xs font-bold uppercase">{prodData?.nombreProducto || 'MATE'}</p>
                                            <p className="text-gray-500 text-[10px] mt-1">{itemO.attributes?.cantidad || itemO.cantidad}x Grabado: {itemO.attributes?.d_grabado || itemO.d_grabado || 'No'}</p>
                                        </div>
                                        <button 
                                            onClick={() => setReviewingProduct({id: prodRef.documentId, name: prodData?.nombreProducto})}
                                            className="bg-white text-black px-3 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-gray-200 transition-colors"
                                        >
                                            RESEÑAR
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                            <p className="text-gray-500 text-xs tracking-widest uppercase">Total Abonado</p>
                            <p className="text-green-500 font-mono text-xl">${order.attributes?.total || (order as any).total}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center border border-dashed border-gray-900 rounded-2xl flex flex-col items-center gap-5">
                      <p className="text-gray-600 italic">Aún no tienes mates...</p>
                      <Link href="/catalogo" className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-gray-200 hover:scale-105 transition-all">
                        ¡Ir a la tienda!
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Modal Reseña */}
      {reviewingProduct && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/80 p-4">
              <div className="bg-[#111] border border-gray-800 p-8 rounded-xl w-full max-w-md animate-in zoom-in-95 duration-200 shadow-2xl relative">
                  <button onClick={() => setReviewingProduct(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl">&times;</button>
                  <h3 className="text-xl font-bold uppercase tracking-widest mb-2">Dejar Reseña</h3>
                  <p className="text-sm text-gray-400 mb-6">Contanos qué te pareció tu <b>{reviewingProduct.name}</b></p>
                  
                  <div className="flex justify-center space-x-2 mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                          <button
                              key={star}
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                          >
                              <span className={star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-700"}>★</span>
                          </button>
                      ))}
                  </div>

                  <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Escribe tu opinión aquí..."
                      className="w-full bg-black border border-gray-800 p-4 text-sm text-white rounded-lg focus:border-white focus:outline-none resize-none h-32 mb-6 placeholder-gray-600"
                  />

                  <button 
                      onClick={submitReview}
                      disabled={submittingReview}
                      className="w-full bg-white text-black font-bold py-3 rounded uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                      {submittingReview ? 'Enviando...' : 'Publicar'}
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default PerfilPage;
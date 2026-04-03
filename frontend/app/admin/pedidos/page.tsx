"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function GestionPedidosPage() {
    const [todasLasOrdenes, setTodasLasOrdenes] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        async function traerOrdenes() {
            try {
                const resOrdens = await fetch("http://127.0.0.1:1337/api/ordens?populate=*", { cache: 'no-store' });
                const dataOrdens = await resOrdens.json();
                
                const ordenesOrdenadas = (dataOrdens.data || []).sort((a: any, b: any) => b.id - a.id);
                setTodasLasOrdenes(ordenesOrdenadas);
            } catch (error) {
                console.error("❌ Error conectando con Strapi:", error);
            } finally {
                setCargando(false);
            }
        }
        traerOrdenes();
    }, []);

    const cambiarEstadoPedido = async (documentId: string, nuevoEstado: string) => {
        if (!confirm(`¿Estás seguro de cambiar el estado a "${nuevoEstado}"?`)) return;
        
        try {
            const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
            const res = await fetch(`http://127.0.0.1:1337/api/ordens/${documentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    data: { estado: nuevoEstado }
                })
            });

            if (res.ok) {
                setTodasLasOrdenes(prev => prev.map(o => o.documentId === documentId ? { ...o, estado: nuevoEstado } : o));
                alert("Estado actualizado exitosamente.");
            } else {
                alert("Error al actualizar. ¿Tienes habilitado el API Token o los permisos en Strapi?");
            }
        } catch (error) {
            console.error("Error al hacer PUT:", error);
            alert("Error de conexión al guardar.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Gestión de Pedidos</h1>
                        <p className="text-gray-500 mt-1">Línea de tiempo logística interactiva.</p>
                    </div>
                    <Link href="/admin">
                        <button className="flex items-center justify-center gap-2 bg-[#1a1a1a] border border-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow-sm w-full md:w-auto font-medium">
                            <ArrowLeft className="w-4 h-4" />
                            Volver al Dashboard
                        </button>
                    </Link>
                </div>

                {cargando ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-10 h-10 animate-spin text-gray-500" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {todasLasOrdenes.length === 0 ? (
                            <div className="bg-[#111] p-10 text-center text-gray-500 rounded-xl border border-gray-800">
                                No hay órdenes para mostrar.
                            </div>
                        ) : todasLasOrdenes.map(orden => {
                            const fecha = new Date(orden.fecha || orden.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                            
                            const userObj = orden.usuario || orden.attributes?.usuario?.data?.attributes || {};
                            const nombreCliente = userObj.username || userObj.email || `Invitado (Orden #${orden.documentId?.slice(-4) || '?'})`;
                            
                            const steps = [
                                { id: 'pagado', label: 'Pagado' },
                                { id: 'armado', label: 'En Armado' },
                                { id: 'listo para enviar', label: 'Preparado' },
                                { id: 'en camino', label: 'En Camino' },
                                { id: 'entregado', label: 'Entregado' }
                            ];

                            const estadoActualId = orden.estado || 'pendiente';
                            const currentIndex = steps.findIndex(s => s.id === estadoActualId);

                            return (
                                <div key={orden.id} className="bg-[#111] rounded-xl border border-gray-800 p-6 flex flex-col md:flex-row gap-8 shadow-sm">
                                    <div className="md:w-1/3 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-800 pb-4 md:pb-0 md:pr-6">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-xl font-bold font-mono text-white">#{orden.id}</h3>
                                                <span className={`text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider ${
                                                    estadoActualId === 'entregado' ? 'bg-green-900/30 text-green-500' :
                                                    estadoActualId === 'cancelado' ? 'bg-red-900/30 text-red-500' :
                                                    estadoActualId === 'pendiente' ? 'bg-yellow-900/30 text-yellow-500' :
                                                    'bg-blue-900/30 text-blue-500'
                                                }`}>
                                                    {estadoActualId}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-300">{nombreCliente}</p>
                                            <p className="text-xs text-gray-500 mt-1">{fecha}</p>
                                        </div>
                                        
                                        <div className="mt-4 pt-4 border-t border-gray-800/50">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500 uppercase tracking-widest">Total Abonado</span>
                                                <span className="font-bold text-green-500">${Number(orden.total).toLocaleString('es-AR')}</span>
                                            </div>
                                            {(orden.direccion_envio_cp || orden.costo_envio > 0) && (
                                                <div className="mt-2 text-xs text-gray-400">
                                                    Envío a CP: {orden.direccion_envio_cp || 'N/A'} 
                                                    {orden.costo_envio ? ` ($${Number(orden.costo_envio).toLocaleString('es-AR')})` : ''}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {estadoActualId === 'cancelado' ? (
                                        <div className="md:w-2/3 flex items-center justify-center text-red-500/50 font-bold uppercase tracking-widest h-full min-h-[100px]">
                                            Pedido Cancelado
                                        </div>
                                    ) : (
                                        <div className="md:w-2/3 flex flex-col justify-center">
                                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-6 text-center md:text-left">
                                                Avance Logístico (Click para actualizar)
                                            </p>
                                            
                                            <div className="relative flex items-center justify-between w-full">
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-800 rounded-full z-0"></div>
                                                
                                                <div 
                                                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full z-0 transition-all duration-500"
                                                    style={{ width: `${currentIndex >= 0 ? (currentIndex / (steps.length - 1)) * 100 : 0}%` }}
                                                ></div>

                                                {steps.map((step, idx) => {
                                                    const isCompleted = currentIndex >= idx;
                                                    const isCurrent = currentIndex === idx;
                                                    
                                                    return (
                                                        <button 
                                                            key={step.id}
                                                            onClick={() => cambiarEstadoPedido(orden.documentId, step.id)}
                                                            className="relative z-10 flex flex-col items-center group outline-none"
                                                        >
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#111] transition-all duration-300 ${
                                                                isCurrent ? 'bg-blue-500 scale-125 shadow-[0_0_15px_rgba(59,130,246,0.5)]' :
                                                                isCompleted ? 'bg-blue-500 hover:bg-blue-400' :
                                                                'bg-gray-700 hover:bg-gray-600'
                                                            }`}>
                                                                {isCompleted && !isCurrent ? (
                                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                ) : isCurrent ? (
                                                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                                ) : null}
                                                            </div>
                                                            <span className={`absolute top-10 text-[10px] font-bold uppercase tracking-wider text-center w-24 -ml-8 transition-colors ${
                                                                isCurrent ? 'text-white' :
                                                                isCompleted ? 'text-gray-400' :
                                                                'text-gray-600 group-hover:text-gray-400'
                                                            }`}>
                                                                {step.label}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

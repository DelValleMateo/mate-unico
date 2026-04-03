"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DollarSign, Package, Users, TrendingUp, ArrowLeft, Loader2, Trophy, Medal } from "lucide-react";

export default function AdminDashboard() {
    // --- ESTADOS PARA GUARDAR LA MATEMÁTICA ---
    const [totalFacturado, setTotalFacturado] = useState(0);
    const [ordenesPagadas, setOrdenesPagadas] = useState(0);
    const [totalMatesVendidos, setTotalMatesVendidos] = useState(0);

    // Arrays para los Rankings y Órdenes
    const [topProductos, setTopProductos] = useState<any[]>([]);
    const [topClientes, setTopClientes] = useState<any[]>([]);
    const [todasLasOrdenes, setTodasLasOrdenes] = useState<any[]>([]);

    const [cargando, setCargando] = useState(true);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'pedidos'>('dashboard');

    // --- FETCH A STRAPI Y MATEMÁTICA PESADA ---
    useEffect(() => {
        async function traerMetricas() {
            try {
                // 1. Traer Órdenes y decirle a Strapi que nos incluya al Usuario que compró
                const resOrdens = await fetch("http://127.0.0.1:1337/api/ordens?populate=*", { cache: 'no-store' });
                const dataOrdens = await resOrdens.json();
                
                // Ordenar por ID o fecha (más reciente primero)
                const ordenesOrdenadas = (dataOrdens.data || []).sort((a: any, b: any) => b.id - a.id);
                setTodasLasOrdenes(ordenesOrdenadas);

                const ordenesPagadasData = ordenesOrdenadas.filter((o: any) => o.estado === 'pagado' || o.estado === 'entregado' || o.estado === 'armado' || o.estado === 'listo para enviar' || o.estado === 'en camino');
                // Consideramos "pagadas" para la contabilidad a todas aquellas que ya pasaron de "pendiente"

                // 2. Traer los Ítems (los mates)
                const resItems = await fetch("http://127.0.0.1:1337/api/item-ordens?populate=*", { cache: 'no-store' });
                const dataItems = await resItems.json();

                // --- TARJETAS SUPERIORES ---
                setOrdenesPagadas(ordenesPagadasData.length);
                const sumaPlata = ordenesPagadasData.reduce((acc: number, o: any) => acc + Number(o.total || 0), 0);
                setTotalFacturado(sumaPlata);

                // --- TOP CLIENTES ---
                const clientesMap: Record<string, number> = {};
                ordenesPagadasData.forEach((orden: any) => {
                    const userObj = orden.usuario || orden.attributes?.usuario?.data?.attributes || {};
                    const nombreCliente = userObj.username || userObj.email || `Invitado (Orden #${orden.documentId?.slice(-4) || '?'})`;
                    clientesMap[nombreCliente] = (clientesMap[nombreCliente] || 0) + Number(orden.total || 0);
                });

                const clientesOrdenados = Object.entries(clientesMap)
                    .map(([nombre, gastado]) => ({ nombre, gastado }))
                    .sort((a, b) => b.gastado - a.gastado)
                    .slice(0, 5);
                setTopClientes(clientesOrdenados);

                // --- TOP PRODUCTOS Y TOTAL MATES ---
                const productosMap: Record<string, { cantidad: number, recaudado: number }> = {};
                let matesContador = 0;

                (dataItems.data || []).forEach((item: any) => {
                    if (item.orden && (item.orden.estado !== 'pendiente' && item.orden.estado !== 'cancelado')) {
                        const cant = Number(item.cantidad || 1);
                        const precioTotalItem = cant * Number(item.precio_unitario || 0);
                        const nombreProd = item.producto?.nombreProducto || "Mate Eliminado";

                        matesContador += cant; 

                        if (!productosMap[nombreProd]) {
                            productosMap[nombreProd] = { cantidad: 0, recaudado: 0 };
                        }
                        productosMap[nombreProd].cantidad += cant;
                        productosMap[nombreProd].recaudado += precioTotalItem;
                    }
                });

                setTotalMatesVendidos(matesContador);

                const productosOrdenados = Object.entries(productosMap)
                    .map(([nombre, stats]) => ({ nombre, ...stats }))
                    .sort((a, b) => b.cantidad - a.cantidad)
                    .slice(0, 5);
                setTopProductos(productosOrdenados);

            } catch (error) {
                console.error("❌ Error conectando con Strapi:", error);
            } finally {
                setCargando(false);
            }
        }

        traerMetricas();
    }, []);
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">

                {/* 1. HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-4">Panel de Control</h1>
                        <p className="text-gray-500 mt-1">Métricas y resumen de ventas</p>
                    </div>
                    <Link href="/">
                        <button className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition shadow-sm w-full md:w-auto font-medium">
                            <ArrowLeft className="w-4 h-4" />
                            Volver a la tienda
                        </button>
                    </Link>
                </div>

                {cargando ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-10 h-10 animate-spin text-gray-500" />
                    </div>
                ) : (
                    <>
                        {/* 2. TARJETAS DE MÉTRICAS (KPIs) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#111] rounded-xl p-6 border border-gray-800 flex items-center space-x-4">
                                <div className="p-3 bg-green-900/30 text-green-500 rounded-lg">
                                    <DollarSign className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Total Facturado</p>
                                    <h3 className="text-2xl font-bold text-white">
                                        ${totalFacturado.toLocaleString('es-AR')}
                                    </h3>
                                </div>
                            </div>

                            <div className="bg-[#111] rounded-xl p-6 border border-gray-800 flex items-center space-x-4">
                                <div className="p-3 bg-blue-900/30 text-blue-500 rounded-lg">
                                    <TrendingUp className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Órdenes Activas/Completadas</p>
                                    <h3 className="text-2xl font-bold text-white">
                                        {ordenesPagadas}
                                    </h3>
                                </div>
                            </div>

                            <div className="bg-[#111] rounded-xl p-6 border border-gray-800 flex items-center space-x-4">
                                <div className="p-3 bg-amber-900/30 text-amber-500 rounded-lg">
                                    <Package className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Mates Vendidos</p>
                                    <h3 className="text-2xl font-bold text-white">
                                        {totalMatesVendidos} unidades
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* 3. TABLAS DE RANKINGS */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Ranking de Productos */}
                            <div className="bg-[#111] rounded-xl border border-gray-800 overflow-hidden flex flex-col">
                                <div className="p-6 border-b border-gray-800 flex items-center gap-2 bg-[#1a1a1a]">
                                    <Trophy className="w-5 h-5 text-amber-500" />
                                    <h2 className="text-lg font-bold text-white">Mates más vendidos</h2>
                                </div>
                                <div className="p-0 flex-1">
                                    {topProductos.length === 0 ? (
                                        <div className="flex justify-center items-center h-48 text-gray-500">Aún no hay mates vendidos.</div>
                                    ) : (
                                        <ul className="divide-y divide-gray-800">
                                            {topProductos.map((producto, index) => (
                                                <li key={index} className="flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition">
                                                    <div className="flex items-center gap-4">
                                                        <span className={`font-bold w-6 text-center ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-700' : 'text-gray-500'}`}>
                                                            #{index + 1}
                                                        </span>
                                                        <div>
                                                            <p className="font-semibold text-white">{producto.nombre}</p>
                                                            <p className="text-xs text-green-500 font-medium">+ ${producto.recaudado.toLocaleString('es-AR')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-amber-900/30 text-amber-500 py-1 px-3 rounded-full text-xs font-bold border border-amber-900/50">
                                                        {producto.cantidad} un.
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Mejores Clientes */}
                            <div className="bg-[#111] rounded-xl border border-gray-800 overflow-hidden flex flex-col">
                                <div className="p-6 border-b border-gray-800 flex items-center gap-2 bg-[#1a1a1a]">
                                    <Medal className="w-5 h-5 text-blue-500" />
                                    <h2 className="text-lg font-bold text-white">Top Clientes</h2>
                                </div>
                                <div className="p-0 flex-1">
                                    {topClientes.length === 0 ? (
                                        <div className="flex justify-center items-center h-48 text-gray-500">Aún no hay clientes registrados.</div>
                                    ) : (
                                        <ul className="divide-y divide-gray-800">
                                            {topClientes.map((cliente, index) => (
                                                <li key={index} className="flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-blue-900/30 text-blue-500 flex items-center justify-center font-bold">
                                                            {cliente.nombre.charAt(0).toUpperCase()}
                                                        </div>
                                                        <p className="font-semibold text-white">{cliente.nombre}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-white">${cliente.gastado.toLocaleString('es-AR')}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
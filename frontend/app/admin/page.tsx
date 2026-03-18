"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DollarSign, Package, Users, TrendingUp, ArrowLeft, Loader2, Trophy, Medal } from "lucide-react";

export default function AdminDashboard() {
    // --- ESTADOS PARA GUARDAR LA MATEMÁTICA ---
    const [totalFacturado, setTotalFacturado] = useState(0);
    const [ordenesPagadas, setOrdenesPagadas] = useState(0);
    const [totalMatesVendidos, setTotalMatesVendidos] = useState(0);

    // Arrays para los Rankings
    const [topProductos, setTopProductos] = useState<any[]>([]);
    const [topClientes, setTopClientes] = useState<any[]>([]);

    const [cargando, setCargando] = useState(true);

    // --- FETCH A STRAPI Y MATEMÁTICA PESADA ---
    useEffect(() => {
        async function traerMetricas() {
            try {
                // 1. Traer Órdenes y decirle a Strapi que nos incluya al Usuario que compró
                const resOrdens = await fetch("http://127.0.0.1:1337/api/ordens?populate=*", { cache: 'no-store' });
                const dataOrdens = await resOrdens.json();
                const ordenesPagadasData = (dataOrdens.data || []).filter((o: any) => o.estado === 'pagado');

                // 2. Traer los Ítems (los mates) y decirle a Strapi que nos incluya la Orden y el Producto
                const resItems = await fetch("http://127.0.0.1:1337/api/item-ordens?populate=*", { cache: 'no-store' });
                const dataItems = await resItems.json();

                // --- TARJETAS SUPERIORES ---
                setOrdenesPagadas(ordenesPagadasData.length);
                const sumaPlata = ordenesPagadasData.reduce((acc: number, o: any) => acc + Number(o.total || 0), 0);
                setTotalFacturado(sumaPlata);

                // --- TOP CLIENTES ---
                const clientesMap: Record<string, number> = {};
                ordenesPagadasData.forEach((orden: any) => {
                    // Si el usuario estaba logueado tomamos su nombre, si no, lo ponemos como Invitado
                    const nombreCliente = orden.users_permissions_user?.username || `Invitado (Orden #${orden.documentId?.slice(-4) || '?'})`;
                    clientesMap[nombreCliente] = (clientesMap[nombreCliente] || 0) + Number(orden.total || 0);
                });

                // Convertimos el objeto en Array, ordenamos de mayor a menor y cortamos los 5 primeros
                const clientesOrdenados = Object.entries(clientesMap)
                    .map(([nombre, gastado]) => ({ nombre, gastado }))
                    .sort((a, b) => b.gastado - a.gastado)
                    .slice(0, 5);
                setTopClientes(clientesOrdenados);

                // --- TOP PRODUCTOS Y TOTAL MATES ---
                const productosMap: Record<string, { cantidad: number, recaudado: number }> = {};
                let matesContador = 0;

                (dataItems.data || []).forEach((item: any) => {
                    // Solo contamos el mate si la orden a la que pertenece realmente se pagó
                    if (item.orden && item.orden.estado === 'pagado') {
                        const cant = Number(item.cantidad || 1);
                        const precioTotalItem = cant * Number(item.precio_unitario || 0);
                        const nombreProd = item.producto?.nombreProducto || "Mate Eliminado";

                        matesContador += cant; // Sumamos a la tarjeta general

                        // Sumamos al ranking individual
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
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">

                {/* 1. HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Panel de Control</h1>
                        <p className="text-gray-500 mt-1">Métricas y resumen de ventas de MateÚnico</p>
                    </div>
                    <Link href="/">
                        <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm w-full md:w-auto">
                            <ArrowLeft className="w-4 h-4" />
                            Volver a la tienda
                        </button>
                    </Link>
                </div>

                {/* 2. TARJETAS DE MÉTRICAS (KPIs) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <DollarSign className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Facturado</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {cargando ? <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" /> : `$${totalFacturado.toLocaleString('es-AR')}`}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Órdenes Pagadas</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {cargando ? <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" /> : ordenesPagadas}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
                            <Package className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Mates Vendidos</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {cargando ? <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" /> : `${totalMatesVendidos} unidades`}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* 3. TABLAS DE RANKINGS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Ranking de Productos */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            <h2 className="text-lg font-bold text-gray-800">Mates más vendidos</h2>
                        </div>
                        <div className="p-0 flex-1">
                            {cargando ? (
                                <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
                            ) : topProductos.length === 0 ? (
                                <div className="flex justify-center items-center h-48 text-gray-400">Aún no hay mates vendidos.</div>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {topProductos.map((producto, index) => (
                                        <li key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                                            <div className="flex items-center gap-4">
                                                <span className={`font-bold w-6 text-center ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-700' : 'text-gray-300'}`}>
                                                    #{index + 1}
                                                </span>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{producto.nombre}</p>
                                                    <p className="text-xs text-green-600 font-medium">+ ${producto.recaudado.toLocaleString('es-AR')}</p>
                                                </div>
                                            </div>
                                            <div className="bg-amber-100 text-amber-800 py-1 px-3 rounded-full text-sm font-bold shadow-sm">
                                                {producto.cantidad} {producto.cantidad === 1 ? 'unidad' : 'unidades'}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Mejores Clientes */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                            <Medal className="w-5 h-5 text-blue-500" />
                            <h2 className="text-lg font-bold text-gray-800">Top Clientes</h2>
                        </div>
                        <div className="p-0 flex-1">
                            {cargando ? (
                                <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
                            ) : topClientes.length === 0 ? (
                                <div className="flex justify-center items-center h-48 text-gray-400">Aún no hay clientes registrados.</div>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {topClientes.map((cliente, index) => (
                                        <li key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-inner">
                                                    {cliente.nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <p className="font-semibold text-gray-800">{cliente.nombre}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">${cliente.gastado.toLocaleString('es-AR')}</p>
                                                <p className="text-xs text-gray-400">Total gastado</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
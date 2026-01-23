"use client";
import MercadoPagoButton from './MercadoPagoButton';
import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const STRAPI_URL = "http://localhost:1337";

interface ProductProps {
    id: number;
    documentId: string;
    nombreProducto: string;
    descripcion: string;
    precio: number;
    stock?: number;
    imagenes: any[]; // Sabemos que es un array gracias a tu JSON
}

export default function ProductClient({ product }: { product: ProductProps }) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState('black');
    const [grabadoText, setGrabadoText] = useState('');

    // 1. Desestructuración directa basada en tu JSON
    const { nombreProducto, precio, descripcion, stock = 10, imagenes } = product;

    // 2. Función simple para obtener URL
    const getImageUrl = (index: number) => {
        // Verificar si existe la imagen en esa posición
        if (!imagenes || !imagenes[index]) return '/placeholder.png';

        const imgObj = imagenes[index];

        // Tu JSON dice que la url está directa, pero por seguridad revisamos ambas
        const url = imgObj.url || imgObj.attributes?.url;

        if (!url) return '/placeholder.png';

        // Si ya tiene http (ej: Cloudinary) la dejamos, si no, le pegamos el localhost
        return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
    };

    // 3. URLs listas
    const mainImage = getImageUrl(0);
    const secondaryImage1 = getImageUrl(1) === '/placeholder.png' ? mainImage : getImageUrl(1);
    const secondaryImage2 = getImageUrl(2) === '/placeholder.png' ? mainImage : getImageUrl(2);

    const formatPrice = (amount: number) => amount.toLocaleString('es-AR');

    const handleQuantity = (type: 'inc' | 'dec') => {
        if (type === 'inc' && quantity < stock) setQuantity(quantity + 1);
        if (type === 'dec' && quantity > 1) setQuantity(quantity - 1);
    };

    const onAddToCart = () => {
        addToCart({
            id: product.id,
            documentId: product.documentId,
            name: nombreProducto,
            price: precio,
            img: mainImage,
            quantity: quantity,
            color: selectedColor
        });
    };

    return (
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start lg:h-[480px]">

                {/* GALERÍA */}
                <div className="w-full h-full grid grid-cols-5 gap-4">
                    <div className="col-span-2 flex flex-col gap-4 h-full">
                        <div className="relative flex-1 bg-gray-800 rounded-[15px] overflow-hidden border border-white/10 group cursor-pointer">
                            <img src={secondaryImage1} alt="Vista 1" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="relative flex-1 bg-gray-800 rounded-[15px] overflow-hidden border border-white/10 group cursor-pointer">
                            <img src={secondaryImage2} alt="Vista 2" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                    <div className="col-span-3 relative h-full bg-gray-800 rounded-[15px] overflow-hidden border border-white/10">
                        <img src={mainImage} alt={nombreProducto} className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* INFO PRODUCTO */}
                <div className="flex flex-col h-full py-1">
                    <div className="flex flex-col gap-4">
                        <div className="mb-1">
                            <h2 className="text-4xl font-bold text-white mb-1">{nombreProducto}</h2>
                            <p className="text-2xl font-light text-gray-300">${formatPrice(precio)}</p>
                        </div>
                        <div className="space-y-3">
                            <p className="text-gray-400 leading-relaxed text-sm md:text-base">{descripcion}</p>
                            <p className="text-sm text-gray-500">by <span className="text-gray-300 font-medium">MateUnico</span></p>
                        </div>

                        <div className="space-y-4 pt-1">
                            <div>
                                <label className="text-sm text-gray-500 mb-2 block">Color</label>
                                <div className="flex gap-3">
                                    <button onClick={() => setSelectedColor('black')} className={`w-10 h-10 bg-black border ${selectedColor === 'black' ? 'border-white' : 'border-gray-600'} rounded-md`} />
                                    <button onClick={() => setSelectedColor('brown')} className={`w-10 h-10 bg-[#5D2E2E] border ${selectedColor === 'brown' ? 'border-white' : 'border-gray-600'} rounded-md`} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between"><label className="text-sm text-gray-500 mb-2 block">Grabado</label><span className="text-xs text-gray-600">{grabadoText.length}/10</span></div>
                                <input type="text" value={grabadoText} onChange={(e) => e.target.value.length <= 10 && setGrabadoText(e.target.value)} placeholder="(Max 10)" className="w-full bg-transparent border border-gray-600 p-3 text-white focus:outline-none focus:border-white rounded-md h-12" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-2 pt-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <button
                                onClick={onAddToCart}
                                disabled={stock <= 0}
                                className={`flex-1 font-bold py-3 px-6 uppercase tracking-wide text-sm rounded-md transition-colors ${stock > 0 ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                            >
                                {stock > 0 ? `AÑADIR AL CARRITO - $${formatPrice(precio * quantity)}` : 'SIN STOCK'}
                            </button>

                            <div className="flex items-center justify-between border border-white/20 bg-white/5 w-32 px-4 py-3 rounded-md">
                                <button onClick={() => handleQuantity('dec')} className={`text-gray-400 hover:text-white ${quantity === 1 ? 'opacity-50' : ''}`}><Minus size={16} /></button>
                                <span className="text-white font-medium">{quantity}</span>
                                <button onClick={() => handleQuantity('inc')} className={`text-gray-400 hover:text-white ${quantity >= stock ? 'opacity-30' : ''}`} disabled={quantity >= stock}><Plus size={16} /></button>
                            </div>
                        </div>

                        {stock > 0 && <div className="mt-2 w-full"><MercadoPagoButton /></div>}

                        <p className="text-xs text-gray-500 text-right mt-2">{stock > 0 ? `Stock disponible: ${stock} unidades` : 'Producto Agotado'}</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
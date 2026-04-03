"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Definimos la estructura del producto en el carrito
export interface CartItem {
    id: number;
    documentId?: string;
    cartItemId?: string; // NUEVO: Identificador único (id + color + grabado)
    name: string;
    price: number;
    img: string;
    quantity: number;
    color: string;
    grabado?: string;
    stock?: number; // Stock disponible del producto
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (cartItemId: string) => void; // Ahora pide el ID único (string)
    clearCart: () => void;
    updateQuantity: (cartItemId: string, action: 'increase' | 'decrease') => void; // Ahora pide el ID único
    totalItems: number;
    isCartOpen: boolean;
    toggleCart: () => void;
    subtotal: number;
    shippingCost: number;
    total: number;
    hasFreeShipping: boolean;
    amountToFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const cartKey = user ? `mateunico_cart_${user.id}` : 'mateunico_cart_guest';

    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [currentStorageKey, setCurrentStorageKey] = useState(cartKey);

    const UMBRAL_ENVIO_GRATIS = 50000;
    const COSTO_ENVIO_FIJO = 5000;

    // Cargar carrito del usuario actual desde localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem(cartKey);
        if (savedCart) {
            const parsed = JSON.parse(savedCart);
            // Migración de seguridad por si tenías items viejos guardados
            const migratedCart = parsed.map((item: CartItem) => ({
                ...item,
                cartItemId: item.cartItemId || `${item.id}-${item.color}-${item.grabado || ''}`
            }));
            setCart(migratedCart);
        } else {
            setCart([]);
        }
        setCurrentStorageKey(cartKey);
    }, [cartKey]);

    useEffect(() => {
        if (currentStorageKey === cartKey) {
            localStorage.setItem(cartKey, JSON.stringify(cart));
        }
    }, [cart, cartKey, currentStorageKey]);

    const addToCart = (newItem: CartItem) => {
        // Creamos la "patente" única para este producto exacto
        const uniqueCartId = `${newItem.id}-${newItem.color}-${newItem.grabado || ''}`;

        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.cartItemId === uniqueCartId);

            if (existingItem) {
                return prevCart.map((item) =>
                    item.cartItemId === uniqueCartId
                        ? { ...item, quantity: Number(item.quantity) + Number(newItem.quantity) }
                        : item
                );
            }
            return [...prevCart, { ...newItem, cartItemId: uniqueCartId, quantity: Number(newItem.quantity) }];
        });
    };

    const removeFromCart = (cartItemId: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
    };

    const updateQuantity = (cartItemId: string, action: 'increase' | 'decrease') => {
        setCart((prevCart) => prevCart.map(item => {
            if (item.cartItemId === cartItemId) {
                if (action === 'increase') return { ...item, quantity: Number(item.quantity) + 1 };
                if (action === 'decrease' && item.quantity > 1) return { ...item, quantity: Number(item.quantity) - 1 };
            }
            return item;
        }));
    };

    const clearCart = () => setCart([]);
    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const totalItems = cart.reduce((acc, item) => acc + Number(item.quantity), 0);
    const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);
    const hasFreeShipping = subtotal >= UMBRAL_ENVIO_GRATIS;
    const amountToFreeShipping = hasFreeShipping ? 0 : UMBRAL_ENVIO_GRATIS - subtotal;
    const shippingCost = (subtotal === 0 || hasFreeShipping) ? 0 : COSTO_ENVIO_FIJO;
    const total = subtotal + shippingCost;

    return (
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, clearCart, updateQuantity,
            totalItems, isCartOpen, toggleCart,
            subtotal, shippingCost, total, hasFreeShipping, amountToFreeShipping
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) throw new Error('useCart must be used within a CartProvider');
    return context;
}
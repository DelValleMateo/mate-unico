"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Definimos la estructura del producto en el carrito
interface CartItem {
    id: number;
    documentId?: string; // Importante para la validación de stock
    name: string;
    price: number;
    img: string;
    quantity: number;
    color: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void; // <--- 1. AGREGAMOS ESTO A LA INTERFAZ
    totalItems: number;
    isCartOpen: boolean;      // Agregamos esto para que Jesús maneje el Sidebar
    toggleCart: () => void;   // Agregamos esto para que Jesús maneje el Sidebar
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Cargar carrito desde localStorage al iniciar
    useEffect(() => {
        const savedCart = localStorage.getItem('mateunico_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Guardar en localStorage cada vez que cambia
    useEffect(() => {
        localStorage.setItem('mateunico_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (newItem: CartItem) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === newItem.id);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.id === newItem.id
                        ? { ...item, quantity: item.quantity + newItem.quantity }
                        : item
                );
            }
            return [...prevCart, newItem];
        });
        setIsCartOpen(true); // Abrimos el carrito al agregar
    };

    const removeFromCart = (id: number) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    // 2. CREAMOS LA FUNCIÓN PARA VACIAR
    const clearCart = () => {
        setCart([]); // Simplemente pone el array vacío
    };

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            clearCart, // <--- 3. LA EXPORTAMOS AQUÍ
            totalItems,
            isCartOpen,
            toggleCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Definimos qué forma tiene un producto en el carrito
type CartItem = {
    id: string | number;
    name: string;
    price: number;
    img: string;
    quantity: number;
    color: string; // Agregamos color para diferenciar
};

// Definimos qué funciones tendrá nuestro "Cerebro"
type CartContextType = {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    totalItems: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    // Función para agregar (si ya existe, suma cantidad)
    const addToCart = (newItem: CartItem) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(
                (item) => item.id === newItem.id && item.color === newItem.color
            );

            if (existingItem) {
                return prevCart.map((item) =>
                    item.id === newItem.id && item.color === newItem.color
                        ? { ...item, quantity: item.quantity + newItem.quantity }
                        : item
                );
            }
            return [...prevCart, newItem];
        });

        // Un pequeño aviso para saber que funcionó (luego haremos algo más bonito)
        alert(`¡Se agregaron ${newItem.quantity} ${newItem.name} al carrito!`);
    };

    // Calcular total de items (ej: 2 mates + 1 bombilla = 3 items)
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, totalItems }}>
            {children}
        </CartContext.Provider>
    );
}

// Hook para usar el carrito fácil
export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart debe usarse dentro de un CartProvider');
    return context;
}
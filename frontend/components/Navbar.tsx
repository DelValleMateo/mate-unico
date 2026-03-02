'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCart, Menu, X, User, Phone, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const navLinks = [
  { name: 'Catálogo', href: '/catalogo' },
  { name: 'Contacto', href: '/contacto', icon: Phone },
];

const authLinks = [
  { name: 'Login', href: '/login', icon: User },
  { name: 'Carrito', href: '/carrito', icon: ShoppingCart },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Traemos todo lo que necesitamos de nuestro súper Contexto
  const { isCartOpen, toggleCart, cart, totalItems, removeFromCart, subtotal } = useCart();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <nav className="bg-mate-secondary shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo / Home */}
            <div className="flex-shrink-0">
              <Link
                href="/"
                className="text-2xl font-bold text-mate-bg tracking-wider hover:text-white transition duration-200"
              >
                MateÚnico
              </Link>
            </div>

            {/* Enlaces principales (Desktop) */}
            <div className="hidden md:flex md:space-x-8 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-mate-bg font-medium hover:text-mate-primary transition duration-200 flex items-center space-x-1"
                >
                  {link.icon && <link.icon className="h-4 w-4" />}
                  <span>{link.name}</span>
                </Link>
              ))}

              {/* Botones de Auth y Carrito */}
              {authLinks.map((link) => {
                // Si es el Carrito, lo convertimos en un botón que abre el Sidebar
                if (link.name === 'Carrito') {
                  return (
                    <button
                      key={link.name}
                      onClick={toggleCart}
                      className="text-mate-bg p-2 rounded-full hover:bg-mate-primary transition duration-200 relative"
                      title={link.name}
                    >
                      <link.icon className="h-6 w-6" />
                      {/* Burbuja con la cantidad total de items */}
                      {totalItems > 0 && (
                        <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {totalItems}
                        </span>
                      )}
                    </button>
                  );
                }

                // Si es Login, es un Link normal
                return (
                  <Link
                    key={link.name}
                    href={`/auth${link.href}`}
                    title={link.name}
                    className="text-mate-bg p-2 rounded-full hover:bg-mate-primary transition duration-200"
                  >
                    <link.icon className="h-6 w-6" />
                  </Link>
                );
              })}
            </div>

            {/* Botón de Menú (Mobile) */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-mate-bg hover:text-white hover:bg-mate-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Abrir menú principal</span>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú Móvil (Responsive) */}
        {isOpen && (
          <div className="md:hidden bg-mate-secondary pb-3 px-2 pt-2">
            {[...navLinks, ...authLinks].map((link) => (
              <Link
                key={link.name}
                href={link.href.includes('/auth') ? `/auth${link.href}` : link.href}
                onClick={toggleMenu}
                className="block px-3 py-2 rounded-md text-base font-medium text-mate-bg hover:bg-mate-primary hover:text-white transition duration-200"
              >
                <div className="flex items-center space-x-2">
                  {link.icon && <link.icon className="h-5 w-5" />}
                  <span>{link.name}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* ========================================= */}
      {/* SIDEBAR DEL CARRITO (Desplegable mágico) */}
      {/* ========================================= */}

      {/* Fondo oscuro cuando el carrito está abierto (z-[9998] para tapar todo el resto) */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity"
          onClick={toggleCart} // Cierra si hacés clic afuera del panel
        ></div>
      )}

      {/* El Panel lateral derecho (z-[9999] para que sea lo más alto de toda la web) */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#111] z-[9999] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header del Sidebar */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-light tracking-widest text-white uppercase">Tu Carrito ({totalItems})</h2>
          <button onClick={toggleCart} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Lista de productos (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-20 font-light">
              Tu carrito está vacío.
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white/5 p-3 rounded-md items-center">
                <div className="relative w-16 h-16 bg-black rounded overflow-hidden flex-shrink-0 border border-white/10">
                  <img src={item.img} alt={item.name} className="w-full h-full object-contain p-1" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white">{item.name}</h4>
                  {/* Mostramos el grabado si existe en el Sidebar */}
                  {item.grabado && <p className="text-[10px] text-gray-400 italic mt-0.5">Grabado: {item.grabado}</p>}
                  <p className="text-xs text-gray-400 mt-1">Cant: {item.quantity}</p>
                  <p className="text-sm font-bold text-white mt-1">${(item.price * item.quantity).toLocaleString()}</p>
                </div>
                <button onClick={() => removeFromCart(item.cartItemId!)} className="text-gray-500 hover:text-red-500 p-2 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer del Sidebar con subtotal y botón de Checkout */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-[#0a0a0a]">
            <div className="flex justify-between items-center mb-6 text-white">
              <span className="text-sm uppercase tracking-widest text-gray-400">Subtotal</span>
              <span className="text-xl font-bold">${subtotal.toLocaleString()}</span>
            </div>
            <Link
              href="/carrito"
              onClick={toggleCart} // Cierra el sidebar al navegar al checkout grande
              className="block w-full bg-white text-black text-center py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors rounded-sm"
            >
              Ir al Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
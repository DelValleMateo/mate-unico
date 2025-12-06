// frontend/components/Navbar.tsx

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCart, Menu, X, User, Phone } from 'lucide-react'; 

const navLinks = [
  { name: 'Catálogo', href: '/catalogo' },
  { name: 'Contacto', href: '/contacto', icon: Phone }, // MUST HAVE Contacto [cite: 16]
];

const authLinks = [
  { name: 'Login', href: '/login', icon: User }, 
  { name: 'Carrito', href: '/carrito', icon: ShoppingCart }, 
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
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
            {authLinks.map((link) => (
              <Link
                key={link.name}
                href={`/auth${link.href}`} 
                title={link.name}
                className="text-mate-bg p-2 rounded-full hover:bg-mate-primary transition duration-200"
              >
                <link.icon className="h-6 w-6" />
              </Link>
            ))}
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
  );
};

export default Navbar;
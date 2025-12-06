import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Importamos las piezas que creó Mateo
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CartProvider } from "../context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MateÚnico",
  description: "Venta de mates artesanales premium",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-[#0f0f0f] text-gray-200 overflow-x-hidden selection:bg-yellow-600 selection:text-white`}>
        
        {/* Lógica del Carrito Global */}
        <CartProvider>
            
            {/* Fondo Global */}
            <div className="fixed inset-0 z-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'url("/fondo-cuero.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

            <div className="relative z-10 flex flex-col min-h-screen">
              {/* TU TAREA: El Header va aquí */}
              <Header />

              {/* Aquí se renderiza la página que esté viendo el usuario */}
              <main className="flex-grow">
                {children}
              </main>

              {/* TU TAREA: El Footer va aquí */}
              <Footer />
            </div>

        </CartProvider>

      </body>
    </html>
  );
}
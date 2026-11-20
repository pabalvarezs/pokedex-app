import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import PokemonDetail from "./pages/PokemonDetail";
import Favorites from "./pages/Favorites";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import TypePage from "./pages/TypePage";
import Admin from "./pages/Admin";
import ScrollToTop from "./components/ScrollToTop";
import SiteHeader from "./components/layout/SiteHeader";
import SiteFooter from "./components/layout/SiteFooter";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <div className="relative flex min-h-screen flex-col font-sans text-ink-900">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-red-700 focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white focus:shadow-ambient focus:outline-none focus:ring-2 focus:ring-amber-300"
        >
          Saltar al contenido
        </a>

        <SiteHeader />

        <main
          id="contenido"
          tabIndex={-1}
          className="flex-1 px-4 py-5 outline-none sm:px-6 sm:py-6"
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pokemon/:id" element={<PokemonDetail />} />
            <Route path="/search/:name" element={<PokemonDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/login" element={<Login />} />
            <Route path="/recuperar" element={<ForgotPassword />} />
            <Route path="/restablecer/:token" element={<ResetPassword />} />
            <Route path="/type/:type" element={<TypePage />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        <SiteFooter />

        {/* Botón flotante Volver arriba (PokéBall) */}
        <ScrollToTop />

        <Toaster
          position="top-center"
          richColors
          closeButton
          offset={16}
          toastOptions={{ duration: 3200, className: "font-sans" }}
        />
      </div>
    </AuthProvider>
  );
}

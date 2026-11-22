import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import RouteTransition from "./components/layout/RouteTransition";
import RouteFallback from "./components/layout/RouteFallback";
import ScrollToTop from "./components/ScrollToTop";
import SiteHeader from "./components/layout/SiteHeader";
import SiteFooter from "./components/layout/SiteFooter";
import { AuthProvider } from "./context/AuthContext";

// El catálogo es la portada y se mantiene en el chunk inicial por ser la
// ruta más visitada; el resto se carga bajo demanda al navegar.
import Home from "./pages/Home";

const PokemonDetail = lazy(() => import("./pages/PokemonDetail"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const TypePage = lazy(() => import("./pages/TypePage"));
const Admin = lazy(() => import("./pages/Admin"));

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
          <RouteTransition>
            <Suspense fallback={<RouteFallback />}>
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
            </Suspense>
          </RouteTransition>
        </main>

        <SiteFooter />

        {/* Botón flotante Volver arriba (PokéBall) */}
        <ScrollToTop />

        <Toaster
          position="top-center"
          richColors
          closeButton
          offset={16}
          toastOptions={{
            duration: 3200,
            className: "font-sans !rounded-control !border-line !shadow-ambient",
            classNames: {
              title: "!text-sm !font-bold",
              description: "!text-ink-700",
              actionButton: "!bg-red-600 !text-white",
              cancelButton: "!bg-slate-200 !text-ink-700",
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignInPage from '@/modules/auth/SignInPage';
import SignUpPage from '@/modules/auth/SignUpPage';
import ForgotPasswordPage from '@/modules/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/modules/auth/ResetPasswordPage'; 
import Dashboard from './modules/home/Dashboard';
import { Toaster } from 'sonner'; 

// Importación del Guardián de Seguridad
import ProtectedRoute from '@/components/routes/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ======================================================= */}
        {/* RUTAS PÚBLICAS (Accesibles sin loguearse)              */}
        {/* ======================================================= */}
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ======================================================= */}
        {/* RUTAS PROTEGIDAS - EXCLUSIVAS ADMIN Y DOCENTE           */}
        {/* ======================================================= */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'DOCENTE']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* ======================================================= */}
        {/* RUTAS PROTEGIDAS - EXCLUSIVAS ESTUDIANTES               */}
        {/* ======================================================= */}
        <Route element={<ProtectedRoute allowedRoles={['ESTUDIANTE']} />}>
          <Route 
            path="/simulador" 
            element={
              <div className="min-h-screen bg-[#0b1d33] text-white flex flex-col items-center justify-center p-6">
                <h1 className="text-3xl font-black text-[#c29b38] mb-2">ENTORNO DE SIMULACIÓN CLÍNICA</h1>
                <p className="text-slate-300 text-sm">Cargando módulos de Realidad Virtual para Enfermería...</p>
              </div>
            } 
          />
        </Route>

        {/* ======================================================= */}
        {/* MANEJO DE CONTROL 404 NO ENCONTRADO                    */}
        {/* ======================================================= */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen bg-[#0b1d33] flex flex-col items-center justify-center text-white font-bold">
              <h2 className="text-4xl text-red-500 mb-2">404</h2>
              <p className="text-lg text-slate-400">Recurso institucional no encontrado</p>
            </div>
          } 
        />
      </Routes>
      
      {/* Configuración global de Toasts */}
      <Toaster richColors position="top-center" closeButton />
    </BrowserRouter>
  );
}

export default App; 
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('https://hospital-uta-backend-production.up.railway.app/auth/login ', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Credenciales inválidas institucionales.');
      }

      // =========================================================================
      // 🚀 RESTICCIÓN DE ENTORNO: Bloqueo de Estudiantes en el Portal Web
      // =========================================================================
      if (data.user.rol === 'ESTUDIANTE') {
        throw new Error('ACCESO_ESTUDIANTE_VR'); 
      }

      // Si es ADMIN o DOCENTE, guardamos la sesión de forma normal
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/dashboard');
      return true; 
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/signin');
  };

  return { login, loading, logout };
};    
import { useState } from 'react';
import { toast } from 'sonner';

export const useSignUp = () => {
  const [loading, setLoading] = useState(false);

  const signUpUser = async (payload: Record<string, any>) => {
    setLoading(true);

    try {
      const response = await fetch('https://hospital-uta-backend-production.up.railway.app/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Captura los errores devueltos por el ValidationPipe de NestJS
        const errorMsg = Array.isArray(data.message) ? data.message[0] : data.message;
        throw new Error(errorMsg || 'Error al procesar el registro');
      }

      // Notificación de éxito con Sonner
      toast.success('¡Registro Exitoso!', {
        duration: 4000,
      });

      return true; // Indicador de éxito para el componente visual
    } catch (error: any) {
      console.error('Error en SignUp Hook:', error.message);
      toast.error('Error en el registro', {
        description: error.message || 'Intente nuevamente más tarde.',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { signUpUser, loading };
};
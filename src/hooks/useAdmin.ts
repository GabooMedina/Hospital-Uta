import { useState } from 'react';
import { toast } from 'sonner';

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // 🚀 ENDPOINT 1: Cargar exclusivamente Alumnos con Semestre y Paralelo (Para el Tab de Alumnos)
  const fetchAlumnosSystem = async () => {
    try {
      const res = await fetch('https://hospital-uta-backend-production.up.railway.app/admin/alumnos', {
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al cargar alumnos');
      return data;
    } catch (error: any) {
      console.error('Error en fetchAlumnos:', error.message);
      return [];
    }
  };

  // 🚀 ENDPOINT 2: Cargar la lista global con roles (Para el Tab de Configuración / Toggle)
  const fetchUsuariosSystem = async () => {
    try {
      const res = await fetch('https://hospital-uta-backend-production.up.railway.app/admin/usuarios', {
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al cargar usuarios globales');
      return data;
    } catch (error: any) {
      console.error('Error en fetchUsuarios:', error.message);
      toast.error('Error de sincronización', { description: error.message });
      return [];
    }
  };

  // 3. UPDATE - Editar la información académica desde el UserModal
  const updateAlumnoData = async (id: string, nombres: string, apellidos: string, semestre: string, paralelo: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://hospital-uta-backend-production.up.railway.app/admin/alumnos/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ nombres, apellidos, semestre, paralelo })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'No se pudo actualizar el registro');
      
      toast.success('Información Actualizada', { description: 'Los cambios fueron guardados con éxito.' });
      return true;
    } catch (error: any) {
      toast.error('Error al editar', { description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 4. DELETE - Eliminar registro
  const deleteAlumnoSystem = async (id: string) => {
    try {
      const res = await fetch(`https://hospital-uta-backend-production.up.railway.app/admin/alumnos/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('No se pudo eliminar al estudiante');
      toast.success('Registro eliminado');
      return true;
    } catch (error: any) {
      toast.error('Error al eliminar', { description: error.message });
      return false;
    }
  };

  // 5. PATCH - Toggle Bar de Roles
  const toggleUserRoleSystem = async (id: string, nuevoRol: string) => {
    try {
      const res = await fetch(`https://hospital-uta-backend-production.up.railway.app/admin/usuarios/${id}/toggle-role`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ nuevoRol })
      });
      if (!res.ok) throw new Error('No se pudo alterar el rango');
      return true;
    } catch (error: any) {
      toast.error('Error de rango', { description: error.message });
      return false;
    }
  };

  return { 
    fetchAlumnosSystem, // <-- Exportamos la nueva función especializada
    fetchUsuariosSystem, 
    updateAlumnoData, 
    deleteAlumnoSystem, 
    toggleUserRoleSystem, 
    loading 
  };
};
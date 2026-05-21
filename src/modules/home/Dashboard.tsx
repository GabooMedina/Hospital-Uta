import { useState, useEffect } from 'react';
import { Users, Stethoscope, Settings, LogOut, Search, Pencil, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner'; 

// ==========================================
// 1. IMPORTACIÓN DE NUESTROS NUEVOS MÓDULOS
// ==========================================
import { useAdmin } from '@/hooks/useAdmin';
import UserModal from '@/components/ui/UserModal'; // Ruta limpia sin subcarpeta redundante

interface UsuarioSession {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
  rol: 'ADMIN' | 'DOCENTE' | 'ESTUDIANTE';
  estado: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [userLogged, setUserLogged] = useState<UsuarioSession | null>(null);
  const [activeTab, setActiveTab] = useState<'alumnos' | 'configuracion'>('alumnos');
  
  // ==========================================
  // 2. ESTADOS SEPARADOS PARA CADA VISTA
  // ==========================================
  const [usuarios, setUsuarios] = useState<any[]>([]); // Tab Configuración
  const [alumnosData, setAlumnosData] = useState<any[]>([]); // Tab Alumnos (Con Semestre y Paralelo)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Consumimos las funciones asíncronas de nuestro Hook actualizado
  const { 
    fetchAlumnosSystem, 
    fetchUsuariosSystem, 
    updateAlumnoData, 
    deleteAlumnoSystem, 
    toggleUserRoleSystem 
  } = useAdmin();

  // Función unificada para sincronizar datos reales desde Supabase -> NestJS
  const cargarInformacionPlataforma = async () => {
    console.log('=== [FRONTEND] DISPARANDO FETCHES PARALELOS DESDE DASHBOARD ===');
    
    // Ejecutamos ambas peticiones en paralelo para optimizar rendimiento de carga
    const [listaAlumnos, listaGeneral] = await Promise.all([
      fetchAlumnosSystem(),
      fetchUsuariosSystem()
    ]);
    
    console.log('📦 Alumnos académicos cargados:', listaAlumnos);
    console.log('📦 Roles globales del sistema:', listaGeneral);

    setAlumnosData(listaAlumnos);
    setUsuarios(listaGeneral);
  };

  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      navigate('/signin');
      return;
    }

    const parsedUser = JSON.parse(rawUser) as UsuarioSession;
    setUserLogged(parsedUser);

    if (parsedUser.rol === 'ESTUDIANTE') {
      localStorage.clear();
      navigate('/signin');
      return;
    }

    cargarInformacionPlataforma(); // Carga inicial de datos reales
  }, [navigate]);

  // ==========================================
  // 3. MANEJADORES DE ACCIONES (CRUD Y TOGGLE)
  // ==========================================
  
  // Abrir el modal inyectándole el usuario seleccionado en la fila
  const handleOpenEdit = (usuario: any) => {
    setSelectedUser(usuario);
    setIsModalOpen(true);
  };

  // Guardar cambios desde el Formulario del Modal hacia NestJS -> Supabase
  const handleSaveUser = async (id: string, nom: string, ape: string, sem: string, par: string) => {
    const success = await updateAlumnoData(id, nom, ape, sem, par);
    if (success) {
      // Forzamos re-fetch para jalar la información reestructurada directo de las tablas SQL
      await cargarInformacionPlataforma();
    }
  };

  // Cambiar privilegios mediante el Toggle Bar / Switch en el Tab de Configuración
  const handleToggleRol = async (id: string, nombre: string, rolActual: string) => {
    const nuevoRol = rolActual === 'Docente' || rolActual === 'DOCENTE' ? 'Estudiante' : 'Docente';
    const success = await toggleUserRoleSystem(id, nuevoRol);
    
    if (success) {
      toast.success(`Rol cambiado a ${nuevoRol.toUpperCase()}`, {
        description: `Se reestructuraron las tablas de privilegios para ${nombre}.`
      });
      // Volvemos a sincronizar para limpiar semestres/paralelos si pasó a ser docente
      await cargarInformacionPlataforma();
    }
  };

  // Dar de baja o eliminar un registro (CRUD)
  const handleDeleteAlumno = (id: string, nombre: string) => {
    toast.warning(`¿Eliminar a ${nombre}?`, {
      description: 'Esta acción borrará de forma permanente al estudiante del sistema.',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          const success = await deleteAlumnoSystem(id);
          if (success) {
            // Sincronización optimizada en cliente
            setAlumnosData(prev => prev.filter(u => u.id !== id));
            setUsuarios(prev => prev.filter(u => u.id !== id));
          }
        }
      }
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.info('Sesión finalizada');
    navigate('/signin');
  };

  if (!userLogged) return null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-sm sm:text-base">
      
      {/* SIDEBAR INSTITUCIONAL */}
      <aside className="w-64 bg-[#0b1d33] text-slate-300 flex flex-col shadow-xl hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-[#c29b38]/20 p-2 rounded-lg text-[#c29b38]"><Stethoscope size={20} /></div>
          <span className="font-bold text-white tracking-tight text-sm">Hospital Universitario</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab('alumnos')} 
            className={`w-full justify-start gap-3 py-5 ${activeTab === 'alumnos' ? 'bg-[#c29b38] text-white hover:bg-[#aa842f]' : 'text-slate-300 hover:bg-slate-800/50'}`}
          >
            <Users size={18} /> Alumnos
          </Button>
          
          {userLogged.rol === 'ADMIN' && (
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab('configuracion')} 
              className={`w-full justify-start gap-3 py-5 ${activeTab === 'configuracion' ? 'bg-[#c29b38] text-white hover:bg-[#aa842f]' : 'text-slate-300 hover:bg-slate-800/50'}`}
            >
              <Settings size={18} /> Configuración
            </Button>
          )}
        </nav>
        <div className="p-4 border-t border-slate-800/60">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3 text-red-400 hover:bg-red-950/20"><LogOut size={18} /> Cerrar Sesión</Button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex flex-col">
            <h2 className="text-lg sm:text-xl font-bold text-[#0b1d33]">{activeTab === 'alumnos' ? 'Gestión de Alumnos' : 'Configuración de Sistema'}</h2>
            <span className="text-[10px] uppercase font-bold text-[#c29b38] tracking-wider -mt-1">Rango: {userLogged.rol}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-44 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input placeholder="Buscar..." className="pl-10 h-9 rounded-lg focus:ring-[#0b1d33] text-xs" />
            </div>
            <div className="w-8 h-8 rounded-full bg-[#c29b38]/10 flex items-center justify-center text-[#c29b38] font-bold text-xs border border-[#c29b38]/20 uppercase">
              {userLogged.nombres[0]}{userLogged.apellidos[0]}
            </div>
          </div>
        </header>

        <section className="flex-1 p-4 sm:p-8 overflow-auto">
          
          {/* TAB 1: GESTIÓN DE ALUMNOS (Muestra Semestre y Paralelo Reales) */}
          {activeTab === 'alumnos' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 animate-in fade-in duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">Lista de Estudiantes Registrados</h3>
                  <p className="text-xs text-slate-500">Listado oficial de alumnos autorizados dentro de la plataforma clínica.</p>
                </div>
                <Badge variant="outline" className="text-[#c29b38] bg-[#c29b38]/5 font-bold px-3 py-1 text-xs">{alumnosData.length} Estudiantes</Badge>
              </div>
              <Table>
                <TableHeader className="bg-slate-50/70">
                  <TableRow>
                    <TableHead className="font-bold text-[#0b1d33]">Nombre</TableHead>
                    <TableHead className="font-bold text-[#0b1d33]">Correo Institucional</TableHead>
                    <TableHead className="font-bold text-[#0b1d33] text-center">Semestre</TableHead>
                    <TableHead className="font-bold text-[#0b1d33] text-center">Paralelo</TableHead>
                    <TableHead className="text-center font-bold text-[#0b1d33] w-32">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alumnosData.map((alumno) => (
                    <TableRow key={alumno.id} className="hover:bg-slate-50/40">
                      <TableCell className="font-medium text-slate-700">{alumno.nombre}</TableCell>
                      <TableCell className="text-slate-500 font-mono text-xs">{alumno.correo}</TableCell>
                      <TableCell className="text-center text-slate-600">{alumno.semestre}</TableCell>
                      <TableCell className="text-center text-slate-600 font-semibold">{alumno.paralelo}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(alumno)} className="h-8 w-8 text-slate-600 hover:text-[#0b1d33]"><Pencil size={15} /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteAlumno(alumno.id, alumno.nombre)} className="h-8 w-8 text-slate-400 hover:text-red-600"><Trash2 size={15} /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* TAB 2: CONFIGURACIÓN DE ROLES (Control Toggle Bar) */}
          {activeTab === 'configuracion' && userLogged.rol === 'ADMIN' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 animate-in fade-in duration-200">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800">Control de Privilegios e Identidad de Personal</h3>
                <p className="text-xs text-slate-500">Activa el interruptor para elevar los privilegios de un estudiante al rango de Docente.</p>
              </div>
              <div className="p-6">
                <Table>
                  <TableHeader className="bg-slate-50/70">
                    <TableRow>
                      <TableHead className="font-bold text-[#0b1d33]">Usuario</TableHead>
                      <TableHead className="font-bold text-[#0b1d33]">Correo Electrónico</TableHead>
                      <TableHead className="font-bold text-[#0b1d33] text-center w-36">Rol Asignado</TableHead>
                      <TableHead className="font-bold text-[#0b1d33] text-center w-40">Privilegio Docente</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map((usuario) => (
                      <TableRow key={usuario.id} className="hover:bg-slate-50/40">
                        <TableCell className="font-medium text-slate-700">{usuario.nombre}</TableCell>
                        <TableCell className="text-slate-500 font-mono text-xs">{usuario.correo}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={usuario.rol === 'Docente' || usuario.rol === 'DOCENTE' ? 'bg-amber-50 text-amber-800 border border-amber-200 font-bold' : 'bg-slate-100 text-slate-600'}>
                            {usuario.rol}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={usuario.rol === 'Docente' || usuario.rol === 'DOCENTE'} 
                                onChange={() => handleToggleRol(usuario.id, usuario.nombre, usuario.rol)} 
                                className="sr-only peer" 
                              />
                              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0b1d33]"></div>
                            </label>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Reutilización del Formulario Unificado */}
      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        user={selectedUser} 
        onSave={handleSaveUser} 
      />
    </div>
  );
};

export default Dashboard;
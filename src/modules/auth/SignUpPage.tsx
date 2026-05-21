import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSignUp } from '@/hooks/useSignUp'; // Importación de nuestro nuevo hook
import { toast } from 'sonner';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signUpUser, loading } = useSignUp(); // Extraemos las propiedades del hook

  // Estados locales para el formulario
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [semestre, setSemestre] = useState('');
  const [paralelo, setParalelo] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación previa obligatoria en los selectores de Shadcn
    if (!semestre || !paralelo) {
      toast.warning('Información incompleta', {
        description: 'Por favor, seleccione su semestre y paralelo académicos.',
      });
      return;
    }

    // Armamos el objeto con el formato exacto de SignUpDto
    const payload = {
      email,
      password,
      nombres,
      apellidos,
      rol_id: 3, // Forzado a nivel de negocio: 3 representa ESTUDIANTE
      semestre,  // Atributos de metadatos adicionales capturados por el trigger
      paralelo,
    };

    // Despachamos la petición al backend a través de nuestro hook
    const success = await signUpUser(payload);

    if (success) {
      // Limpieza de campos en caso de éxito
      setNombres('');
      setApellidos('');
      setEmail('');
      setPassword('');
      setSemestre('');
      setParalelo('');

      // Redirección controlada al Login tras 2 segundos
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-2 sm:p-4 py-6 sm:py-10">
      <Card className="max-w-2xl w-full rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl border-none overflow-hidden">
        
        {/* Cabecera Azul Marino Responsiva */}
        <CardHeader className="bg-[#0b1d33] text-white text-center p-6 sm:py-8">
          <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 backdrop-blur-sm text-[#c29b38]">
            <UserPlus size={24} />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">Registro de Usuarios</CardTitle>
          <CardDescription className="text-slate-300 opacity-90 text-xs sm:text-sm max-w-md mx-auto">
            Crea tu cuenta institucional para acceder al simulador clínico virtual
          </CardDescription>
        </CardHeader>

        {/* Contenido adaptable a teléfonos móviles */}
        <CardContent className="p-4 sm:p-8">
          <form className="space-y-4 sm:space-y-5" onSubmit={handleSignUp}>
            
            {/* Grilla Nombres y Apellidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombres" className="text-xs font-bold uppercase ml-1 text-slate-600">Nombres Completos</Label>
                <Input 
                  id="nombres"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  required
                  placeholder="Ej: Gabriel Leonardo" 
                  className="rounded-xl bg-slate-50 py-5 sm:py-6 focus:ring-[#0b1d33]" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos" className="text-xs font-bold uppercase ml-1 text-slate-600">Apellidos Completos</Label>
                <Input 
                  id="apellidos"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  required
                  placeholder="Ej: Medina Vasco" 
                  className="rounded-xl bg-slate-50 py-5 sm:py-6 focus:ring-[#0b1d33]" 
                />
              </div>
            </div>

            {/* Correo Institucional */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase ml-1 text-slate-600">Correo Institucional</Label>
              <Input 
                id="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="usuario@uta.edu.ec" 
                className="rounded-xl bg-slate-50 py-5 sm:py-6 focus:ring-[#0b1d33]" 
              />
            </div>

            {/* Información Académica con Selectores Estructurados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="space-y-1 md:col-span-2 text-[#0b1d33] font-bold text-xs uppercase tracking-tight">
                Información Académica Requerida
              </div>
              
              {/* Select Semestre */}
              <div className="space-y-2">
                <Label htmlFor="semestre" className="text-[10px] font-bold uppercase text-slate-500">Semestre</Label>
                <Select onValueChange={(value) => setSemestre(value)} value={semestre}>
                  <SelectTrigger id="semestre" className="rounded-lg bg-white py-5 focus:ring-[#0b1d33]">
                    <SelectValue placeholder="Seleccione Semestre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1er Semestre</SelectItem>
                    <SelectItem value="2">2do Semestre</SelectItem>
                    <SelectItem value="3">3er Semestre</SelectItem>
                    <SelectItem value="4">4to Semestre</SelectItem>
                    <SelectItem value="5">5to Semestre</SelectItem>
                    <SelectItem value="6">6to Semestre</SelectItem>
                    <SelectItem value="7">7mo Semestre</SelectItem>
                    <SelectItem value="8">8vo Semestre</SelectItem>
                    <SelectItem value="9">9no Semestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Select Paralelo */}
              <div className="space-y-2">
                <Label htmlFor="paralelo" className="text-[10px] font-bold uppercase text-slate-500">Paralelo</Label>
                <Select onValueChange={(value) => setParalelo(value)} value={paralelo}>
                  <SelectTrigger id="paralelo" className="rounded-lg bg-white py-5 focus:ring-[#0b1d33]">
                    <SelectValue placeholder="Seleccione Paralelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Paralelo A</SelectItem>
                    <SelectItem value="B">Paralelo B</SelectItem>
                    <SelectItem value="C">Paralelo C</SelectItem>
                    <SelectItem value="D">Paralelo D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase ml-1 text-slate-600">Establecer Contraseña</Label>
              <Input 
                id="password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres" 
                className="rounded-xl bg-slate-50 py-5 sm:py-6 focus:ring-[#0b1d33]" 
              />
            </div>

            {/* Botón de Envío Dinámico enlazado al loading del hook */}
            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#c29b38] hover:bg-[#aa842f] text-white font-bold py-5 sm:py-7 rounded-2xl shadow-xl transition-all active:scale-95 text-base sm:text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Procesando Registro...
                </>
              ) : "Completar Registro"}
            </Button>
          </form>

          {/* Enlace de Retorno */}
          <div className="mt-6 sm:mt-8 text-center pt-5 sm:pt-6 border-t border-slate-100">
            <Link 
              to="/signin" 
              className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-[#c29b38] transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;
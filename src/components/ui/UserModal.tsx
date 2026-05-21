import { useState, useEffect } from 'react';
import { Pencil, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  semestre: string;
  paralelo: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Usuario | null;
  onSave: (id: string, nombres: string, apellidos: string, semestre: string, paralelo: string) => Promise<void>;
}

const UserModal = ({ isOpen, onClose, user, onSave }: UserModalProps) => {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [semestre, setSemestre] = useState('');
  const [paralelo, setParalelo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      // Separación inteligente de nombres y apellidos para los inputs individuales del DTO
      const parts = user.nombre.trim().split(' ');
      if (parts.length >= 3) {
        setNombres(`${parts[0]} ${parts[1]}`);
        setApellidos(parts.slice(2).join(' '));
      } else {
        setNombres(parts[0] || '');
        setApellidos(parts[1] || '');
      }
      setSemestre(user.semestre || '-');
      setParalelo(user.paralelo || '-');
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    await onSave(user.id, nombres, apellidos, semestre, paralelo);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95%] sm:w-full rounded-2xl p-6 bg-white border-none shadow-2xl">
        
        <DialogHeader className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
          <div className="bg-[#0b1d33]/5 w-12 h-12 rounded-xl flex items-center justify-center mb-3 text-[#0b1d33] border border-[#0b1d33]/10">
            <Pencil size={20} />
          </div>
          <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">
            Actualizar Información
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs sm:text-sm">
            Modifica los datos de registro del usuario para el entorno clínico institucional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* Correo Informativo */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Correo Institucional</Label>
            <Input value={user?.correo || ''} disabled className="rounded-xl bg-slate-100 text-slate-500 font-mono text-xs cursor-not-allowed" />
          </div>

          {/* Nombre y Apellido Divididos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="m-nombres" className="text-xs font-bold uppercase text-slate-600">Nombres</Label>
              <Input id="m-nombres" value={nombres} onChange={(e) => setNombres(e.target.value)} required className="rounded-xl bg-slate-50 border-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-apellidos" className="text-xs font-bold uppercase text-slate-600">Apellidos</Label>
              <Input id="m-apellidos" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required className="rounded-xl bg-slate-50 border-slate-200" />
            </div>
          </div>

          {/* Información de Matrícula (Opcional por si es Docente) */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="space-y-1.5">
              <Label htmlFor="edit-semestre" className="text-[10px] font-bold uppercase text-slate-500">Semestre</Label>
              <Select onValueChange={(value) => setSemestre(value)} value={semestre}>
                <SelectTrigger id="edit-semestre" className="rounded-lg bg-white h-10 border-slate-200">
                  <SelectValue placeholder="Semestre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">Ninguno (Docente)</SelectItem>
                  {['1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo', '9no'].map(sem => (
                    <SelectItem key={sem} value={sem}>{sem} Semestre</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-paralelo" className="text-[10px] font-bold uppercase text-slate-500">Paralelo</Label>
              <Select onValueChange={(value) => setParalelo(value)} value={paralelo}>
                <SelectTrigger id="edit-paralelo" className="rounded-lg bg-white h-10 border-slate-200">
                  <SelectValue placeholder="Paralelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">Ninguno (Docente)</SelectItem>
                  {['A', 'B', 'C', 'D'].map(par => (
                    <SelectItem key={par} value={par}>Paralelo {par}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="w-1/3 rounded-xl">Cancelar</Button>
            <Button type="submit" disabled={isSubmitting} className="w-2/3 bg-[#c29b38] hover:bg-[#aa842f] text-white font-bold rounded-xl shadow-lg">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;
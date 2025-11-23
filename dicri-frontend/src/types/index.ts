export type Permiso = {
  permisoId: number;
  nombre: string;
};

export type Rol = {
  rolId: number;
  nombre: string;
  permisos?: Permiso[];
};

export type Usuario = {
  usuarioId: number;
  nombre: string;
  email: string;
  activo: boolean;
  fechaCreacion?: string;
  roles?: Rol[];
};

export type Expediente = {
  id?: number;
  numero: string;
  descripcion?: string;
  fechaRegistro: string;
  estado?: 'REGISTRADO' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO';
};

export type Indicio = {
  id?: number;
  expedienteId: number;
  objeto?: string;
  descripcion: string;
  color?: string;
  tamano?: string;
  peso?: number;
  ubicacion?: string;
};

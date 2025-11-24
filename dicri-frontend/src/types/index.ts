export type Permiso = {
  PermisoId: number;
  Nombre: string;
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
  roles?: Array<Rol | string>;
  // Cuando el backend devuelve permisos directos en el login
  permissions?: string[];
};

export type Expediente = {
  id?: number;
  Numero: string;
  Descripcion?: string;
  FechaRegistro: string;
  Estado?: 'REGISTRADO' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO';
};

export type Indicio = {
  id?: number;
  ExpedienteId: number;
  Objeto?: string;
  Descripcion: string;
  Color?: string;
  Tamano?: string;
  Peso?: number;
  Ubicacion?: string;
};

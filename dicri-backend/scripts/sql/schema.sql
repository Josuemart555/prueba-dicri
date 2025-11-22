-- CREAR BASE DE DATOS (opcional)
-- CREATE DATABASE DICRI;
-- GO
USE DICRI;
GO

-- TABLAS DE SEGURIDAD
IF OBJECT_ID('dbo.Usuarios','U') IS NOT NULL DROP TABLE dbo.Usuarios;
IF OBJECT_ID('dbo.Roles','U') IS NOT NULL DROP TABLE dbo.Roles;
IF OBJECT_ID('dbo.Permisos','U') IS NOT NULL DROP TABLE dbo.Permisos;
IF OBJECT_ID('dbo.UsuarioRol','U') IS NOT NULL DROP TABLE dbo.UsuarioRol;
IF OBJECT_ID('dbo.RolPermiso','U') IS NOT NULL DROP TABLE dbo.RolPermiso;
IF OBJECT_ID('dbo.ExpedienteEstadoHistorial','U') IS NOT NULL DROP TABLE dbo.ExpedienteEstadoHistorial;
IF OBJECT_ID('dbo.Rechazos','U') IS NOT NULL DROP TABLE dbo.Rechazos;
IF OBJECT_ID('dbo.Indicios','U') IS NOT NULL DROP TABLE dbo.Indicios;
IF OBJECT_ID('dbo.Expedientes','U') IS NOT NULL DROP TABLE dbo.Expedientes;
GO

CREATE TABLE dbo.Usuarios (
  UsuarioId INT IDENTITY PRIMARY KEY,
  Nombre NVARCHAR(150) NOT NULL,
  Email VARCHAR(150) NOT NULL UNIQUE,
  PasswordHash VARCHAR(200) NOT NULL,
  Activo BIT NOT NULL DEFAULT 1,
  FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.Roles (
  RolId INT IDENTITY PRIMARY KEY,
  Nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE dbo.Permisos (
  PermisoId INT IDENTITY PRIMARY KEY,
  Nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE dbo.UsuarioRol (
  UsuarioId INT NOT NULL,
  RolId INT NOT NULL,
  PRIMARY KEY (UsuarioId, RolId),
  FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(UsuarioId),
  FOREIGN KEY (RolId) REFERENCES dbo.Roles(RolId)
);

CREATE TABLE dbo.RolPermiso (
  RolId INT NOT NULL,
  PermisoId INT NOT NULL,
  PRIMARY KEY (RolId, PermisoId),
  FOREIGN KEY (RolId) REFERENCES dbo.Roles(RolId),
  FOREIGN KEY (PermisoId) REFERENCES dbo.Permisos(PermisoId)
);

-- TABLAS DE NEGOCIO
CREATE TABLE dbo.Expedientes (
  ExpedienteId INT IDENTITY PRIMARY KEY,
  Numero VARCHAR(50) NOT NULL UNIQUE,
  Descripcion NVARCHAR(MAX) NULL,
  FechaRegistro DATETIME2 NOT NULL,
  Estado VARCHAR(20) NOT NULL DEFAULT 'REGISTRADO',
  TecnicoId INT NOT NULL,
  FOREIGN KEY (TecnicoId) REFERENCES dbo.Usuarios(UsuarioId)
);

CREATE TABLE dbo.Indicios (
  IndicioId INT IDENTITY PRIMARY KEY,
  ExpedienteId INT NOT NULL,
  Objeto NVARCHAR(200) NULL,
  Descripcion NVARCHAR(MAX) NOT NULL,
  Color NVARCHAR(50) NULL,
  Tamano NVARCHAR(50) NULL,
  Peso DECIMAL(18,2) NULL,
  Ubicacion NVARCHAR(200) NULL,
  TecnicoId INT NOT NULL,
  FechaRegistro DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (ExpedienteId) REFERENCES dbo.Expedientes(ExpedienteId),
  FOREIGN KEY (TecnicoId) REFERENCES dbo.Usuarios(UsuarioId)
);

CREATE TABLE dbo.ExpedienteEstadoHistorial (
  HistorialId INT IDENTITY PRIMARY KEY,
  ExpedienteId INT NOT NULL,
  EstadoAnterior VARCHAR(20) NULL,
  EstadoNuevo VARCHAR(20) NOT NULL,
  UsuarioId INT NOT NULL,
  Justificacion NVARCHAR(MAX) NULL,
  FechaCambio DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (ExpedienteId) REFERENCES dbo.Expedientes(ExpedienteId),
  FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(UsuarioId)
);

CREATE TABLE dbo.Rechazos (
  RechazoId INT IDENTITY PRIMARY KEY,
  ExpedienteId INT NOT NULL,
  UsuarioId INT NOT NULL,
  Justificacion NVARCHAR(MAX) NOT NULL,
  Fecha DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (ExpedienteId) REFERENCES dbo.Expedientes(ExpedienteId),
  FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(UsuarioId)
);

-- INDICES BASICOS
CREATE INDEX IX_Expedientes_Estado_Fecha ON dbo.Expedientes(Estado, FechaRegistro);
CREATE INDEX IX_Indicios_ExpedienteId ON dbo.Indicios(ExpedienteId);

-- DATOS SEMILLA
INSERT INTO dbo.Roles (Nombre) VALUES ('TECNICO'), ('COORDINADOR');
INSERT INTO dbo.Permisos (Nombre) VALUES ('EXPEDIENTES_CREAR'), ('EXPEDIENTES_APROBAR'), ('EXPEDIENTES_RECHAZAR'), ('INDICIOS_CREAR');

-- Usuario administrador/coordinador demo: contraseña se debe reemplazar por hash real en entorno
INSERT INTO dbo.Usuarios (Nombre, Email, PasswordHash)
VALUES ('Coordinador Demo', 'coordinador@dicri.gob.gt', '$2b$10$demoHashReemplace');

INSERT INTO dbo.Usuarios (Nombre, Email, PasswordHash)
VALUES ('Tecnico Demo', 'tecnico@dicri.gob.gt', '$2b$10$demoHashReemplace');

-- Asignaciones de roles y permisos (ejemplo)
INSERT INTO dbo.UsuarioRol (UsuarioId, RolId)
SELECT u.UsuarioId, r.RolId FROM dbo.Usuarios u CROSS JOIN dbo.Roles r WHERE u.Email = 'coordinador@dicri.gob.gt' AND r.Nombre='COORDINADOR';
INSERT INTO dbo.UsuarioRol (UsuarioId, RolId)
SELECT u.UsuarioId, r.RolId FROM dbo.Usuarios u CROSS JOIN dbo.Roles r WHERE u.Email = 'tecnico@dicri.gob.gt' AND r.Nombre='TECNICO';

INSERT INTO dbo.RolPermiso (RolId, PermisoId)
SELECT r.RolId, p.PermisoId FROM dbo.Roles r JOIN dbo.Permisos p ON 1=1 WHERE r.Nombre='COORDINADOR';

INSERT INTO dbo.RolPermiso (RolId, PermisoId)
SELECT r.RolId, p.PermisoId FROM dbo.Roles r JOIN dbo.Permisos p ON p.Nombre IN ('EXPEDIENTES_CREAR','INDICIOS_CREAR') WHERE r.Nombre='TECNICO';

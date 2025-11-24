USE DICRI;
GO

-- =============================================
-- CRUD Permisos
-- =============================================
IF OBJECT_ID('dbo.Permisos_Create','P') IS NOT NULL DROP PROCEDURE dbo.Permisos_Create;
GO
CREATE PROCEDURE dbo.Permisos_Create
  @Nombre VARCHAR(100)
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.Permisos(Nombre) VALUES(@Nombre);
  SELECT SCOPE_IDENTITY() AS PermisoId;
END
GO

IF OBJECT_ID('dbo.Permisos_GetAll','P') IS NOT NULL DROP PROCEDURE dbo.Permisos_GetAll;
GO
CREATE PROCEDURE dbo.Permisos_GetAll
AS
BEGIN
  SET NOCOUNT ON;
  SELECT PermisoId, Nombre FROM dbo.Permisos ORDER BY Nombre;
END
GO

IF OBJECT_ID('dbo.Permisos_GetById','P') IS NOT NULL DROP PROCEDURE dbo.Permisos_GetById;
GO
CREATE PROCEDURE dbo.Permisos_GetById
  @PermisoId INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT PermisoId, Nombre FROM dbo.Permisos WHERE PermisoId = @PermisoId;
END
GO

IF OBJECT_ID('dbo.Permisos_Update','P') IS NOT NULL DROP PROCEDURE dbo.Permisos_Update;
GO
CREATE PROCEDURE dbo.Permisos_Update
  @PermisoId INT,
  @Nombre VARCHAR(100)
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.Permisos SET Nombre = @Nombre WHERE PermisoId = @PermisoId;
  SELECT PermisoId, Nombre FROM dbo.Permisos WHERE PermisoId = @PermisoId;
END
GO

IF OBJECT_ID('dbo.Permisos_Delete','P') IS NOT NULL DROP PROCEDURE dbo.Permisos_Delete;
GO
CREATE PROCEDURE dbo.Permisos_Delete
  @PermisoId INT
AS
BEGIN
  SET NOCOUNT ON;
  DELETE FROM dbo.Permisos WHERE PermisoId = @PermisoId;
END
GO

-- =============================================
-- CRUD Roles y asignación de permisos
-- =============================================
IF OBJECT_ID('dbo.Roles_Create','P') IS NOT NULL DROP PROCEDURE dbo.Roles_Create;
GO
CREATE PROCEDURE dbo.Roles_Create
  @Nombre VARCHAR(50)
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.Roles(Nombre) VALUES(@Nombre);
  SELECT SCOPE_IDENTITY() AS RolId;
END
GO

IF OBJECT_ID('dbo.Roles_GetAll','P') IS NOT NULL DROP PROCEDURE dbo.Roles_GetAll;
GO
CREATE PROCEDURE dbo.Roles_GetAll
AS
BEGIN
  SET NOCOUNT ON;
  SELECT RolId, Nombre FROM dbo.Roles ORDER BY Nombre;
END
GO

IF OBJECT_ID('dbo.Roles_GetById','P') IS NOT NULL DROP PROCEDURE dbo.Roles_GetById;
GO
CREATE PROCEDURE dbo.Roles_GetById
  @RolId INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT RolId, Nombre FROM dbo.Roles WHERE RolId = @RolId;
END
GO

IF OBJECT_ID('dbo.Roles_Update','P') IS NOT NULL DROP PROCEDURE dbo.Roles_Update;
GO
CREATE PROCEDURE dbo.Roles_Update
  @RolId INT,
  @Nombre VARCHAR(50)
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.Roles SET Nombre = @Nombre WHERE RolId = @RolId;
  SELECT RolId, Nombre FROM dbo.Roles WHERE RolId = @RolId;
END
GO

IF OBJECT_ID('dbo.Roles_Delete','P') IS NOT NULL DROP PROCEDURE dbo.Roles_Delete;
GO
CREATE PROCEDURE dbo.Roles_Delete
  @RolId INT
AS
BEGIN
  SET NOCOUNT ON;
  DELETE FROM dbo.Roles WHERE RolId = @RolId;
END
GO

IF OBJECT_ID('dbo.Roles_AssignPermiso','P') IS NOT NULL DROP PROCEDURE dbo.Roles_AssignPermiso;
GO
CREATE PROCEDURE dbo.Roles_AssignPermiso
  @RolId INT,
  @PermisoId INT
AS
BEGIN
  SET NOCOUNT ON;
  IF NOT EXISTS (SELECT 1 FROM dbo.RolPermiso WHERE RolId=@RolId AND PermisoId=@PermisoId)
    INSERT INTO dbo.RolPermiso(RolId, PermisoId) VALUES(@RolId, @PermisoId);
END
GO

IF OBJECT_ID('dbo.Roles_RemovePermiso','P') IS NOT NULL DROP PROCEDURE dbo.Roles_RemovePermiso;
GO
CREATE PROCEDURE dbo.Roles_RemovePermiso
  @RolId INT,
  @PermisoId INT
AS
BEGIN
  SET NOCOUNT ON;
  DELETE FROM dbo.RolPermiso WHERE RolId=@RolId AND PermisoId=@PermisoId;
END
GO

IF OBJECT_ID('dbo.Roles_GetPermisos','P') IS NOT NULL DROP PROCEDURE dbo.Roles_GetPermisos;
GO
CREATE PROCEDURE dbo.Roles_GetPermisos
  @RolId INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT p.PermisoId, p.Nombre
  FROM dbo.RolPermiso rp
  JOIN dbo.Permisos p ON p.PermisoId = rp.PermisoId
  WHERE rp.RolId = @RolId
  ORDER BY p.Nombre;
END
GO

-- =============================================
-- CRUD Usuarios y asignación de roles
-- =============================================
IF OBJECT_ID('dbo.Usuarios_Create','P') IS NOT NULL DROP PROCEDURE dbo.Usuarios_Create;
GO
CREATE PROCEDURE dbo.Usuarios_Create
  @Nombre NVARCHAR(150),
  @Email VARCHAR(150),
  @PasswordHash VARCHAR(200),
  @Activo BIT = 1
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.Usuarios(Nombre, Email, PasswordHash, Activo)
  VALUES(@Nombre, @Email, @PasswordHash, ISNULL(@Activo,1));
  SELECT SCOPE_IDENTITY() AS UsuarioId;
END
GO

IF OBJECT_ID('dbo.Usuarios_GetAll','P') IS NOT NULL DROP PROCEDURE dbo.Usuarios_GetAll;
GO
CREATE PROCEDURE dbo.Usuarios_GetAll
AS
BEGIN
  SET NOCOUNT ON;
  SELECT UsuarioId, Nombre, Email, Activo, FechaCreacion FROM dbo.Usuarios ORDER BY FechaCreacion DESC;
END
GO

IF OBJECT_ID('dbo.Usuarios_GetById','P') IS NOT NULL DROP PROCEDURE dbo.Usuarios_GetById;
GO
CREATE PROCEDURE dbo.Usuarios_GetById
  @UsuarioId INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT UsuarioId, Nombre, Email, Activo, FechaCreacion FROM dbo.Usuarios WHERE UsuarioId=@UsuarioId;
END
GO

IF OBJECT_ID('dbo.Usuarios_Update','P') IS NOT NULL DROP PROCEDURE dbo.Usuarios_Update;
GO
CREATE PROCEDURE dbo.Usuarios_Update
  @UsuarioId INT,
  @Nombre NVARCHAR(150),
  @Email VARCHAR(150),
  @Activo BIT
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.Usuarios SET Nombre=@Nombre, Email=@Email, Activo=@Activo WHERE UsuarioId=@UsuarioId;
  SELECT UsuarioId, Nombre, Email, Activo, FechaCreacion FROM dbo.Usuarios WHERE UsuarioId=@UsuarioId;
END
GO

IF OBJECT_ID('dbo.Usuarios_UpdatePassword','P') IS NOT NULL DROP PROCEDURE dbo.Usuarios_UpdatePassword;
GO
CREATE PROCEDURE dbo.Usuarios_UpdatePassword
  @UsuarioId INT,
  @PasswordHash VARCHAR(200)
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.Usuarios SET PasswordHash=@PasswordHash WHERE UsuarioId=@UsuarioId;
END
GO

IF OBJECT_ID('dbo.Usuarios_Delete','P') IS NOT NULL DROP PROCEDURE dbo.Usuarios_Delete;
GO
CREATE PROCEDURE dbo.Usuarios_Delete
  @UsuarioId INT
AS
BEGIN
  SET NOCOUNT ON;
  DELETE FROM dbo.Usuarios WHERE UsuarioId=@UsuarioId;
END
GO

IF OBJECT_ID('dbo.Usuarios_AssignRol','P') IS NOT NULL DROP PROCEDURE dbo.Usuarios_AssignRol;
GO
CREATE PROCEDURE dbo.Usuarios_AssignRol
  @UsuarioId INT,
  @RolId INT
AS
BEGIN
  SET NOCOUNT ON;
  IF NOT EXISTS (SELECT 1 FROM dbo.UsuarioRol WHERE UsuarioId=@UsuarioId AND RolId=@RolId)
    INSERT INTO dbo.UsuarioRol(UsuarioId, RolId) VALUES(@UsuarioId, @RolId);
END
GO

IF OBJECT_ID('dbo.Usuarios_RemoveRol','P') IS NOT NULL DROP PROCEDURE dbo.Usuarios_RemoveRol;
GO
CREATE PROCEDURE dbo.Usuarios_RemoveRol
  @UsuarioId INT,
  @RolId INT
AS
BEGIN
  SET NOCOUNT ON;
  DELETE FROM dbo.UsuarioRol WHERE UsuarioId=@UsuarioId AND RolId=@RolId;
END
GO

IF OBJECT_ID('dbo.Usuarios_GetRoles','P') IS NOT NULL DROP PROCEDURE dbo.Usuarios_GetRoles;
GO
CREATE PROCEDURE dbo.Usuarios_GetRoles
  @UsuarioId INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT r.RolId, r.Nombre
  FROM dbo.UsuarioRol ur
  JOIN dbo.Roles r ON r.RolId = ur.RolId
  WHERE ur.UsuarioId = @UsuarioId
  ORDER BY r.Nombre;
END
GO

-- =============================================
-- AUTH_Login: devuelve datos del usuario por email
-- recordset 1: usuario (UsuarioId, Email, Nombre, PasswordHash)
-- recordset 2: roles (Rol)
-- recordset 3: permisos (Permiso)
-- =============================================
IF OBJECT_ID('dbo.Auth_Login','P') IS NOT NULL DROP PROCEDURE dbo.Auth_Login;
GO
CREATE PROCEDURE dbo.Auth_Login
  @Email VARCHAR(150)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT u.UsuarioId, u.Email, u.Nombre, u.PasswordHash
  FROM dbo.Usuarios u
  WHERE u.Email = @Email AND u.Activo = 1;

  SELECT r.Nombre AS Rol
  FROM dbo.Usuarios u
  JOIN dbo.UsuarioRol ur ON ur.UsuarioId = u.UsuarioId
  JOIN dbo.Roles r ON r.RolId = ur.RolId
  WHERE u.Email = @Email;

  SELECT p.Nombre AS Permiso
  FROM dbo.Usuarios u
  JOIN dbo.UsuarioRol ur ON ur.UsuarioId = u.UsuarioId
  JOIN dbo.RolPermiso rp ON rp.RolId = ur.RolId
  JOIN dbo.Permisos p ON p.PermisoId = rp.PermisoId
  WHERE u.Email = @Email;
END
GO

-- =============================================
-- Expedientes_Create
-- =============================================
IF OBJECT_ID('dbo.Expedientes_Create','P') IS NOT NULL DROP PROCEDURE dbo.Expedientes_Create;
GO
CREATE PROCEDURE dbo.Expedientes_Create
  @Numero VARCHAR(50),
  @Descripcion NVARCHAR(MAX) = NULL,
  @FechaRegistro DATETIME2,
  @TecnicoId INT
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.Expedientes(Numero, Descripcion, FechaRegistro, Estado, TecnicoId)
  VALUES(@Numero, @Descripcion, @FechaRegistro, 'REGISTRADO', @TecnicoId);
  DECLARE @ExpedienteId INT = SCOPE_IDENTITY();

  INSERT INTO dbo.ExpedienteEstadoHistorial(ExpedienteId, EstadoAnterior, EstadoNuevo, UsuarioId, Justificacion)
  VALUES(@ExpedienteId, NULL, 'REGISTRADO', @TecnicoId, NULL);

  SELECT @ExpedienteId AS ExpedienteId;
END
GO

-- =============================================
-- Indicios_Create
-- =============================================
IF OBJECT_ID('dbo.Indicios_Create','P') IS NOT NULL DROP PROCEDURE dbo.Indicios_Create;
GO
CREATE PROCEDURE dbo.Indicios_Create
  @ExpedienteId INT,
  @Objeto NVARCHAR(200) = NULL,
  @Descripcion NVARCHAR(MAX),
  @Color NVARCHAR(50) = NULL,
  @Tamano NVARCHAR(50) = NULL,
  @Peso DECIMAL(18,2) = NULL,
  @Ubicacion NVARCHAR(200) = NULL,
  @TecnicoId INT
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.Indicios(ExpedienteId, Objeto, Descripcion, Color, Tamano, Peso, Ubicacion, TecnicoId)
  VALUES(@ExpedienteId, @Objeto, @Descripcion, @Color, @Tamano, @Peso, @Ubicacion, @TecnicoId);
  SELECT SCOPE_IDENTITY() AS IndicioId;
END
GO

-- =============================================
-- Indicios_GetById
-- =============================================
IF OBJECT_ID('dbo.Indicios_GetById','P') IS NOT NULL DROP PROCEDURE dbo.Indicios_GetById;
GO
CREATE PROCEDURE dbo.Indicios_GetById
  @IndicioId INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT IndicioId, ExpedienteId, Objeto, Descripcion, Color, Tamano, Peso, Ubicacion, TecnicoId, FechaRegistro
  FROM dbo.Indicios
  WHERE IndicioId = @IndicioId;
END
GO

-- =============================================
-- Indicios_GetByExpedienteId
-- =============================================
IF OBJECT_ID('dbo.Indicios_GetByExpedienteId','P') IS NOT NULL DROP PROCEDURE dbo.Indicios_GetByExpedienteId;
GO
CREATE PROCEDURE dbo.Indicios_GetByExpedienteId
  @ExpedienteId INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT IndicioId, ExpedienteId, Objeto, Descripcion, Color, Tamano, Peso, Ubicacion, TecnicoId, FechaRegistro
  FROM dbo.Indicios
  WHERE ExpedienteId = @ExpedienteId
  ORDER BY FechaRegistro DESC, IndicioId DESC;
END
GO

-- =============================================
-- Indicios_Update
-- =============================================
IF OBJECT_ID('dbo.Indicios_Update','P') IS NOT NULL DROP PROCEDURE dbo.Indicios_Update;
GO
CREATE PROCEDURE dbo.Indicios_Update
  @IndicioId INT,
  @Objeto NVARCHAR(200) = NULL,
  @Descripcion NVARCHAR(MAX) = NULL,
  @Color NVARCHAR(50) = NULL,
  @Tamano NVARCHAR(50) = NULL,
  @Peso DECIMAL(18,2) = NULL,
  @Ubicacion NVARCHAR(200) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.Indicios
  SET Objeto = COALESCE(@Objeto, Objeto),
      Descripcion = COALESCE(@Descripcion, Descripcion),
      Color = COALESCE(@Color, Color),
      Tamano = COALESCE(@Tamano, Tamano),
      Peso = COALESCE(@Peso, Peso),
      Ubicacion = COALESCE(@Ubicacion, Ubicacion)
  WHERE IndicioId = @IndicioId;

  SELECT IndicioId, ExpedienteId, Objeto, Descripcion, Color, Tamano, Peso, Ubicacion, TecnicoId, FechaRegistro
  FROM dbo.Indicios
  WHERE IndicioId = @IndicioId;
END
GO

-- =============================================
-- Indicios_Delete
-- =============================================
IF OBJECT_ID('dbo.Indicios_Delete','P') IS NOT NULL DROP PROCEDURE dbo.Indicios_Delete;
GO
CREATE PROCEDURE dbo.Indicios_Delete
  @IndicioId INT
AS
BEGIN
  SET NOCOUNT ON;
  DELETE FROM dbo.Indicios WHERE IndicioId = @IndicioId;
END
GO

-- =============================================
-- Expedientes_UpdateEstado (aprobar/rechazar)
-- =============================================
IF OBJECT_ID('dbo.Expedientes_UpdateEstado','P') IS NOT NULL DROP PROCEDURE dbo.Expedientes_UpdateEstado;
GO
CREATE PROCEDURE dbo.Expedientes_UpdateEstado
  @ExpedienteId INT,
  @NuevoEstado VARCHAR(20), -- 'APROBADO' | 'RECHAZADO'
  @UsuarioId INT,
  @Justificacion NVARCHAR(MAX) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @EstadoAnterior VARCHAR(20);
  SELECT @EstadoAnterior = Estado FROM dbo.Expedientes WHERE ExpedienteId = @ExpedienteId;

  UPDATE dbo.Expedientes SET Estado = @NuevoEstado WHERE ExpedienteId = @ExpedienteId;

  INSERT INTO dbo.ExpedienteEstadoHistorial(ExpedienteId, EstadoAnterior, EstadoNuevo, UsuarioId, Justificacion)
  VALUES(@ExpedienteId, @EstadoAnterior, @NuevoEstado, @UsuarioId, @Justificacion);

  IF (@NuevoEstado = 'RECHAZADO')
  BEGIN
    IF (@Justificacion IS NULL OR LTRIM(RTRIM(@Justificacion)) = '')
    BEGIN
      RAISERROR('Justificación requerida para rechazo', 16, 1);
      RETURN;
    END
    INSERT INTO dbo.Rechazos(ExpedienteId, UsuarioId, Justificacion)
    VALUES(@ExpedienteId, @UsuarioId, @Justificacion);
  END
END
GO

-- =============================================
-- Expedientes_List (filtros por estado y fechas)
-- =============================================
IF OBJECT_ID('dbo.Expedientes_List','P') IS NOT NULL DROP PROCEDURE dbo.Expedientes_List;
GO
CREATE PROCEDURE dbo.Expedientes_List
  @Estado VARCHAR(20) = NULL,
  @FechaInicio DATE = NULL,
  @FechaFin DATE = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SELECT e.ExpedienteId, e.Numero, e.Descripcion, e.FechaRegistro, e.Estado,
         e.TecnicoId, u.Nombre AS Tecnico
  FROM dbo.Expedientes e
  JOIN dbo.Usuarios u ON u.UsuarioId = e.TecnicoId
  WHERE (@Estado IS NULL OR e.Estado = @Estado)
    AND (@FechaInicio IS NULL OR CAST(e.FechaRegistro AS DATE) >= @FechaInicio)
    AND (@FechaFin IS NULL OR CAST(e.FechaRegistro AS DATE) <= @FechaFin)
  ORDER BY e.FechaRegistro DESC;
END
GO

-- =============================================
-- Reportes_Resumen
-- =============================================
IF OBJECT_ID('dbo.Reportes_Resumen','P') IS NOT NULL DROP PROCEDURE dbo.Reportes_Resumen;
GO
CREATE PROCEDURE dbo.Reportes_Resumen
  @FechaInicio DATE = NULL,
  @FechaFin DATE = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- 1) Resumen por estado
  SELECT e.Estado, COUNT(*) AS Total
  FROM dbo.Expedientes e
  WHERE (@FechaInicio IS NULL OR CAST(e.FechaRegistro AS DATE) >= @FechaInicio)
    AND (@FechaFin IS NULL OR CAST(e.FechaRegistro AS DATE) <= @FechaFin)
  GROUP BY e.Estado;

  -- 2) Detalle de expedientes APROBADOS (incluye último dato de aprobación)
  SELECT 
    e.ExpedienteId,
    e.Numero,
    e.Descripcion,
    e.FechaRegistro,
    e.Estado,
    e.TecnicoId,
    uTec.Nombre AS Tecnico,
    hAprob.FechaCambio AS AprobacionFecha,
    hAprob.UsuarioId AS AprobacionUsuarioId,
    uApr.Nombre AS AprobacionUsuario
  FROM dbo.Expedientes e
  JOIN dbo.Usuarios uTec ON uTec.UsuarioId = e.TecnicoId
  OUTER APPLY (
    SELECT TOP 1 eh.FechaCambio, eh.UsuarioId
    FROM dbo.ExpedienteEstadoHistorial eh
    WHERE eh.ExpedienteId = e.ExpedienteId AND eh.EstadoNuevo = 'APROBADO'
    ORDER BY eh.FechaCambio DESC, eh.HistorialId DESC
  ) hAprob
  LEFT JOIN dbo.Usuarios uApr ON uApr.UsuarioId = hAprob.UsuarioId
  WHERE e.Estado = 'APROBADO'
    AND (@FechaInicio IS NULL OR CAST(e.FechaRegistro AS DATE) >= @FechaInicio)
    AND (@FechaFin IS NULL OR CAST(e.FechaRegistro AS DATE) <= @FechaFin)
  ORDER BY e.FechaRegistro DESC, e.ExpedienteId DESC;

  -- 3) Detalle de expedientes RECHAZADOS (incluye último rechazo)
  SELECT 
    e.ExpedienteId,
    e.Numero,
    e.Descripcion,
    e.FechaRegistro,
    e.Estado,
    e.TecnicoId,
    uTec.Nombre AS Tecnico,
    rLast.Justificacion AS UltimoRechazoJustificacion,
    rLast.Fecha AS UltimoRechazoFecha,
    rLast.UsuarioId AS UltimoRechazoUsuarioId,
    uRec.Nombre AS UltimoRechazoUsuario
  FROM dbo.Expedientes e
  JOIN dbo.Usuarios uTec ON uTec.UsuarioId = e.TecnicoId
  OUTER APPLY (
    SELECT TOP 1 r.RechazoId, r.Justificacion, r.Fecha, r.UsuarioId
    FROM dbo.Rechazos r
    WHERE r.ExpedienteId = e.ExpedienteId
    ORDER BY r.Fecha DESC, r.RechazoId DESC
  ) rLast
  LEFT JOIN dbo.Usuarios uRec ON uRec.UsuarioId = rLast.UsuarioId
  WHERE e.Estado = 'RECHAZADO'
    AND (@FechaInicio IS NULL OR CAST(e.FechaRegistro AS DATE) >= @FechaInicio)
    AND (@FechaFin IS NULL OR CAST(e.FechaRegistro AS DATE) <= @FechaFin)
  ORDER BY e.FechaRegistro DESC, e.ExpedienteId DESC;
END
GO

-- =============================================
-- Expedientes_Rechazados_List (solo lectura)
-- Devuelve expedientes con estado RECHAZADO y datos del último rechazo
-- =============================================
IF OBJECT_ID('dbo.Expedientes_Rechazados_List','P') IS NOT NULL DROP PROCEDURE dbo.Expedientes_Rechazados_List;
GO
CREATE PROCEDURE dbo.Expedientes_Rechazados_List
  @FechaInicio DATE = NULL,
  @FechaFin DATE = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SELECT 
    e.ExpedienteId,
    e.Numero,
    e.Descripcion,
    e.FechaRegistro,
    e.Estado,
    e.TecnicoId,
    u.Nombre AS Tecnico,
    lr.Justificacion AS UltimoRechazoJustificacion,
    lr.Fecha AS UltimoRechazoFecha,
    lr.UsuarioId AS UltimoRechazoUsuarioId,
    u2.Nombre AS UltimoRechazoUsuario
  FROM dbo.Expedientes e
  JOIN dbo.Usuarios u ON u.UsuarioId = e.TecnicoId
  OUTER APPLY (
    SELECT TOP 1 r.RechazoId, r.Justificacion, r.Fecha, r.UsuarioId
    FROM dbo.Rechazos r
    WHERE r.ExpedienteId = e.ExpedienteId
    ORDER BY r.Fecha DESC, r.RechazoId DESC
  ) lr
  LEFT JOIN dbo.Usuarios u2 ON u2.UsuarioId = lr.UsuarioId
  WHERE e.Estado = 'RECHAZADO'
    AND (@FechaInicio IS NULL OR CAST(e.FechaRegistro AS DATE) >= @FechaInicio)
    AND (@FechaFin IS NULL OR CAST(e.FechaRegistro AS DATE) <= @FechaFin)
  ORDER BY e.FechaRegistro DESC, e.ExpedienteId DESC;
END
GO

-- =============================================
-- Rechazos_GetByExpedienteId (solo lectura)
-- Lista de rechazos registrados para un expediente
-- =============================================
IF OBJECT_ID('dbo.Rechazos_GetByExpedienteId','P') IS NOT NULL DROP PROCEDURE dbo.Rechazos_GetByExpedienteId;
GO
CREATE PROCEDURE dbo.Rechazos_GetByExpedienteId
  @ExpedienteId INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT 
    r.RechazoId,
    r.ExpedienteId,
    r.UsuarioId,
    u.Nombre AS Usuario,
    r.Justificacion,
    r.Fecha
  FROM dbo.Rechazos r
  JOIN dbo.Usuarios u ON u.UsuarioId = r.UsuarioId
  WHERE r.ExpedienteId = @ExpedienteId
  ORDER BY r.Fecha DESC, r.RechazoId DESC;
END
GO

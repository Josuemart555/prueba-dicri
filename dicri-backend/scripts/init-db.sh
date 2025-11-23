#!/bin/bash
# Esperar a que SQL Server esté listo
sleep 30s

# Ejecutar el script de schema
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $SA_PASSWORD -i /sql/schema.sql
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $SA_PASSWORD -i /sql/procedures.sql

echo "Base de datos inicializada"
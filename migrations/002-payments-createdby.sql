-- Migración: abonos (payments) y autor (created_by) para facturas
-- Run this in the Supabase SQL Editor.


-- 1) Columna de pagos (abonos) en formato JSONB
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS payments JSONB DEFAULT '[]'::jsonb;

-- 2) Columna con el correo del usuario que creó la factura
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS created_by TEXT;

-- 3) Índice para filtros por usuario
CREATE INDEX IF NOT EXISTS invoices_created_by_idx ON invoices (created_by);
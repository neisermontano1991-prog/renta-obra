-- =============================================
-- RentaObra - Migration 3: Add missing columns
-- Ejecuta este en Supabase SQL Editor
-- =============================================

-- Agregar columnas a businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS iva_rate NUMERIC(5,2) DEFAULT 19;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS prefix TEXT DEFAULT 'FAC';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Agregar columna de notas a invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_notes TEXT;

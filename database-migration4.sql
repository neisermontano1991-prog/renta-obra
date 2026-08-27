-- =============================================
-- RentaObra - Migration 4: delivered + extra fields + quantity
-- Ejecuta este en Supabase SQL Editor
-- =============================================

-- Agregar columna delivered a invoice_items
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS delivered BOOLEAN DEFAULT false;

-- Agregar columna quantity a invoice_items
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- Agregar columnas extra a invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS extra_charge NUMERIC DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS extra_description TEXT DEFAULT '';

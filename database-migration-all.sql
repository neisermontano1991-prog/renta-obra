-- =============================================
-- RentaObra - Migración UNIFICADA
-- Ejecuta este en Supabase SQL Editor si NO ejecutaste las migraciones anteriores
-- =============================================

-- 1. businesses: columnas de configuración
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS iva_rate NUMERIC(5,2) DEFAULT 19;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS prefix TEXT DEFAULT 'FAC';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS admin_name TEXT DEFAULT '';

-- 2. invoices: notas y cargo adicional
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_notes TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS extra_charge NUMERIC DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS extra_description TEXT DEFAULT '';

-- 3. invoice_items: entregado, cantidad
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS delivered BOOLEAN DEFAULT false;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- 4. Fix FKs que bloquean inserts
ALTER TABLE invoice_items DROP CONSTRAINT IF EXISTS invoice_items_tool_id_fkey;
ALTER TABLE invoice_items ALTER COLUMN tool_id DROP NOT NULL;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_client_id_fkey;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_business_id_fkey;

-- 5. Contador
INSERT INTO counters (id, seq) VALUES ('invoice-seq', 22) ON CONFLICT (id) DO NOTHING;

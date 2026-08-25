-- =============================================
-- RentaObra - Migration 2: Drop FKs that block inserts
-- Ejecuta este en Supabase SQL Editor
-- =============================================

-- Eliminar FK en invoices.client_id (la app maneja integridad propia)
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_client_id_fkey;

-- Eliminar FK en invoices.business_id
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_business_id_fkey;

-- Eliminar FK en invoice_items.invoice_id (ya borramos items antes de reinsertar)
-- Mantenemos este porque cascada con DELETE de invoices es útil
-- Solo lo dejamos, no lo tocamos

-- Asegurar que counters exista
INSERT INTO counters (id, seq) VALUES ('invoice-seq', 22)
ON CONFLICT (id) DO NOTHING;

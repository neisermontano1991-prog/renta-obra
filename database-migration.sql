-- =============================================
-- RentaObra - Migration: Fix invoice_items FK + Add DELETE policies
-- Ejecuta este script en el SQL Editor de Supabase
-- https://supabase.com/dashboard → SQL Editor → New query → Run
-- =============================================

-- 1. Eliminar la foreign key en invoice_items.tool_id
-- (la app usa IDs locales, no UUIDs de Supabase)
ALTER TABLE invoice_items DROP CONSTRAINT IF EXISTS invoice_items_tool_id_fkey;

-- 2. Hacer tool_id nullable (ya lo es por defecto, pero por seguridad)
ALTER TABLE invoice_items ALTER COLUMN tool_id DROP NOT NULL;

-- 3. Agregar DELETE policies que faltaban
DO $$
BEGIN
  -- businesses
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own business' AND tablename = 'businesses') THEN
    CREATE POLICY "Users can delete own business" ON businesses FOR DELETE USING (true);
  END IF;

  -- clients
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own clients' AND tablename = 'clients') THEN
    CREATE POLICY "Users can delete own clients" ON clients FOR DELETE USING (true);
  END IF;

  -- tools
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own tools' AND tablename = 'tools') THEN
    CREATE POLICY "Users can delete own tools" ON tools FOR DELETE USING (true);
  END IF;

  -- invoices
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own invoices' AND tablename = 'invoices') THEN
    CREATE POLICY "Users can delete own invoices" ON invoices FOR DELETE USING (true);
  END IF;

  -- invoice_items
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own invoice_items' AND tablename = 'invoice_items') THEN
    CREATE POLICY "Users can delete own invoice_items" ON invoice_items FOR DELETE USING (true);
  END IF;
END
$$;

-- 4. Insertar contador si no existe
INSERT INTO counters (id, seq) VALUES ('invoice-seq', 22)
ON CONFLICT (id) DO NOTHING;

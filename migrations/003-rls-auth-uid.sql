-- =============================================
-- RentaObra - Migración 3: RLS por auth.uid()
-- PROTEGE la base: cualquiera con la key pública anónima
-- ya NO puede leer, modificar ni borrar datos.
-- Ejecuta este en el SQL Editor de Supabase.
-- =============================================

-- =============================================
-- 1) Habilitar RLS en todas las tablas (idempotente)
-- =============================================
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF to_regclass('public.expenses') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE expenses ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- =============================================
-- 2) Eliminar las políticas permisivas antiguas (USING true)
-- =============================================
DROP POLICY IF EXISTS "Users can view own business" ON businesses;
DROP POLICY IF EXISTS "Users can insert business" ON businesses;
DROP POLICY IF EXISTS "Users can update own business" ON businesses;
DROP POLICY IF EXISTS "Users can delete own business" ON businesses;

DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

DROP POLICY IF EXISTS "Users can view own tools" ON tools;
DROP POLICY IF EXISTS "Users can insert tools" ON tools;
DROP POLICY IF EXISTS "Users can update own tools" ON tools;
DROP POLICY IF EXISTS "Users can delete own tools" ON tools;

DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;

DROP POLICY IF EXISTS "Users can view own invoice_items" ON invoice_items;
DROP POLICY IF EXISTS "Users can insert invoice_items" ON invoice_items;
DROP POLICY IF EXISTS "Users can update own invoice_items" ON invoice_items;
DROP POLICY IF EXISTS "Users can delete own invoice_items" ON invoice_items;

DROP POLICY IF EXISTS "Users can view counters" ON counters;
DROP POLICY IF EXISTS "Users can insert counters" ON counters;
DROP POLICY IF EXISTS "Users can update counters" ON counters;

DROP POLICY IF EXISTS "anon_all" ON businesses;
DROP POLICY IF EXISTS "anon_all" ON clients;
DROP POLICY IF EXISTS "anon_all" ON tools;
DROP POLICY IF EXISTS "anon_all" ON invoices;
DROP POLICY IF EXISTS "anon_all" ON invoice_items;
DROP POLICY IF EXISTS "anon_all" ON counters;

-- =============================================
-- 3) Tablas COMPARTIDAS (negocio, clientes, herramientas,
--    contador, gastos): SOLO usuarios logueados
-- =============================================

CREATE POLICY "req_auth_select" ON businesses FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "req_auth_insert" ON businesses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "req_auth_update" ON businesses FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "req_auth_delete" ON businesses FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "req_auth_select" ON clients FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "req_auth_insert" ON clients FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "req_auth_update" ON clients FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "req_auth_delete" ON clients FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "req_auth_select" ON tools FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "req_auth_insert" ON tools FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "req_auth_update" ON tools FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "req_auth_delete" ON tools FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "req_auth_select" ON counters FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "req_auth_insert" ON counters FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "req_auth_update" ON counters FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "req_auth_delete" ON counters FOR DELETE USING (auth.uid() IS NOT NULL);

DO $$
BEGIN
  IF to_regclass('public.expenses') IS NOT NULL THEN
    EXECUTE 'CREATE POLICY "req_auth_select" ON expenses FOR SELECT USING (auth.uid() IS NOT NULL)';
    EXECUTE 'CREATE POLICY "req_auth_insert" ON expenses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL)';
    EXECUTE 'CREATE POLICY "req_auth_update" ON expenses FOR UPDATE USING (auth.uid() IS NOT NULL)';
    EXECUTE 'CREATE POLICY "req_auth_delete" ON expenses FOR DELETE USING (auth.uid() IS NOT NULL)';
  END IF;
END $$;

-- =============================================
-- 4) Facturas y líneas: SOLO su dueño (por email del JWT)
--    El app guarda created_by = email del usuario
-- =============================================

-- SELECT: ve su propia factura; las legacy (sin created_by)
-- también, pero solo usuarios autenticados.
CREATE POLICY "owner_select" ON invoices FOR SELECT USING (
  auth.uid() IS NOT NULL
  AND (
    created_by IS NULL
    OR created_by = ''
    OR lower(created_by) = lower(auth.jwt() ->> 'email')
  )
);

CREATE POLICY "owner_insert" ON invoices FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
  AND lower(created_by) = lower(auth.jwt() ->> 'email')
);

CREATE POLICY "owner_update" ON invoices FOR UPDATE USING (
  auth.uid() IS NOT NULL
  AND lower(created_by) = lower(auth.jwt() ->> 'email')
);

CREATE POLICY "owner_delete" ON invoices FOR DELETE USING (
  auth.uid() IS NOT NULL
  AND lower(created_by) = lower(auth.jwt() ->> 'email')
);

-- Líneas de factura: se controlan vía su factura padre.
CREATE POLICY "owner_select" ON invoice_items FOR SELECT USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM invoices i
    WHERE i.id = invoice_items.invoice_id
      AND (
        i.created_by IS NULL
        OR i.created_by = ''
        OR lower(i.created_by) = lower(auth.jwt() ->> 'email')
      )
  )
);

CREATE POLICY "owner_insert" ON invoice_items FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM invoices i
    WHERE i.id = invoice_items.invoice_id
      AND lower(i.created_by) = lower(auth.jwt() ->> 'email')
  )
);

CREATE POLICY "owner_update" ON invoice_items FOR UPDATE USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM invoices i
    WHERE i.id = invoice_items.invoice_id
      AND lower(i.created_by) = lower(auth.jwt() ->> 'email')
  )
);

CREATE POLICY "owner_delete" ON invoice_items FOR DELETE USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM invoices i
    WHERE i.id = invoice_items.invoice_id
      AND lower(i.created_by) = lower(auth.jwt() ->> 'email')
  )
);

-- =============================================
-- 5) (Opcional) Asigna las facturas "legacy" (sin created_by)
--    a cada usuario que ya existe, para que queden solo suyas.
--    Ejecuta tantas veces como usuarios quieras, cambiando el email:
-- =============================================
-- UPDATE invoices SET created_by = 'tu-email@ejemplo.com'
-- WHERE created_by IS NULL OR created_by = '';

-- =============================================
-- Verificación rápida (debe devolver 0 filas para anonymouse):
-- SELECT * FROM invoices;
-- En el panel de edición ejecuta 'auth.login' para probar con sesión.
-- =============================================
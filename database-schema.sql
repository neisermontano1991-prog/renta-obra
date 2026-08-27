-- =============================================
-- RentaObra - Supabase Database Schema
-- =============================================
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase
-- https://supabase.com/dashboard → SQL Editor → New query → Run

-- Tabla: businesses (negocios)
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  nif TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: clients (clientes)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nit TEXT,
  phone TEXT,
  email TEXT,
  addr TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: tools (herramientas)
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  serial TEXT,
  price_day NUMERIC(10,2) NOT NULL,
  stock INTEGER DEFAULT 1,
  status TEXT DEFAULT 'disponible',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: invoices (facturas)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  number TEXT NOT NULL,
  date TEXT NOT NULL,
  due_date TEXT,
  status TEXT DEFAULT 'pendiente',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: invoice_items (líneas de factura)
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,
  tool_name TEXT NOT NULL,
  days INTEGER NOT NULL DEFAULT 1,
  price_day NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: counters (secuencias)
CREATE TABLE IF NOT EXISTS counters (
  id TEXT PRIMARY KEY,
  seq INTEGER NOT NULL DEFAULT 0
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================
-- IMPORTANTE: ejecuta también migrations/003-rls-auth-uid.sql
-- (limpia las políticas USING(true) y crea las políticas por auth.uid()).

-- Habilitar RLS en todas las tablas
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;

-- Las políticas reales viven en migrations/003-rls-auth-uid.sql.
-- Resumen de las políticas aplicadas por la migración 003:
--   - businesses / clients / tools / counters / expenses (compartidas):
--       todas las operaciones requieren estar autenticado (auth.uid() IS NOT NULL).
--   - invoices / invoice_items (por usuario):
--       SELECT: auth.uid() IS NOT NULL Y (created_by vacío O created_by = email del JWT)
--       INSERT/UPDATE/DELETE: created_by = email del JWT.

-- =============================================
-- Seed Data (Datos iniciales)
-- =============================================
-- Insertar negocio de ejemplo
INSERT INTO businesses (id, name, nif, address, phone, email)
VALUES (
  'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1',
  'RentaObra Solutions',
  'B12345678',
  'Calle Principal 123, Madrid',
  '912 345 678',
  'info@rentaobra.es'
);

-- Insertar clientes de ejemplo
INSERT INTO clients (business_id, name, nit, phone, email, addr) VALUES
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Constructora García', 'B87654321', '600 111 222', 'garcia@constructora.es', 'Av. Industria 45, Madrid'),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Edificaciones López', 'B11223344', '600 333 444', 'lopez@edificaciones.es', 'Calle Mayor 78, Barcelona'),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Obras y Reformas Martín', 'B55667788', '600 555 666', 'martin@obras.es', 'Polígono Industrial, Valencia'),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Instalaciones Ruiz', 'B99887766', '600 777 888', 'ruiz@instalaciones.es', 'Calle Nueva 12, Sevilla'),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Proyectos Fernández', 'B44332211', '600 999 000', 'fernandez@proyectos.es', 'Av. Libertad 90, Bilbao');

-- Insertar herramientas de ejemplo
INSERT INTO tools (business_id, name, brand, model, serial, price_day, stock, status) VALUES
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Taladro Percutor', 'Bosch', 'GSB 20-2', 'TL-001', 15.00, 10, 'disponible'),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Amoladora Angular', 'Makita', 'GA5030', 'TL-002', 12.00, 8, 'disponible'),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Sierra Circular', 'DeWalt', 'DWE575', 'TL-003', 20.00, 5, 'disponible'),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Compresor 50L', 'Ingco', 'AC5008', 'TL-004', 25.00, 4, 'disponible'),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Martillo Demoledor', 'Hilti', 'TE 700', 'TL-005', 35.00, 3, 'disponible'),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Generador 5kVA', 'Kipor', 'KGE 5000', 'TL-006', 30.00, 2, 'disponible'),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Soldadora Inverter', 'Jasic', 'Arc 200', 'TL-007', 18.00, 6, 'disponible'),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Nivel Láser', 'Bosch', 'GCL 2-50', 'TL-008', 22.00, 4, 'disponible');

-- Insertar contador de facturas
INSERT INTO counters (id, seq) VALUES ('invoice-seq', 22);

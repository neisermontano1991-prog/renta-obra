# RentaObra - Documentacion Completa del Proyecto

---

## 1. Descripcion General

**RentaObra** es una aplicacion web para la gestion de facturacion de alquiler de herramientas de construccion. Permite a un negocio de alquiler de herramientas crear facturas, gestionar clientes, administrar su catalogo de herramientas, y visualizar un panel de control con metricas clave (KPIs).

### Usuarios objetivo

- pequenos y medianos negocios de alquiler de herramientas de construccion
- administradores que necesitan generar facturas rapidas por el alquiler diario de herramientas
- trabajadores independientes que alquilan su equipamiento

### Stack tecnologico

| Capa | Tecnologia |
|---|---|
| Framework | Angular 19.2 (standalone components, signals) |
| Backend/BDD | Supabase (PostgreSQL + API REST + RLS) |
| PWA | Angular Service Worker (`@angular/service-worker`) |
| Lenguaje | TypeScript 5.7 |
| Estilos | CSS puro (sin framework CSS externo) |
| Despliegue | Netlify |
| APK (TWA) | PWABuilder / Bubblewrap via GitHub Actions |

---

## 2. Estructura del Proyecto

```
renta-obra/
├── .github/
│   └── workflows/
│       └── build-apk.yml              # GitHub Actions para construir APK (TWA)
├── public/
│   ├── _redirects                      # Configuracion de redirecciones Netlify
│   ├── manifest.webmanifest            # Manifest PWA
│   ├── favicon.ico
│   └── icons/
│       ├── icon-72x72.png
│       ├── icon-96x96.png
│       ├── icon-128x128.png
│       ├── icon-144x144.png
│       ├── icon-152x152.png
│       ├── icon-192x192.png
│       ├── icon-384x384.png
│       └── icon-512x512.png
├── src/
│   ├── index.html                      # HTML principal (lang="es")
│   ├── main.ts                         # Punto de entrada de la app
│   ├── styles.css                      # Estilos globales + design tokens
│   ├── environments/
│   │   ├── environment.ts              # Variables de entorno (dev)
│   │   └── environment.prod.ts         # Variables de entorno (prod)
│   └── app/
│       ├── app.config.ts               # Configuracion de providers Angular
│       ├── app.routes.ts               # Definicion de rutas
│       ├── app.component.ts            # Componente raiz
│       ├── app.component.html          # Template del componente raiz
│       ├── app.component.css           # Estilos del componente raiz
│       ├── core/
│       │   ├── models/
│       │   │   └── index.ts            # Interfaces: Business, Client, Tool, Invoice, etc.
│       │   ├── services/
│       │   │   ├── data.service.ts     # Servicio central de datos
│       │   │   └── supabase.service.ts # Cliente Supabase exportado
│       │   └── pipes/
│       │       └── format.pipe.ts      # CurrencyFormatPipe y DateFormatPipe
│       ├── shared/
│       │   └── components/
│       │       ├── badge/
│       │       │   └── badge.component.ts       # Badge de estado de factura
│       │       ├── toast/
│       │       │   ├── toast.component.ts       # Componente de notificacion toast
│       │       │   └── toast.service.ts         # Servicio para mostrar toasts
│       │       ├── sidebar/
│       │       │   ├── sidebar.component.ts     # Sidebar de navegacion
│       │       │   ├── sidebar.component.html
│       │       │   └── sidebar.component.css
│       │       └── invoice-doc/
│       │           └── invoice-doc.component.ts # Componente de vista previa de factura
│       └── features/
│           ├── panel/
│           │   ├── panel.component.ts           # Panel de control (dashboard)
│           │   ├── panel.component.html
│           │   └── panel.component.css
│           ├── facturas/
│           │   ├── facturas.component.ts        # Lista de facturas
│           │   ├── facturas.component.html
│           │   └── facturas.component.css
│           ├── nueva-factura/
│           │   ├── nueva-factura.component.ts   # Crear/editar factura
│           │   ├── nueva-factura.component.html
│           │   └── nueva-factura.component.css
│           ├── clientes/
│           │   ├── clientes.component.ts        # Gestion de clientes
│           │   ├── clientes.component.html
│           │   └── clientes.component.css
│           ├── herramientas/
│           │   ├── herramientas.component.ts    # Catalogo de herramientas
│           │   ├── herramientas.component.html
│           │   └── herramientas.component.css
│           ├── ajustes/
│           │   ├── ajustes.component.ts         # Configuracion del negocio
│           │   ├── ajustes.component.html
│           │   └── ajustes.component.css
│           ├── ios-nueva-factura/
│           │   ├── ios-nueva-factura.component.ts   # Vista iOS de nueva factura
│           │   ├── ios-nueva-factura.component.html
│           │   └── ios-nueva-factura.component.css
│           ├── ios-transferencia/
│           │   ├── ios-transferencia.component.ts   # Vista iOS de transferencia
│           │   ├── ios-transferencia.component.html
│           │   └── ios-transferencia.component.css
│           └── android-facturas/
│               ├── android-facturas.component.ts    # Vista Android de facturas
│               ├── android-facturas.component.html
│               └── android-facturas.component.css
├── database-schema.sql                 # Schema inicial de Supabase
├── database-migration.sql              # Migracion 1: FK fix + DELETE policies
├── database-migration2.sql             # Migracion 2: Drop FKs que bloquean inserts
├── database-migration3.sql             # Migracion 3: Columnas faltantes (iva_rate, prefix, logo_url, invoice_notes)
├── database-migration4.sql             # Migracion 4: delivered, quantity, extra_charge, extra_description
├── database-migration-all.sql          # Migracion unificada (todas las anteriores)
├── angular.json                        # Configuracion de Angular CLI
├── package.json                        # Dependencias del proyecto
├── tsconfig.json                       # Configuracion de TypeScript
├── tsconfig.app.json                   # Configuracion TS para la app
├── tsconfig.spec.json                  # Configuracion TS para tests
├── ngsw-config.json                    # Configuracion del service worker
└── README.md                           # README por defecto de Angular CLI
```

---

## 3. Arquitectura

### 3.1 Componentes Standalone (sin NgModule)

Todos los componentes en esta app son **standalone** (declara `standalone: true` en el decorador `@Component`). Esto significa que NO existen modulos `NgModule` en la app. Cada componente importa directamente lo que necesita (CommonModule, RouterLink, FormsModule, pipes, etc.).

**Ventaja:** No hay que declarar componentes en ningun modulo. Cada componente es autocontenido.

### 3.2 Signals para gestion de estado

La app usa **Signals de Angular 19** para manejar todo el estado reactivo:

- `signal()` - crea un valor reactivo modificable
- `computed()` - crea un valor derivado que se recalcula automaticamente
- `effect()` - ejecuta codigo cuando cambian los signals que lee

No se usa RxJS para el estado de la UI (solo se usa `toSignal` en `AppComponent` para convertir eventos del router a signal).

### 3.3 DataService como servicio central

**`DataService`** (`src/app/core/services/data.service.ts`) es el corazon de la app. Es un servicio inyectable singleton (`providedIn: 'root'`) que:

1. Mantiene todos los datos en signals privados
2. Expone signals de solo lectura (`business$`, `clients$`, `tools$`, `invoices$`)
3. Contiene toda la logica de CRUD (crear, leer, actualizar, borrar)
4. Se conecta a Supabase al iniciar, y si falla, usa localStorage
5. Sincroniza automaticamente con Supabase cuando esta conectado

### 3.4 Dual mode: Supabase + localStorage

El DataService opera en dos modos:

1. **Supabase (preferido):** Al iniciar, intenta cargar todos los datos de Supabase. Si tiene exito, marca `connected = true` y todas las operaciones CRUD van a Supabase.
2. **localStorage (fallback):** Si Supabase no esta disponible (sin internet, configuracion incorrecta), carga datos de `localStorage` usando la key `rentaobra-state-v1`. Todos los cambios se guardan ahi.

**Flujo de inicializacion en el constructor:**
```
constructor() → createClient(Supabase) → init()
  → init() intenta loadFromSupabase()
    → Si tiene exito: connected = true
    → Si falla: loadFromLocalStorage()
```

### 3.5 Routing con lazy loading

Todas las rutas usan `loadComponent` con `() => import(...)`, lo que significa que Angular carga cada componente **solo cuando el usuario navega a esa ruta**. Esto reduce el tamano del bundle inicial.

---

## 4. Modelos de Datos (Models)

Archivo: `src/app/core/models/index.ts`

### 4.1 `Business`

Representa la empresa/negocio que usa la app.

```typescript
interface Business {
  id?: string;        // UUID (de Supabase). Opcional porque puede no existir aun
  name: string;       // Nombre comercial del negocio
  nit: string;        // NIF / CIF / NIT tributario
  phone: string;      // Telefono de contacto
  addr: string;       // Direccion fisica
  email: string;      // Correo electronico
  rate: number;       // Porcentaje de IVA (ej: 19 para 19%)
  prefix: string;     // Prefijo para numerar facturas (ej: "FAC" → FAC-2026-001)
  logoUrl: string;    // URL o base64 del logo de la empresa
  adminName: string;  // Nombre del administrador (aparece en la firma de la factura)
}
```

### 4.2 `Client`

Un cliente que alquila herramientas.

```typescript
interface Client {
  id?: string;    // UUID
  name: string;   // Nombre completo o razon social
  nit: string;    // NIF/CIF/NIT
  phone: string;  // Telefono
  email: string;  // Email
  addr: string;   // Direccion
}
```

### 4.3 `Tool`

Una herramienta del catalogo de alquiler.

```typescript
interface Tool {
  id?: string;        // UUID
  name: string;       // Nombre de la herramienta (ej: "Taladro percutor Bosch GSB 21")
  priceDay: number;   // Precio de alquiler por dia en COP
  stock: number;      // Cantidad disponible en inventario
}
```

### 4.4 `InvoiceItem`

Una linea dentro de una factura (una herramienta alquilada).

```typescript
interface InvoiceItem {
  toolId?: string;    // ID de la herramienta (nullable si fue borrada del catalogo)
  name: string;       // Nombre de la herramienta (se guarda independientemente del toolId)
  priceDay: number;   // Precio por dia al momento de crear la factura
  days: number;       // Cantidad de dias de alquiler
  quantity?: number;  // Cantidad de unidades (default: 1)
  delivered?: boolean; // Si la herramienta fue entregada al cliente (default: false)
}
```

### 4.5 `Invoice`

Una factura completa.

```typescript
interface Invoice {
  id?: string;                // UUID
  num: string;                // Numero de factura (ej: "FAC-2026-018")
  clientId?: string;          // UUID del cliente
  date: string;               // Fecha de emision (formato "YYYY-MM-DD")
  due: string;                // Fecha de vencimiento (formato "YYYY-MM-DD")
  method: string;             // Forma de pago ("Transferencia", "Efectivo", "Tarjeta", etc.)
  status: 'pagada' | 'pendiente' | 'vencida';  // Estado de la factura
  items: InvoiceItem[];       // Lineas de la factura
  notes?: string;             // Notas adicionales
  extraCharge?: number;       // Cargo adicional (ej: transporte)
  extraDescription?: string;  // Descripcion del cargo adicional
}
```

### 4.6 `InvoiceStatus`

```typescript
type InvoiceStatus = Invoice['status'];  // 'pagada' | 'pendiente' | 'vencida'
```

### 4.7 `AppState`

Interface que describe el estado completo de la app (usado para localStorage).

```typescript
interface AppState {
  business: Business;    // Datos del negocio
  clients: Client[];     // Lista de clientes
  tools: Tool[];         // Lista de herramientas
  invoices: Invoice[];   // Lista de facturas
  seq: number;           // Siguiente numero de secuencia para facturas
}
```

---

## 5. Servicios

### 5.1 DataService

Archivo: `src/app/core/services/data.service.ts` (505 lineas)

#### Signals privados (estado interno)

| Signal | Tipo | Descripcion |
|---|---|---|
| `connected` | `signal<boolean>` | `true` si hay conexion a Supabase |
| `business` | `signal<Business>` | Datos del negocio (default: "RentaObra S.L.") |
| `clients` | `signal<Client[]>` | Lista de clientes (5 defaults de ejemplo) |
| `tools` | `signal<Tool[]>` | Lista de herramientas (8 defaults de ejemplo) |
| `invoices` | `signal<Invoice[]>` | Lista de facturas (5 defaults de ejemplo) |
| `seq` | `signal<number>` | Secuencia de numeracion de facturas (inicia en 23) |

#### Signals publicos (solo lectura)

| Signal | Tipo | Descripcion |
|---|---|---|
| `business$` | `readonly signal<Business>` | Acceso de solo lectura a business |
| `clients$` | `readonly signal<Client[]>` | Acceso de solo lectura a clients |
| `tools$` | `readonly signal<Tool[]>` | Acceso de solo lectura a tools |
| `invoices$` | `readonly signal<Invoice[]>` | Acceso de solo lectura a invoices |
| `isConnected` | `readonly signal<boolean>` | Estado de conexion a Supabase |

#### Computed signals

| Signal | Descripcion |
|---|---|
| `invoicesCount` | Numero total de facturas (`this.invoices().length`) |
| `totalFacturado` | Suma de todas las facturas con status `pagada` (priceDay * days de cada item) |

#### Constructor y flujo de inicializacion

```typescript
constructor() {
  this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  this.init();
}
```

`init()` es async:
1. Intenta `loadFromSupabase()` - carga businesses, clients, tools, invoices y seq en paralelo
2. Si tiene exito: `connected.set(true)`
3. Si falla: `loadFromLocalStorage()` - carga del localStorage

#### Metodos publicos

##### CRUD de Clientes

| Metodo | Firma | Descripcion |
|---|---|---|
| `addClient` | `(c: Omit<Client, 'id'>) => Promise<Client>` | Crea un cliente nuevo. Si hay Supabase, lo inserta alli y usa el UUID retornado. Si no, genera un UUID local con `crypto.randomUUID()`. Retorna el cliente con ID. |
| `updateClient` | `(c: Client) => Promise<void>` | Actualiza un cliente existente. Si hay Supabase, actualiza alla. Siempre actualiza el signal local. |
| `removeClient` | `(id: string) => Promise<void>` | Elimina un cliente. Si hay Supabase, lo borra de alla. Filtra el signal local. |

##### CRUD de Herramientas

| Metodo | Firma | Descripcion |
|---|---|---|
| `addTool` | `(t: Omit<Tool, 'id'>) => Promise<Tool>` | Crea una herramienta nueva. Misma logica dual Supabase/local. |
| `updateTool` | `(t: Tool) => Promise<void>` | Actualiza una herramienta existente. |
| `removeTool` | `(id: string) => Promise<void>` | Elimina una herramienta por ID. |

##### CRUD de Facturas

| Metodo | Firma | Descripcion |
|---|---|---|
| `addInvoice` | `(inv: Omit<Invoice, 'id' \| 'num'>) => Promise<Invoice>` | Crea una factura nueva. Genera el numero con formato `{prefix}-{anio}-{seq}`. Inserta la factura y todos sus items en Supabase (o local). Actualiza el contador `seq`. |
| `updateInvoice` | `(inv: Invoice) => Promise<void>` | Actualiza una factura existente. Primero actualiza los campos de la factura, luego borra todos los items viejos y reinserta los nuevos (estrategia de "borrar y reinsertar"). |
| `deleteInvoice` | `(id: string) => Promise<void>` | Elimina una factura y sus items. |
| `toggleInvoiceStatus` | `(id: string) => Promise<void>` | Cambia el status entre `pagada` y `pendiente`. Si se marca como pagada, todos los items se marcan como `delivered = true`. |
| `toggleItemDelivered` | `(invoiceId: string, itemIndex: number) => Promise<void>` | Cambia el estado `delivered` de un item individual. Si todos los items quedan entregados, la factura pasa automaticamente a `pagada`. |

##### Actualizar Negocio

| Metodo | Firma | Descripcion |
|---|---|---|
| `updateBusiness` | `(b: Partial<Business>) => Promise<void>` | Actualiza los campos del negocio (nombre, NIF, direccion, IVA, etc.). Siempre actualiza el signal local y, si hay Supabase, tambien alla. |

##### Metodos de consulta

| Metodo | Firma | Descripcion |
|---|---|---|
| `getClientById` | `(id: string) => Client \| undefined` | Busca un cliente por ID. |
| `getToolById` | `(id: string) => Tool \| undefined` | Busca una herramienta por ID. |
| `getInvoicesByClient` | `(clientId: string) => Invoice[]` | Retorna todas las facturas de un cliente. |
| `getActiveToolCount` | `(toolId: string) => number` | Cuenta cuantas facturas pendientes/vencidas contienen una herramienta dada. |

#### Logica Supabase vs localStorage

Cada metodo CRUD verifica `this.connected()`:
- Si es `true`: ejecuta la operacion en Supabase primero, luego actualiza el signal local
- Si es `false`: solo opera sobre el signal local y guarda a localStorage con `saveToLocal()`

`saveToLocal()` serializa todo el estado (`business`, `clients`, `tools`, `invoices`, `seq`) a la key `rentaobra-state-v1` en localStorage.

#### Mapeo de columnas Supabase

La app usa camelCase en TypeScript pero snake_case en Supabase. Ejemplos del mapeo:

| Modelo (TS) | Supabase (DB) |
|---|---|
| `Business.nit` | `businesses.nif` |
| `Business.addr` | `businesses.address` |
| `Business.rate` | `businesses.iva_rate` |
| `Business.logoUrl` | `businesses.logo_url` |
| `Business.adminName` | `businesses.admin_name` |
| `Tool.priceDay` | `tools.price_day` |
| `Invoice.num` | `invoices.number` |
| `Invoice.clientId` | `invoices.client_id` |
| `Invoice.due` | `invoices.due_date` |
| `Invoice.method` | `invoices.notes` (campo reutilizado) |
| `Invoice.notes` | `invoices.invoice_notes` |
| `Invoice.extraCharge` | `invoices.extra_charge` |
| `Invoice.extraDescription` | `invoices.extra_description` |
| `InvoiceItem.toolId` | `invoice_items.tool_id` |
| `InvoiceItem.priceDay` | `invoice_items.price_day` |
| `InvoiceItem.quantity` | `invoice_items.quantity` |
| `InvoiceItem.delivered` | `invoice_items.delivered` |

### 5.2 Supabase Service

Archivo: `src/app/core/services/supabase.service.ts` (7 lineas)

Este archivo exporta una instancia del cliente Supabase:

```typescript
export const supabase: SupabaseClient = createClient(
  environment.supabaseUrl,
  environment.supabaseAnonKey
);
```

**Nota:** Este servicio NO es usado directamente por los componentes. El `DataService` crea su propia instancia de Supabase internamente. Este archivo existe como alternativa/respaldo si se necesita acceso directo a Supabase desde otro lugar.

---

## 6. Componentes

### 6.1 AppComponent

- **Archivo:** `src/app/app.component.ts`
- **Rol:** Componente raiz de la aplicacion. Maneja el layout principal.
- **Lo que hace:**
  - Detecta la URL actual usando `toSignal` sobre `router.events`
  - Muestra el sidebar solo si la URL NO empieza con `/ios/` o `/android/` (las vistas moviles no llevan sidebar)
  - Muestra `<router-outlet>` para el contenido de cada pagina
  - Muestra `<app-toast>` para notificaciones globales
  - Detecta la vista actual (`currentView`) para resaltar el link activo en el sidebar
  - Provee `navigateTo(view)` para navegacion programatica

**Template:**
```html
<div class="app" [class.has-sidebar]="showSidebar">
  @if (showSidebar) {
    <app-sidebar [currentView]="currentView" (viewChange)="navigateTo($event)"></app-sidebar>
  }
  <main class="main" [class.main-full]="!showSidebar">
    <div class="container">
      <router-outlet></router-outlet>
    </div>
  </main>
</div>
<app-toast></app-toast>
```

### 6.2 SidebarComponent

- **Archivo:** `src/app/shared/components/sidebar/sidebar.component.ts`
- **Inputs:** `@Input() currentView: string` (nombre de la vista activa)
- **Outputs:** `@Output() viewChange: EventEmitter<string>` (emite cuando el usuario hace click en un link)
- **Lo que muestra:**
  - Logo con icono SVG + nombre "RentaObra" + subtitulo "Alquiler de herramientas"
  - 6 links de navegacion: Panel, Facturas, Crear factura, Clientes, Herramientas, Ajustes
  - Cada link tiene un icono SVG inline y usa `routerLink` + `routerLinkActive`
  - Seccion de usuario abajo: avatar con iniciales del admin + nombre + rol "Administrador"
- **Computed:** `initials` - extrae las primeras 2 letras del nombre del admin

### 6.3 FacturasComponent

- **Archivo:** `src/app/features/facturas/facturas.component.ts`
- **Ruta:** `/facturas`

#### Signals

| Signal | Tipo | Descripcion |
|---|---|---|
| `activeFilter` | `signal<'todas' \| 'pagada' \| 'pendiente' \| 'vencida'>` | Filtro activo (default: `'todas'`) |
| `searchQuery` | `signal<string>` | Texto de busqueda |
| `expandedInvoice` | `signal<string \| null>` | ID de factura expandida (para ver detalle) |

#### Computed

| Signal | Descripcion |
|---|---|
| `invoiceCount` | Numero total de facturas |
| `filteredInvoices` | Lista de facturas filtrada por status y busqueda, ordenada por fecha descendente |

#### Metodos

| Metodo | Descripcion |
|---|---|
| `setFilter(f)` | Cambia el filtro activo |
| `onSearch(event)` | Actualiza la query de busqueda desde un input |
| `toggleStatus(id)` | Cambia el status de una factura (pagada ↔ pendiente) |
| `toggleExpanded(id)` | Expande/contrae el detalle de una factura |
| `toggleItemDelivered(invoiceId, itemIndex)` | Marca un item como entregado/no entregado |
| `openInvoice(inv)` | Navega a `/nueva-factura?id={inv.id}` para editar |
| `total(inv)` | Calcula el total de una factura (items + extraCharge) |
| `clientName(clientId)` | Retorna el nombre del cliente por ID |

#### Template

- Encabezado con titulo "Facturas" y conteo total
- Barra de filtros: chips (Todas, Pagadas, Pendientes, Vencidas) + campo de busqueda
- Tabla con columnas: N.º factura, Cliente, Fecha, Vencimiento, Total, Estado, Acciones
- Acciones por factura: Editar, Detalle/ Ocultar, Marcar pagada/Reabrir
- Fila expandible que muestra las herramientas de la factura con boton "Marcar entregada"

### 6.4 NuevaFacturaComponent

- **Archivo:** `src/app/features/nueva-factura/nueva-factura.component.ts`
- **Ruta:** `/nueva-factura`

Este es el componente mas complejo de la app. Permite crear facturas nuevas y editar existentes.

#### Interfaz DraftLine (local)

```typescript
interface DraftLine {
  toolId: string | null;   // ID de la herramienta seleccionada
  name: string;             // Nombre de la herramienta
  priceDay: number;         // Precio por dia
  days: number;             // Dias de alquiler
  quantity: number;         // Cantidad de unidades
  delivered?: boolean;      // Si fue entregada
}
```

#### Signals

| Signal | Tipo | Descripcion |
|---|---|---|
| `editMode` | `signal<boolean>` | `true` si esta editando una factura existente |
| `editInvoiceId` | `signal<string \| null>` | ID de la factura que se edita |
| `editInvoiceNum` | `signal<string>` | Numero de la factura que se edita |
| `date` | `signal<string>` | Fecha de emision (default: hoy) |
| `due` | `signal<string>` | Fecha de vencimiento |
| `method` | `signal<string>` | Forma de pago (default: "Transferencia") |
| `clientId` | `signal<string \| null>` | ID del cliente seleccionado |
| `showNewClient` | `signal<boolean>` | Muestra/oculta el formulario de cliente nuevo |
| `ivaRate` | `signal<number>` | Porcentaje de IVA (default: 19) |
| `extraCharge` | `signal<number>` | Cargo adicional |
| `extraDescription` | `signal<string>` | Descripcion del cargo adicional |
| `notes` | `signal<string>` | Notas de la factura |
| `lines` | `signal<DraftLine[]>` | Lineas de la factura (herramientas) |
| `newClient` | `signal<{name,nit,phone,email,addr}>` | Datos para crear un cliente nuevo |

#### Computed

| Signal | Descripcion |
|---|---|
| `base` | Suma de `priceDay * days * quantity` de todas las lineas |
| `iva` | `base * ivaRate / 100` |
| `total` | `base + extraCharge` |
| `draftItems` | Lineas filtradas (solo las que tienen toolId) en formato InvoiceItem |
| `selectedClient` | Objeto Client del cliente seleccionado |
| `toolOptions` | Lista de herramientas disponibles (= `tools()`) |

#### Metodos

| Metodo | Descripcion |
|---|---|
| `ngOnInit()` | Se suscribe a `queryParams`. Si hay `?id=xxx`, llama a `loadInvoice()` |
| `loadInvoice(id)` | Carga una factura existente para editarla. Si los datos aun no estan disponibles (Supabase lento), guarda el ID en `pendingEditId` y espera al effect |
| `updateNewClientField(field, event)` | Actualiza un campo del formulario de cliente nuevo |
| `toggleNewClient()` | Muestra/oculta el formulario de cliente nuevo |
| `saveNewClient()` | Crea un cliente nuevo y lo selecciona automaticamente |
| `onClientChange(event)` | Cambia el cliente seleccionado desde el select |
| `onToolSelect(toolId, index)` | Cuando selecciona una herramienta en una linea, llena name y priceDay |
| `onDaysChange(event, index)` | Cambia los dias de una linea |
| `onQuantityChange(event, index)` | Cambia la cantidad de una linea |
| `addLine()` | Agrega una linea vacia al final |
| `removeLine(index)` | Elimina una linea por indice |
| `saveInvoice()` | Guarda la factura (nueva o editada) y navega a `/facturas` |
| `printInvoice()` | Llama a `window.print()` |
| `onIvaChange(event)` | Cambia el porcentaje de IVA |
| `onExtraChargeChange(event)` | Cambia el cargo adicional |

#### Efecto/timeout para carga diferida

El componente tiene un `effect()` llamado `_dataReadyEffect` que resuelve un problema de timing: cuando se navega a `/nueva-factura?id=xxx`, los datos de Supabase podrian no haber cargado aun.

```typescript
private _dataReadyEffect = effect(() => {
  const tools = this.tools();
  const invoices = this.data.invoices$();
  // Si hay un pendingEditId y ya hay facturas cargadas...
  if (this.pendingEditId && invoices.length > 0) {
    this.loadInvoice(editId);  // Ahora si carga la factura
  }
  // Si hay herramientas y pendingInvoiceItems...
  if (tools.length > 0 && this.pendingInvoiceItems) {
    // Mapea las lineas pendientes y las coloca en lines()
  }
});
```

**Como funciona:**
1. `loadInvoice()` se llama antes de que Supabase responda
2. Si `invoices` esta vacio, guarda `pendingEditId = id` y retorna
3. Cuando Supabase carga los datos, los signals cambian
4. El effect detecta el cambio y re-intenta `loadInvoice()`
5. Para el `clientId`, se usa `setTimeout(() => this.clientId.set(...), 0)` para evitar un bug de Angular donde el select no se actualiza

#### Como funciona el modo edicion

1. El usuario llega desde Facturas con click en "Editar" → navega a `/nueva-factura?id=inv1`
2. `ngOnInit` lee el query param `id`
3. `loadInvoice()` busca la factura por ID
4. Si la encuentra: pone `editMode = true`, llena todos los signals con los datos existentes
5. Si no la encuentra (datos no cargados): guarda el ID como pendiente
6. Al guardar: si `editMode` es true, llama a `data.updateInvoice()`, si no, llama a `data.addInvoice()`

#### Template

Layout de dos columnas (en desktop):
- **Izquierda:** Formulario con cards (Datos de factura, Cliente, Herramientas, Notas, Totales)
- **Derecha:** Vista previa en vivo usando `<app-invoice-doc>`

En mobile: las columnas se apilan verticalmente.

### 6.5 ClientesComponent

- **Archivo:** `src/app/features/clientes/clientes.component.ts`
- **Ruta:** `/clientes`

#### Signals

| Signal | Tipo | Descripcion |
|---|---|---|
| `showForm` | `signal<boolean>` | Muestra/oculta el formulario |
| `newClient` | `signal<{name,nit,phone,email,addr}>` | Datos del nuevo cliente |

#### Computed

| Signal | Descripcion |
|---|---|
| `clientCount` | Numero total de clientes |
| `clientData` | Lista de clientes enriquecida con: `invoiceCount`, `pendingCount`, `totalAmount`, `pendingAmount` |

#### Metodos

| Metodo | Descripcion |
|---|---|
| `initials(name)` | Extrae las primeras 2 letras del nombre (para el avatar) |
| `toggleForm()` | Muestra/oculta el formulario |
| `updateField(field, event)` | Actualiza un campo del form |
| `saveClient()` | Crea un cliente nuevo, limpia el form, cierra el form |
| `removeClient(id)` | Pide confirmacion y elimina el cliente |

#### Template

- Encabezado con titulo + boton "Anadir cliente"
- Card de formulario (ocultable) con campos: Nombre, NIF/CIF, Telefono, Email, Direccion
- Lista de clientes como cards, cada una con: avatar, nombre, NIT/telefono/email, estadisticas (facturas, pendientes, total facturado), boton eliminar

### 6.6 HerramientasComponent

- **Archivo:** `src/app/features/herramientas/herramientas.component.ts`
- **Ruta:** `/herramientas`

#### Signals

| Signal | Tipo | Descripcion |
|---|---|---|
| `showForm` | `signal<boolean>` | Muestra/oculta el formulario |
| `editingTool` | `signal<Tool \| null>` | Herramienta que se esta editando (null = creando nueva) |
| `newTool` | `signal<{name, priceDay, stock}>` | Datos del form |

#### Computed

| Signal | Descripcion |
|---|---|
| `toolCount` | Numero total de herramientas |
| `toolData` | Lista de herramientas enriquecida con `activeRentals` (cuantas estan alquiladas activamente) |

#### Metodos

| Metodo | Descripcion |
|---|---|
| `toggleForm()` | Muestra/oculta form. Si se cierra, limpia editingTool |
| `startEdit(tool)` | Pone la herramienta en modo edicion, abre el form |
| `saveTool()` | Si esta editando: actualiza. Si no: crea nueva. Valida que name y priceDay > 0 |
| `removeTool(id, name)` | Pide confirmacion y elimina |
| `onFieldChange(field, event)` | Actualiza un campo del form |

#### Template

- Encabezado + boton "Anadir herramienta"
- Card de form (ocultable): Nombre, Tarifa por dia, Stock. Botones: Guardar/Actualizar + Cancelar
- Card con lista de herramientas, cada una con: nombre, precio/dia, stock, pill de "N en alquiler", botones Editar y Quitar

### 6.7 AjustesComponent

- **Archivo:** `src/app/features/ajustes/ajustes.component.ts`
- **Ruta:** `/ajustes`

#### Signals

| Signal | Tipo | Descripcion |
|---|---|---|
| `form` | `signal<{name,nit,phone,addr,email,rate,prefix,logoUrl,adminName}>` | Datos del formulario |
| `saved` | `signal<boolean>` | Indica si se guardo recientemente (muestra "Guardado ✓") |

#### El efecto de sincronizacion con Supabase

```typescript
private loaded = signal(false);

private syncEffect = effect(() => {
  const b = this.business();   // Lee el signal business
  if (!this.loaded()) {
    this.loaded.set(true);
    this.form.set({            // Llena el form con los datos del negocio
      name: b.name, nit: b.nit, phone: b.phone,
      addr: b.addr, email: b.email, rate: b.rate,
      prefix: b.prefix, logoUrl: b.logoUrl || '',
      adminName: b.adminName || '',
    });
  }
});
```

**Como funciona:**
1. El effect lee `this.business()` cada vez que cambia
2. La primera vez que se ejecuta (`loaded = false`), copia los datos del negocio al form
3. Despues marca `loaded = true` y no vuelve a sobreescribir el form
4. Esto evita que si el usuario esta escribiendo y Supabase responde, se le borren los cambios

#### Metodos

| Metodo | Descripcion |
|---|---|
| `onFieldChange(field, event)` | Actualiza un campo del form |
| `onLogoUpload(event)` | Lee un archivo de imagen como base64 y lo guarda en `logoUrl` |
| `removeLogo()` | Limpia el logo |
| `save()` | Llama a `data.updateBusiness()`, muestra "Guardado ✓" por 2 segundos |

#### Template

Card con formulario en grid:
- Nombre comercial, CIF/NIF, Telefono, Email, Direccion (ancho completo)
- Nombre del administrador, Tipo de IVA (%), Serie de facturacion
- Logo de la empresa (upload de archivo + preview + boton quitar)
- Boton "Guardar cambios"

### 6.8 InvoiceDocComponent

- **Archivo:** `src/app/shared/components/invoice-doc/invoice-doc.component.ts`
- **Selector:** `<app-invoice-doc>`
- **Rol:** Renderiza una factura completa como documento visual. Se usa en la vista previa de `NuevaFacturaComponent` y para impresion.

#### Inputs

| Input | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `business` | `Business` | Si | Datos del negocio |
| `client` | `Client \| null` | No | Cliente asignado |
| `items` | `InvoiceItem[]` | No | Lineas de la factura |
| `invoiceNum` | `string` | No | Numero de factura (vacio = "Borrador") |
| `invoiceDate` | `string` | No | Fecha de emision |
| `invoiceDue` | `string` | No | Fecha de vencimiento |
| `invoiceMethod` | `string` | No | Forma de pago |
| `invoiceNotes` | `string` | No | Notas |
| `ivaRate` | `number` | No | Porcentaje IVA (default: 19) |
| `extraCharge` | `number` | No | Cargo adicional (default: 0) |
| `extraDescription` | `string` | No | Descripcion del cargo extra |

#### Computed

| Signal | Descripcion |
|---|---|
| `base` | Suma de `priceDay * days * (quantity \|\| 1)` de todos los items |
| `iva` | `base * ivaRate / 100` |
| `total` | `base + extraCharge` |

#### Estructura del template

```
.invoice-doc
├── .doc-head (flex justify-between)
│   ├── .doc-brand (logo o SVG, nombre, NIT, telefono, direccion, email)
│   └── .doc-title (FACTURA, numero, fecha, vencimiento)
├── .doc-body
│   ├── Bloque "Facturado a" (nombre, NIT, email del cliente)
│   └── Bloque "Condiciones de pago" (metodo)
├── .doc-table (tabla de items: Herramienta, Valor/dia, Dias, Cant., Total)
├── .doc-totals (Base, IVA, cargo extra si hay, Total)
├── .doc-notes (si hay notas)
├── .doc-signature (linea + nombre del admin + "Administrador")
└── .doc-foot ("Gracias por su preferencia!")
```

**Para impresion:** Los estilos `@media print` en `styles.css` ocultan sidebar, botones, formularios, y muestran solo el documento.

### 6.9 PanelComponent

- **Archivo:** `src/app/features/panel/panel.component.ts`
- **Ruta:** `/panel` (ruta por defecto)
- **Rol:** Dashboard / panel de control con KPIs y graficos

#### Computed

| Signal | Descripcion |
|---|---|
| `ingresosDelMes` | Suma de facturas pagadas del mes actual |
| `pendienteData` | `{ total, count }` de facturas pendientes/vencidas |
| `facturasMes` | Numero de facturas emitidas en el mes actual |
| `herramientasAlquiler` | Numero de herramientas unicas en alquiler activo |
| `chartMonths` | Array de 6 ultimos meses con sus montos facturados (para el grafico de barras) |
| `chartMax` | Monto maximo del chart (para calcular alturas de barras) |
| `recentInvoices` | 5 facturas mas recientes con nombre del cliente |

#### Metodos

| Metodo | Descripcion |
|---|---|
| `invoiceTotal(inv)` | Calcula el total de una factura |

#### Template

- Encabezado con "Panel de control", fecha actual, boton "Nueva factura"
- Grid de 4 KPIs: Ingresos del mes, Pendiente de cobro, Facturas emitidas, Herramientas en alquiler
- Grid de 2 columnas:
  - **Izquierda:** Grafico de barras "Cobro mensual" (6 ultimos meses, CSS puro sin libreria externa)
  - **Derecha:** Tabla "Ultimas facturas" (5 mas recientes con numero, cliente, total, badge de estado)

### 6.10 Componentes iOS y Android (TWA Preview)

Estos componentes son **vistas de demostracion** que simulan como se veria la app en dispositivos moviles dentro de un frame de iPhone o Android.

#### IosNuevaFacturaComponent

- **Archivo:** `src/app/features/ios-nueva-factura/ios-nueva-factura.component.ts`
- **Ruta:** `/ios/nueva-factura`
- **Lo que hace:** Muestra un formulario de nueva factura dentro de un frame de iPhone 15 Pro (con Dynamic Island, barra de estado, etc.). Permite seleccionar cliente, agregar herramientas con stepper de dias, ver totales, y guardar.
- **Signals:** `clientId`, `ivaRate`, `lines`, `saved`
- **Computed:** `base`, `iva`, `total`
- **Metodos:** `onClientChange`, `onToolSelect`, `incrementDays`, `decrementDays`, `addLine`, `removeLine`, `lineTotal`, `saveInvoice`, `goBack`
- **Diferencia con NuevaFacturaComponent:** No tiene campo quantity, no tiene notas, no tiene extraCharge, no tiene modo edicion. Es una version simplificada para movil.

#### IosTransferenciaComponent

- **Archivo:** `src/app/features/ios-transferencia/ios-transferencia.component.ts`
- **Ruta:** `/ios/transferencia`
- **Lo que hace:** Simula una pantalla de confirmacion de transferencia bancaria estilo iOS. Muestra un monto, destinatario, detalles, y un boton "Confirmar envio" con spinner. Al confirmar, muestra una pantalla de exito.
- **Signals:** `loading`, `success`
- **Metodos:** `confirm` (simula delay de 1.4s), `reset`, `goBack`
- **Nota:** Esta es una vista estatica/demo. Los datos (monto, destinatario) estan hardcodeados.

#### AndroidFacturasComponent

- **Archivo:** `src/app/features/android-facturas/android-facturas.component.ts`
- **Ruta:** `/android/facturas`
- **Lo que hace:** Muestra una lista de facturas dentro de un frame de Android (con punch-hole camera, bottom navigation, FAB). Usa Material 3 design.
- **Signals:** `activeFilter`
- **Computed:** `filteredInvoices`
- **Metodos:** `setFilter`, `invoiceTotal`, `clientName`, `statusLabel`, `goBack`
- **Estilo:** Sigue Material 3 con chips, cards, bottom nav y FAB.

---

## 7. Pipes

Archivo: `src/app/core/pipes/format.pipe.ts`

### 7.1 CurrencyFormatPipe

- **Nombre en template:** `currencyFormat`
- **Formato:** Pesos colombianos (COP) con formato localizado `es-CO`
- **Ejemplo:** `1250000` → `$ 1.250.000`
- **Usado en:** Todos los componentes que muestran precios (facturas, herramientas, panel, cliente, invoice-doc, etc.)

### 7.2 DateFormatPipe

- **Nombre en template:** `dateFormat`
- **Formato:** Fecha espanola `es-ES` con formato `DD/MM/YYYY`
- **Ejemplo:** `"2026-08-19"` → `"19/08/2026"`
- **Nota:** Agrega `T00:00:00` a la cadena de fecha para evitar problemas de zona horaria
- **Usado en:** FacturasComponent, AndroidFacturasComponent, InvoiceDocComponent

---

## 8. Enrutamiento (Routes)

Archivo: `src/app/app.routes.ts`

| Ruta | Componente | Lazy Loaded | Descripcion |
|---|---|---|---|
| `''` | (redirect) | - | Redirige a `/panel` |
| `'panel'` | `PanelComponent` | Si | Panel de control / dashboard |
| `'facturas'` | `FacturasComponent` | Si | Lista de facturas |
| `'nueva-factura'` | `NuevaFacturaComponent` | Si | Crear/editar factura (soporta `?id=`) |
| `'clientes'` | `ClientesComponent` | Si | Gestion de clientes |
| `'herramientas'` | `HerramientasComponent` | Si | Catalogo de herramientas |
| `'ajustes'` | `AjustesComponent` | Si | Configuracion del negocio |
| `'ios/nueva-factura'` | `IosNuevaFacturaComponent` | Si | Demo iOS de nueva factura |
| `'ios/transferencia'` | `IosTransferenciaComponent` | Si | Demo iOS de transferencia |
| `'android/facturas'` | `AndroidFacturasComponent` | Si | Demo Android de facturas |
| `'**'` | (redirect) | - | Cualquier ruta invalida → `/panel` |

**Lazy loading:** Cada ruta usa `loadComponent: () => import('./...').then(m => m.ComponentName)`. Angular solo descarga el JavaScript del componente cuando el usuario navega a esa ruta.

---

## 9. Estilos y Diseno (CSS)

Archivo: `src/styles.css` (1118 lineas)

### 9.1 CSS Variables (Design Tokens)

#### Superficies

| Variable | Valor | Uso |
|---|---|---|
| `--bg` | `#f8fafc` | Fondo de la pagina |
| `--surface` | `#ffffff` | Fondo de cards y componentes |
| `--surface-warm` | `#fef7ed` | Superficie con tono calido |

#### Texto

| Variable | Valor | Uso |
|---|---|---|
| `--fg` | `#0f172a` | Texto principal (casi negro) |
| `--fg-2` | `#334155` | Texto secundario |
| `--muted` | `#64748b` | Texto apagado / labels |
| `--meta` | `#94a3b8` | Texto muy suave (placeholders) |

#### Bordes

| Variable | Valor | Uso |
|---|---|---|
| `--border` | `#e2e8f0` | Borde estandar |
| `--border-soft` | `#f1f5f9` | Borde suave (separadores de fila) |

#### Acento (Indigo vibrante)

| Variable | Valor | Uso |
|---|---|---|
| `--accent` | `#4f46e5` | Color principal (links, botones primarios) |
| `--accent-on` | `#ffffff` | Texto sobre acento |
| `--accent-hover` | `#4338ca` | Acento hover |
| `--accent-active` | `#3730a3` | Acento click |

#### Semanticos

| Variable | Valor | Uso |
|---|---|---|
| `--success` | `#059669` | Verde (pagada) |
| `--warn` | `#d97706` | Amarillo (pendiente) |
| `--danger` | `#e11d48` | Rojo (vencida, eliminar) |

#### Derivados (backgrounds suaves)

| Variable | Valor | Uso |
|---|---|---|
| `--accent-soft` | `#eef2ff` | Fondo claro de acento |
| `--fg-soft` | `#f8fafc` | Fondo claro de texto |
| `--success-soft` | `#ecfdf5` | Badge pagada |
| `--warn-soft` | `#fffbeb` | Badge pendiente |
| `--danger-soft` | `#fff1f2` | Badge vencida |

#### Gradientes

| Variable | Valor | Uso |
|---|---|---|
| `--gradient-accent` | `linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)` | Sidebar, botones primarios, avatares |
| `--gradient-warm` | `linear-gradient(135deg, #f97316 0%, #fb923c 100%)` | No usado actualmente |
| `--gradient-cool` | `linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)` | Pill de stock activo |

#### Tipografia

| Variable | Valor |
|---|---|
| `--font-display` | `'Inter', system-ui, sans-serif` |
| `--font-body` | `'Inter', system-ui, sans-serif` |
| `--font-mono` | `'SF Mono', 'Cascadia Code', 'Fira Code', monospace` |
| `--fs-xs` a `--fs-4xl` | Desde 12px hasta 33px |
| `--fs-page` | 28px (titulos de pagina) |
| `--fs-kpi` | 30px (valores de KPI) |
| `--fw-regular/medium/semibold/bold` | 400, 500, 600, 700 |

#### Espaciado (base 4px)

`--space-1` (4px) hasta `--space-20` (80px)

#### Bordes redondeados

| Variable | Valor |
|---|---|
| `--radius-sm` | 8px |
| `--radius-md` | 12px |
| `--radius-lg` | 16px |
| `--radius-pill` | 9999px (para badges) |

#### Elevaciones

| Variable | Valor |
|---|---|
| `--elev-flat` | `0 1px 3px rgba(0,0,0,.08)` |
| `--elev-ring` | `0 0 0 3px rgba(79,70,229,.25)` (focus ring) |
| `--elev-raised` | `0 8px 24px rgba(0,0,0,.12)` |

#### Layout

| Variable | Valor | Uso |
|---|---|---|
| `--container-max` | 1200px | Ancho maximo del contenido |
| `--gutter` | 24px | Padding horizontal |
| `--sidebar-w` | 248px | Ancho del sidebar |

### 9.2 Reset y base

- `box-sizing: border-box` global
- Tipografia Inter con font-smoothing
- Links con color accent, h1-h4 con pesos y tamanos variables
- Clases utilitarias: `.num` (tabular-nums), `.mono` (font mono), `.eyebrow` (uppercase + letter-spacing)

### 9.3 Estilos de componentes

- **Sidebar:** Fondo gradiente accent, sticky, links hover/active
- **Cards:** Borde + sombra flat + border-radius md
- **KPIs:** Grid responsive, barra de color accent a la izquierda
- **Tablas:** Headers uppercase muted, filas con hover, link rows
- **Badges:** Pills con colores segun estado (pagada=verde, pendiente=amarillo, vencida=rojo)
- **Botones:** 3 variantes (primary con gradiente, secondary con borde, ghost transparente)
- **Forms:** Labels medium, inputs con borde y focus ring accent
- **Invoice doc:** Documento centrado, max 800px, sombra raised
- **Toast:** Fijo abajo-derecha, gradiente accent, animacion slide-in

### 9.4 Estilos de impresion (`@media print`)

Oculta: sidebar, nav, side-user, btn, form-actions, toast, icon-btn, page-head, filters, gen-form, add-row-btn, item-row.

Cambia: `.app` a `display: block`, `.main` sin padding, `.invoice-doc` sin sombra/borde/padding, tabla sin color.

### 9.5 Breakpoints responsive

| Breakpoint | Cambios |
|---|---|
| `max-width: 1180px` | Grid KPIs mas compacto, chart-grid a 1 columna |
| `max-width: 900px` | Sidebar pasa a ser bottom navigation bar fijo, grid 1 columna, brand y side-user ocultos |
| `max-width: 560px` | Page head vertical, KPIs 1 columna, form 1 columna, invoice doc reducido |
| `prefers-reduced-motion` | Desactiva animaciones |

---

## 10. Base de Datos (Supabase)

### 10.1 Tablas

#### `businesses`
| Columna | Tipo | Descripcion |
|---|---|---|
| `id` | UUID (PK) | Identificador unico |
| `name` | TEXT NOT NULL | Nombre del negocio |
| `nif` | TEXT | NIF/CIF/NIT |
| `address` | TEXT | Direccion |
| `phone` | TEXT | Telefono |
| `email` | TEXT | Email |
| `logo_url` | TEXT | URL/base64 del logo |
| `iva_rate` | NUMERIC(5,2) DEFAULT 19 | Porcentaje de IVA |
| `prefix` | TEXT DEFAULT 'FAC' | Prefijo de facturacion |
| `admin_name` | TEXT DEFAULT '' | Nombre del administrador |
| `created_at` | TIMESTAMPTZ | Fecha de creacion |

#### `clients`
| Columna | Tipo | Descripcion |
|---|---|---|
| `id` | UUID (PK) | Identificador unico |
| `business_id` | UUID (FK → businesses) | Negocio dueño |
| `name` | TEXT NOT NULL | Nombre |
| `nit` | TEXT | NIT |
| `phone` | TEXT | Telefono |
| `email` | TEXT | Email |
| `addr` | TEXT | Direccion |
| `created_at` | TIMESTAMPTZ | Fecha de creacion |

#### `tools`
| Columna | Tipo | Descripcion |
|---|---|---|
| `id` | UUID (PK) | Identificador unico |
| `business_id` | UUID (FK → businesses) | Negocio dueño |
| `name` | TEXT NOT NULL | Nombre |
| `brand` | TEXT | Marca (no usado en la app) |
| `model` | TEXT | Modelo (no usado en la app) |
| `serial` | TEXT | Serial (no usado en la app) |
| `price_day` | NUMERIC(10,2) NOT NULL | Precio por dia |
| `stock` | INTEGER DEFAULT 1 | Stock disponible |
| `status` | TEXT DEFAULT 'disponible' | Estado (no usado en la app) |
| `created_at` | TIMESTAMPTZ | Fecha de creacion |

#### `invoices`
| Columna | Tipo | Descripcion |
|---|---|---|
| `id` | UUID (PK) | Identificador unico |
| `business_id` | UUID (FK → businesses) | Negocio dueño |
| `client_id` | UUID (FK → clients, ON DELETE SET NULL) | Cliente (FK eliminada en migracion 2) |
| `number` | TEXT NOT NULL | Numero de factura (FAC-2026-018) |
| `date` | TEXT NOT NULL | Fecha emision (YYYY-MM-DD) |
| `due_date` | TEXT | Fecha vencimiento |
| `status` | TEXT DEFAULT 'pendiente' | Estado: pagada, pendiente, vencida |
| `notes` | TEXT | Forma de pago (reutilizado) |
| `invoice_notes` | TEXT | Notas de la factura |
| `extra_charge` | NUMERIC DEFAULT 0 | Cargo adicional |
| `extra_description` | TEXT DEFAULT '' | Descripcion del cargo extra |
| `created_at` | TIMESTAMPTZ | Fecha de creacion |

#### `invoice_items`
| Columna | Tipo | Descripcion |
|---|---|---|
| `id` | UUID (PK) | Identificador unico |
| `invoice_id` | UUID (FK → invoices, ON DELETE CASCADE) | Factura padre |
| `tool_id` | UUID (nullable, FK eliminada en migracion 1) | Herramienta |
| `tool_name` | TEXT NOT NULL | Nombre de la herramienta |
| `days` | INTEGER NOT NULL DEFAULT 1 | Dias de alquiler |
| `price_day` | NUMERIC(10,2) NOT NULL | Precio por dia al momento de facturar |
| `quantity` | INTEGER DEFAULT 1 | Cantidad de unidades |
| `delivered` | BOOLEAN DEFAULT false | Si fue entregada |
| `created_at` | TIMESTAMPTZ | Fecha de creacion |

#### `counters`
| Columna | Tipo | Descripcion |
|---|---|---|
| `id` | TEXT (PK) | Identificador del contador |
| `seq` | INTEGER NOT NULL DEFAULT 0 | Siguiente numero de secuencia |

Contador por defecto: `('invoice-seq', 22)`

### 10.2 Migraciones

#### Migracion 1 (`database-migration.sql`)
- Elimina la FK `invoice_items_tool_id_fkey` (la app usa IDs locales, no UUIDs de Supabase)
- Hace `tool_id` nullable en `invoice_items`
- Agrega policies DELETE que faltaban en todas las tablas
- Inserta contador `invoice-seq = 22` si no existe

#### Migracion 2 (`database-migration2.sql`)
- Elimina FK `invoices_client_id_fkey` (la app maneja integridad propia)
- Elimina FK `invoices_business_id_fkey`
- Asegura que `counters` exista

#### Migracion 3 (`database-migration3.sql`)
- Agrega columnas a `businesses`: `iva_rate`, `prefix`, `logo_url`
- Agrega columna `invoice_notes` a `invoices`

#### Migracion 4 (`database-migration4.sql`)
- Agrega `delivered` (BOOLEAN) a `invoice_items`
- Agrega `quantity` (INTEGER) a `invoice_items`
- Agrega `extra_charge` y `extra_description` a `invoices`

#### Migracion unificada (`database-migration-all.sql`)
- Combina todas las anteriores en un solo archivo
- Agrega `admin_name` a `businesses`
- Para usar si NO ejecutaste las migraciones individuales

### 10.3 RLS (Row Level Security)

Todas las tablas tienen RLS habilitado. Las policies permiten todas las operaciones CRUD con `USING (true)` (sin restriccion por usuario). Esto es un ejemplo basico; en produccion se deberia restringir por `auth.uid()`.

---

## 11. PWA

### 11.1 Manifest

Archivo: `public/manifest.webmanifest`

- `name`: "renta-obra"
- `display`: "standalone" (se instala como app)
- `scope`: "./"
- `start_url`: "./"
- 8 iconos de diferentes tamanos (72x72 a 512x512), todos con `purpose: "maskable any"`

### 11.2 Service Worker

Archivo: `ngsw-config.json`

**Grupo "app"** (prefetch - se descarga todo al instalar):
- `/favicon.ico`, `/index.html`, `/manifest.webmanifest`
- `/*.css`, `/*.js`

**Grupo "assets"** (lazy - se descarga bajo demanda):
- `/**/*.(svg|cur|jpg|jpeg|png|apng|webp|avif|gif|otf|ttf|woff|woff2)`

### 11.3 Configuracion del Service Worker

En `app.config.ts`:
```typescript
provideServiceWorker('ngsw-worker.js', {
  enabled: !isDevMode(),        // Solo en produccion
  registrationStrategy: 'registerWhenStable:30000'  // Registra despues de 30s de estabilidad
})
```

### 11.4 Offline Support

La PWA permite:
- Acceso a la app sin conexion (el service worker cachea HTML, CSS y JS)
- Si Supabase no esta disponible, la app automaticamente usa localStorage como fallback

---

## 12. Guia para Modificar

### "Quiero cambiar el formulario de ajustes"

**Archivo:** `src/app/features/ajustes/ajustes.component.html`

- **Lineas 10-53:** El formulario completo esta dentro de `<div class="grid-form">`
- **Linea 12-13:** Campo "Nombre comercial"
- **Linea 16-17:** Campo "CIF / NIF"
- **Linea 20-21:** Campo "Telefono"
- **Linea 24-25:** Campo "Email"
- **Linea 27-29:** Campo "Direccion" (ancho completo con `grid-column: 1 / -1`)
- **Linea 32-33:** Campo "Nombre del administrador"
- **Linea 36-37:** Campo "Tipo de IVA (%)"
- **Linea 40-41:** Campo "Serie de facturacion"
- **Linea 43-52:** Upload de logo

**Para agregar un campo nuevo:**
1. Agregar el input en `ajustes.component.html` dentro de `.grid-form`
2. Agregar el campo al signal `form` en `ajustes.component.ts` linea 37
3. Agregar el campo a la interfaz `Business` en `core/models/index.ts` linea 1
4. Agregar el campo a `data.service.ts` en los metodos `loadFromSupabase()` (linea 102) y `updateBusiness()` (linea 476)

### "Quiero agregar un campo nuevo al cliente"

**Pasos:**

1. **Modelo:** `src/app/core/models/index.ts` linea 14-21 → Agregar campo a `interface Client`
2. **Data defaults:** `src/app/core/services/data.service.ts` linea 20-26 → Agregar campo a los clientes DEFAULT
3. **Form en ClientesComponent:** `src/app/features/clientes/clientes.component.ts` linea 21 → Agregar campo al signal `newClient`
4. **Template ClientesComponent:** `src/app/features/clientes/clientes.component.html` linea 15-35 → Agregar input en el form
5. **Template lista:** `src/app/features/clientes/clientes.component.html` linea 47-48 → Mostrar el campo
6. **Data Service CRUD:** `src/app/core/services/data.service.ts`:
   - `addClient()` linea 206 → Agregar campo al insert
   - `updateClient()` linea 226 → Agregar campo al update
   - `loadFromSupabase()` linea 117-125 → Mapear campo de Supabase
7. **Migracion SQL:** Crear migracion para agregar la columna en Supabase

### "Quiero cambiar el diseno de la factura"

**Archivo principal:** `src/app/shared/components/invoice-doc/invoice-doc.component.ts`

El template inline esta en las lineas 9-118 de este archivo. Estructura:
- **Lineas 11-33:** `.doc-head` (logo + titulo FACTURA)
- **Lineas 35-49:** `.doc-body` (cliente + condiciones de pago)
- **Lineas 51-76:** `.doc-table` (tabla de items)
- **Lineas 78-97:** `.doc-totals` (base, IVA, cargo extra, total)
- **Lineas 99-104:** `.doc-notes` (notas)
- **Lineas 106-112:** `.doc-signature` (firma del admin)
- **Lineas 114-116:** `.doc-foot` (pie de pagina)

**Estilos del documento:** `src/styles.css` lineas 628-791 (clases `.doc-*`)

### "Quiero agregar una nueva ruta/pagina"

1. **Crear el componente:**
   ```bash
   ng generate component features/mi-nueva-pagina
   ```

2. **Agregar la ruta:** `src/app/app.routes.ts`
   ```typescript
   { path: 'mi-pagina', loadComponent: () => import('./features/mi-nueva-pagina/mi-nueva-pagina.component').then(m => m.MiNuevaPaginaComponent) },
   ```

3. **Agregar link al sidebar:** `src/app/shared/components/sidebar/sidebar.component.html`
   Agregar un nuevo `<a class="nav-item" routerLink="/mi-pagina" ...>`

4. **Detectar en AppComponent:** `src/app/app.component.ts` linea 33-41, agregar:
   ```typescript
   if (url.includes('mi-pagina')) return 'mi-pagina';
   ```

### "Quiero cambiar los colores"

**Archivo:** `src/styles.css` lineas 6-113

| Que cambiar | Variable | Linea |
|---|---|---|
| Color principal (accent) | `--accent` | 23 |
| Fondo de pagina | `--bg` | 8 |
| Fondo de cards | `--surface` | 9 |
| Texto principal | `--fg` | 13 |
| Color de exito | `--success` | 29 |
| Color de advertencia | `--warn` | 30 |
| Color de peligro | `--danger` | 31 |
| Gradiente sidebar/botones | `--gradient-accent` | 41 |
| Color del sidebar | Cambiar gradiente en linea 213: `background: var(--gradient-accent)` |

### "Quiero modificar el total de la factura"

**En el formulario (NuevaFacturaComponent):**
- **Signal `base`:** `src/app/features/nueva-factura/nueva-factura.component.ts` linea 83-85
  ```typescript
  base = computed(() => this.lines().reduce((s, l) => s + l.priceDay * l.days * l.quantity, 0));
  ```
- **Signal `iva`:** linea 87 → `(this.base() * this.ivaRate()) / 100`
- **Signal `total`:** linea 89 → `this.base() + this.extraCharge()`

**En el documento (InvoiceDocComponent):**
- **Signal `base`:** `src/app/shared/components/invoice-doc/invoice-doc.component.ts` linea 133-135
- **Signal `iva`:** linea 137
- **Signal `total`:** linea 139

**En la lista de facturas (FacturasComponent):**
- **Metodo `total()`:** `src/app/features/facturas/facturas.component.ts` linea 75-77
  ```typescript
  total(inv: Invoice): number {
    return inv.items.reduce((s, i) => s + i.priceDay * i.days * (i.quantity || 1), 0) + (inv.extraCharge ?? 0);
  }
  ```

### "Quiero cambiar la logica de IVA"

1. **Porcentaje por defecto:** `src/app/core/services/data.service.ts` linea 14 → `rate: 19`
2. **Signal ivaRate en nueva factura:** `src/app/features/nueva-factura/nueva-factura.component.ts` linea 74 → `ivaRate = signal(19)`
3. **Calculo del IVA:** linea 87 → `(this.base() * this.ivaRate()) / 100`
4. **En el documento:** `src/app/shared/components/invoice-doc/invoice-doc.component.ts` linea 137
5. **Para cambiar el IVA default para nuevos negocios:** Cambiar el valor en `DEFAULT_BUSINESS` linea 14

### "Quiero agregar un nuevo tipo de forma de pago"

**Archivo:** `src/app/features/nueva-factura/nueva-factura.component.ts` linea 102
```typescript
methods = ['Transferencia', 'Efectivo', 'Tarjeta', 'Crédito a 30 días', 'Cheque'];
```
Agregar el nuevo metodo al array.

---

## 13. Despliegue

### 13.1 Netlify

**Build command:** `npx ng build --configuration=production`

**Output directory:** `dist/renta-obra/browser`

**Archivo `_redirects`:** `public/_redirects`
```
/*    /index.html   200
```
Esto redirige todas las rutas a `index.html` (necesario para Angular routing en produccion).

### 13.2 Build para produccion

```bash
npx ng build --configuration=production
```

Esto genera:
- Archivos hash-eados para cache busting
- Service worker habilitado
- Optimizaciones de tamano (budgets: 600kB warning, 1.5MB error)

### 13.3 Variables de entorno

**Dev:** `src/environments/environment.ts`
**Prod:** `src/environments/environment.prod.ts`

Ambas apuntan al mismo proyecto de Supabase. Para crear un entorno de produccion separado, editar `environment.prod.ts`.

---

## 14. APK (TWA - Trusted Web Activity)

### 14.1 PWABuilder

1. Desplegar la app en HTTPS (Netlify)
2. Ir a https://www.pwabuilder.com
3. Ingresar la URL de la app
4. PWABuilder detecta el manifest y service worker
5. Generar el package para Android

### 14.2 GitHub Actions

Archivo: `.github/workflows/build-apk.yml`

**Trigger:** Push a `main`/`master` o manual (`workflow_dispatch`)

**Pasos del workflow:**
1. Checkout del codigo
2. Setup Node 22 + npm ci
3. Build de Angular (`ng build --configuration=production`)
4. Setup Java 17 (Temurin) + Android SDK
5. Instalar Bubblewrap (`npm install -g @nicepkg/bubblewrap`)
6. Crear `twa-manifest.json` con configuracion de la app
7. Ejecutar `bubblewrap init` para generar el proyecto Android
8. Ejecutar `./gradlew assembleRelease` para construir el APK
9. Subir el APK como artifact de GitHub (retencion: 30 dias)

**Configuracion del TWA manifest:**
- `name`: "RentaObra"
- `themeColor`: "#4f46e5" (el accent de la app)
- `backgroundColor`: "#f8fafc" (el bg de la app)
- `startUrl`: "/panel"
- `orientation`: "portrait"
- `display`: "standalone"
- `appVersion`: "1.0.0"

**Para descargar el APK:**
1. Ir a la pestana "Actions" del repositorio en GitHub
2. Hacer click en el workflow mas reciente
3. En "Artifacts", descargar `rentaobra-apk`

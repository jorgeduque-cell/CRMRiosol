# 🔍 Code Review — App CRM — Segunda Pasada

**Fecha:** 2026-03-08 | **Reviewer:** Antigravity Core Engine | **Scope:** Full Project Re-scan

---

## Cambios Detectados Desde la Primera Revisión

| Cambio | Estado |
|---|---|
| `.env.example` → renombrado/reemplazado a `.env` | ⚠️ Credenciales reales ahora en archivo activo |
| `node_modules/` aparece en backend | ✅ `npm install` ejecutado |
| `package-lock.json` creado en backend | ✅ Normal |
| Código fuente (controllers, services, etc.) | ⬜ Sin cambios (tamaños idénticos) |
| Tests agregados | ❌ Ninguno |
| Correcciones de seguridad | ❌ Ninguna |

> [!CAUTION]
> **Ninguno de los 4 problemas CRÍTICOS de la primera revisión fue corregido.** Además, se identificaron **5 problemas nuevos** derivados de la configuración actual.

---

## 🚨 NUEVOS Problemas Críticos (Post-Cambios)

### CRIT-05: `.env` con Credenciales Reales Existe en Disco

**Archivo:** [.env](file:///c:/Users/LENOVO%20CORP/App%20CRM/backend/.env)

El archivo `.env` contiene credenciales **reales y activas**:

| Variable | Valor | Riesgo |
|---|---|---|
| `DATABASE_URL` | Contraseña real de Supabase: `M0JryIHR6rzeqa5r` | 🔴 Acceso total a la DB |
| `OPENAI_API_KEY` | Key real: `sk-PR1u...he3X` | 🔴 Facturación no autorizada |
| `JWT_SECRET` | `"your_super_secret_jwt_key_here_min_32_chars"` | 🔴 **Placeholder, NO es un secret real** |

> [!WARNING]
> El `JWT_SECRET` sigue siendo un placeholder legible. Cualquiera que lea este string puede forjar tokens JWT válidos. Debe ser un valor aleatorio criptográficamente seguro (ej: `openssl rand -base64 64`).

---

### CRIT-06: Backend NO Tiene `.gitignore`

**Directorio:** `c:\Users\LENOVO CORP\App CRM\backend\`

No existe archivo `.gitignore` en el directorio backend. Esto significa que:
- ✅ `node_modules/` **será trackeado por git** (~cientos de MB)
- 🔴 `.env` con credenciales reales **será comiteado**
- ⚠️ `dist/` (build output) será comiteado
- ⚠️ `prisma/migrations/` sin control

**Acción inmediata — crear `backend/.gitignore`:**

```gitignore
# Dependencies
node_modules/

# Build
dist/

# Environment
.env
.env.local
.env.*.local

# Prisma
prisma/migrations/*_migration_lock.toml

# OS / IDE
.DS_Store
*.swp
.idea/
.vscode/
```

---

### CRIT-07: Frontend `.gitignore` No Excluye `.env`

**Archivo:** [.gitignore](file:///c:/Users/LENOVO%20CORP/App%20CRM/frontend/.gitignore)

El `.gitignore` del frontend no tiene regla para `.env`. Cuando el frontend necesite variables de entorno (API URL, etc.), el archivo `.env` será comiteado.

```diff
 node_modules
 dist
 dist-ssr
 *.local
+.env
+.env.local
+.env.*.local
```

---

### CRIT-08: No Existe `.env.example` Para Onboarding

El archivo `.env.example` fue eliminado/renombrado a `.env`. Sin `.env.example`, un nuevo desarrollador no sabrá qué variables de entorno necesita configurar. Deben existir **ambos archivos**:
- `.env` → valores reales (nunca en git)
- `.env.example` → plantilla con valores placeholder (en git)

---

### CRIT-09: Raíz del Proyecto Sin `.gitignore` Global

No existe `.gitignore` en `c:\Users\LENOVO CORP\App CRM\`. Si se inicializa git desde la raíz, no habrá protecciones.

---

## Verificación de Problemas Originales (Primera Pasada)

| ID | Descripción | ¿Corregido? |
|---|---|---|
| CRIT-01 | Credenciales reales en `.env.example` | ❌ Ahora peor: en `.env` activo |
| CRIT-02 | JWT Secret con fallback `'secret'` | ❌ Sin cambios |
| CRIT-03 | `/register` sin autenticación | ❌ Sin cambios |
| CRIT-04 | Error middleware filtra mensajes internos | ❌ Sin cambios |
| IMP-01 | Bug en cálculo de `totalRevenue` | ❌ Sin cambios |
| IMP-02 | N+1 query en `getKanbanBoard` | ❌ Sin cambios |
| IMP-03 | `updateStatus` sin validación | ❌ Sin cambios |
| IMP-04 | `AIService` viola DIP | ❌ Sin cambios |
| IMP-05 | `any` cast en `user.controller.ts` | ❌ Sin cambios |
| IMP-06 | Login frontend mock (no conecta a API) | ❌ Sin cambios |
| IMP-07 | Auth store no persiste JWT token | ❌ Sin cambios |
| IMP-08 | `express-rate-limit` instalado sin usar | ❌ Sin cambios |
| Testing | Cobertura: 0% | ❌ Sin cambios |

---

## Matriz de Prioridades Actualizada

### 🔴 Sprint 0 — Bloqueo de Producción (Hacer AHORA)

| # | Acción | Archivo(s) | Esfuerzo |
|---|---|---|---|
| 1 | Crear `backend/.gitignore` | NUEVO | 5 min |
| 2 | Agregar `.env` a `frontend/.gitignore` | frontend/.gitignore | 2 min |
| 3 | Crear `backend/.env.example` con placeholders | NUEVO | 5 min |
| 4 | Generar JWT_SECRET real (`openssl rand -base64 64`) | .env | 2 min |
| 5 | Rotar password de Supabase | Panel Supabase | 10 min |
| 6 | Revocar API key de OpenAI | Panel OpenAI | 5 min |
| 7 | Eliminar fallback `'secret'` en JWT verify/sign | auth.middleware.ts + auth.service.ts | 10 min |
| 8 | Proteger `/register` con `authenticate` + `requireRole` | user.routes.ts | 5 min |

### 🟠 Sprint 1 — Deuda Técnica Crítica

| # | Acción | Archivo(s) |
|---|---|---|
| 1 | Crear clase `AppError` + refactor error middleware | NUEVO + error.middleware.ts |
| 2 | Corregir cálculo `totalRevenue` en `finance.service.ts` | finance.service.ts |
| 3 | Eliminar N+1 en `getKanbanBoard` | customer.service.ts |
| 4 | Agregar validación Zod a `PATCH /status` | crm.schema.ts + customer.routes.ts |
| 5 | Inyectar `FinanceService` en `AIService` (DIP) | ai.service.ts + ai.routes.ts |
| 6 | Activar `express-rate-limit` en auth endpoints | app.ts o auth.routes.ts |
| 7 | Usar `AuthRequest` en vez de `any` cast | user.controller.ts |

### 🟡 Sprint 2 — Conectar Frontend ↔ Backend

| # | Acción | Archivo(s) |
|---|---|---|
| 1 | Crear HTTP client centralizado (Axios + interceptors) | NUEVO: lib/api.ts |
| 2 | Conectar Login real al backend | Login.tsx |
| 3 | Persistir JWT token en auth store | auth.store.ts |
| 4 | Agregar paginación a endpoints `getAll()` | Todos los services |
| 5 | Crear Prisma enums nativos (Role, Status, Priority) | schema.prisma |
| 6 | Escribir tests unitarios para services críticos | NUEVO: tests/ |

---

## Veredicto Final

```
¿El código funciona correctamente?
├── Backend: No verificable (no se ha ejecutado)
└── Frontend: Parcialmente (login mock)

¿Maneja edge cases?
└── ❌ No — sin validación en varios endpoints

¿Sigue las convenciones del proyecto?
└── ✅ Sí — estructura consistente, buena separación de capas

¿Hay código duplicado?
└── ⚠️ Moderado — try/catch repetido en todos los controllers

¿Hay problemas de performance?
└── ⚠️ Sí — N+1 en Kanban, sin paginación

¿Está bien testeado?
└── ❌ No — 0 tests

RESULTADO: ❌ REQUEST CHANGES — No apto para deploy
```

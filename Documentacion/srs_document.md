# Software Requirements Specification (SRS): Oil CRM

## 1. Executive Summary
El sistema **Oil CRM** es una solución empresarial diseñada para gestionar la cadena de suministro de aceite de soya (Oil Bean) y aceite de palma. Centraliza la gestión de proveedores (compras), clientes (ventas), finanzas y reportes de utilidad. El valor diferencial radica en la integración de un **Asistente de IA** encargado de analizar las tendencias de ventas y salud financiera para optimizar la toma de decisiones.

## 2. User Actors & Roles
*   **Administrador de Negocios (Scrum Master):** Supervisa todas las operaciones, aprueba reportes financieros y consulta a la IA para análisis estratégico.
*   **Gestor de Compras:** Registra la adquisición de aceite crudo y gestiona cuentas por pagar a proveedores.
*   **Gestor de Ventas:** Gestiona la comercialización del aceite, crea reportes de ventas y maneja cuentas por cobrar.
*   **Asistente de IA (Servicio):** Analiza datos históricos y proporciona insights automáticos.

## 3. Functional Requirements (The "Must-Haves")
*   **REQ-01 (Gestión de Inventario/Compras):** El sistema DEBE permitir registrar compras de aceite detallando tipo (Soya/Palma), volumen y costo.
*   **REQ-02 (Gestión de Ventas):** El sistema DEBE permitir crear reportes de ventas agregando múltiples cuentas y clientes.
*   **REQ-03 (Kanban de Clientes):** El sistema DEBE incluir un tablero Kanban para visualizar el estado de los clientes (Prospecto, Negociación, Cerrado, etc.) con múltiples vistas (Lista, Tabla).
*   **REQ-04 (Módulo de Tareas):** El sistema DEBE permitir la gestión de "Tareas de la Semana", con estados de completitud y recordatorios.
*   **REQ-05 (Contabilidad de Utilidad):** El sistema DEBE calcular automáticamente la utilidad neta (Ventas - Costos - Gastos Operativos).
*   **REQ-06 (Consolidación de Cuentas):** El sistema DEBE permitir la agregación de múltiples cuentas bancarias o contables para reportes financieros.
*   **REQ-07 (Asistente de IA):** El sistema DEBE integrar un módulo de IA que analice los reportes de ventas, tareas y financieros para sugerir mejoras.
*   **REQ-08 (Localización):** Toda la interfaz de usuario DEBE estar en **Español (Latinoamericano)**, mientras que la lógica interna y base de datos estarán en **Inglés**.

## 4. Data Entities
*   **Provider (Proveedor):** Name, Contact, OilType.
*   **Customer (Cliente):** Name, Contact, Status (for Kanban), CreditHistory.
*   **Task (Tarea):** Title, Description, DueDate (Weekly scope), IsCompleted, Priority.
*   **PurchaseOrder (Compra):** Quantity, UnitPrice, Date, TotalAmount.
*   **SaleInvoice (Venta):** Quantity, SalePrice, Date, UtilityCalculated, AccountsInvolved.
*   **FinancialReport (Reporte):** Period, TotalRevenue, TotalCost, NetProfit.
*   **AIDialog (Interacción IA):** Query, AnalysisResult, Date.

## 5. Recommended Technical Stack
Elegido para escalabilidad, seguridad y fácil integración con APIs de IA (OpenAI/Gemini).

*   **Frontend:** **React 18 con Vite + Tailwind CSS** (Ejecutado por KIMI CODE). Permite una UI premium y reactiva.
*   **Backend:** **Node.js (TypeScript) con Express**. Ideal para manejar flujos de datos asíncronos y contratos estrictos de API.
*   **Database:** **PostgreSQL con Prisma ORM**. Esencial para reportes financieros complejos y relaciones de datos sólidas.
*   **AI Integration:** **LangChain + OpenAI SDK / Google Generative AI**. Para procesar los datos de los reportes y generar análisis contextuales.
*   **DevOps:** Docker para contenedores y variables de entorno para seguridad total.

---
> [!IMPORTANT]
> **Antigravity** (Logic/DB) y **Kimi Code** (UI) mantendrán una separación estricta mediante contratos JSON.

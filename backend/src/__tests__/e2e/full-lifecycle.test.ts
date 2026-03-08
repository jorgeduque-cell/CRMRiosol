import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ProviderService } from '../../services/provider.service';
import { CustomerService } from '../../services/customer.service';
import { PurchaseService } from '../../services/purchase.service';
import { SaleService } from '../../services/sale.service';
import { TaskService } from '../../services/task.service';
import { FinanceService } from '../../services/finance.service';
import { NotFoundError } from '../../utils/errors';

/**
 * E2E Integration Test — Full Business Lifecycle
 * Simulates: Register → Login → Provider → Customer → Purchase → Sale → Finance → Task
 *
 * All Prisma calls are mocked, but the SERVICE LOGIC is real.
 * This verifies the happy path end-to-end across all services.
 */

jest.mock('../../config/env', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-must-be-at-least-32-chars-long',
    NODE_ENV: 'test',
  },
}));

jest.mock('../../utils/constants', () => ({
  SALT_ROUNDS: 4, // Faster hashing for tests
  TOKEN_EXPIRY: '1h',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  CUSTOMER_STATUSES: ['PROSPECT', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'] as const,
  TASK_PRIORITIES: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const,
  OIL_TYPES: ['SOY', 'PALM'] as const,
  USER_ROLES: ['ADMIN', 'USER'] as const,
  RATE_LIMIT_WINDOW_MS: 900000,
  RATE_LIMIT_MAX_REQUESTS: 100,
  AUTH_RATE_LIMIT_MAX_REQUESTS: 10,
}));

// In-memory store to simulate DB state
const store = {
  users: [] as any[],
  providers: [] as any[],
  customers: [] as any[],
  purchases: [] as any[],
  sales: [] as any[],
  tasks: [] as any[],
};

const mockPrisma = {
  user: {
    findUnique: jest.fn().mockImplementation(({ where }) =>
      store.users.find((u) => u.id === where.id || u.email === where.email) || null
    ),
    create: jest.fn().mockImplementation(({ data, select }) => {
      const user = { id: 'user-' + Date.now(), ...data, createdAt: new Date() };
      store.users.push(user);
      if (select) {
        const { password, ...safe } = user;
        return safe;
      }
      return user;
    }),
  },
  provider: {
    findMany: jest.fn().mockImplementation(() => store.providers),
    findUnique: jest.fn().mockImplementation(({ where }) =>
      store.providers.find((p) => p.id === where.id) || null
    ),
    create: jest.fn().mockImplementation(({ data }) => {
      const provider = { id: 'prov-' + Date.now(), ...data, purchases: [], createdAt: new Date(), updatedAt: new Date() };
      store.providers.push(provider);
      return provider;
    }),
    count: jest.fn().mockImplementation(() => store.providers.length),
  },
  customer: {
    findMany: jest.fn().mockImplementation(() => store.customers),
    findUnique: jest.fn().mockImplementation(({ where }) =>
      store.customers.find((c) => c.id === where.id) || null
    ),
    create: jest.fn().mockImplementation(({ data }) => {
      const customer = { id: 'cust-' + Date.now(), ...data, sales: [], createdAt: new Date(), updatedAt: new Date() };
      store.customers.push(customer);
      return customer;
    }),
    count: jest.fn().mockImplementation(() => store.customers.length),
  },
  purchaseOrder: {
    findMany: jest.fn().mockImplementation(() => store.purchases),
    findUnique: jest.fn().mockImplementation(({ where }) =>
      store.purchases.find((p) => p.id === where.id) || null
    ),
    findFirst: jest.fn().mockImplementation(() =>
      store.purchases.length > 0 ? store.purchases[store.purchases.length - 1] : null
    ),
    create: jest.fn().mockImplementation(({ data }) => {
      const purchase = { id: 'purch-' + Date.now(), ...data, createdAt: new Date(), updatedAt: new Date() };
      store.purchases.push(purchase);
      return purchase;
    }),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
    count: jest.fn().mockImplementation(() => store.purchases.length),
  },
  saleInvoice: {
    findMany: jest.fn().mockImplementation(() => store.sales),
    findUnique: jest.fn().mockImplementation(({ where }) =>
      store.sales.find((s) => s.id === where.id) || null
    ),
    create: jest.fn().mockImplementation(({ data }) => {
      const sale = { id: 'sale-' + Date.now(), ...data, customer: store.customers[0], createdAt: new Date() };
      store.sales.push(sale);
      return sale;
    }),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
    count: jest.fn().mockImplementation(() => store.sales.length),
  },
  task: {
    findMany: jest.fn().mockImplementation(({ where }) =>
      store.tasks.filter((t) => !where?.userId || t.userId === where.userId)
    ),
    findFirst: jest.fn().mockImplementation(({ where }) =>
      store.tasks.find((t) => t.id === where.id && t.userId === where.userId) || null
    ),
    create: jest.fn().mockImplementation(({ data }) => {
      const task = { id: 'task-' + Date.now(), ...data, isCompleted: false, createdAt: new Date() };
      store.tasks.push(task);
      return task;
    }),
    update: jest.fn().mockImplementation(({ where, data }) => {
      const task = store.tasks.find((t) => t.id === where.id);
      if (task) Object.assign(task, data);
      return task;
    }),
    count: jest.fn().mockImplementation(({ where }) =>
      store.tasks.filter((t) => !where?.userId || t.userId === where.userId).length
    ),
  },
} as any;

describe('E2E: Full Business Lifecycle', () => {
  beforeAll(() => {
    // Reset store
    store.users = [];
    store.providers = [];
    store.customers = [];
    store.purchases = [];
    store.sales = [];
    store.tasks = [];
  });

  let userId: string;
  let providerId: string;
  let customerId: string;

  it('1. Register → debería crear un nuevo usuario', async () => {
    const userService = new UserService(mockPrisma);
    const user = await userService.createUser({
      email: 'admin@oilcrm.com',
      name: 'Admin CRM',
      password: 'SecureP@ss123',
      role: 'ADMIN',
    });

    userId = user.id;
    expect(user.email).toBe('admin@oilcrm.com');
    expect(user).not.toHaveProperty('password');
  });

  it('2. Login → debería retornar JWT token', async () => {
    // Re-mock findUnique to return the stored user WITH password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('SecureP@ss123', 4);
    store.users[0].password = hashedPassword;

    mockPrisma.user.findUnique.mockResolvedValueOnce(store.users[0]);

    const authService = new AuthService(mockPrisma);
    const result = await authService.login({
      email: 'admin@oilcrm.com',
      password: 'SecureP@ss123',
    });

    expect(result.token).toBeTruthy();
    expect(result.user.email).toBe('admin@oilcrm.com');
  });

  it('3. Create Provider → debería registrar proveedor de aceite', async () => {
    const providerService = new ProviderService(mockPrisma);
    const provider = await providerService.create({
      name: 'Aceites del Pacífico',
      contact: '+57 300 123 4567',
      oilType: 'PALM',
    });

    providerId = provider.id;
    expect(provider.oilType).toBe('PALM');
  });

  it('4. Create Customer → debería registrar cliente como PROSPECT', async () => {
    const customerService = new CustomerService(mockPrisma);
    const customer = await customerService.create({
      name: 'Restaurante El Buen Sabor',
      contact: '+57 311 987 6543',
    });

    customerId = customer.id;
    expect(customer.name).toBe('Restaurante El Buen Sabor');
  });

  it('5. Create Purchase → debería registrar compra con totalAmount calculado', async () => {
    const purchaseService = new PurchaseService(mockPrisma);
    const purchase = await purchaseService.create({
      providerId,
      quantity: 100,
      unitPrice: 25,
    });

    expect(purchase.totalAmount).toBe(2500);
  });

  it('6. Create Sale → debería calcular utilidad con costo del proveedor', async () => {
    // Mock the provider aggregate for per-provider cost
    mockPrisma.purchaseOrder.aggregate.mockResolvedValueOnce({
      _avg: { unitPrice: 25 },
    });

    const saleService = new SaleService(mockPrisma);
    const sale = await saleService.create({
      customerId,
      quantity: 50,
      salePrice: 40,
      accountsInvolved: [{ name: 'Cuenta Principal' }],
    });

    // Utility = (40 - 25) * 50 = 750
    expect(sale.utilityCalculated).toBe(750);
  });

  it('7. Finance Report → debería generar reporte P&L', async () => {
    mockPrisma.purchaseOrder.aggregate.mockResolvedValueOnce({
      _sum: { totalAmount: 2500 },
      _count: 1,
    });
    mockPrisma.saleInvoice.aggregate.mockResolvedValueOnce({
      _sum: { salePrice: 2000, utilityCalculated: 750, quantity: 50 },
      _count: 1,
    });
    mockPrisma.saleInvoice.groupBy.mockResolvedValueOnce([]);

    const financeService = new FinanceService(mockPrisma);
    const report = await financeService.getFullReport();

    expect(report.totalRevenue).toBe(2000);
    expect(report.totalCost).toBe(2500);
    expect(report.netProfit).toBe(-500); // Loss in this scenario
  });

  it('8. Create Task → debería asignar al userId', async () => {
    const taskService = new TaskService(mockPrisma);
    const task = await taskService.create(
      {
        title: 'Contactar proveedor nuevo',
        dueDate: new Date().toISOString(),
        priority: 'HIGH',
      },
      userId
    );

    expect(task.userId).toBe(userId);
    expect(task.title).toBe('Contactar proveedor nuevo');
  });

  it('9. IDOR Protection → otro usuario no puede ver la tarea', async () => {
    const taskService = new TaskService(mockPrisma);

    await expect(
      taskService.getById(store.tasks[0].id, 'other-user-id')
    ).rejects.toThrow(NotFoundError);
  });
});

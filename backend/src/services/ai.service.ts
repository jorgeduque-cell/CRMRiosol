import OpenAI from 'openai';
import { FinanceService } from './finance.service';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

export class AIService {
  private openai: OpenAI;

  // DIP FIX: FinanceService is now injected via constructor
  constructor(
    private prisma: PrismaClient,
    private financeService: FinanceService
  ) {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  async analyzeFinances(query?: string) {
    // Gather all business data
    const report = await this.financeService.getFullReport();

    const recentSales = await this.prisma.saleInvoice.findMany({
      include: { customer: true },
      orderBy: { date: 'desc' },
      take: 20,
    });

    const recentPurchases = await this.prisma.purchaseOrder.findMany({
      include: { provider: true },
      orderBy: { date: 'desc' },
      take: 20,
    });

    const pendingTasks = await this.prisma.task.findMany({
      where: { isCompleted: false },
      orderBy: { dueDate: 'asc' },
      take: 50,
    });

    const systemPrompt = `Eres un asistente financiero especializado en el negocio de ACEITE DE SOYA y ACEITE DE PALMA.
Tu rol es analizar los datos financieros proporcionados y dar insights accionables.

REGLAS:
- Responde siempre en ESPAÑOL LATINOAMERICANO
- Sé conciso pero profundo en tu análisis
- Destaca oportunidades de optimización de costos
- Identifica tendencias de ventas
- Sugiere acciones concretas para mejorar la utilidad
- Si hay tareas pendientes, menciona cuáles son prioritarias

DATOS DEL NEGOCIO:`;

    const dataContext = `
REPORTE FINANCIERO:
${JSON.stringify(report, null, 2)}

ÚLTIMAS 20 VENTAS:
${JSON.stringify(
  recentSales.map(s => ({
    cliente: s.customer.name,
    cantidad: s.quantity,
    precio: s.salePrice,
    utilidad: s.utilityCalculated,
    fecha: s.date,
  })),
  null,
  2
)}

ÚLTIMAS 20 COMPRAS:
${JSON.stringify(
  recentPurchases.map(p => ({
    proveedor: p.provider.name,
    tipoAceite: p.provider.oilType,
    cantidad: p.quantity,
    precioUnitario: p.unitPrice,
    total: p.totalAmount,
    fecha: p.date,
  })),
  null,
  2
)}

TAREAS PENDIENTES:
${JSON.stringify(
  pendingTasks.map(t => ({
    titulo: t.title,
    prioridad: t.priority,
    vencimiento: t.dueDate,
  })),
  null,
  2
)}`;

    const userMessage = query
      ? `${dataContext}\n\nPREGUNTA DEL USUARIO: ${query}`
      : `${dataContext}\n\nPor favor proporciona un análisis completo del estado actual del negocio con recomendaciones.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    return {
      analysis:
        completion.choices[0]?.message?.content ||
        'No se pudo generar el análisis.',
      dataSnapshot: {
        totalRevenue: report.totalRevenue,
        totalCost: report.totalCost,
        netProfit: report.netProfit,
        profitMargin: report.profitMargin,
        pendingTasksCount: pendingTasks.length,
      },
      generatedAt: new Date(),
    };
  }
}

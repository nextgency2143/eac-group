import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const where:any = {};
  if (from || to) where.create_time = { gte: from ? new Date(from) : undefined, lt: to ? new Date(to) : undefined };

  const [agg, byDay, byChannel] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, _count: true, where }),
    prisma.$queryRawUnsafe<{ d: string; s: number }[]>(`
      SELECT DATE(CONVERT_TZ(create_time,'UTC','Asia/Ho_Chi_Minh')) d, SUM(total) s
      FROM \`Order\`
      ${from || to ? "WHERE create_time >= ? AND create_time < ?" : ""}
      GROUP BY d ORDER BY d ASC
    `, from ?? null, to ?? null),
    prisma.$queryRawUnsafe<{ c: string|null; s: number }[]>(`
      SELECT channel c, SUM(total) s FROM \`Order\`
      ${from || to ? "WHERE create_time >= ? AND create_time < ?" : ""}
      GROUP BY c ORDER BY s DESC
    `, from ?? null, to ?? null),
  ]);

  return NextResponse.json({
    kpi: { revenue: Number(agg._sum.total ?? 0), orders: agg._count },
    byDay, byChannel
  });
}

// ...existing code...
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const q = searchParams.get("q")?.trim();

  const where: any = {};
  if (from || to) where.create_time = { gte: from ? new Date(from) : undefined, lt: to ? new Date(to) : undefined };
  if (q) where.OR = [{ order_no: { contains: q } }, { customer: { name: { contains: q } } }, { customer: { phone: { contains: q } } }];

  const rows = await prisma.order.findMany({ where, include: { customer: true }, orderBy: { create_time: "desc" }, take: 50000 });

  const header = ["order_no", "create_time", "customer_name", "phone", "channel", "branch", "seller", "total"];
  const csv = [header.join(","), ...rows.map(r => [
    r.order_no,
    new Date(r.create_time).toISOString(),
    r.customer?.name ?? "",
    r.customer?.phone ?? "",
    r.channel ?? "", r.branch ?? "", r.seller ?? "",
    r.total ?? 0
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders.csv"`
    }
  });
}
// ...existing code...
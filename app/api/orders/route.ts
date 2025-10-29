import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(Math.max(1, Number(searchParams.get("pageSize") ?? 50)), 200);
  const sort = searchParams.get("sort") ?? "create_time";
  const dir = (searchParams.get("dir") ?? "desc").toLowerCase() === "asc" ? "asc" : "desc";

  const q = searchParams.get("q")?.trim();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const channel = searchParams.get("channel");
  const branch = searchParams.get("branch");
  const seller = searchParams.get("seller");

  const where: any = {};
  if (from || to) where.create_time = { gte: from ? new Date(from) : undefined, lt: to ? new Date(to) : undefined };
  if (channel) where.channel = channel;
  if (branch) where.branch = branch;
  if (seller) where.seller = seller;
  if (q) where.OR = [
    { order_no: { contains: q } },
    { customer: { name: { contains: q } } },
    { customer: { phone: { contains: q } } },
  ];

  const [total, rows] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: { customer: true },
      orderBy: { [sort]: dir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({ page, pageSize, total, totalPages: Math.ceil(total / pageSize), rows });
}

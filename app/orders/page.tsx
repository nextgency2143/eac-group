"use client";
import { useState } from "react";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
const qc = new QueryClient();

type Row = {
  id: number; order_no: string; create_time: string; channel?: string; branch?: string; seller?: string; total?: number;
  customer?: { name?: string|null; phone?: string|null };
};

function Orders() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [q, setQ] = useState(""); const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const [sort, setSort] = useState<{key:string; dir:"asc"|"desc"}>({key:"create_time", dir:"desc"});

  const { data, isFetching } = useQuery({
    queryKey: ["orders", page, pageSize, q, from, to, sort],
    queryFn: async () => {
      const p = new URLSearchParams({ page:String(page), pageSize:String(pageSize), q, from, to, sort:sort.key, dir:sort.dir });
      const r = await fetch(`/api/orders?${p.toString()}`, { cache: "no-store" });
      return r.json() as Promise<{ rows: Row[]; total: number; totalPages: number }>;
    },
    keepPreviousData: true
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Bảng đơn</h1>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        <input className="border rounded p-2" placeholder="Tìm mã / tên / sđt" value={q} onChange={e=>{ setPage(1); setQ(e.target.value); }}/>
        <input className="border rounded p-2" type="date" value={from} onChange={e=>{ setPage(1); setFrom(e.target.value); }}/>
        <input className="border rounded p-2" type="date" value={to} onChange={e=>{ setPage(1); setTo(e.target.value); }}/>
        <select className="border rounded p-2" value={pageSize} onChange={e=>setPageSize(Number(e.target.value))}>
          <option>25</option><option>50</option><option>100</option><option>200</option>
        </select>
        <button className="border rounded p-2" onClick={()=>setSort(s=>({key:s.key, dir:s.dir==="asc"?"desc":"asc"}))}>Sort: {sort.key} {sort.dir}</button>
        <button className="border rounded p-2"
          onClick={()=>window.open(`/api/export/orders.csv?from=${from}&to=${to}&q=${encodeURIComponent(q)}`,'_blank')}>
          Xuất CSV
        </button>
      </div>

      <div className="border rounded overflow-auto">
        <table className="min-w-[900px] w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border-b text-left">Mã đơn</th>
              <th className="px-3 py-2 border-b text-left">Thời gian</th>
              <th className="px-3 py-2 border-b text-left">Khách</th>
              <th className="px-3 py-2 border-b text-left">SĐT</th>
              <th className="px-3 py-2 border-b text-left">Kênh</th>
              <th className="px-3 py-2 border-b text-left">Chi nhánh</th>
              <th className="px-3 py-2 border-b text-left">NV bán</th>
              <th className="px-3 py-2 border-b text-left">Tổng</th>
            </tr>
          </thead>
          <tbody>
            {isFetching && !data?.rows?.length ? (
              <tr><td className="p-6">Đang tải…</td></tr>
            ) : data?.rows?.map(r=>(
              <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                <td className="px-3 py-2 border-b">{r.order_no}</td>
                <td className="px-3 py-2 border-b">{new Date(r.create_time).toLocaleString("vi-VN", { timeZone: process.env.NEXT_PUBLIC_TZ })}</td>
                <td className="px-3 py-2 border-b">{r.customer?.name ?? ""}</td>
                <td className="px-3 py-2 border-b">{r.customer?.phone ?? ""}</td>
                <td className="px-3 py-2 border-b">{r.channel ?? ""}</td>
                <td className="px-3 py-2 border-b">{r.branch ?? ""}</td>
                <td className="px-3 py-2 border-b">{r.seller ?? ""}</td>
                <td className="px-3 py-2 border-b">{(r.total ?? 0).toLocaleString("vi-VN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2">
        <button className="border px-3 py-1 rounded" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>←</button>
        <span>Trang {page} / {data?.totalPages ?? 1}</span>
        <button className="border px-3 py-1 rounded"
          onClick={()=>setPage(p=>Math.min((data?.totalPages ?? 1), p+1))}
          disabled={page>=(data?.totalPages ?? 1)}>→</button>
      </div>
    </div>
  );
}
export default function Page(){ return <QueryClientProvider client={qc}><Orders/></QueryClientProvider>; }

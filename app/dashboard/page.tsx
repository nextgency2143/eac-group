"use client";
import { useState } from "react";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
const qc = new QueryClient();

function DashboardInner(){
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const { data } = useQuery({
    queryKey: ["metrics", from, to],
    queryFn: async () => {
      const p = new URLSearchParams({ from, to });
      const r = await fetch(`/api/metrics?${p.toString()}`, { cache: "no-store" });
      return r.json();
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="flex gap-2">
        <input type="date" className="border rounded p-2" value={from} onChange={e=>setFrom(e.target.value)} />
        <input type="date" className="border rounded p-2" value={to} onChange={e=>setTo(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border">
          <div className="text-gray-500">Doanh thu</div>
          <div className="text-2xl font-semibold">{Number(data?.kpi?.revenue||0).toLocaleString("vi-VN")} ₫</div>
        </div>
        <div className="p-4 rounded-xl border">
          <div className="text-gray-500">Số đơn</div>
          <div className="text-2xl font-semibold">{data?.kpi?.orders||0}</div>
        </div>
      </div>
      <div className="p-4 rounded-xl border">
        <div className="mb-2 font-medium">Doanh thu theo ngày</div>
        <LineChart width={900} height={320} data={data?.byDay||[]}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="d" /><YAxis /><Tooltip />
          <Line type="monotone" dataKey="s" />
        </LineChart>
      </div>
      <div className="p-4 rounded-xl border">
        <div className="mb-2 font-medium">Doanh thu theo kênh</div>
        <BarChart width={900} height={320} data={data?.byChannel||[]}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="c" /><YAxis /><Tooltip />
          <Bar dataKey="s" />
        </BarChart>
      </div>
    </div>
  );
}
export default function Page(){ return <QueryClientProvider client={qc}><DashboardInner/></QueryClientProvider>; }

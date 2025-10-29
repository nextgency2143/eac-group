export const metadata = { title: "EAC Mini CRM" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-white text-gray-900">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <nav className="flex items-center gap-4 border-b pb-4">
            <a href="/" className="font-semibold">Home</a>
            <a href="/orders" className="hover:underline">Bảng đơn</a>
            <a href="/dashboard" className="hover:underline">Dashboard</a>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}

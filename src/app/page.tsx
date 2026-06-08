import StockDashboard from "@/features/dashboard/components/stock-dashboard";

export default function Page() {
  return (
    <main className="bg-background text-foreground flex h-screen w-screen flex-col overflow-hidden">
      <StockDashboard />
    </main>
  );
}

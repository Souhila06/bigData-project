import Sidebar from "@/components/ui/sidebar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen flex">
      <div className="h-screen flex-shrink-0">
        <Sidebar />
      </div>
      <main className="p-4 flex-grow overflow-y-auto">{children}</main>
    </div>
  );
}

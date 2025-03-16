import { Link, useLocation } from "react-router-dom";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import { Database, BarChart2, Brain } from "lucide-react";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    {
      label: "Queries",
      href: "/query",
      icon: Database,
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: BarChart2,
    },
    {
      label: "Predict",
      href: "/predict",
      icon: Brain,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside className="h-screen w-64 bg-content1 border-r border-divider flex flex-col">
      {/* Logo Section */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-bold text-xl text-foreground">PAMAP2</span>
        </Link>
      </div>

      <Divider className="my-2" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <Button
                  as={Link}
                  to={item.href}
                  variant="light"
                  className={`w-full justify-start gap-2 transition-colors ${
                    active ? "bg-primary/10 text-primary" : ""
                  }`}
                  startContent={
                    <Icon
                      className={`w-5 h-5 ${active ? "text-primary" : ""}`}
                    />
                  }
                >
                  {item.label}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <Divider className="my-2" />
      <div className="p-4">
        <div className="flex justify-center">
          <ThemeSwitch />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

import Sidebar from "./sidebar";
import Header from "./header";
import { useLocation } from "wouter";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const pageConfig = {
  "/": { title: "Dashboard Overview", subtitle: "Welcome back to CClient Admin" },
  "/dashboard": { title: "Dashboard Overview", subtitle: "Welcome back to CClient Admin" },
  "/learners": { title: "Manage Learners", subtitle: "Filter, sort, and access detailed learner profiles" },
  "/tracks": { title: "Manage Tracks", subtitle: "Filter, sort, and access detailed tracks" },
  "/courses": { title: "Manage Courses", subtitle: "Filter, sort, and access detailed courses" },
  "/invoices": { title: "Manage Invoices", subtitle: "Track payments and manage billing" },
  "/reports": { title: "Analytics & Reports", subtitle: "Comprehensive insights into your platform performance" },
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const config = pageConfig[location as keyof typeof pageConfig] || pageConfig["/dashboard"];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title={config.title} subtitle={config.subtitle} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

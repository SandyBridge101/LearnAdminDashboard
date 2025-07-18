import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  GraduationCap, 
  BarChart3, 
  FileText, 
  Users, 
  Route, 
  BookOpen, 
  FileBarChart,
  LogOut
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Learners", href: "/learners", icon: Users },
  { name: "Tracks", href: "/tracks", icon: Route },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Reports", href: "/reports", icon: FileBarChart },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { admin, logout } = useAuth();

  return (
    <div className="w-64 sidebar-bg text-white flex flex-col">
      <div className="p-6 border-b border-blue-500">
        <div className="flex items-center space-x-3">
          <div className="bg-white text-blue-600 rounded-lg p-2">
            <GraduationCap className="text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold">CClient</h2>
            <p className="text-blue-200 text-sm">Admin Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a className={`nav-link ${isActive ? 'active' : ''}`}>
                    <item.icon className="text-lg" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-blue-500">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {admin?.firstName?.[0]}{admin?.lastName?.[0]}
            </span>
          </div>
          <div>
            <p className="font-medium">{admin?.firstName} {admin?.lastName}</p>
            <p className="text-blue-200 text-sm">{admin?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

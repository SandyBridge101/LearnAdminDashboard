import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  FileText,
  UserPlus,
  Plus,
  Route,
  TrendingUp,
  ArrowUp,
  CircleAlert
} from "lucide-react";
import { learners } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: stats, } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });
  const { data: learnersRaw = [], isLoading } = useQuery({
    queryKey: ["/api/learners"], //queryKey: ["/api/learners", search, trackFilter === "all" ? undefined : trackFilter],
  });
  const { data: invoicesRaw = [], } = useQuery({
    queryKey: ["/api/invoices",],
  });
    const { data: coursesRaw = [] } = useQuery({
    queryKey: ["/api/courses"], //queryKey: ["/api/courses", search, trackFilter === "all" ? undefined : trackFilter],
  });

  console.log("invoicesRaw",invoicesRaw);

  const invoices = Array.isArray(invoicesRaw) ? invoicesRaw : [];
  const learners = Array.isArray(learnersRaw) ? learnersRaw : [];
  const courses = Array.isArray(coursesRaw) ? coursesRaw : [];

  const { totalAmount, pendingCount } = invoices.reduce(
    (acc, invoice) => {
      acc.totalAmount += Number(invoice.amount) || 0; // ensure numeric
      if (invoice.status === "pending") {
        acc.pendingCount += 1;
      }
      return acc;
    },
    { totalAmount: 0, pendingCount: 0 }
  );

  
  

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  

  const statsData = {
    totalLearners: learners.length,
    totalRevenue: totalAmount,
    activeCourses: courses.length,
    pendingInvoices: pendingCount,
  };

  const data = invoices.map((invoice, index) => ({
    id: `Invoice ${index + 1}`, // use a friendly label instead of UUID
    amount: Number(invoice.amount),
  }));

  console.log("Chart Data",data);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Learners</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{statsData.totalLearners.toLocaleString()}</p>
              <p className="text-green-600 text-sm mt-2 flex items-center">
                <ArrowUp className="w-4 h-4 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Users className="text-blue-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">${statsData.totalRevenue.toLocaleString()}</p>
              <p className="text-green-600 text-sm mt-2 flex items-center">
                <ArrowUp className="w-4 h-4 mr-1" />
                +8% from last month
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <DollarSign className="text-green-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Courses</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{statsData.activeCourses}</p>
              <p className="text-blue-600 text-sm mt-2 flex items-center">
                <ArrowUp className="w-4 h-4 mr-1" />
                +3 new courses
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <BookOpen className="text-purple-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Invoices</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{statsData.pendingInvoices}</p>
              <p className="text-orange-600 text-sm mt-2 flex items-center">
                <CircleAlert className="w-4 h-4 mr-1" />
                Requires attention
              </p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <FileText className="text-orange-600 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      
      {/* Charts and Recent Activity */}
      <div className="flex items-center justify-center">
        {/* Revenue Chart */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Revenue Overview</h3>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>Last year</option>
              </select>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              {/*
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Revenue chart will be displayed here</p>
              </div>
              */}

              {/* Chart Section */}
              <div className="h-64">
                <ResponsiveContainer width="100%" aspect={3}>
                  <LineChart width={500} height={300} data={data}>
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
                    <XAxis dataKey="id"/>
                    <YAxis/>
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>


            </div>
          </CardContent>
        </Card>
        

        {/* Recent Activity */}
        {/*
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">New learner registered</p>
                  <p className="text-xs text-gray-500">James Anderson joined Software Development track</p>
                </div>
                <span className="text-xs text-gray-500">2 mins ago</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Payment received</p>
                  <p className="text-xs text-gray-500">$300 payment for ReactJS course</p>
                </div>
                <span className="text-xs text-gray-500">15 mins ago</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Course updated</p>
                  <p className="text-xs text-gray-500">Python course content was updated</p>
                </div>
                <span className="text-xs text-gray-500">1 hour ago</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <CircleAlert className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Invoice overdue</p>
                  <p className="text-xs text-gray-500">Invoice #1234 is 5 days overdue</p>
                </div>
                <span className="text-xs text-gray-500">3 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
        */}
      </div>
      

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="p-4 h-auto border-2 border-dashed border-blue-300 hover:bg-blue-50 transition-colors group"
              onClick={() => setLocation(`/learners`)}
            >
              <div className="text-center">
                <UserPlus className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-800">Manage Learners</p>
                <Link href="/Learners" className="text-blue-600 hover:text-blue-800 font-medium"></Link>
              </div>
            </Button>

            <Button
              variant="outline"
              className="p-4 h-auto border-2 border-dashed border-green-300 hover:bg-green-50 transition-colors group"
              onClick={() => setLocation(`/courses`)}
            >
              <div className="text-center">
                <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-800">Manage Courses</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="p-4 h-auto border-2 border-dashed border-purple-300 hover:bg-purple-50 transition-colors group"
              onClick={() => setLocation(`/tracks`)}
            >
              <div className="text-center">
                <Route className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-800">Manage Tracks</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="p-4 h-auto border-2 border-dashed border-orange-300 hover:bg-orange-50 transition-colors group"
              onClick={() => setLocation(`/invoices`)}
            >
              <div className="text-center">
                <FileText className="w-8 h-8 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-800">Manage Invoices</p>
                
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

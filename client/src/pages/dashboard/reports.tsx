import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  FileSpreadsheet,
  FileBarChart2
} from "lucide-react";

export default function Reports() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const statsData = stats || {
    totalLearners: 0,
    totalRevenue: 0,
    activeCourses: 0,
    pendingInvoices: 0,
  };

  const handleExportReport = (type: string) => {
    // In a real implementation, this would trigger a download
    console.log(`Exporting ${type} report`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Monthly Revenue</h3>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                <option>Last 12 months</option>
                <option>Last 6 months</option>
                <option>Last 3 months</option>
              </select>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Monthly Revenue Chart</p>
                <p className="text-2xl font-bold text-gray-800">
                  ${statsData.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Course Enrollment</h3>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                <option>All time</option>
                <option>This year</option>
                <option>Last 6 months</option>
              </select>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Enrollment Analytics</p>
                <p className="text-2xl font-bold text-gray-800">
                  {statsData.totalLearners.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Learners</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Learners</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.totalLearners}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${statsData.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.activeCourses}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <FileBarChart2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.pendingInvoices}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Reports */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Export Reports</h3>
            <p className="text-gray-600">Generate and download detailed reports for analysis</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => handleExportReport('learners')}
              className="p-6 h-auto border-2 border-green-200 hover:bg-green-50 transition-colors"
            >
              <div className="text-center">
                <FileSpreadsheet className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="font-medium text-gray-800 mb-1">Learner Report</p>
                <p className="text-sm text-gray-500">Export all learner data and enrollment history</p>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleExportReport('financial')}
              className="p-6 h-auto border-2 border-blue-200 hover:bg-blue-50 transition-colors"
            >
              <div className="text-center">
                <FileBarChart2 className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <p className="font-medium text-gray-800 mb-1">Financial Report</p>
                <p className="text-sm text-gray-500">Revenue, payments, and invoice analytics</p>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleExportReport('courses')}
              className="p-6 h-auto border-2 border-purple-200 hover:bg-purple-50 transition-colors"
            >
              <div className="text-center">
                <FileText className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <p className="font-medium text-gray-800 mb-1">Course Report</p>
                <p className="text-sm text-gray-500">Course performance and completion metrics</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Activity Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">This Month</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New Learners</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed Courses</span>
                  <span className="font-medium">18</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Revenue Generated</span>
                  <span className="font-medium">$8,420</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">This Week</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New Enrollments</span>
                  <span className="font-medium">7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Payments Received</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Support Tickets</span>
                  <span className="font-medium">3</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

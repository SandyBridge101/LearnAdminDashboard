import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { InvoiceFormModal } from "@/components/modals/invoice-form-modal";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Search, 
  Filter, 
  Download,
  Edit,
  Eye,
  Trash2
} from "lucide-react";
import type { Invoice } from "@shared/schema";

export default function Invoices() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoicesRaw = [], isLoading } = useQuery({
    queryKey: ["/api/invoices", search],
  });

  console.log("invoicesRaw",invoicesRaw);

  const invoices = Array.isArray(invoicesRaw) ? invoicesRaw : [];

  const { data: learners = [] } = useQuery({
    queryKey: ["/api/learners"],
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ["/api/tracks"],
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice deleted",
        description: "Invoice has been successfully deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete invoice",
        variant: "destructive",
      });
    },
  });

  const handleDeleteInvoice = (id: number, invoiceNumber: string) => {
    if (confirm(`Are you sure you want to delete invoice with id ${id}?`)) {
      deleteInvoiceMutation.mutate(id);
    }
  };

  const handleAddInvoice = () => {
    setSelectedInvoice(null);
    setShowModal(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    
    return (
      <Badge className={`status-badge ${variants[status as keyof typeof variants] || variants.pending}`}>
        {status}
      </Badge>
    );
  };

  const getLearnerName = (learnerId: number) => {
    const learner = learners.find((l: any) => l.id === learnerId);
    return learner ? `${learner.first_name} ${learner.last_name}` : "Unknown Learner";
  };

  const getLearnerEmail = (learnerId: number) => {
    const learner = learners.find((l: any) => l.id === learnerId);
    return learner?.email || "";
  };

  const getTrackName = (trackId: number | null) => {
    if (!trackId) return "N/A";
    const track = tracks.find((t: any) => t.id === trackId);
    return track?.name || "Unknown Track";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={handleAddInvoice} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Search and Filter Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search invoices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Course/Track</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice: Invoice) => (
                    <TableRow key={invoice.id} className="table-hover">
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-medium text-sm">
                              {getLearnerName(invoice.learner).split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {getLearnerName(invoice.learner)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getLearnerEmail(invoice.learner)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTrackName(invoice.track)}</TableCell>
                      <TableCell>${parseFloat(invoice.amount).toFixed(2)}</TableCell>
                      <TableCell>
                        {invoice.createdAt ? new Date(invoice.due_date).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status || "pending")}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-900"
                            onClick={() => handleEditInvoice(invoice)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteInvoice(invoice.id, invoice.invoiceNumber)}
                            className="h-8 w-8 text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {invoices.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{invoices.length}</span> of{" "}
                <span className="font-medium">{invoices.length}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="default" size="sm">
                  1
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Form Modal */}
      {showModal && (
        <InvoiceFormModal
          invoice={selectedInvoice}
          learners={learners}
          tracks={tracks}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            setSelectedInvoice(null);
          }}
        />
      )}
    </div>
  );
}

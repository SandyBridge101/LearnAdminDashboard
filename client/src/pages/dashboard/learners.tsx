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
import { LearnerDetailsModal } from "@/components/modals/learner-details-modal";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Search, 
  Filter, 
  Download,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import type { Learner } from "@shared/schema";

export default function Learners() {
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: learners = [], isLoading } = useQuery({
    queryKey: ["/api/learners", search, trackFilter === "all" ? undefined : trackFilter],
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ["/api/tracks"],
  });

  const deleteLearnerMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/learners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learners"] });
      toast({
        title: "Learner deleted",
        description: "Learner has been successfully deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete learner",
        variant: "destructive",
      });
    },
  });

  const handleDeleteLearner = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteLearnerMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800", 
      inactive: "bg-gray-100 text-gray-800",
    };
    
    return (
      <Badge className={`status-badge ${variants[status as keyof typeof variants] || variants.inactive}`}>
        {status}
      </Badge>
    );
  };

  const getTrackName = (trackId: number | null) => {
    if (!trackId) return "No Track";
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
        <Button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Learner
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
                  placeholder="Search learners..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={trackFilter} onValueChange={setTrackFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Tracks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tracks</SelectItem>
                  {tracks.map((track: any) => (
                    <SelectItem key={track.id} value={track.id.toString()}>
                      {track.name}
                    </SelectItem>
                  ))}
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

          {/* Learners Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Learner</TableHead>
                  <TableHead>Track</TableHead>
                  <TableHead>Date Joined</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {learners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No learners found
                    </TableCell>
                  </TableRow>
                ) : (
                  learners.map((learner: Learner) => (
                    <TableRow key={learner.id} className="table-hover">
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-medium">
                              {learner.firstName[0]}{learner.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {learner.firstName} {learner.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{learner.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTrackName(learner.trackId)}</TableCell>
                      <TableCell>
                        {learner.dateJoined ? new Date(learner.dateJoined).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>${parseFloat(learner.amountPaid || "0").toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(learner.status || "active")}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedLearner(learner)}
                            className="h-8 w-8 text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteLearner(learner.id, `${learner.firstName} ${learner.lastName}`)}
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
          {learners.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{learners.length}</span> of{" "}
                <span className="font-medium">{learners.length}</span> results
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

      {/* Learner Details Modal */}
      {selectedLearner && (
        <LearnerDetailsModal
          learner={selectedLearner}
          tracks={tracks}
          onClose={() => setSelectedLearner(null)}
        />
      )}
    </div>
  );
}

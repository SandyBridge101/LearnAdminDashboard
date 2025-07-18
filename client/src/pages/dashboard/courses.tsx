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
import { CourseFormModal } from "@/components/modals/course-form-modal";
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
import type { Course } from "@shared/schema";

export default function Courses() {
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["/api/courses", search, trackFilter === "all" ? undefined : trackFilter],
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ["/api/tracks"],
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Course deleted",
        description: "Course has been successfully deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      });
    },
  });

  const handleDeleteCourse = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteCourseMutation.mutate(id);
    }
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      draft: "bg-gray-100 text-gray-800",
      archived: "bg-red-100 text-red-800",
    };
    
    return (
      <Badge className={`status-badge ${variants[status as keyof typeof variants] || variants.active}`}>
        {status}
      </Badge>
    );
  };

  const getTrackName = (trackId: number) => {
    const track = tracks.find((t: any) => t.id === trackId);
    return track?.name || "Unknown Track";
  };

  const getTechnologyBadges = (technologies: string[] | null) => {
    if (!technologies || technologies.length === 0) return null;
    
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800", 
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
    ];
    
    return technologies.slice(0, 2).map((tech, index) => (
      <Badge key={tech} className={`status-badge ${colors[index % colors.length]} mr-1`}>
        {tech}
      </Badge>
    ));
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
        <Button onClick={handleAddCourse} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Course
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
                  placeholder="Search courses..."
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

          {/* Courses Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Track</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No courses found
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course: Course) => (
                    <TableRow key={course.id} className="table-hover">
                      <TableCell>
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {course.title[0]}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{course.title}</div>
                            <div className="text-sm text-gray-500">
                              {course.description?.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTrackName(course.trackId)}</TableCell>
                      <TableCell>{course.instructor}</TableCell>
                      <TableCell>{course.duration}</TableCell>
                      <TableCell>{course.students || 0}</TableCell>
                      <TableCell>{getStatusBadge(course.status || "active")}</TableCell>
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
                            onClick={() => handleEditCourse(course)}
                            className="h-8 w-8 text-green-600 hover:text-green-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCourse(course.id, course.title)}
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
          {courses.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{courses.length}</span> of{" "}
                <span className="font-medium">{courses.length}</span> results
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

      {/* Course Form Modal */}
      {showModal && (
        <CourseFormModal
          course={selectedCourse}
          tracks={tracks}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            setSelectedCourse(null);
          }}
        />
      )}
    </div>
  );
}

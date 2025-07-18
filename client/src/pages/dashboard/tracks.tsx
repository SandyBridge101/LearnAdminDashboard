import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TrackFormModal } from "@/components/modals/track-form-modal";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Search, 
  Filter, 
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User
} from "lucide-react";
import type { Track } from "@shared/schema";

export default function Tracks() {
  const [search, setSearch] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ["/api/tracks", search],
  });

  const deleteTrackMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/tracks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
      toast({
        title: "Track deleted",
        description: "Track has been successfully deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete track",
        variant: "destructive",
      });
    },
  });

  const handleDeleteTrack = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteTrackMutation.mutate(id);
    }
  };

  const handleEditTrack = (track: Track) => {
    setSelectedTrack(track);
    setShowModal(true);
  };

  const handleAddTrack = () => {
    setSelectedTrack(null);
    setShowModal(true);
  };

  const getTechnologyBadges = (technologies: string[] | null) => {
    if (!technologies || technologies.length === 0) return null;
    
    const colors = [
      "bg-green-100 text-green-800",
      "bg-blue-100 text-blue-800", 
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-pink-100 text-pink-800",
    ];
    
    return technologies.slice(0, 2).map((tech, index) => (
      <Badge key={tech} className={`status-badge ${colors[index % colors.length]}`}>
        {tech}
      </Badge>
    ));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-xl"></div>
              <div className="p-6 bg-white rounded-b-xl">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={handleAddTrack} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Track
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tracks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
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

      {/* Tracks Grid */}
      {tracks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Plus className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium mb-2">No tracks found</h3>
              <p className="text-sm mb-4">Get started by creating your first track</p>
              <Button onClick={handleAddTrack} className="btn-primary">
                Add Track
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tracks.map((track: Track) => (
            <Card key={track.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-lg text-sm font-medium text-gray-800">
                  ${parseFloat(track.price).toFixed(0)}
                </div>
                <div className="h-48 bg-gradient-to-r from-blue-400 via-teal-400 to-green-400"></div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{track.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {track.description || "No description available"}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {track.duration}
                  </span>
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {track.instructor}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {getTechnologyBadges(track.technologies)}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-900">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditTrack(track)}
                      className="h-8 w-8 text-green-600 hover:text-green-900"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTrack(track.id, track.name)}
                      className="h-8 w-8 text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Track Form Modal */}
      {showModal && (
        <TrackFormModal
          track={selectedTrack}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            setSelectedTrack(null);
          }}
        />
      )}
    </div>
  );
}

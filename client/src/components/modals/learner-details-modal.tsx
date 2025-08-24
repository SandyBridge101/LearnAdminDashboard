import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Mail, Phone, MapPin, User } from "lucide-react";
import type { Learner } from "@shared/schema";

interface LearnerDetailsModalProps {
  learner: Learner;
  tracks: any[];
  onClose: () => void;
}

export function LearnerDetailsModal({ learner, tracks, onClose }: LearnerDetailsModalProps) {
  const getTrackName = (trackId: number | null) => {
    if (!trackId) return "No Track";
    const track = tracks.find((t) => t.id === trackId);
    return track?.name || "Unknown Track";
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      inactive: "bg-gray-100 text-gray-800",
    };
    
    return (
      <Badge className={`status-badge ${variants[status as keyof typeof variants] || variants.active}`}>
        {status}
      </Badge>
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Learner Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-semibold text-2xl">
                {learner.first_name[0]}{learner.last_name[0]}
              </span>
            </div>
            <h4 className="text-lg font-semibold text-gray-800">
              {learner.first_name} {learner.last_name}
            </h4>
            <p className="text-gray-600">{learner.email}</p>
            <div className="mt-2">
              {getStatusBadge(learner.status || "active")}
            </div>
          </div>

          {/* Details Section */}
          
          <div className="space-y-4">
            {/*
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Track
              </span>
              <span className="font-medium text-gray-800">{getTrackName(learner.track)}</span>
            </div>
            

            {learner.gender && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Gender</span>
                <span className="font-medium text-gray-800">{learner.gender}</span>
              </div>
            )}
            */}

            {learner.contact && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact
                </span>
                <span className="font-medium text-gray-800">{learner.contact}</span>
              </div>
            )}

            {learner.location && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Location
                </span>
                <span className="font-medium text-gray-800">{learner.location}</span>
              </div>
            )}

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Amount Paid</span>
              <span className="font-medium text-gray-800">
                ${parseFloat(learner.amountPaid || "0").toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Date Joined</span>
              <span className="font-medium text-gray-800">
                {learner.dateJoined ? new Date(learner.dateJoined).toLocaleDateString() : "N/A"}
              </span>
            </div>

            {learner.bio && (
              <div className="py-2">
                <span className="text-gray-600 block mb-1">Bio</span>
                <p className="text-gray-800 text-sm">{learner.bio}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button className="flex-1 btn-primary">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" className="flex-1">
              <Mail className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

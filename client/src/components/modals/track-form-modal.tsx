import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertTrackSchema, type InsertTrack, type Track } from "@shared/schema";
import { X, Upload } from "lucide-react";

interface TrackFormModalProps {
  track?: Track | null;
  onClose: () => void;
  onSuccess: () => void;
}

/*
          <div>
          <Label htmlFor="imageUrl">Upload Media</Label>
          <Input
            id="imageUrl"
            type="file"
            accept="image/*,video/*,audio/*"
            {...form.register("imageUrl")}
          />
          </div>
*/

export function TrackFormModal({ track, onClose, onSuccess }: TrackFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!track;

  const form = useForm<InsertTrack>({
    //resolver: zodResolver(insertTrackSchema),
    defaultValues: {
      name: track?.name || "",
      description: track?.description || "",
      price: track?.price || "",
      duration: track?.duration || "",
      instructor: track?.instructor || "",
      imageUrl: track?.imageUrl || "",
      technologies: track?.technologies || [],
    },
  });

  const mutation = useMutation({
    mutationFn: (data: InsertTrack) => {
      if (isEdit) {
        return apiRequest("PUT", `/api/tracks/${track.id}`, data);
      } else {
        return apiRequest("POST", "/api/tracks", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
      toast({
        title: isEdit ? "Track updated" : "Track created",
        description: `Track has been successfully ${isEdit ? "updated" : "created"}`,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: isEdit ? "Update failed" : "Create failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });



  const onSubmit = (data: InsertTrack) => {
    // Convert technologies from comma-separated string to array
    const technologiesInput = (document.getElementById('technologies') as HTMLInputElement)?.value || '';
    const technologies = technologiesInput.split(',').map(t => t.trim()).filter(t => t);
    
    mutation.mutate({
      ...data,
      technologies,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isEdit ? "Update Track" : "Add New Track"}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Track Name</Label>
            <Input
              id="name"
              placeholder="Enter track name"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="Enter price"
              {...form.register("price")}
            />
            {form.formState.errors.price && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.price.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              placeholder="e.g., 12 weeks"
              {...form.register("duration")}
            />
            {form.formState.errors.duration && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.duration.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="instructor">Instructor</Label>
            <Input
              id="instructor"
              placeholder="Instructor name"
              {...form.register("instructor")}
            />
            {form.formState.errors.instructor && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.instructor.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="technologies">Technologies (comma-separated)</Label>
            <Input
              id="technologies"
              placeholder="e.g., React, Node.js, MongoDB"
              defaultValue={track?.technologies?.join(', ') || ''}
            />
          </div>
          

          <div>
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="imageUrl"
            type="url"
            placeholder="https://example.com/image.jpg"
            {...form.register("imageUrl")}
          />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Track description..."
              className="h-24"
              {...form.register("description")}
            />
          </div>

          <Button
            type="submit"
            className="w-full btn-primary"
            disabled={mutation.isPending}
          >
            {mutation.isPending 
              ? (isEdit ? "Updating..." : "Creating...") 
              : (isEdit ? "Update Track" : "Create Track")
            }
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

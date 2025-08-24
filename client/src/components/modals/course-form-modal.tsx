import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCourseSchema, type InsertCourse, type Course } from "@shared/schema";
import { X } from "lucide-react";

interface CourseFormModalProps {
  course?: Course | null;
  tracks: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CourseFormModal({ course, tracks, onClose, onSuccess }: CourseFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!course;

  const form = useForm<InsertCourse>({
    //resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      title: course?.title || "",
      description: course?.description || "",
      trackId: course?.trackId || 0,
      image: course?.image || "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: InsertCourse) => {
      if (isEdit) {
        return apiRequest("PUT", `/api/courses/${course.id}`, data);
      } else {
        return apiRequest("POST", "/api/courses", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: isEdit ? "Course updated" : "Course created",
        description: `Course has been successfully ${isEdit ? "updated" : "created"}`,
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

  const onSubmit = (data: InsertCourse) => {
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
            <span>{isEdit ? "Update Course" : "Add New Course"}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              placeholder="Enter course title"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="trackId">Track</Label>
            <Select
              value={form.watch("trackId") !== null 
                ? form.watch("trackId")?.toString() 
                : "none"
              }
              onValueChange={(value) =>
                form.setValue("trackId", value === "none" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a track" />
              </SelectTrigger>
              <SelectContent>
                {tracks.map((track) => (
                  <SelectItem key={track.id} value={track.id.toString()}>
                    {track.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.trackId && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.trackId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              placeholder="Image Url"
              {...form.register("image")}
            />
            {form.formState.errors.instructor && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.instructor.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Course description..."
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
              : (isEdit ? "Update Course" : "Create Course")
            }
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

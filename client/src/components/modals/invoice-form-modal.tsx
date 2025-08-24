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
import { insertInvoiceSchema, type InsertInvoice, type Invoice } from "@shared/schema";
import { X } from "lucide-react";

interface InvoiceFormModalProps {
  invoice?: Invoice | null;
  learners: any[];
  tracks: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export function InvoiceFormModal({ invoice, learners, tracks, onClose, onSuccess }: InvoiceFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!invoice;

  const form = useForm<InsertInvoice>({
    //resolver: zodResolver(insertInvoiceSchema),
    defaultValues: {
      learnerId: invoice?.learnerId || "",
      trackId: invoice?.trackId || null,
      courseId: invoice?.courseId || null,
      amount: invoice?.amount || "",
      status: invoice?.status || "pending",
      dueDate: invoice?.dueDate ? new Date(invoice.dueDate) : null,
      notes: invoice?.notes || "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: InsertInvoice) => {
      if (isEdit) {
        console.log("running put request for invoice...");
        return apiRequest("PUT", `/api/invoices/${invoice.id}`, data);
      } else {
        console.log("running post request for invoice...");
        return apiRequest("POST", "/api/invoices", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: isEdit ? "Invoice updated" : "Invoice created",
        description: `Invoice has been successfully ${isEdit ? "updated" : "created"}`,
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

  const onSubmit = (data: InsertInvoice) => {
    // Convert date string to Date object if provided
    /*
    const processedData = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    };
    mutation.mutate(processedData);
    */
    console.log('submitted data',data);
    mutation.mutate(data);
    
    
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isEdit ? "Update Invoice" : "Create New Invoice"}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="learnerId">Learner</Label>
            <Select
              
              value={form.watch("learnerId")?.toString()}
              onValueChange={(value) => form.setValue("learnerId", value)}

              /*
              value={form.watch("learnerId") !== null 
                ? form.watch("learnerId")?.toString() 
                : "none"
              }
              onValueChange={(value) =>
                //form.setValue("learnerId", value === "none" ? null : value)
                form.setValue("learnerId", value === "none" ? null : value)
              }
              */
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a learner" />
              </SelectTrigger>
              <SelectContent>
                {learners.map((learner) => (
                  <SelectItem key={learner.id} value={learner.id.toString()}>
                    {learner.first_name} {learner.last_name} ({learner.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.learnerId && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.learnerId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="trackId">Track (Optional)</Label>
            <Select
              /*
              value={form.watch("trackId")?.toString() || ""}
              onValueChange={(value) => form.setValue("trackId", value ? parseInt(value) : null)}
              */
               value={form.watch("trackId") !== null 
                ? form.watch("trackId")?.toString() 
                : "none"
              }
              onValueChange={(value) =>
                form.setValue("trackId", value === "none" ? null : value)
              }

            >
              <SelectTrigger>
                <SelectValue placeholder="Select a track" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Track</SelectItem>
                {tracks.map((track) => (
                  <SelectItem key={track.id} value={track.id.toString()}>
                    {track.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="Enter amount"
              {...form.register("amount")}
            />
            {form.formState.errors.amount && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              /*
              value={form.watch("status")}
              onValueChange={(value) => form.setValue("status", value)}
              */
               value={form.watch("status") !== null 
                ? form.watch("status")?.toString() 
                : "none"
              }
              onValueChange={(value) =>
                form.setValue("status", value === "none" ? "none" : value)
              }>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              {...form.register("dueDate")}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              className="h-20"
              {...form.register("notes")}
            />
          </div>

          <Button
            type="submit"
            className="w-full btn-primary"
            disabled={mutation.isPending}
          >
            {mutation.isPending 
              ? (isEdit ? "Updating..." : "Creating...") 
              : (isEdit ? "Update Invoice" : "Create Invoice")
            }
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

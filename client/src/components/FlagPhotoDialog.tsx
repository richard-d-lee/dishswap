// Flag photo dialog for reporting inappropriate content
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle } from "lucide-react";

interface FlagPhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string, description?: string) => Promise<void>;
}

const FLAG_REASONS = [
  { value: "inappropriate", label: "Inappropriate Content", description: "Nudity, sexual content, or offensive material" },
  { value: "spam", label: "Spam or Misleading", description: "Promotional content or unrelated images" },
  { value: "violence", label: "Violence or Harmful", description: "Graphic violence or dangerous activities" },
  { value: "copyright", label: "Copyright Violation", description: "Unauthorized use of copyrighted material" },
  { value: "other", label: "Other", description: "Other concerns not listed above" },
];

export function FlagPhotoDialog({ open, onOpenChange, onSubmit }: FlagPhotoDialogProps) {
  const [reason, setReason] = useState<string>("inappropriate");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(reason, description || undefined);
      setReason("inappropriate");
      setDescription("");
      onOpenChange(false);
    } catch (error) {
      console.error("Flag submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report Photo
          </DialogTitle>
          <DialogDescription>
            Help us maintain community standards by reporting inappropriate content.
            Our moderation team will review this report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Reason for reporting</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="mt-3 space-y-3">
              {FLAG_REASONS.map((r) => (
                <div key={r.value} className="flex items-start space-x-3">
                  <RadioGroupItem value={r.value} id={r.value} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={r.value} className="font-medium cursor-pointer">
                      {r.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{r.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide more context about why you're reporting this photo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

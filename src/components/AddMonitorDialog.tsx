import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const INTERVALS = [
  { value: "5", label: "5 seconds" },
  { value: "10", label: "10 seconds" },
  { value: "30", label: "30 seconds" },
  { value: "60", label: "1 minute" },
  { value: "300", label: "5 minutes" },
];

interface AddMonitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, url: string, interval: number) => void;
}

const AddMonitorDialog = ({ open, onOpenChange, onAdd }: AddMonitorDialogProps) => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("https://");
  const [interval, setInterval] = useState("60");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && url) {
      onAdd(name, url, Number(interval));
      setName("");
      setUrl("https://");
      setInterval("60");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground font-mono text-sm tracking-tight">
            Add New Monitor
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground font-mono mb-1.5 block">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="api.example.com"
              className="bg-background border-border font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-mono mb-1.5 block">URL</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="bg-background border-border font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-mono mb-1.5 block">Check Interval</label>
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger className="bg-background border-border font-mono text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {INTERVALS.map((i) => (
                  <SelectItem key={i.value} value={i.value} className="font-mono text-sm">
                    {i.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full font-mono text-sm">
            Begin Monitoring
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMonitorDialog;

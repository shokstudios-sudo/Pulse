import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddMonitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, url: string) => void;
}

const AddMonitorDialog = ({ open, onOpenChange, onAdd }: AddMonitorDialogProps) => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("https://");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && url) {
      onAdd(name, url);
      setName("");
      setUrl("https://");
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
          <Button type="submit" className="w-full font-mono text-sm">
            Begin Monitoring
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMonitorDialog;

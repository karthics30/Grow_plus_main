import React, { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import BatchCallDrawer, { BatchSummary } from "./BatchCallDrawer";
import BatchCallCard from "./BatchCallCard";

const VoiceAgent: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [batches, setBatches] = useState<BatchSummary[]>([]);

  // ESC closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleCreated = (summary: BatchSummary) => {
    setBatches((prev) => [summary, ...prev]);
  };

  const hasBatches = batches.length > 0;

  return (
    <div className="w-full min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="w-4 h-4" />
          <span>Batch Call</span>
        </div>
        <Button onClick={() => setOpen(true)} className="rounded-full">
          Create a batch call
        </Button>
      </div>

      {/* Content */}
      {hasBatches ? (
        <div className="p-4">
          <div className="p-4 ">
            {batches.map((b) => (
              <BatchCallCard
                key={b.id}
                name={b.name}
                status={b.status}
                sent={b.recipients}
                pickedUp={b.pickedUp}
                successful={b.successful}
                failed={b.recipients - b.pickedUp}
                onDetails={() => alert("Show batch details here")}

                // ✅ new actions
                onStop={() => {
                  console.log("Stop batch:", b.id);
                  // TODO: call API OR change state here
                }}
                onDuplicate={() => {
                  console.log("Duplicate batch:", b.id);
                  // TODO: push new card
                }}
                onDelete={() => {
                  console.log("Delete batch:", b.id);
                  // TODO: remove from list state
                }}

                // ✅ enable Stop only when status indicates active sending
                canStop={b.status === "Sending"}
              />

            ))}
          </div>

        </div>
      ) : (
        /* Empty state */
        <div className="flex items-center justify-center h-[calc(100vh-56px)] px-4">
          <div className="text-center text-sm text-muted-foreground space-y-3">
            <div className="mx-auto w-10 h-10 rounded-lg border flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <p>You don&apos;t have any batch call</p>
          </div>
        </div>
      )}

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <BatchCallDrawer
        open={open}
        onClose={() => setOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
};

export default VoiceAgent;

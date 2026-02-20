import { Loader2 } from "lucide-react";

export default function TeamsLoading() {
  return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

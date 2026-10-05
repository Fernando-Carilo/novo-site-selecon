import { Badge } from "@selecon/ui";
import { CONTEST_STATUS_LABEL, CONTEST_STATUS_TONE } from "@/lib/content/labels";
import type { ContestPublicStatus } from "@/lib/content/types";

export function StatusBadge({ status, className = "" }: { status: ContestPublicStatus; className?: string }) {
  return (
    <Badge tone={CONTEST_STATUS_TONE[status]} dot className={className}>
      {CONTEST_STATUS_LABEL[status]}
    </Badge>
  );
}

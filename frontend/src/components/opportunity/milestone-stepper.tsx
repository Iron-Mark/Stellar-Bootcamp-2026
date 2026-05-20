import { MAX_OPPORTUNITY_MILESTONES } from "@/lib/types";

interface MilestoneStepperProps {
  milestoneCount: number;
  currentMilestone: number;
  status: string;
}

export function MilestoneStepper({
  milestoneCount,
  currentMilestone,
  status,
}: MilestoneStepperProps) {
  const safeMilestoneCount = Math.min(
    Math.max(1, Math.trunc(milestoneCount || 1)),
    MAX_OPPORTUNITY_MILESTONES,
  );
  const safeCurrentMilestone = Math.min(
    Math.max(0, Math.trunc(currentMilestone || 0)),
    safeMilestoneCount,
  );

  return (
    <div className="flex flex-col gap-2">
      <span className="font-pixel text-xs font-medium text-text-muted uppercase tracking-wider">
        Milestone progress
      </span>
      <div className="flex gap-2 items-center flex-wrap">
        {Array.from({ length: safeMilestoneCount }, (_, i) => {
          const done = i < safeCurrentMilestone;
          const current = i === safeCurrentMilestone && status !== "released" && status !== "refunded";
          return (
            <div
              key={i}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold border-2 transition-colors ${
                done
                  ? "border-success bg-success text-on-primary"
                  : current
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface-2 text-text-muted"
              }`}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-text-muted">
        {safeCurrentMilestone} of {safeMilestoneCount} milestone{safeMilestoneCount > 1 ? "s" : ""} completed
      </p>
    </div>
  );
}

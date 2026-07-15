import { Check } from "lucide-react";

interface Props {
  steps: string[];
  currentStep: number;
  onStepClick: (step: number) => void;
  completedSteps: number[];
}

export function StepWizard({ steps, currentStep, onStepClick, completedSteps }: Props) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((label, i) => {
        const stepNum  = i + 1;
        const isActive    = stepNum === currentStep;
        const isCompleted = completedSteps.includes(stepNum);
        const isClickable = isCompleted || stepNum === currentStep;

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            {/* Circle + label */}
            <button
              onClick={() => isClickable && onStepClick(stepNum)}
              disabled={!isClickable}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                  ${isCompleted
                    ? "bg-gradient-gold text-primary-foreground"
                    : isActive
                    ? "bg-gradient-gold text-primary-foreground shadow-gold"
                    : "bg-card border border-border text-muted-foreground"
                  }
                `}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
              </div>
              <span
                className={`text-[9px] tracking-[0.2em] uppercase whitespace-nowrap transition-colors ${
                  isActive ? "text-gold" : isCompleted ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </button>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 mb-5 transition-colors ${
                  isCompleted ? "bg-gold/50" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

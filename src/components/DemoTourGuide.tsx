import React, { useState } from 'react';
import { Play, ChevronRight, ChevronLeft, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { FireCluster, PrimaryScreen } from '../types/emberwatch.js';

interface DemoTourGuideProps {
  isOpen: boolean;
  onClose: () => void;
  clusters: FireCluster[];
  onSelectCluster: (c: FireCluster) => void;
  onSelectScreen: (screen: PrimaryScreen) => void;
  onTriggerNewObservation: () => void;
  onOpenAgent: () => void;
  onSetTimeOffset: (offset: number) => void;
}

export const DemoTourGuide: React.FC<DemoTourGuideProps> = ({
  isOpen,
  onClose,
  clusters,
  onSelectCluster,
  onSelectScreen,
  onTriggerNewObservation,
  onOpenAgent,
  onSetTimeOffset
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: '01 // SATELLITE & SENSOR SYNCHRONIZATION',
      desc: 'NASA FIRMS VIIRS & Open-Meteo live feeds are synchronized into the in-memory spatial store.',
      actionLabel: 'Go to Operations Center',
      action: () => {
        onSelectScreen('OPERATIONS');
        onSetTimeOffset(0);
      }
    },
    {
      title: '02 // DETECT CLUSTERS & THERMAL PULSES',
      desc: 'Inspect active satellite thermal pulses and DBSCAN spatial clusters across the Sierra Nevada corridor.',
      actionLabel: 'Select Highest Risk Cluster',
      action: () => {
        const topCluster = [...clusters].sort((a, b) => b.risk_score - a.risk_score)[0] || clusters[0];
        if (topCluster) onSelectCluster(topCluster);
        onSelectScreen('OPERATIONS');
      }
    },
    {
      title: '03 // SATELLITE INGESTION & RISK TRANSITION',
      desc: 'Simulate live NASA FIRMS satellite detection event with instant risk recalculation (82 → 91).',
      actionLabel: 'Simulate Satellite Overpass',
      action: () => {
        onTriggerNewObservation();
      }
    },
    {
      title: '04 // INCIDENT INTELLIGENCE & SHAP ATTRIBUTION',
      desc: 'Examine empirical factor contributions: Wind Speed (+24.3), Humidity Deficit (+27.6), FRP (+20.8).',
      actionLabel: 'Open Incident Intelligence',
      action: () => {
        const topCluster = [...clusters].sort((a, b) => b.risk_score - a.risk_score)[0] || clusters[0];
        if (topCluster) onSelectCluster(topCluster);
        onSelectScreen('INCIDENT');
      }
    },
    {
      title: '05 // EXPOSURE & TACTICAL RECOMMENDATIONS',
      desc: 'Review populated settlements, schools, hospitals, power infrastructure, and 01/02/03 response actions.',
      actionLabel: 'View Incident Overview',
      action: () => {
        onSelectScreen('INCIDENT');
      }
    },
    {
      title: '06 // ASK EMBERWATCH INTELLIGENCE AGENT',
      desc: 'Autonomous tool-calling agent querying get_active_fires, get_weather, and get_exposed_assets.',
      actionLabel: 'Launch Ask EmberWatch',
      action: () => {
        onOpenAgent();
      }
    },
    {
      title: '07 // TEMPORAL SCRUBBING & REPLAY',
      desc: 'Scrub temporal timeline backward by 4 hours to demonstrate propagation history and satellite tracking.',
      actionLabel: 'Scrub -4 Hours Replay',
      action: () => {
        onSelectScreen('OPERATIONS');
        onSetTimeOffset(-4);
      }
    },
    {
      title: '08 // RETURN TO REAL-TIME SYSTEM SYNC',
      desc: 'Return to real-time live satellite monitoring and review Model & System Intelligence validation metrics.',
      actionLabel: 'View Model & System Validation',
      action: () => {
        onSetTimeOffset(0);
        onSelectScreen('SYSTEM');
      }
    }
  ];

  const step = tourSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      tourSteps[nextIdx].action();
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      tourSteps[prevIdx].action();
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#080A0D]/95 backdrop-blur-md border-2 border-[#C6A15B] p-4 rounded-xl shadow-2xl space-y-3 text-[#F3EEE2]">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#C6A15B]/20 text-[#E1C47A]">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="font-mono text-xs font-bold text-[#E1C47A]">
              HACKATHON JUDGE DEMO TOUR &bull; STEP {currentStep + 1} OF {tourSteps.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-[#A9A394] hover:text-[#F3EEE2] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <h4 className="font-serif-display text-base font-bold text-[#F3EEE2]">
            {step.title}
          </h4>
          <p className="text-xs text-[#A9A394] mt-1 leading-relaxed">
            {step.desc}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={step.action}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C6A15B]/25 hover:bg-[#C6A15B]/35 text-[#E1C47A] border border-[#C6A15B]/60 text-xs font-mono font-semibold transition cursor-pointer"
          >
            <Play className="h-3 w-3 fill-[#E1C47A]" />
            <span>{step.actionLabel}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="p-1.5 rounded bg-[#171D27] text-[#A9A394] hover:text-[#F3EEE2] disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#171D27] hover:bg-[#202735] text-[#F3EEE2] border border-white/[0.08] text-xs font-mono cursor-pointer"
            >
              <span>{currentStep === tourSteps.length - 1 ? 'FINISH' : 'NEXT STEP'}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

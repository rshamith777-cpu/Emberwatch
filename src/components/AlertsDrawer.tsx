import React from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  MapPin,
  Clock
} from 'lucide-react';
import { EmberAlert, FireCluster } from '../types/emberwatch.js';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: EmberAlert[];
  clusters: FireCluster[];
  onSelectCluster: (cluster: FireCluster) => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  clusters,
  onSelectCluster
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-[#080A0D] border-l border-[#C6A15B]/30 shadow-2xl flex flex-col text-[#F3EEE2]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-[#0D121A]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#171D27] border border-[#C6A15B]/40 flex items-center justify-center">
              <Bell className="h-4 w-4 text-[#E1C47A]" />
            </div>
            <div>
              <h3 className="font-serif-display text-base font-bold text-[#F3EEE2]">
                AUTOMATED ALERT BROADCASTS
              </h3>
              <p className="text-[11px] font-mono text-[#A9A394]">
                {alerts.length} event alerts generated with hysteresis cooldown
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#111720] hover:bg-[#171D27] text-[#A9A394] hover:text-[#F3EEE2] border border-white/[0.08] transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {alerts.length === 0 ? (
            <div className="text-center py-16 text-[#A9A394]">
              <ShieldAlert className="h-10 w-10 mx-auto mb-2 text-[#C6A15B]/40" />
              <p className="font-serif-display text-base font-bold text-[#F3EEE2]">No Active Threat Alerts</p>
              <p className="text-xs text-[#A9A394] mt-1">All monitored clusters currently operating within nominal thresholds.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const isCritical = alert.severity === 'CRITICAL';
              const isHigh = alert.severity === 'HIGH';

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition ${
                    isCritical
                      ? 'bg-[#111720] border-[#D45543]/50 hover:border-[#D45543]'
                      : isHigh
                      ? 'bg-[#111720] border-[#B84535]/40 hover:border-[#B84535]'
                      : 'bg-[#111720] border-white/[0.08] hover:border-[#C6A15B]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                        isCritical
                          ? 'bg-[#D45543]/20 text-[#D45543] border-[#D45543]/40'
                          : isHigh
                          ? 'bg-[#B84535]/20 text-[#B84535] border-[#B84535]/40'
                          : 'bg-[#C89A4B]/20 text-[#C89A4B] border-[#C89A4B]/40'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-[10px] font-mono text-[#A9A394] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="font-bold text-[#F3EEE2] text-xs leading-snug">
                    {alert.title}
                  </h4>

                  <p className="text-[11px] text-[#A9A394] mt-1 leading-relaxed">
                    {alert.message}
                  </p>

                  {alert.cluster_id && (
                    <button
                      onClick={() => {
                        const target = clusters.find((c) => c.id === alert.cluster_id);
                        if (target) {
                          onSelectCluster(target);
                          onClose();
                        }
                      }}
                      className="mt-3 w-full flex items-center justify-between p-2 rounded bg-[#171D27] hover:bg-[#202735] border border-white/[0.06] text-[#E1C47A] text-[11px] font-mono transition cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-[#C6A15B]" />
                        <span>Inspect Incident Cluster</span>
                      </div>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

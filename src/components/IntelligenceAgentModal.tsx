import React, { useState } from 'react';
import {
  Bot,
  X,
  Send,
  Terminal,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  Database,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { AgentMessage } from '../types/emberwatch.js';

interface IntelligenceAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntelligenceAgentModal: React.FC<IntelligenceAgentModalProps> = ({
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### EmberWatch Tactical Intelligence Terminal Active
Direct tool-calling access to live satellite observations, Open-Meteo meteorological streams, ML risk predictions, and critical infrastructure proximity queries.

**Recommended Queries:**
- **"Which incident requires the highest priority?"**
- **"Why is Cluster 184 critical?"**
- **"What changed during the last hour?"**
- **"Which communities are potentially exposed?"**`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const quickPrompts = [
    'Which incident requires the highest priority?',
    'Why is Cluster 184 critical?',
    'What changed during the last hour?',
    'Which communities are potentially exposed?'
  ];

  const handleSend = async (promptToSend?: string) => {
    const query = (promptToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/agent/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query })
      });

      if (!res.ok) {
        throw new Error(`Agent query failed: ${res.status}`);
      }

      const agentResponse: AgentMessage = await res.json();
      setMessages((prev) => [...prev, agentResponse]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `**Agent Query Error**: ${err?.message || 'Failed to execute command'}. Please retry.`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleToolExpand = (id: string) => {
    setExpandedTools((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl h-[680px] max-h-[90vh] flex flex-col bg-[#080A0D] border border-[#C6A15B]/40 rounded-2xl shadow-2xl overflow-hidden text-[#F3EEE2]">
        {/* Terminal Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-[#0D121A]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#171D27] border border-[#C6A15B]/40 flex items-center justify-center shadow-lg">
              <Sparkles className="h-4 w-4 text-[#E1C47A]" />
            </div>
            <div>
              <h3 className="font-serif-display text-lg font-bold text-[#F3EEE2] flex items-center gap-2">
                <span>ASK EMBERWATCH // TACTICAL INTELLIGENCE TERMINAL</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-[#718A72]/20 text-[#718A72] border border-[#718A72]/30">
                  TOOL-CALLING ONLINE
                </span>
              </h3>
              <p className="text-[11px] text-[#A9A394] font-mono">
                Autonomous grounding via get_active_fires, get_weather, get_risk_prediction & get_exposed_assets
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

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1 text-[10px] font-mono text-[#A9A394]">
                <span>{msg.role === 'user' ? 'TACTICAL OPERATOR' : 'EMBERWATCH INTELLIGENCE'}</span>
                <span>&bull;</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div
                className={`p-4 rounded-xl max-w-[85%] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#171D27] border border-[#C6A15B]/40 text-[#F3EEE2]'
                    : 'bg-[#0D121A] border border-white/[0.08] text-[#F3EEE2]'
                }`}
              >
                {/* Expandable Tool Execution Trace (Section 22) */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mb-3 space-y-2 border-b border-white/[0.08] pb-3">
                    <span className="text-[10px] font-mono text-[#C6A15B] uppercase font-bold tracking-wider block">
                      TOOL EXECUTION TRACE ({msg.toolCalls.length} EXECUTED)
                    </span>
                    <div className="space-y-1.5">
                      {msg.toolCalls.map((tc, idx) => {
                        const isExp = expandedTools[`${msg.id}-${idx}`];
                        return (
                          <div
                            key={idx}
                            className="p-2 rounded bg-[#111720] border border-white/[0.06] text-[11px] font-mono"
                          >
                            <button
                              onClick={() => toggleToolExpand(`${msg.id}-${idx}`)}
                              className="w-full flex items-center justify-between text-left cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5">
                                <Terminal className="h-3.5 w-3.5 text-[#E1C47A]" />
                                <span className="font-bold text-[#E1C47A]">{tc.toolName}</span>
                                <span className="text-[#A9A394]">({JSON.stringify(tc.arguments || {})})</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-[#718A72]">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>{tc.executionTimeMs}ms</span>
                                {isExp ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                              </div>
                            </button>

                            {isExp && tc.result && (
                              <div className="mt-2 pt-2 border-t border-white/[0.06] text-[10px] text-[#A9A394] overflow-x-auto max-h-36">
                                <pre>{JSON.stringify(tc.result, null, 2)}</pre>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Markdown text formatted with structured sections */}
                <div className="space-y-2 prose prose-invert max-w-none text-xs leading-relaxed whitespace-pre-line">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0D121A] border border-[#C6A15B]/30 text-xs font-mono text-[#E1C47A] animate-pulse">
              <Bot className="h-4 w-4 text-[#E1C47A]" />
              <span>Querying satellite telemetry, running spatial tools & generating decision brief...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips (Section 21) */}
        <div className="px-4 py-2 bg-[#0D121A] border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-mono text-[#A9A394] shrink-0 uppercase">SUGGESTED:</span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded bg-[#111720] hover:bg-[#171D27] text-[#A9A394] hover:text-[#E1C47A] border border-white/[0.06] text-[11px] whitespace-nowrap transition cursor-pointer disabled:opacity-50"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#080A0D] border-t border-white/[0.08]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about active incidents, priority clusters, meteorological drivers, or exposed assets..."
              disabled={isLoading}
              className="flex-1 bg-[#111720] border border-[#C6A15B]/30 rounded-lg px-3.5 py-2.5 text-xs text-[#F3EEE2] placeholder-[#A9A394]/60 focus:outline-none focus:border-[#E1C47A] font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2.5 rounded-lg bg-[#C6A15B]/20 hover:bg-[#C6A15B]/30 text-[#E1C47A] border border-[#C6A15B]/50 transition cursor-pointer disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

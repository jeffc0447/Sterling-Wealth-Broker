import React, { useState, useRef, useEffect } from 'react';
import { useBroker } from '../../context/BrokerContext';
import {
  MessageSquareLock,
  Send,
  Lock,
  ShieldCheck,
  Paperclip,
  CheckCheck,
  UserCheck,
  Phone,
  Bot,
  Mail,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

interface EncryptedChatProps {
  embedded?: boolean;
}

export const EncryptedChat: React.FC<EncryptedChatProps> = ({ embedded = false }) => {
  const { messages, sendMessage, currentUser, chatQuestionCount, resetChatQuestions, supportConfig } = useBroker();
  const [inputText, setInputText] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agentName = supportConfig?.agentName || 'Jeffery Dean';
  const agentEmail = supportConfig?.agentEmail || 'jeffery@accountant.com';
  const agentSecondaryEmail = supportConfig?.agentSecondaryEmail || 'jeffery@sterlingwealthbroker.com';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`${agentEmail}, ${agentSecondaryEmail}`);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col ${embedded ? 'h-[540px]' : 'h-[700px]'}`}>
      
      {/* Chat Room Top Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs">
              <Bot className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                Sterling Broker Desk & Underwriting Robot
              </h3>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                Automated Bot Active
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>AES-256 GCM Encrypted Session · Assigned Agent: {agentName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Question Count Indicator */}
          <div className="flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg font-mono">
            <span className="text-slate-400 text-[11px]">Triage Questions:</span>
            <span className={`font-bold ${chatQuestionCount >= 4 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {chatQuestionCount} / 4
            </span>
          </div>

          {chatQuestionCount >= 4 && (
            <button
              onClick={resetChatQuestions}
              title="Restart automated chat session"
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 border border-slate-700 transition"
            >
              <RotateCcw className="w-3 h-3 text-emerald-400" />
              <span>Restart</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-950/40">
        {messages.map((msg) => {
          const isMe = msg.senderRole === 'CLIENT';
          const isSystem = msg.senderRole === 'SYSTEM';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-3">
                <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl px-4 py-2 text-center text-[11px] text-slate-400 max-w-md flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{msg.text}</span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                <span className="font-medium text-slate-300">{msg.senderName}</span>
                <span>·</span>
                <span className="font-mono">{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-md sm:max-w-lg rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isMe
                    ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none shadow-md shadow-emerald-500/10'
                    : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/60'
                }`}
              >
                {msg.text}
              </div>

              <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 px-1">
                {isMe && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                <span className="font-mono text-[9px]">Encrypted Payload</span>
              </div>
            </div>
          );
        })}
        {chatQuestionCount >= 4 && (
          <div className="mx-auto max-w-xl my-4 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl shadow-amber-500/10">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-semibold border border-amber-500/30">
                    <span>Underwriting Triage Limit Reached</span>
                  </div>
                  <h4 className="text-sm font-bold text-white font-display mt-1">
                    Direct Agent Handoff Required
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    You have completed the automated preliminary underwriting triage questions. For specialized structuring, live term sheet covenants, and customized loan documentation, please contact your assigned Customer Care Agent.
                  </p>
                </div>

                {/* Contact Details Box */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Contact Details for your Agent:
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Name: </span>
                      <strong className="text-white">{agentName}</strong>
                    </div>
                    <div className="font-mono text-emerald-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <a href={`mailto:${agentEmail}`} className="hover:underline">{agentEmail}</a>
                      <span className="text-slate-500 font-sans">and</span>
                      <a href={`mailto:${agentSecondaryEmail}`} className="hover:underline">{agentSecondaryEmail}</a>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied Emails</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Both Emails</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`mailto:${agentEmail},${agentSecondaryEmail}?subject=Sterling%20Wealth%20Broker%20-%20Loan%20Underwriting%20Assistance%20Request&body=Hello%20${encodeURIComponent(agentName.split(' ')[0] || 'Jeffery')}%2C%0A%0AI%20am%20following%20up%20on%20my%20membership%20loan%20underwriting%20process.`}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-emerald-500/20"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Launch Email Client</span>
                  </a>

                  <button
                    type="button"
                    onClick={resetChatQuestions}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs flex items-center gap-1 transition ml-auto"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset AI Robot</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-3.5 bg-slate-950 border-t border-slate-800">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setInputText((prev) => prev ? `${prev} [Attached Term Sheet Addition]` : 'Please find attached the signed board resolution.');
            }}
            title="Attach file from Document Vault"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              chatQuestionCount >= 4
                ? `Triage answered. Ask another question or reach out to ${agentName} directly...`
                : "Ask any underwriting, loan facility, or membership question..."
            }
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { UserAccount } from '../types';
import { Bot, Send, Sparkles, Cpu, X, User } from 'lucide-react';
import { API } from "../utils/api";
interface AIAgentAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onOpenSendModal: (recipientUpi?: string) => void;
}

export const AIAgentAssistantModal: React.FC<AIAgentAssistantModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenSendModal,
}) => {
  const [messages, setMessages] = useState<
    { sender: 'user' | 'agent'; text: string; actionUpi?: string }[]
  >([
    {
      sender: 'agent',
      text: `Hello ${user.name}! I am your BlockPay AI Agent powered by Gemini. You can ask me to check liquidity, analyze spending, or prepare x402 agent payment contracts.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const res = await fetch(`${API}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, userId: user.id }),
      });
      const data = await res.json();

      let actionUpi = undefined;
      if (userText.toLowerCase().includes('friend')) {
        actionUpi = 'friend@blockpay';
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: data.reply || "I'm ready to assist with your x402 payment flow.",
          actionUpi,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: 'agent', text: 'Network connection issue with Gemini AI model.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white relative flex flex-col h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-1.5">
                BlockPay AI Agent <Sparkles className="w-4 h-4 text-amber-300" />
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">Gemini 3.6 Flash & x402 Assistant</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'agent' && (
                <div className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0">
                  <Cpu className="w-4 h-4 text-purple-300" />
                </div>
              )}

              <div
                className={`max-w-[80%] p-3.5 rounded-2xl text-xs font-mono leading-relaxed shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}

                {msg.actionUpi && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSendModal(msg.actionUpi);
                    }}
                    className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs transition"
                  >
                    Open x402 Payment for {msg.actionUpi}
                  </button>
                )}
              </div>

              {msg.sender === 'user' && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-xl object-cover shrink-0"
                />
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2 text-xs text-slate-400 font-mono items-center">
              <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
              <span>Gemini is thinking...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="flex gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
          <input
            type="text"
            placeholder="Ask agent: 'Send 500 to Friend' or 'Check balance'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent px-3 text-xs text-white focus:outline-none font-mono"
          />
          <button
            onClick={handleSend}
            className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-lg transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

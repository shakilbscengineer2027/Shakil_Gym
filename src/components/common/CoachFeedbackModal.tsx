import React, { useState } from 'react';
import { X, Send, Award, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sqliteDb } from '../../db/sqliteEngine';

export const CoachFeedbackModal: React.FC = () => {
  const { isCoachModalOpen, setIsCoachModalOpen, profile, refreshData, showToast } = useApp();
  const [replyText, setReplyText] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'coach' | 'user'; text: string; time: string }>>([
    {
      sender: 'coach',
      text: profile.coachFeedback,
      time: '10:15 AM Today',
    },
    {
      sender: 'coach',
      text: 'Remember to keep your wrists neutral during the hammer curls to protect your tendons.',
      time: '10:18 AM Today',
    },
  ]);

  if (!isCoachModalOpen) return null;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newMsg = {
      sender: 'user' as const,
      text: replyText.trim(),
      time: 'Just now',
    };
    setMessages((prev) => [...prev, newMsg]);
    setReplyText('');

    // Update profile
    sqliteDb.updateProfile({ hasNewFeedback: false });
    refreshData();
    showToast('Message sent to Coach Narez!', 'success');

    // Simulate coach response after 1.5s
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'coach',
          text: 'Got it Michael! Stay locked in on today’s scheduled session. You got this!',
          time: 'Just now',
        },
      ]);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#171717] border border-[#2B2B2B] rounded-3xl w-full max-w-sm overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2B2B2B] bg-[#1a1a1a]">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={profile.coachAvatarUrl}
                alt={profile.coachName}
                className="w-10 h-10 rounded-full object-cover border border-[#D4F52A]"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#A6E22E] rounded-full ring-2 ring-[#171717]"></span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{profile.coachName}</span>
                <Award className="w-3.5 h-3.5 text-[#D4F52A]" />
              </h3>
              <p className="text-[10px] text-[#A6E22E] font-medium">Head Trainer · Online</p>
            </div>
          </div>
          <button
            onClick={() => setIsCoachModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#242424] hover:bg-[#333333] flex items-center justify-center text-[#aaaaaa] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#111111]/80 text-xs">
          <div className="text-center my-1">
            <span className="text-[10px] text-[#666666] bg-[#1a1a1a] px-2.5 py-0.5 rounded-full border border-[#222222]">
              Assigned Coach · AuraFit Performance
            </span>
          </div>

          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-xs ${
                  m.sender === 'user'
                    ? 'bg-[#D4F52A] text-black font-semibold rounded-br-xs'
                    : 'bg-[#242424] text-white border border-[#333333] rounded-bl-xs'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-[#666666] mt-1 px-1">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSendReply} className="p-3 bg-[#1a1a1a] border-t border-[#2B2B2B] flex items-center space-x-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Reply to Coach Narez..."
            className="flex-1 bg-[#242424] text-white placeholder-[#777777] text-xs px-3.5 py-2.5 rounded-full border border-[#333333] focus:outline-hidden focus:border-[#D4F52A]"
          />
          <button
            type="submit"
            disabled={!replyText.trim()}
            className="w-9 h-9 rounded-full bg-[#D4F52A] disabled:opacity-40 text-black flex items-center justify-center transition-transform active:scale-90"
          >
            <Send className="w-4 h-4 fill-black stroke-black" />
          </button>
        </form>
      </div>
    </div>
  );
};

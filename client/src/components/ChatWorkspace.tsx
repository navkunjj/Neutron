import React, { useRef, useEffect, useState } from 'react';
import {
  Code2,
  FileText,
  Share2,
  FileCheck,
  ArrowRight,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bug,
  Zap,
  RefreshCw,
  CheckSquare,
} from 'lucide-react';
import type { ChatMessage, FileDiff, ModelProvider } from '../types';
import { Header } from './Header';
import { MessageItem } from './MessageItem';
import { PromptComposer } from './PromptComposer';

interface ChatWorkspaceProps {
  conversationId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  activeModel: string;
  mode: 'agent' | 'chat';
  onModeChange: (mode: 'agent' | 'chat') => void;
  onOpenSettings: () => void;
  activityPanelOpen: boolean;
  onToggleActivityPanel: () => void;
  onSend: (prompt: string, files?: File[]) => void;
  onStop: () => void;
  providers: ModelProvider[];
  onSelectModel: (providerId: string, modelId: string) => void;
  diffs: FileDiff[];
  userName?: string;
  onToggleMobileSidebar?: () => void;
  pendingApproval?: {
    id: string;
    command: string;
    reason: string;
  } | null;
  onApproveCommand?: (approved: boolean) => void;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  conversationId,
  messages,
  isStreaming,
  activeModel,
  mode,
  onModeChange,
  onOpenSettings,
  activityPanelOpen,
  onToggleActivityPanel,
  onSend,
  onStop,
  providers,
  onSelectModel,
  diffs,
  userName = 'nav',
  onToggleMobileSidebar,
  pendingApproval,
  onApproveCommand,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const [isScrolledUp, setIsScrolledUp] = useState(false);

  // Auto-scroll on message update (when at or near bottom)
  useEffect(() => {
    if (scrollRef.current && !isScrolledUp) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming, isScrolledUp]);

  // When opening a new chat or switching conversation: reset to normal size & scroll to bottom
  useEffect(() => {
    setIsScrolledUp(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversationId]);

  // Track scroll position to decrease message box size when sliding up, and restore original size when at bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      // If there are no messages (e.g. new chat landing), always keep normal original size
      if (messages.length === 0) {
        setIsScrolledUp(false);
        return;
      }

      // Check distance from bottom of scroll container
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

      // When user slides / scrolls up (> 55px from bottom), decrease message box size
      if (distanceFromBottom > 55) {
        setIsScrolledUp(true);
      } else {
        // When user slides down to bottom, restore original real size!
        setIsScrolledUp(false);
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [messages.length, conversationId]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setIsScrolledUp(false);
    }
  };

  const isAgent = mode === 'agent';

  // Assistant Mode Cards
  const assistantCards = [
    {
      title: 'Review my project',
      desc: 'Analyze your codebase and suggest improvements.',
      themeClass: 'theme-purple',
      icon: <Code2 size={18} />,
      prompt: 'Review my codebase and suggest improvements.',
    },
    {
      title: 'Explain something',
      desc: 'Get a clear explanation of any file or concept.',
      themeClass: 'theme-magenta',
      icon: <FileText size={18} />,
      prompt: 'Get a clear explanation of any file or concept.',
    },
    {
      title: 'Plan a project',
      desc: 'Break down ideas into steps and tasks.',
      themeClass: 'theme-blue',
      icon: <Share2 size={18} />,
      prompt: 'Break down ideas into practical steps and tasks.',
    },
    {
      title: 'Draft a report',
      desc: 'Generate documentation or technical reports.',
      themeClass: 'theme-teal',
      icon: <FileCheck size={18} />,
      prompt: 'Generate documentation or technical reports.',
    },
  ];

  // Coding Agent Mode Cards
  const agentCards = [
    {
      title: 'Fix a bug or issue',
      desc: 'Debug failing tests, terminal errors, or exceptions.',
      themeClass: 'theme-purple',
      icon: <Bug size={18} />,
      prompt: 'Diagnose and fix any bugs, terminal errors, or failing tests in the repository.',
    },
    {
      title: 'Build a new feature',
      desc: 'Implement full modules, components, or API endpoints.',
      themeClass: 'theme-magenta',
      icon: <Zap size={18} />,
      prompt: 'Help me plan and build a new feature end-to-end.',
    },
    {
      title: 'Refactor codebase',
      desc: 'Improve architecture, performance, and best practices.',
      themeClass: 'theme-blue',
      icon: <RefreshCw size={18} />,
      prompt: 'Analyze the codebase structure and suggest clean refactorings.',
    },
    {
      title: 'Run automated tests',
      desc: 'Write unit tests and execute test suites via terminal.',
      themeClass: 'theme-teal',
      icon: <CheckSquare size={18} />,
      prompt: 'Write and run comprehensive tests for this project.',
    },
  ];

  const quickActionCards = isAgent ? agentCards : assistantCards;
  const composerPlaceholder = isAgent
    ? "Instruct Neutron Coding Agent (e.g. 'Fix authentication issue and write tests')..."
    : "Message Neutron. Ask a question or tell it what to work on...";
  const compactPlaceholder = isAgent ? "Instruct Coding Agent..." : "Message Neutron...";

  return (
    <main className="neutron-main-workspace">
      {/* Top Header */}
      <Header
        activeModel={activeModel}
        mode={mode}
        onModeChange={onModeChange}
        onOpenSettings={onOpenSettings}
        activityPanelOpen={activityPanelOpen}
        onToggleActivityPanel={onToggleActivityPanel}
        onToggleMobileSidebar={onToggleMobileSidebar}
        modifiedFilesCount={diffs.length}
      />

      {/* Confirmation Banner for Sensitive Actions */}
      {pendingApproval && (
        <div className="pending-approval-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24' }}>
                Command Approval Required:
              </span>{' '}
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#fef08a' }}>
                {pendingApproval.command}
              </code>
              <div style={{ fontSize: '11px', color: '#d1d5db' }}>
                {pendingApproval.reason}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="banner-reject-btn"
              onClick={() => onApproveCommand && onApproveCommand(false)}
            >
              Reject
            </button>
            <button
              className="banner-approve-btn"
              onClick={() => onApproveCommand && onApproveCommand(true)}
            >
              Approve & Run
            </button>
          </div>
        </div>
      )}

      {/* Right Edge Panel Toggle & Grip Indicator (matching reference) */}
      <div
        className="workspace-right-edge-handle"
        onClick={onToggleActivityPanel}
        title={activityPanelOpen ? 'Close activity panel' : 'Open activity panel'}
      >
        <div className="edge-chevron-wrapper">
          {activityPanelOpen ? (
            <ChevronRight size={13} className="edge-chevron" />
          ) : (
            <ChevronLeft size={13} className="edge-chevron" />
          )}
        </div>
        <div className="edge-grip-pill">
          <div className="edge-grip-dots">
            <div className="grip-dot" />
            <div className="grip-dot" />
            <div className="grip-dot" />
            <div className="grip-dot" />
            <div className="grip-dot" />
            <div className="grip-dot" />
          </div>
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="chat-scroll-container" ref={scrollRef}>
        <div className="chat-inner-width">
          {messages.length === 0 ? (
            <div className="hero-landing-container">
              {/* Greeting Headline */}
              <div className="hero-greeting-block">
                <h1 className="hero-greeting-title">
                  {greeting},{' '}
                  <span className="hero-name-gradient">{userName}</span>
                </h1>
                <p className="hero-greeting-subtitle">
                  {isAgent ? (
                    <>
                      I'm Neutron, your autonomous coding agent.<br />
                      Give me a goal, terminal task, or codebase feature to build.
                    </>
                  ) : (
                    <>
                      I'm Neutron, your personal AI assistant.<br />
                      Ask me anything, or choose a quick action below.
                    </>
                  )}
                </p>
              </div>

              {/* 4 Quick Action Cards in 1 Row */}
              <div className="quick-action-cards-row">
                {quickActionCards.map((card, idx) => (
                  <div
                    key={idx}
                    className={`quick-action-card ${card.themeClass}`}
                    onClick={() => onSend(card.prompt)}
                  >
                    <div className="card-top-icon-badge">
                      {card.icon}
                    </div>
                    <div className="card-content">
                      <div className="card-title">{card.title}</div>
                      <div className="card-desc">{card.desc}</div>
                    </div>
                    <div className="card-arrow-bottom">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Prompt Composer Floating Below Cards */}
              <div className="hero-composer-container">
                <PromptComposer
                  onSend={onSend}
                  onStop={onStop}
                  isStreaming={isStreaming}
                  providers={providers}
                  activeModel={activeModel}
                  onSelectModel={onSelectModel}
                  placeholder={composerPlaceholder}
                  compactPlaceholder={compactPlaceholder}
                />
              </div>
            </div>
          ) : (
            <div className="active-messages-container">
              {messages.map((msg, index) => (
                <MessageItem
                  key={msg.id || index}
                  message={msg}
                  isStreaming={isStreaming && index === messages.length - 1 && msg.role === 'assistant'}
                />
              ))}

              {/* Bottom prompt composer: decreases in size when scrolled up, restores original size at bottom */}
              <div className={`active-chat-composer-dock ${isScrolledUp ? 'dock-compact' : ''}`}>
                {isScrolledUp && (
                  <button
                    type="button"
                    className="scroll-to-bottom-pill"
                    onClick={scrollToBottom}
                    title="Jump down to latest messages"
                  >
                    <ChevronDown size={13} />
                    <span>Scroll to bottom</span>
                  </button>
                )}
                <PromptComposer
                  onSend={onSend}
                  onStop={onStop}
                  isStreaming={isStreaming}
                  providers={providers}
                  activeModel={activeModel}
                  onSelectModel={onSelectModel}
                  compact={isScrolledUp}
                  onExpand={() => setIsScrolledUp(false)}
                  placeholder={composerPlaceholder}
                  compactPlaceholder={compactPlaceholder}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

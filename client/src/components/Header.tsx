import React from 'react';
import { PanelRight, Settings, Menu, Bot, Terminal } from 'lucide-react';

interface HeaderProps {
  activeModel?: string;
  mode: 'agent' | 'chat';
  onModeChange: (mode: 'agent' | 'chat') => void;
  activityPanelOpen: boolean;
  onToggleActivityPanel: () => void;
  onOpenSettings: () => void;
  onToggleMobileSidebar?: () => void;
  modifiedFilesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  onOpenSettings,
  activityPanelOpen,
  onToggleActivityPanel,
  onToggleMobileSidebar,
  modifiedFilesCount = 0,
}) => {
  const isAgent = mode === 'agent';

  return (
    <header className="workspace-topbar">
      <div className="topbar-left">
        {onToggleMobileSidebar && (
          <button
            type="button"
            className="topbar-mobile-menu-btn"
            onClick={onToggleMobileSidebar}
            title="Open chats & projects"
            aria-label="Open navigation sidebar"
          >
            <Menu size={18} />
          </button>
        )}
      </div>

      {/* Center Mode Switcher: [ Assistant | Coding Agent ] */}
      <div className="topbar-mode-pill" role="group" aria-label="Operating Mode">
        <button
          type="button"
          onClick={() => onModeChange('chat')}
          className={`topbar-mode-btn ${mode === 'chat' ? 'active' : ''}`}
          aria-pressed={mode === 'chat'}
          title="Switch to conversational Assistant mode"
        >
          <Bot size={13} className="mode-btn-icon" />
          <span>Assistant</span>
        </button>
        <button
          type="button"
          onClick={() => onModeChange('agent')}
          className={`topbar-mode-btn ${mode === 'agent' ? 'active' : ''}`}
          aria-pressed={mode === 'agent'}
          title="Switch to autonomous Coding Agent mode"
        >
          <Terminal size={13} className="mode-btn-icon" />
          <span>Coding Agent</span>
          <span className="mode-agent-dot" />
        </button>
      </div>

      {/* Right Controls: Agent Panel Toggle (ONLY rendered in Coding Agent mode) and Settings */}
      <div className="topbar-right">
        {isAgent && (
          <button
            type="button"
            className={`topbar-icon-btn topbar-agent-panel-btn ${activityPanelOpen ? 'active' : ''}`}
            onClick={onToggleActivityPanel}
            title={activityPanelOpen ? 'Close Agent Activity Panel' : 'Open Agent Activity Panel'}
            aria-label="Toggle Agent Activity Panel"
          >
            <PanelRight size={17} />
            {modifiedFilesCount > 0 && (
              <span className="topbar-badge">{modifiedFilesCount}</span>
            )}
          </button>
        )}

        <button
          type="button"
          className="topbar-icon-btn"
          onClick={onOpenSettings}
          title="Settings"
          aria-label="Open Settings"
        >
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
};

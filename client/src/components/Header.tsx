import React from 'react';
import { PanelRight, Settings, Menu } from 'lucide-react';

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

      {/* Center Mode Switcher matching screenshot: [ Assistant | Coding Agent ] */}
      <div className="topbar-mode-pill" role="group" aria-label="Assistant mode">
        <button
          type="button"
          onClick={() => onModeChange('chat')}
          className={`topbar-mode-btn ${mode === 'chat' ? 'active' : ''}`}
          aria-pressed={mode === 'chat'}
        >
          Assistant
        </button>
        <button
          type="button"
          onClick={() => onModeChange('agent')}
          className={`topbar-mode-btn ${mode === 'agent' ? 'active' : ''}`}
          aria-pressed={mode === 'agent'}
        >
          Coding Agent
        </button>
      </div>

      {/* Right Controls: Panel Toggle and Settings */}
      <div className="topbar-right">
        <button
          type="button"
          className={`topbar-icon-btn ${activityPanelOpen ? 'active' : ''}`}
          onClick={onToggleActivityPanel}
          title={activityPanelOpen ? 'Close Activity Panel' : 'Open Activity Panel'}
          aria-label="Toggle Activity Panel"
        >
          <PanelRight size={17} />
          {modifiedFilesCount > 0 && (
            <span className="topbar-badge">{modifiedFilesCount}</span>
          )}
        </button>

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

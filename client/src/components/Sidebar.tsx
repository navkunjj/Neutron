import React, { useState } from 'react';
import {
  Plus,
  Folder,
  ChevronDown,
  MessageSquare,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  Pin,
  LogOut,
} from 'lucide-react';
import type { Conversation, AuthUser } from '../types';
import { NeutronLogo } from './NeutronLogo';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  projectName?: string;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onTogglePin: (id: string) => void;
  onOpenSettings: () => void;
  onOpenWorkspaceModal: () => void;
  workspaceDir: string;
  user?: AuthUser | null;
  onSignOut?: () => void;
  mode?: 'agent' | 'chat';
  onModeChange?: (mode: 'agent' | 'chat') => void;
}

const formatTimeAgo = (timestamp?: number): string => {
  if (!timestamp) return 'Just now';
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 5) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(timestamp).toLocaleDateString();
};

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  projectName = 'Main Project',
  mobileOpen = false,
  onCloseMobile,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onTogglePin,
  onOpenSettings,
  user,
  onSignOut,
  mode = 'chat',
  onModeChange,
}) => {
  const isAgent = mode === 'agent';
  const visibleConversations = conversations.filter((c) => {
    if (isAgent) return c.mode === 'agent';
    return c.mode === 'chat' || !c.mode;
  });
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const userName = user?.name || 'nav';
  const userRole = user?.role || 'AI Engineer';

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-mobile-backdrop" onClick={onCloseMobile} />
      )}
      <aside className={`neutron-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Top Header */}
      <div className="sidebar-header">
        <NeutronLogo size={26} withText={true} />
        <button
          className="sidebar-header-icon-btn"
          onClick={onOpenSettings}
          title="Open Project / Settings"
          aria-label="Open Project / Settings"
        >
          <ExternalLink size={15} />
        </button>
      </div>

      <div className="sidebar-body">
        {/* Project Section */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">PROJECT</div>
          <button
            className="sidebar-project-btn"
            onClick={onOpenSettings}
            title={projectName}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <Folder size={15} className="sidebar-folder-icon" />
              <span className="sidebar-project-name">{projectName}</span>
            </div>
            <ChevronDown size={14} className="sidebar-chevron" />
          </button>
        </div>

        {/* New Chat Button Row */}
        <div style={{ marginTop: '12px' }}>
          <button
            className="sidebar-newchat-pill"
            onClick={() => { onNewChat(); onCloseMobile?.(); }}
            title="Create a new conversation (Ctrl+K)"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <Plus size={16} />
              <span style={{ fontWeight: 500, fontSize: '13px' }}>New Chat</span>
            </div>
            <span className="sidebar-token-badge">86 K</span>
          </button>
        </div>

        {/* Recent Chats Section (Scoped to active Mode) */}
        <div className="sidebar-section" style={{ marginTop: '22px' }}>
          <div className="sidebar-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{isAgent ? 'AGENT SESSIONS' : 'RECENT CHATS'}</span>
            <button
              type="button"
              className="sidebar-mode-indicator-pill"
              onClick={() => onModeChange?.(isAgent ? 'chat' : 'agent')}
              title={`Switch to ${isAgent ? 'Assistant' : 'Coding Agent'} mode`}
              style={{ cursor: onModeChange ? 'pointer' : 'default' }}
            >
              {isAgent ? 'Agent' : 'Assistant'}
            </button>
          </div>
          <div className="sidebar-chat-list">
            {visibleConversations.length === 0 ? (
              <div className="sidebar-empty-chats">
                {isAgent ? 'No agent sessions yet.' : 'No assistant chats yet.'}
              </div>
            ) : (
              visibleConversations.map((c) => {
              const isActive = activeConversationId === c.id;
              return (
                <div
                  key={c.id}
                  className={`sidebar-chat-item ${isActive ? 'active' : ''}`}
                  onClick={() => { onSelectConversation(c.id); onCloseMobile?.(); }}
                >
                  <MessageSquare size={15} className="chat-item-icon" />
                  <div className="chat-item-text">
                    <div className="chat-item-title">{c.title}</div>
                    <div className="chat-item-time">{formatTimeAgo(c.updatedAt)}</div>
                  </div>

                  {isActive && (
                    <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        className="chat-item-menu-btn"
                        onClick={() => setActiveMenuId(activeMenuId === c.id ? null : c.id)}
                        title="Conversation options"
                      >
                        <MoreHorizontal size={14} />
                      </button>

                      {activeMenuId === c.id && (
                        <div className="chat-item-dropdown">
                          <button
                            onClick={() => {
                              onTogglePin(c.id);
                              setActiveMenuId(null);
                            }}
                          >
                            <Pin size={12} />
                            <span>{c.pinned ? 'Unpin chat' : 'Pin chat'}</span>
                          </button>
                          <button
                            className="danger"
                            onClick={() => {
                              onDeleteConversation(c.id);
                              setActiveMenuId(null);
                            }}
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
              })
            )}
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="sidebar-footer">
        <div className="user-profile-row">
          <div className="user-avatar-wrapper" onClick={onOpenSettings} title="Profile settings">
            <img
              src="/avatar.jpg"
              alt={userName}
              className="user-avatar-photo"
              onError={(e) => {
                // Fallback to initials if image fails to load
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
            <div className="user-avatar-initials-fallback" style={{ display: 'none' }}>
              {userName.slice(0, 2).toUpperCase()}
            </div>
          </div>

          <div
            className="user-profile-info"
            onClick={onOpenSettings}
            style={{ cursor: 'pointer' }}
            title="Account Settings"
          >
            <div className="user-profile-name">{userName}</div>
            <div className="user-profile-role">{userRole}</div>
          </div>

          {onSignOut && (
            <button
              className="user-logout-btn"
              onClick={(e) => {
                e.stopPropagation();
                onSignOut();
              }}
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
    </>
  );
};

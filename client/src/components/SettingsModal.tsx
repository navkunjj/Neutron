import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Folder,
  Cpu,
  ShieldCheck,
  Check,
  Sliders,
  Laptop,
} from 'lucide-react';
import type { AppSettings, ModelProvider, AuthUser } from '../types';
import { NeutronLogo } from './NeutronLogo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  providers: ModelProvider[];
  user?: AuthUser | null;
  onUpdateUser?: (updatedUser: Partial<AuthUser>) => void;
  projectName?: string;
  onUpdateProjectName?: (name: string) => void;
  mode?: 'agent' | 'chat';
  onModeChange?: (mode: 'agent' | 'chat') => void;
  onSave: (updated: any) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  providers,
  user,
  onUpdateUser,
  projectName = 'Main Project',
  onUpdateProjectName,
  mode = 'chat',
  onModeChange,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'project' | 'models' | 'agent'>('profile');

  // Form states
  const [name, setName] = useState(user?.name || 'nav');
  const [role, setRole] = useState(user?.role || 'AI Engineer');
  const [email, setEmail] = useState(user?.email || 'nav@neutron.ai');
  const [localProjectName, setLocalProjectName] = useState(projectName);
  const [selectedModel, setSelectedModel] = useState(settings.activeModel);
  const [selectedProvider, setSelectedProvider] = useState(settings.activeProvider);
  const [autoApproveSafe, setAutoApproveSafe] = useState(settings.autoApproveSafe);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(user?.name || 'nav');
      setRole(user?.role || 'AI Engineer');
      setEmail(user?.email || 'nav@neutron.ai');
      setLocalProjectName(projectName);
      setSelectedModel(settings.activeModel);
      setSelectedProvider(settings.activeProvider);
      setAutoApproveSafe(settings.autoApproveSafe);
      setSavedSuccess(false);
    }
  }, [isOpen, user, projectName, settings]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Update user profile if changed
      if (onUpdateUser) {
        onUpdateUser({
          name: name.trim() || 'nav',
          role: role.trim() || 'AI Engineer',
          email: email.trim() || 'nav@neutron.ai',
        });
      }

      // 2. Update project name if changed
      if (onUpdateProjectName) {
        onUpdateProjectName(localProjectName.trim() || 'Main Project');
      }

      // 3. Save core app settings
      await onSave({
        activeProvider: selectedProvider,
        activeModel: selectedModel,
        autoApproveSafe,
      });

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 600);
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="settings-header-brand">
            <NeutronLogo size={22} withText={true} />
            <span className="settings-header-badge">SETTINGS</span>
          </div>
          <button className="settings-close-btn" onClick={onClose} title="Close settings" aria-label="Close settings">
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher matching home panel navigation */}
        <div className="settings-tabs-bar">
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={14} />
            <span>Profile</span>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'project' ? 'active' : ''}`}
            onClick={() => setActiveTab('project')}
          >
            <Folder size={14} />
            <span>Project</span>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'models' ? 'active' : ''}`}
            onClick={() => setActiveTab('models')}
          >
            <Cpu size={14} />
            <span>Models</span>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'agent' ? 'active' : ''}`}
            onClick={() => setActiveTab('agent')}
          >
            <ShieldCheck size={14} />
            <span>Agent</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body settings-scroll-body">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="settings-tab-pane">
              <div className="settings-pane-header">
                <h3>User Profile & Home Panel Identity</h3>
                <p>Customize your identity displayed across the home greeting and sidebar profile.</p>
              </div>

              {/* Live Preview Card */}
              <div className="settings-preview-card">
                <div className="settings-preview-avatar">
                  <img
                    src="/avatar.jpg"
                    alt={name}
                    className="preview-avatar-img"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="preview-avatar-fallback">
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="settings-preview-info">
                  <div className="preview-greeting">
                    Good evening, <span className="preview-greeting-name">{name || 'nav'}</span>
                  </div>
                  <div className="preview-role-text">{role || 'AI Engineer'} · {email}</div>
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="settings-field">
                  <label htmlFor="settings-name">Full Name / Display Name</label>
                  <input
                    id="settings-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. nav"
                    className="settings-input"
                  />
                  <span className="field-hint">Updates the main greeting headline on the home panel.</span>
                </div>

                <div className="settings-field">
                  <label htmlFor="settings-role">Professional Role</label>
                  <input
                    id="settings-role"
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. AI Engineer"
                    className="settings-input"
                  />
                  <span className="field-hint">Shown in the sidebar footer profile card.</span>
                </div>

                <div className="settings-field">
                  <label htmlFor="settings-email">Email Address</label>
                  <input
                    id="settings-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. nav@neutron.ai"
                    className="settings-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROJECT & WORKSPACE */}
          {activeTab === 'project' && (
            <div className="settings-tab-pane">
              <div className="settings-pane-header">
                <h3>Project & Workspace Settings</h3>
                <p>Manage your active project title and local workspace directory.</p>
              </div>

              <div className="settings-form-grid">
                <div className="settings-field">
                  <label htmlFor="settings-project-name">Project Title</label>
                  <input
                    id="settings-project-name"
                    type="text"
                    value={localProjectName}
                    onChange={(e) => setLocalProjectName(e.target.value)}
                    placeholder="e.g. Main Project"
                    className="settings-input"
                  />
                  <span className="field-hint">Updates the project dropdown title in the left sidebar.</span>
                </div>

                <div className="settings-field">
                  <label>Current Mode</label>
                  <div className="settings-mode-selector">
                    <button
                      type="button"
                      className={`settings-mode-btn ${mode === 'chat' ? 'active' : ''}`}
                      onClick={() => onModeChange && onModeChange('chat')}
                    >
                      <Sliders size={13} />
                      <span>Assistant</span>
                    </button>
                    <button
                      type="button"
                      className={`settings-mode-btn ${mode === 'agent' ? 'active' : ''}`}
                      onClick={() => onModeChange && onModeChange('agent')}
                    >
                      <Laptop size={13} />
                      <span>Coding Agent</span>
                    </button>
                  </div>
                  <span className="field-hint">Controls the primary agent persona on the home panel.</span>
                </div>

                <div className="settings-field">
                  <label>Workspace Directory</label>
                  <div className="settings-workspace-box">
                    <code className="workspace-path-code">
                      {settings.workspaceDir || 'Default sandbox environment'}
                    </code>
                    <span className="workspace-status-badge">Mounted & Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI MODELS */}
          {activeTab === 'models' && (
            <div className="settings-tab-pane">
              <div className="settings-pane-header">
                <h3>AI Model Engine</h3>
                <p>Choose the default intelligence model powering Neutron.</p>
              </div>

              <div className="settings-models-list">
                {providers.length === 0 ? (
                  <div className="settings-model-option active">
                    <div className="model-radio-circle selected" />
                    <div className="model-option-details">
                      <div className="model-option-title">NVIDIA Nemotron 3 Nano Omni 30B</div>
                      <div className="model-option-desc">Advanced reasoning & multimodal coding agent.</div>
                    </div>
                    <span className="model-badge">Default</span>
                  </div>
                ) : (
                  providers.flatMap((p) =>
                    p.models.map((m) => {
                      const isSelected = m.id === selectedModel;
                      return (
                        <div
                          key={m.id}
                          className={`settings-model-option ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedModel(m.id);
                            setSelectedProvider(p.id);
                          }}
                        >
                          <div className={`model-radio-circle ${isSelected ? 'selected' : ''}`} />
                          <div className="model-option-details">
                            <div className="model-option-title">{m.name}</div>
                            <div className="model-option-desc">{m.description || p.name}</div>
                          </div>
                          {isSelected && <span className="model-badge">Active</span>}
                        </div>
                      );
                    })
                  )
                )}
              </div>

              <div className="settings-info-box">
                <span className="info-box-title">NVIDIA Cloud Credentials</span>
                <p>NVIDIA AI reasoning keys are loaded securely from your environment variables without exposing sensitive secrets.</p>
              </div>
            </div>
          )}

          {/* TAB 4: AGENT & SAFETY */}
          {activeTab === 'agent' && (
            <div className="settings-tab-pane">
              <div className="settings-pane-header">
                <h3>Autonomous Agent & Safety Controls</h3>
                <p>Configure command execution safety rules and sandbox autonomy.</p>
              </div>

              <div className="settings-toggle-card">
                <div className="toggle-card-info">
                  <div className="toggle-card-title">Auto-Approve Safe Commands</div>
                  <div className="toggle-card-desc">
                    Allows the Coding Agent to automatically run compilation, linter, and unit test commands without prompting for confirmation.
                  </div>
                </div>
                <label className="settings-switch">
                  <input
                    type="checkbox"
                    checked={autoApproveSafe}
                    onChange={(e) => setAutoApproveSafe(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              <div className="settings-toggle-card">
                <div className="toggle-card-info">
                  <div className="toggle-card-title">Terminal Sandbox Isolation</div>
                  <div className="toggle-card-desc">
                    Enforces strict directory containment preventing destructive operations (rm -rf, format) outside your project root.
                  </div>
                </div>
                <div className="toggle-status-active">
                  <Check size={12} />
                  <span>Enforced</span>
                </div>
              </div>

              <div className="settings-toggle-card">
                <div className="toggle-card-info">
                  <div className="toggle-card-title">Real-time Activity Stream</div>
                  <div className="toggle-card-desc">
                    Automatically opens the right Activity Panel during agent execution steps to visualize diffs and logs.
                  </div>
                </div>
                <div className="toggle-status-active">
                  <Check size={12} />
                  <span>Enabled</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="settings-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="settings-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {savedSuccess ? (
              <>
                <Check size={14} />
                <span>Saved!</span>
              </>
            ) : saving ? (
              <span>Saving...</span>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

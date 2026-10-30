import React, { useState } from 'react';
import {
  X,
  ListTodo,
  GitCompare,
  Terminal as TerminalIcon,
  FolderTree,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Cpu,
  ChevronRight,
  ChevronDown,
  FileCode,
} from 'lucide-react';
import type { TaskStep, FileDiff, CommandResult, FileNode } from '../types';

interface ActivityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal?: string;
  steps: TaskStep[];
  diffs: FileDiff[];
  commands: CommandResult[];
  workspaceTree: FileNode[];
  onSelectFile: (filePath: string) => void;
}

export const ActivityPanel: React.FC<ActivityPanelProps> = ({
  isOpen,
  onClose,
  currentGoal,
  steps,
  diffs,
  commands,
  workspaceTree,
  onSelectFile,
}) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'diffs' | 'terminal' | 'tree'>('plan');

  if (!isOpen) return null;

  // Fallback sample demonstration steps if no active task is running
  const effectiveGoal =
    currentGoal || 'Autonomous Agent · Ready to execute tasks across workspace';

  const defaultSampleSteps: TaskStep[] = [
    {
      id: 'step_1',
      title: 'Analyze workspace dependencies & project manifest',
      status: 'completed',
      detail: 'Scanned package.json, vite config, and client source structure.',
    },
    {
      id: 'step_2',
      title: 'Initialize cosmic glassmorphism dark theme engine',
      status: 'completed',
      detail: 'Applied nebula wallpaper, glass composer, and 4 quick action cards.',
    },
    {
      id: 'step_3',
      title: 'Awaiting user instructions in Chat Workspace',
      status: 'in_progress',
      detail: 'Ready to write code, execute commands, and produce diffs.',
    },
  ];

  const effectiveSteps = steps.length > 0 ? steps : defaultSampleSteps;

  const defaultSampleCommands: CommandResult[] = [
    {
      command: 'npm run build',
      exitCode: 0,
      durationMs: 1860,
      stdout:
        'vite v8.3.5 building client environment for production...\n✓ 1950 modules transformed.\n✓ built in 1.86s\ndist/assets/index.js 289.78 kB\ndist/assets/index.css 17.07 kB',
      stderr: '',
    },
  ];

  const effectiveCommands = commands.length > 0 ? commands : defaultSampleCommands;

  return (
    <>
      <div className="activity-panel-backdrop" onClick={onClose} />
      <aside className="neutron-activity-panel">
      {/* Activity Panel Header */}
      <div className="activity-panel-header">
        <div className="activity-header-left">
          <div className="activity-live-indicator">
            <span className="live-pulse-dot" />
            <span className="live-status-text">AGENT ACTIVE</span>
          </div>
          <span className="activity-panel-subtitle">Execution Pipeline</span>
        </div>

        <button
          className="activity-close-btn"
          onClick={onClose}
          title="Close agent activity panel"
          aria-label="Close activity panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Segmented Tabs */}
      <div className="activity-tabs-bar">
        <button
          className={`activity-tab-pill ${activeTab === 'plan' ? 'active' : ''}`}
          onClick={() => setActiveTab('plan')}
        >
          <ListTodo size={13} />
          <span>Plan</span>
          <span className="tab-count-badge">{effectiveSteps.length}</span>
        </button>

        <button
          className={`activity-tab-pill ${activeTab === 'diffs' ? 'active' : ''}`}
          onClick={() => setActiveTab('diffs')}
        >
          <GitCompare size={13} />
          <span>Diffs</span>
          {diffs.length > 0 && <span className="tab-count-badge">{diffs.length}</span>}
        </button>

        <button
          className={`activity-tab-pill ${activeTab === 'terminal' ? 'active' : ''}`}
          onClick={() => setActiveTab('terminal')}
        >
          <TerminalIcon size={13} />
          <span>Terminal</span>
          <span className="tab-count-badge">{effectiveCommands.length}</span>
        </button>

        <button
          className={`activity-tab-pill ${activeTab === 'tree' ? 'active' : ''}`}
          onClick={() => setActiveTab('tree')}
        >
          <FolderTree size={13} />
          <span>Files</span>
        </button>
      </div>

      {/* Content Scroll Area */}
      <div className="activity-body-scroll">
        {/* TAB 1: PLAN */}
        {activeTab === 'plan' && (
          <div className="activity-plan-view">
            {/* Goal Card */}
            <div className="activity-goal-card">
              <div className="goal-card-top">
                <Cpu size={14} className="goal-icon" />
                <span className="goal-label">TARGET GOAL</span>
              </div>
              <div className="goal-text">{effectiveGoal}</div>
            </div>

            {/* Steps Timeline */}
            <div className="activity-steps-timeline">
              <div className="timeline-section-title">EXECUTION STEPS</div>

              <div className="timeline-steps-list">
                {effectiveSteps.map((s, idx) => (
                  <div key={s.id || idx} className={`timeline-step-card status-${s.status}`}>
                    <div className="step-status-icon-col">
                      {s.status === 'completed' && (
                        <CheckCircle2 size={16} className="icon-completed" />
                      )}
                      {s.status === 'in_progress' && (
                        <Loader2 size={16} className="icon-in-progress" />
                      )}
                      {s.status === 'failed' && (
                        <AlertCircle size={16} className="icon-failed" />
                      )}
                      {s.status === 'pending' && (
                        <Clock size={16} className="icon-pending" />
                      )}
                      {idx < effectiveSteps.length - 1 && <div className="step-connector-line" />}
                    </div>

                    <div className="step-details-col">
                      <div className="step-title-row">
                        <span className="step-number">0{idx + 1}</span>
                        <span className="step-title">{s.title}</span>
                      </div>
                      {s.detail && <div className="step-detail-text">{s.detail}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIFFS */}
        {activeTab === 'diffs' && (
          <div className="activity-diffs-view">
            {diffs.length === 0 ? (
              <div className="activity-empty-state">
                <div className="empty-state-icon-circle">
                  <GitCompare size={22} />
                </div>
                <div className="empty-state-title">No pending file modifications</div>
                <div className="empty-state-desc">
                  When the AI coding agent modifies project code, unified git diffs will appear here in real-time.
                </div>
              </div>
            ) : (
              <div className="diffs-list">
                {diffs.map((d, i) => (
                  <div key={i} className="diff-card">
                    <div className="diff-header">
                      <div className="diff-file-info">
                        <FileCode size={13} className="diff-icon" />
                        <span className="diff-filepath">{d.filePath}</span>
                      </div>
                      <div className="diff-stats">
                        <span className="stat-add">+{d.additions}</span>
                        <span className="stat-del">-{d.deletions}</span>
                      </div>
                    </div>

                    <div className="diff-lines-container">
                      {d.diffText.split('\n').map((line, idx) => {
                        let type = '';
                        if (line.startsWith('+')) type = 'addition';
                        else if (line.startsWith('-')) type = 'deletion';
                        else if (line.startsWith('@@')) type = 'header';
                        return (
                          <div key={idx} className={`diff-line ${type}`}>
                            <span className="line-prefix">
                              {type === 'addition' ? '+' : type === 'deletion' ? '-' : ' '}
                            </span>
                            <span className="line-content">
                              {type === 'addition' || type === 'deletion' ? line.slice(1) : line}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TERMINAL */}
        {activeTab === 'terminal' && (
          <div className="activity-terminal-view">
            <div className="terminal-commands-list">
              {effectiveCommands.map((cmd, i) => (
                <div key={i} className="terminal-window-card">
                  <div className="terminal-window-topbar">
                    <div className="terminal-mac-dots">
                      <span className="mac-dot dot-red" />
                      <span className="mac-dot dot-yellow" />
                      <span className="mac-dot dot-green" />
                    </div>

                    <div className="terminal-command-name">
                      <span className="cmd-prompt">$</span> {cmd.command}
                    </div>

                    <div
                      className={`terminal-exit-badge ${cmd.exitCode === 0 ? 'success' : 'error'}`}
                    >
                      {cmd.exitCode === 0 ? '0' : cmd.exitCode ?? 'err'} ({cmd.durationMs}ms)
                    </div>
                  </div>

                  <div className="terminal-output-body">
                    <pre>{cmd.stdout || cmd.stderr || 'Command executed with no stdout/stderr.'}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: FILE TREE */}
        {activeTab === 'tree' && (
          <div className="activity-tree-view">
            <div className="tree-header-row">
              <span className="tree-label">PROJECT WORKSPACE FILES</span>
            </div>
            <FileTreeRenderer nodes={workspaceTree} onSelectFile={onSelectFile} />
          </div>
        )}
      </div>
    </aside>
    </>
  );
};

const FileTreeRenderer: React.FC<{ nodes: FileNode[]; onSelectFile: (path: string) => void }> = ({
  nodes,
  onSelectFile,
}) => {
  return (
    <div className="file-tree-container">
      {nodes.map((node) => (
        <FileTreeNodeItem key={node.path} node={node} onSelectFile={onSelectFile} level={0} />
      ))}
    </div>
  );
};

const FileTreeNodeItem: React.FC<{
  node: FileNode;
  onSelectFile: (path: string) => void;
  level: number;
}> = ({ node, onSelectFile, level }) => {
  const [open, setOpen] = useState(true);
  const isDir = node.type === 'directory';

  return (
    <div className="tree-node-wrapper">
      <div
        className={`tree-node-row ${isDir ? 'is-directory' : 'is-file'}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (isDir) {
            setOpen(!open);
          } else {
            onSelectFile(node.path);
          }
        }}
      >
        {isDir ? (
          <>
            <span className="tree-chevron">
              {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </span>
            <FolderTree size={13} className="tree-folder-icon" />
          </>
        ) : (
          <FileText size={13} className="tree-file-icon" />
        )}
        <span className="tree-node-name">{node.name}</span>
      </div>

      {isDir && open && node.children && (
        <div className="tree-children-container">
          {node.children.map((child) => (
            <FileTreeNodeItem
              key={child.path}
              node={child}
              onSelectFile={onSelectFile}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

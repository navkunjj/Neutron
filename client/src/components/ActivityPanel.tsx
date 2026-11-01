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
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Play,
  Zap,
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
  onSelectSuggestion?: (prompt: string) => void;
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
  onSelectSuggestion,
}) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'diffs' | 'terminal' | 'tree'>('plan');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const inProgressSteps = steps.filter((s) => s.status === 'in_progress').length;
  const failedSteps = steps.filter((s) => s.status === 'failed').length;
  const totalSteps = steps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const isAllDone = totalSteps > 0 && completedSteps === totalSteps;
  const isRunning = inProgressSteps > 0;

  const totalAdditions = diffs.reduce((acc, d) => acc + (d.additions || 0), 0);
  const totalDeletions = diffs.reduce((acc, d) => acc + (d.deletions || 0), 0);

  const handleCopyCommandOutput = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sampleSuggestions = [
    {
      title: 'Fix authentication error',
      desc: 'Inspect auth handlers, debug tokens, and fix login errors.',
      prompt: 'Diagnose and fix authentication and session issues in the repository.',
    },
    {
      title: 'Build a REST API endpoint',
      desc: 'Create CRUD routes, request validation, and database operations.',
      prompt: 'Plan and build a complete REST API module with input validation.',
    },
    {
      title: 'Refactor codebase architecture',
      desc: 'Improve code readability, clean abstractions, and best practices.',
      prompt: 'Analyze repository structure and suggest clean architectural refactorings.',
    },
    {
      title: 'Write automated unit tests',
      desc: 'Generate test cases and run verification via terminal.',
      prompt: 'Write comprehensive automated unit tests and verify them in terminal.',
    },
  ];

  return (
    <>
      <div className="activity-panel-backdrop" onClick={onClose} />
      <aside className="neutron-activity-panel">
        {/* Activity Panel Header */}
        <div className="activity-panel-header">
          <div className="activity-header-left">
            <div className="activity-live-indicator">
              <span className={`live-pulse-dot ${isRunning ? 'pulse-running' : isAllDone ? 'pulse-done' : ''}`} />
              <span className="live-status-text">
                {isRunning ? 'AGENT EXECUTING' : isAllDone ? 'AGENT COMPLETED' : 'AGENT PIPELINE'}
              </span>
            </div>
            <span className="activity-panel-subtitle">Autonomous Execution Pipeline</span>
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

        {/* Segmented Tabs Bar */}
        <div className="activity-tabs-bar">
          <button
            className={`activity-tab-pill ${activeTab === 'plan' ? 'active' : ''}`}
            onClick={() => setActiveTab('plan')}
          >
            <ListTodo size={13} />
            <span>Plan</span>
            {steps.length > 0 && <span className="tab-count-badge">{steps.length}</span>}
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
            {commands.length > 0 && <span className="tab-count-badge">{commands.length}</span>}
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
              {/* Target Goal Card */}
              {currentGoal && (
                <div className="activity-goal-card">
                  <div className="goal-card-top">
                    <Cpu size={14} className="goal-icon" />
                    <span className="goal-label">ACTIVE GOAL</span>
                  </div>
                  <div className="goal-text">{currentGoal}</div>
                </div>
              )}

              {/* Progress Summary Card when steps exist */}
              {steps.length > 0 ? (
                <div className="activity-steps-timeline">
                  <div className="plan-progress-header">
                    <div className="plan-progress-title-row">
                      <span className="timeline-section-title">PIPELINE EXECUTION STEPS</span>
                      <span
                        className={`plan-status-chip ${
                          isRunning ? 'status-running' : isAllDone ? 'status-done' : failedSteps > 0 ? 'status-err' : ''
                        }`}
                      >
                        {isRunning ? (
                          <>
                            <Loader2 size={11} className="spin-fast" />
                            <span>In Progress</span>
                          </>
                        ) : isAllDone ? (
                          <>
                            <CheckCircle2 size={11} />
                            <span>Completed</span>
                          </>
                        ) : failedSteps > 0 ? (
                          <>
                            <AlertCircle size={11} />
                            <span>Failed</span>
                          </>
                        ) : (
                          <span>Ready</span>
                        )}
                      </span>
                    </div>

                    <div className="plan-progress-bar-track">
                      <div
                        className={`plan-progress-bar-fill ${isRunning ? 'animated-gradient' : ''}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="plan-progress-stats">
                      <span>
                        {completedSteps} of {totalSteps} steps completed
                      </span>
                      <span>{progressPercent}%</span>
                    </div>
                  </div>

                  {/* List of Step Cards */}
                  <div className="timeline-steps-list">
                    {steps.map((s, idx) => (
                      <div key={s.id || idx} className={`timeline-step-card status-${s.status}`}>
                        <div className="step-status-icon-col">
                          {s.status === 'completed' && (
                            <CheckCircle2 size={16} className="icon-completed" />
                          )}
                          {s.status === 'in_progress' && (
                            <Loader2 size={16} className="icon-in-progress spin-fast" />
                          )}
                          {s.status === 'failed' && (
                            <AlertCircle size={16} className="icon-failed" />
                          )}
                          {s.status === 'pending' && (
                            <Clock size={16} className="icon-pending" />
                          )}
                          {idx < steps.length - 1 && <div className="step-connector-line" />}
                        </div>

                        <div className="step-details-col">
                          <div className="step-title-row">
                            <span className="step-number">0{idx + 1}</span>
                            <span className="step-title">{s.title}</span>
                          </div>
                          {s.detail && (
                            <div className="step-detail-text">
                              {renderFormattedDetail(s.detail)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Sleek Standby State when no active steps */
                <div className="activity-standby-container">
                  <div className="standby-icon-circle">
                    <Sparkles size={24} className="standby-sparkle" />
                  </div>
                  <h3 className="standby-title">Coding Agent Standby</h3>
                  <p className="standby-desc">
                    Neutron is ready to inspect workspace files, plan solutions, generate code diffs, and execute terminal commands.
                  </p>

                  <div className="standby-suggestions-title">
                    <Play size={12} />
                    <span>SUGGESTED CODING TASKS</span>
                  </div>

                  <div className="standby-suggestions-list">
                    {sampleSuggestions.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        className="standby-suggestion-btn"
                        onClick={() => onSelectSuggestion?.(item.prompt)}
                      >
                        <div className="standby-btn-top">
                          <Zap size={13} className="standby-btn-icon" />
                          <span className="standby-btn-title">{item.title}</span>
                        </div>
                        <div className="standby-btn-desc">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                  <div className="empty-state-title">No workspace diffs</div>
                  <div className="empty-state-desc">
                    When the AI coding agent modifies or creates project files, unified git diffs will appear here with syntax highlighting.
                  </div>
                </div>
              ) : (
                <div className="diffs-container-inner">
                  <div className="diffs-summary-bar">
                    <span className="summary-file-count">
                      {diffs.length} file{diffs.length > 1 ? 's' : ''} modified
                    </span>
                    <div className="summary-line-stats">
                      <span className="stat-add">+{totalAdditions}</span>
                      <span className="stat-del">-{totalDeletions}</span>
                    </div>
                  </div>

                  <div className="diffs-list">
                    {diffs.map((d, i) => (
                      <div key={i} className="diff-card">
                        <div className="diff-header">
                          <div className="diff-file-info">
                            <FileCode size={13} className="diff-icon" />
                            <span className="diff-filepath">{d.filePath}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="diff-stats">
                              <span className="stat-add">+{d.additions}</span>
                              <span className="stat-del">-{d.deletions}</span>
                            </div>
                            <button
                              type="button"
                              className="diff-open-btn"
                              onClick={() => onSelectFile(d.filePath)}
                              title="Open file in editor"
                            >
                              <ExternalLink size={12} />
                              <span>View</span>
                            </button>
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
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TERMINAL */}
          {activeTab === 'terminal' && (
            <div className="activity-terminal-view">
              {commands.length === 0 ? (
                <div className="activity-empty-state">
                  <div className="empty-state-icon-circle">
                    <TerminalIcon size={22} />
                  </div>
                  <div className="empty-state-title">No terminal executions</div>
                  <div className="empty-state-desc">
                    When the coding agent executes build commands, test suites, or verification scripts in the sandbox, real-time command output will stream here.
                  </div>
                </div>
              ) : (
                <div className="terminal-commands-list">
                  {commands.map((cmd, i) => (
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

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            className="terminal-copy-btn"
                            onClick={() => handleCopyCommandOutput(cmd.stdout || cmd.stderr, i)}
                            title="Copy terminal output"
                          >
                            {copiedIndex === i ? (
                              <Check size={12} style={{ color: 'var(--status-success)' }} />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                          <div
                            className={`terminal-exit-badge ${cmd.exitCode === 0 ? 'success' : 'error'}`}
                          >
                            {cmd.exitCode === 0 ? 'exit 0' : `exit ${cmd.exitCode ?? 'err'}`} (
                            {cmd.durationMs}ms)
                          </div>
                        </div>
                      </div>

                      <div className="terminal-output-body">
                        <pre>{cmd.stdout || cmd.stderr || 'Command executed without output.'}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FILE TREE */}
          {activeTab === 'tree' && (
            <div className="activity-tree-view">
              <div className="tree-header-row">
                <span className="tree-label">PROJECT WORKSPACE SANDBOX</span>
                <span className="tree-badge">{countFiles(workspaceTree)} items</span>
              </div>
              {workspaceTree.length === 0 ? (
                <div className="activity-empty-state" style={{ padding: '24px 16px' }}>
                  <div className="empty-state-desc">
                    Workspace directory is currently empty. Run an agent task to initialize project files.
                  </div>
                </div>
              ) : (
                <FileTreeRenderer nodes={workspaceTree} onSelectFile={onSelectFile} />
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

function renderFormattedDetail(detail: string): React.ReactNode {
  // Highlight backticks `file.ext` or `command`
  const parts = detail.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="step-inline-code">{part.slice(1, -1)}</code>;
        }
        return part;
      })}
    </>
  );
}

function countFiles(nodes: FileNode[]): number {
  let count = 0;
  for (const node of nodes) {
    count++;
    if (node.children) {
      count += countFiles(node.children);
    }
  }
  return count;
}

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
        style={{ paddingLeft: `${level * 14 + 8}px` }}
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

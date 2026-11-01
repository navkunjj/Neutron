import React, { useState } from 'react';
import { Copy, Check, FileText } from 'lucide-react';
import type { ChatMessage } from '../types';
import { NeutronLogo } from './NeutronLogo';

interface MessageItemProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="message-wrapper user">
        <div className="user-header">
          <div className="user-avatar-mini">
            <img
              src="/avatar.jpg"
              alt="You"
              className="user-avatar-mini-img"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <span className="user-header-title">YOU</span>
        </div>

        {message.files && message.files.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
            {message.files.map((f, i) => (
              <span
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <FileText size={12} />
                {f.name}
              </span>
            ))}
          </div>
        )}

        <div className="user-bubble">{message.content}</div>
      </div>
    );
  }

  return (
    <div className="message-wrapper assistant">
      {/* Assistant Header outside the bubble box */}
      <div className="assistant-header">
        <NeutronLogo size={18} />
        <span className="assistant-header-name">
          NEUT<span style={{ color: '#3b82f6' }}>RON</span>
        </span>
      </div>

      <div className="assistant-bubble">
        {/* Note: Execution steps are strictly displayed in the Agent Panel, NOT in the chat section */}

        {/* Markdown Formatted Content or 4-Dot Loading Wave */}
        <div className="markdown-content">
          {!message.content && isStreaming ? (
            <div className="typing-dots-container" aria-label="Neutron is thinking...">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          ) : (
            <>
              <MarkdownRenderer content={message.content} />
              {isStreaming && <span className="streaming-cursor" />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Markdown Renderer with Code Syntax Highlighting and Unified Diff Parser
 */
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  // Split content by code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push(<TextSection key={`text-${lastIndex}`} text={textBefore} />);
    }

    const lang = match[1] || 'code';
    const code = match[2];

    if (lang === 'diff') {
      parts.push(<DiffBlock key={`diff-${match.index}`} diff={code} />);
    } else {
      parts.push(<CodeBlock key={`code-${match.index}`} language={lang} code={code} />);
    }

    lastIndex = match.index + match[0].length;
  }

  const remaining = content.substring(lastIndex);
  if (remaining) {
    parts.push(<TextSection key={`text-remaining`} text={remaining} />);
  }

  return <div>{parts}</div>;
};

/**
 * Code Block Component with 1-click Copy
 */
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span>{language}</span>
        <button className="copy-btn" onClick={handleCopy} title="Copy code">
          {copied ? <Check size={12} style={{ color: 'var(--status-success)' }} /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="code-block-content">
        <code>{code}</code>
      </pre>
    </div>
  );
};

/**
 * Diff Block Component
 */
const DiffBlock: React.FC<{ diff: string }> = ({ diff }) => {
  const lines = diff.split('\n');

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span>Unified Diff</span>
      </div>
      <div className="diff-container" style={{ padding: '8px' }}>
        {lines.map((line, idx) => {
          let lineType = '';
          if (line.startsWith('+')) lineType = 'addition';
          else if (line.startsWith('-')) lineType = 'deletion';
          else if (line.startsWith('@@')) lineType = 'header';
          return (
            <div key={idx} className={`diff-line ${lineType}`}>
              <span className="line-prefix">
                {lineType === 'addition' ? '+' : lineType === 'deletion' ? '-' : ' '}
              </span>
              <span className="line-content">
                {lineType === 'addition' || lineType === 'deletion' ? line.slice(1) : line}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Text Section with Inline Code, Bold, Lists, Headers & Links
 */
const TextSection: React.FC<{ text: string }> = ({ text }) => {
  const paragraphs = text.split(/\n\n+/);

  return (
    <>
      {paragraphs.map((p, pIdx) => {
        const trimmed = p.trim();
        if (!trimmed) return null;

        // Headers
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={pIdx} className="markdown-h3">
              {formatInlineStyles(trimmed.replace(/^###\s+/, ''))}
            </h3>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={pIdx} className="markdown-h2">
              {formatInlineStyles(trimmed.replace(/^##\s+/, ''))}
            </h2>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={pIdx} className="markdown-h1">
              {formatInlineStyles(trimmed.replace(/^#\s+/, ''))}
            </h1>
          );
        }

        // Bullet list block
        if (trimmed.split('\n').every((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '))) {
          const items = trimmed.split('\n').map((l) => l.trim().replace(/^[-*]\s+/, ''));
          return (
            <ul key={pIdx} className="markdown-list">
              {items.map((item, iIdx) => (
                <li key={iIdx}>{formatInlineStyles(item)}</li>
              ))}
            </ul>
          );
        }

        // Standard paragraph
        return (
          <p key={pIdx} className="markdown-p">
            {formatInlineStyles(trimmed)}
          </p>
        );
      })}
    </>
  );
};

function formatInlineStyles(raw: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      parts.push(raw.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<strong key={match.index}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={match.index}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(<code key={match.index}>{token.slice(1, -1)}</code>);
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < raw.length) {
    parts.push(raw.substring(lastIndex));
  }

  return parts;
}

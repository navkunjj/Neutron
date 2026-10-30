import React, { useRef, useState, useEffect } from 'react';
import {
  Plus,
  Paperclip,
  Globe,
  Star,
  ChevronDown,
  X,
  Square,
  ArrowRight,
} from 'lucide-react';
import type { ModelProvider } from '../types';

interface PromptComposerProps {
  onSend: (prompt: string, files?: File[]) => void;
  onStop: () => void;
  isStreaming: boolean;
  providers: ModelProvider[];
  activeModel: string;
  onSelectModel: (providerId: string, modelId: string) => void;
  compact?: boolean;
  onExpand?: () => void;
  placeholder?: string;
  compactPlaceholder?: string;
}

export const PromptComposer: React.FC<PromptComposerProps> = ({
  onSend,
  onStop,
  isStreaming,
  providers,
  activeModel,
  onSelectModel,
  compact = false,
  onExpand,
  placeholder,
  compactPlaceholder,
}) => {
  const [text, setText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [webSearchActive, setWebSearchActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea (adapts to normal vs compact state)
  useEffect(() => {
    if (textareaRef.current) {
      if (compact && !isFocused) {
        textareaRef.current.style.height = '24px';
      } else {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
      }
    }
  }, [text, compact, isFocused]);

  useEffect(() => {
    if (compact) {
      setIsFocused(false);
    }
  }, [compact]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed && attachedFiles.length === 0) return;
    if (isStreaming) return;

    onSend(trimmed, attachedFiles);
    setText('');
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="prompt-composer-wrapper">
      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className="composer-attached-files">
          {attachedFiles.map((file, idx) => (
            <div key={idx} className="composer-file-pill">
              <span className="file-name">{file.name}</span>
              <button onClick={() => removeFile(idx)} className="file-remove-btn">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Glass Composer Card (with compact decrease animation when scrolling) */}
      <div
        className={`neutron-composer-card ${compact && !isFocused ? 'compact' : ''}`}
        onClick={() => {
          if (compact && !isFocused) {
            setIsFocused(true);
            onExpand?.();
            textareaRef.current?.focus();
          }
        }}
      >
        <textarea
          ref={textareaRef}
          className="composer-textarea"
          placeholder={
            compact && !isFocused
              ? (compactPlaceholder || "Message Neutron...")
              : (placeholder || "Message Neutron. Ask a question or tell it what to work on...")
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            onExpand?.();
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
          rows={1}
        />

        {/* Bottom Bar: Tools on Left, Model & Send on Right */}
        <div className="composer-bottom-bar">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            multiple
          />

          {/* Left 3 Tool Buttons */}
          <div className="composer-tools-left">
            <button
              type="button"
              className="composer-tool-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Add file or context"
            >
              <Plus size={16} />
            </button>
            <button
              type="button"
              className="composer-tool-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Attach document"
            >
              <Paperclip size={15} />
            </button>
            <button
              type="button"
              className={`composer-tool-btn ${webSearchActive ? 'active' : ''}`}
              onClick={() => setWebSearchActive(!webSearchActive)}
              title={webSearchActive ? 'Web search enabled' : 'Toggle web search'}
            >
              <Globe size={15} />
            </button>
          </div>

          {/* Right Controls: Model Pill & Send Button */}
          <div className="composer-controls-right">
            {/* Recommended Model Dropdown Pill */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="composer-model-pill"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <Star size={13} fill="#a78bfa" color="#a78bfa" />
                <span>Recommended</span>
                <ChevronDown size={13} />
              </button>

              {showDropdown && (
                <div className="model-dropdown-menu">
                  <div className="dropdown-section-header">Select Model</div>
                  {providers.flatMap((p) =>
                    p.models.map((m) => (
                      <button
                        key={m.id}
                        className={`dropdown-item ${m.id === activeModel ? 'selected' : ''}`}
                        onClick={() => {
                          onSelectModel(p.id, m.id);
                          setShowDropdown(false);
                        }}
                      >
                        <span className="model-name">{m.name}</span>
                        <span className="provider-name">{p.name}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Glowing Let's Go / Stop Button */}
            {isStreaming ? (
              <button
                type="button"
                className="composer-stop-btn"
                onClick={onStop}
                title="Stop generation"
              >
                <Square size={12} fill="currentColor" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                className="composer-letsgo-btn"
                onClick={handleSubmit}
                disabled={!text.trim() && attachedFiles.length === 0}
                title="Send message"
              >
                <span className="letsgo-text">Let's Go!</span>
                <div className="letsgo-arrow-circle">
                  <ArrowRight size={13} />
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

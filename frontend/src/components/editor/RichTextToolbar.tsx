'use client';

import { useState, useRef, useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Minus,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolbarButtonProps {
  onClick: () => void;
  isActive: boolean;
  disabled?: boolean;
  icon: React.ElementType;
  tooltip: string;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  icon: Icon,
  tooltip,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={cn(
        'p-1.5 rounded-sm transition-colors',
        'hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
        isActive && 'bg-gray-100 text-gray-900'
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

function Separator() {
  return <div className="w-px h-4 bg-gray-200 mx-1" />;
}

interface LinkButtonProps {
  editor: Editor;
}

function LinkButton({ editor }: LinkButtonProps) {
  const [showInput, setShowInput] = useState(false);
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showInput && inputRef.current) {
      // Pre-fill with existing link if there is one
      const existingHref = editor.getAttributes('link').href;
      if (existingHref) {
        setUrl(existingHref);
      }
      inputRef.current.focus();
    }
  }, [showInput, editor]);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowInput(false);
        setUrl('');
      }
    }

    if (showInput) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showInput]);

  const setLink = () => {
    if (url) {
      // Ensure URL has protocol
      const href = url.match(/^https?:\/\//) ? url : `https://${url}`;
      editor.chain().focus().setLink({ href }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setShowInput(false);
    setUrl('');
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
    setShowInput(false);
    setUrl('');
  };

  return (
    <div className="relative" ref={popoverRef}>
      <ToolbarButton
        icon={LinkIcon}
        isActive={editor.isActive('link')}
        onClick={() => setShowInput(!showInput)}
        tooltip="Add Link (Ctrl+K)"
      />
      {showInput && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex items-center gap-1">
          <input
            ref={inputRef}
            type="url"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setLink();
              }
              if (e.key === 'Escape') {
                setShowInput(false);
                setUrl('');
              }
            }}
            className="text-sm border border-gray-200 rounded px-2 py-1 w-48 outline-none focus:border-gray-400"
          />
          <button
            onClick={setLink}
            className="text-sm px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Set
          </button>
          {editor.isActive('link') && (
            <button
              onClick={removeLink}
              className="text-sm px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface RichTextToolbarProps {
  editor: Editor | null;
}

export function RichTextToolbar({ editor }: RichTextToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 p-1 border-b border-gray-200 bg-gray-50/50 flex-wrap">
      {/* Text formatting */}
      <ToolbarButton
        icon={Bold}
        isActive={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        tooltip="Bold (Ctrl+B)"
      />
      <ToolbarButton
        icon={Italic}
        isActive={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        tooltip="Italic (Ctrl+I)"
      />
      <ToolbarButton
        icon={Underline}
        isActive={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        tooltip="Underline (Ctrl+U)"
      />
      <ToolbarButton
        icon={Strikethrough}
        isActive={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        tooltip="Strikethrough"
      />

      <Separator />

      {/* Headings */}
      <ToolbarButton
        icon={Heading2}
        isActive={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
        tooltip="Heading 2"
      />
      <ToolbarButton
        icon={Heading3}
        isActive={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        disabled={!editor.can().chain().focus().toggleHeading({ level: 3 }).run()}
        tooltip="Heading 3"
      />

      <Separator />

      {/* Lists */}
      <ToolbarButton
        icon={List}
        isActive={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
        tooltip="Bullet List"
      />
      <ToolbarButton
        icon={ListOrdered}
        isActive={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        tooltip="Numbered List"
      />
      <ToolbarButton
        icon={ListTodo}
        isActive={editor.isActive('taskList')}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        disabled={!editor.can().chain().focus().toggleTaskList().run()}
        tooltip="Task List"
      />

      <Separator />

      {/* Blocks */}
      <ToolbarButton
        icon={Quote}
        isActive={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        disabled={!editor.can().chain().focus().toggleBlockquote().run()}
        tooltip="Blockquote"
      />
      <ToolbarButton
        icon={Minus}
        isActive={false}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        disabled={!editor.can().chain().focus().setHorizontalRule().run()}
        tooltip="Horizontal Rule"
      />

      <Separator />

      {/* Link */}
      <LinkButton editor={editor} />
    </div>
  );
}

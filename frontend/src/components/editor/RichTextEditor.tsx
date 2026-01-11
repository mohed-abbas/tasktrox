'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { cn } from '@/lib/utils';
import { RichTextToolbar } from './RichTextToolbar';
import { wrapPlainText } from './utils';

interface RichTextEditorProps {
  value: string | null;
  onChange: (html: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = 'Add a description...',
  disabled = false,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // Prevents SSR hydration errors in Next.js
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        blockquote: {},
        strike: {},
        horizontalRule: {},
        codeBlock: false,
        code: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline cursor-pointer' },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          'before:content-[attr(data-placeholder)] before:text-gray-400 before:pointer-events-none before:absolute before:left-0 before:top-0',
      }),
    ],
    content: wrapPlainText(value),
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Return empty string if editor only contains empty paragraph
      const isEmpty = html === '<p></p>' || html === '';
      onChange(isEmpty ? '' : html);
    },
    onFocus: () => {
      onFocus?.();
    },
    onBlur: () => {
      onBlur?.();
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none',
          'px-3 py-2 min-h-[100px] outline-none',
          'text-sm text-gray-700',
          '[&_p]:my-0 [&_ul]:my-1 [&_ol]:my-1',
          '[&_li]:my-0 [&_li_p]:my-0',
          // Headings
          '[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:my-2 [&_h2]:text-gray-900',
          '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:my-1.5 [&_h3]:text-gray-900',
          // Blockquote
          '[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2 [&_blockquote]:text-gray-600',
          // Horizontal rule
          '[&_hr]:my-3 [&_hr]:border-gray-200',
          // Links
          '[&_a]:text-blue-600 [&_a]:underline [&_a]:cursor-pointer',
          // Task list
          '[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0',
          '[&_li[data-type=taskItem]]:flex [&_li[data-type=taskItem]]:gap-2 [&_li[data-type=taskItem]]:items-start',
          '[&_li[data-type=taskItem]>label]:mt-0.5',
          '[&_li[data-type=taskItem]_input]:mt-1'
        ),
      },
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentHtml = editor.getHTML();
      const newContent = wrapPlainText(value);

      // Only update if content actually changed to avoid cursor jumping
      if (currentHtml !== newContent && newContent !== currentHtml) {
        // Preserve selection if possible
        const { from, to } = editor.state.selection;
        editor.commands.setContent(newContent, { emitUpdate: false });
        // Try to restore selection
        try {
          editor.commands.setTextSelection({ from, to });
        } catch {
          // Selection restoration failed, that's ok
        }
      }
    }
  }, [value, editor]);

  // Update editable state when disabled changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 overflow-hidden',
        'focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-800/10',
        'transition-colors',
        disabled && 'bg-gray-50 cursor-default',
        className
      )}
    >
      {!disabled && <RichTextToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

'use client';

import { useRef, useEffect, useState } from 'react';
import {
  FiBold, FiItalic, FiUnderline,
  FiAlignLeft, FiAlignCenter, FiAlignRight, FiAlignJustify,
  FiList, FiLink,
} from 'react-icons/fi';
import {
  MdStrikethroughS, MdFormatListNumbered, MdFormatClear,
  MdUndo, MdRedo, MdFormatColorText,
} from 'react-icons/md';

const HEADING_OPTIONS = [
  { label: 'Paragraph', value: 'p' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
  { label: 'Heading 4', value: 'h4' },
];

const SIZE_OPTIONS = [
  { label: 'Small', value: '2' },
  { label: 'Normal', value: '3' },
  { label: 'Large', value: '5' },
  { label: 'Huge', value: '7' },
];

const COLORS = [
  '#111827', '#374151', '#6B7280',
  '#EF4444', '#F97316', '#EAB308',
  '#22C55E', '#14B8A6', '#3B82F6',
  '#8B5CF6', '#EC4899', '#FFFFFF',
];

const EDITOR_STYLES = `
  .rte-body h1 { font-size:2em; font-weight:700; line-height:1.2; margin:.4em 0; }
  .rte-body h2 { font-size:1.5em; font-weight:700; line-height:1.3; margin:.4em 0; }
  .rte-body h3 { font-size:1.25em; font-weight:600; margin:.4em 0; }
  .rte-body h4 { font-size:1.05em; font-weight:600; margin:.4em 0; }
  .rte-body ul { list-style:disc; padding-left:1.5em; margin:.5em 0; }
  .rte-body ol { list-style:decimal; padding-left:1.5em; margin:.5em 0; }
  .rte-body a  { color:#0d9488; text-decoration:underline; }
  .rte-body p  { margin:.25em 0; }
  .rte-body:empty:before { content:attr(data-ph); color:#9ca3af; pointer-events:none; }
`;

export default function RichTextEditor({
  defaultValue = '',
  onChange,
  placeholder = 'Start writing…',
  minHeight = 200,
}) {
  const editorRef = useRef(null);
  const savedRange = useRef(null);
  const [showColors, setShowColors] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = defaultValue || '';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    onChange?.(editorRef.current?.innerHTML ?? '');
  };

  const saveRange = () => {
    const sel = window.getSelection();
    savedRange.current = sel?.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
  };

  const restoreRange = () => {
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
    editorRef.current?.focus();
  };

  const Btn = ({ cmd, val = null, title, children }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); exec(cmd, val); }}
      className="p-1.5 rounded text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
    >
      {children}
    </button>
  );

  const Sep = () => (
    <span className="w-px h-5 bg-gray-200 mx-1 self-center flex-shrink-0 inline-block" />
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: EDITOR_STYLES }} />
      <div
        className="border border-gray-300 rounded-lg overflow-visible focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all"
        onMouseDown={(e) => { if (showColors) setShowColors(false); }}
      >
        {/* ── Toolbar ── */}
        <div className="bg-gray-50 border-b border-gray-200 px-2 py-1.5 flex flex-wrap items-center gap-0.5 rounded-t-lg">
          <Btn cmd="undo" title="Undo"><MdUndo size={17} /></Btn>
          <Btn cmd="redo" title="Redo"><MdRedo size={17} /></Btn>
          <Sep />

          <select
            defaultValue="p"
            onChange={(e) => exec('formatBlock', `<${e.target.value}>`)}
            onMouseDown={(e) => e.stopPropagation()}
            className="text-xs bg-white border border-gray-200 rounded px-1.5 py-1 text-gray-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-400 hover:bg-gray-100"
          >
            {HEADING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <select
            defaultValue="3"
            onChange={(e) => exec('fontSize', e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            className="text-xs bg-white border border-gray-200 rounded px-1.5 py-1 text-gray-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-400 hover:bg-gray-100 ml-1"
          >
            {SIZE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <Sep />
          <Btn cmd="bold"         title="Bold (Ctrl+B)">        <FiBold size={15} /></Btn>
          <Btn cmd="italic"       title="Italic (Ctrl+I)">      <FiItalic size={15} /></Btn>
          <Btn cmd="underline"    title="Underline (Ctrl+U)">   <FiUnderline size={15} /></Btn>
          <Btn cmd="strikeThrough" title="Strikethrough">       <MdStrikethroughS size={17} /></Btn>
          <Sep />

          <Btn cmd="justifyLeft"   title="Align Left">    <FiAlignLeft size={15} /></Btn>
          <Btn cmd="justifyCenter" title="Center">        <FiAlignCenter size={15} /></Btn>
          <Btn cmd="justifyRight"  title="Align Right">   <FiAlignRight size={15} /></Btn>
          <Btn cmd="justifyFull"   title="Justify">       <FiAlignJustify size={15} /></Btn>
          <Sep />

          <Btn cmd="insertUnorderedList" title="Bullet List">   <FiList size={15} /></Btn>
          <Btn cmd="insertOrderedList"   title="Numbered List"> <MdFormatListNumbered size={17} /></Btn>
          <Sep />

          {/* Text color */}
          <div className="relative">
            <button
              type="button"
              title="Text Color"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); saveRange(); setShowColors((p) => !p); setShowLink(false); }}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
            >
              <MdFormatColorText size={17} />
            </button>
            {showColors && (
              <div
                className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-2 grid grid-cols-4 gap-1"
                style={{ width: 116 }}
                onClick={(e) => e.stopPropagation()}
              >
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); restoreRange(); exec('foreColor', c); setShowColors(false); }}
                    className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform"
                    style={{ background: c }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Link */}
          <button
            type="button"
            title="Insert Link"
            onMouseDown={(e) => { e.preventDefault(); saveRange(); setShowLink(true); setShowColors(false); setLinkUrl(''); }}
            className="p-1.5 rounded text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
          >
            <FiLink size={15} />
          </button>

          <Btn cmd="removeFormat" title="Clear Formatting"><MdFormatClear size={15} /></Btn>
        </div>

        {/* ── Editable area ── */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          data-ph={placeholder}
          onInput={() => onChange?.(editorRef.current?.innerHTML ?? '')}
          className="rte-body px-4 py-3 outline-none text-gray-800 text-sm leading-relaxed rounded-b-lg"
          style={{ minHeight }}
        />
      </div>

      {/* Link dialog */}
      {showLink && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40"
          onClick={() => setShowLink(false)}
        >
          <div className="bg-white rounded-xl shadow-2xl p-6 w-80" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') { restoreRange(); exec('createLink', linkUrl); setShowLink(false); }
              }}
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowLink(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { restoreRange(); exec('createLink', linkUrl); setShowLink(false); }}
                className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

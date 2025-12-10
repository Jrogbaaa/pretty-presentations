"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3,
  Link as LinkIcon,
  Quote,
  Table,
  Check,
  X,
  Plus,
  Trash2
} from "lucide-react";

interface EditableMarkdownProps {
  content: string;
  onChange: (newContent: string) => void;
  onSave?: () => void;
  className?: string;
}

interface EditableBlockProps {
  children: React.ReactNode;
  blockIndex: number;
  blockContent: string;
  onEdit: (index: number, newContent: string) => void;
}

/**
 * Parse HTML table into a 2D array for editing
 */
const parseHtmlTable = (html: string): { headers: string[]; rows: string[][] } => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const table = doc.querySelector('table');
  
  if (!table) return { headers: [], rows: [] };
  
  const headers: string[] = [];
  const rows: string[][] = [];
  
  // Get headers
  const headerCells = table.querySelectorAll('th');
  headerCells.forEach(cell => {
    headers.push(cell.textContent?.trim() || '');
  });
  
  // Get rows (skip header row if it exists)
  const tableRows = table.querySelectorAll('tr');
  tableRows.forEach((row, idx) => {
    const cells = row.querySelectorAll('td');
    if (cells.length > 0) {
      const rowData: string[] = [];
      cells.forEach(cell => {
        rowData.push(cell.textContent?.trim() || '');
      });
      rows.push(rowData);
    }
  });
  
  return { headers, rows };
};

/**
 * Convert table data back to HTML
 */
const tableToHtml = (headers: string[], rows: string[][]): string => {
  let html = '<table>\n<tr>\n';
  headers.forEach(h => {
    html += `<th>${h}</th>\n`;
  });
  html += '</tr>\n';
  rows.forEach(row => {
    html += '<tr>\n';
    row.forEach(cell => {
      html += `<td>${cell}</td>\n`;
    });
    html += '</tr>\n';
  });
  html += '</table>';
  return html;
};

/**
 * Check if content is an HTML table
 */
const isHtmlTable = (content: string): boolean => {
  return content.trim().startsWith('<table') && content.includes('</table>');
};

/**
 * Editable Table Component - allows clicking into cells to edit
 */
const EditableTable = ({
  content,
  onSave,
  onCancel
}: {
  content: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
}) => {
  const { headers: initialHeaders, rows: initialRows } = parseHtmlTable(content);
  const [headers, setHeaders] = useState<string[]>(initialHeaders);
  const [rows, setRows] = useState<string[][]>(initialRows);

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    setHeaders(newHeaders);
  };

  const handleCellChange = (rowIndex: number, cellIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][cellIndex] = value;
    setRows(newRows);
  };

  const handleSave = () => {
    onSave(tableToHtml(headers, rows));
  };

  const addRow = () => {
    setRows([...rows, new Array(headers.length).fill('')]);
  };

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="my-4 rounded-xl border-2 border-purple-500 overflow-hidden bg-white dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-purple-600 text-white">
              {headers.map((header, idx) => (
                <th key={idx} className="p-0">
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => handleHeaderChange(idx, e.target.value)}
                    className="w-full px-4 py-3 bg-transparent text-white font-semibold 
                               focus:outline-none focus:bg-purple-700 transition-colors
                               placeholder-purple-200"
                    placeholder="Header..."
                  />
                </th>
              ))}
              <th className="w-10 bg-purple-700"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="p-0">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => handleCellChange(rowIdx, cellIdx, e.target.value)}
                      className="w-full px-4 py-3 bg-transparent text-gray-900 dark:text-gray-100
                                 focus:outline-none focus:bg-purple-50 dark:focus:bg-purple-900/30 
                                 transition-colors"
                      placeholder="Enter value..."
                    />
                  </td>
                ))}
                <td className="w-10 text-center">
                  <button
                    onClick={() => removeRow(rowIdx)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Table Actions */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={addRow}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 dark:text-purple-400
                     hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Row
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 
                       text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium
                       hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white 
                       rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <Check className="w-3 h-3" />
            Save Table
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Parse markdown into blocks for individual editing
 */
const parseMarkdownBlocks = (markdown: string): string[] => {
  // Split by double newlines to get blocks, but preserve headers and lists
  const lines = markdown.split('\n');
  const blocks: string[] = [];
  let currentBlock: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];
    
    // Headers always get their own block
    if (line.startsWith('#')) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
      blocks.push(line);
      continue;
    }
    
    // Horizontal rules get their own block
    if (line.trim() === '---' || line.trim() === '***') {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
      blocks.push(line);
      continue;
    }
    
    // Blockquotes
    if (line.startsWith('>')) {
      if (currentBlock.length > 0 && !currentBlock[0].startsWith('>')) {
        blocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
      currentBlock.push(line);
      if (!nextLine?.startsWith('>')) {
        blocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
      continue;
    }
    
    // Lists (keep together)
    if (line.match(/^[\s]*[-*+]\s/) || line.match(/^[\s]*\d+\.\s/)) {
      if (currentBlock.length > 0 && !currentBlock[0].match(/^[\s]*[-*+\d]/)) {
        blocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
      currentBlock.push(line);
      continue;
    }
    
    // Tables
    if (line.includes('|') && (line.startsWith('|') || line.startsWith('<table'))) {
      if (currentBlock.length > 0 && !currentBlock[0].includes('|')) {
        blocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
      currentBlock.push(line);
      continue;
    }
    
    // Empty lines - might be end of block
    if (line.trim() === '') {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
      continue;
    }
    
    // Regular text
    currentBlock.push(line);
  }
  
  // Don't forget the last block
  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join('\n'));
  }
  
  return blocks.filter(b => b.trim().length > 0);
};

/**
 * Reconstruct markdown from blocks
 */
const blocksToMarkdown = (blocks: string[]): string => {
  return blocks.join('\n\n');
};

/**
 * Floating toolbar for formatting selected text
 */
const FormattingToolbar = ({ 
  position, 
  onFormat, 
  onClose 
}: { 
  position: { x: number; y: number } | null;
  onFormat: (format: string) => void;
  onClose: () => void;
}) => {
  if (!position) return null;

  const buttons = [
    { icon: Bold, format: 'bold', label: 'Bold' },
    { icon: Italic, format: 'italic', label: 'Italic' },
    { icon: LinkIcon, format: 'link', label: 'Link' },
    { icon: Heading1, format: 'h1', label: 'Heading 1' },
    { icon: Heading2, format: 'h2', label: 'Heading 2' },
    { icon: Heading3, format: 'h3', label: 'Heading 3' },
    { icon: List, format: 'ul', label: 'Bullet List' },
    { icon: ListOrdered, format: 'ol', label: 'Numbered List' },
    { icon: Quote, format: 'quote', label: 'Quote' },
  ];

  return (
    <div 
      className="fixed z-50 bg-gray-900 dark:bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-1 flex gap-1"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y - 50}px`,
        transform: 'translateX(-50%)'
      }}
    >
      {buttons.map(({ icon: Icon, format, label }) => (
        <button
          key={format}
          onClick={() => onFormat(format)}
          className="p-2 hover:bg-gray-700 rounded text-gray-200 transition-colors"
          title={label}
          aria-label={label}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
      <button
        onClick={onClose}
        className="p-2 hover:bg-red-600 rounded text-gray-200 transition-colors ml-1"
        title="Close"
        aria-label="Close toolbar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

/**
 * Editable block wrapper - makes each block clickable for inline editing
 * Uses specialized editors for tables vs regular content
 */
const EditableBlock = ({ 
  children, 
  blockIndex, 
  blockContent, 
  onEdit 
}: EditableBlockProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(blockContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Check if this block is a table
  const isTable = isHtmlTable(blockContent);

  useEffect(() => {
    setEditValue(blockContent);
  }, [blockContent]);

  useEffect(() => {
    if (isEditing && !isTable && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, isTable]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Don't trigger edit on link clicks
    if ((e.target as HTMLElement).tagName === 'A') return;
    setIsEditing(true);
  }, []);

  const handleSave = useCallback((newValue?: string) => {
    const valueToSave = newValue !== undefined ? newValue : editValue;
    onEdit(blockIndex, valueToSave);
    setIsEditing(false);
  }, [blockIndex, editValue, onEdit]);

  const handleCancel = useCallback(() => {
    setEditValue(blockContent);
    setIsEditing(false);
  }, [blockContent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
    if (e.key === 'Enter' && e.metaKey) {
      handleSave();
    }
  }, [handleCancel, handleSave]);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }, []);

  // Render table editor for tables
  if (isEditing && isTable) {
    return (
      <EditableTable
        content={blockContent}
        onSave={(newContent) => handleSave(newContent)}
        onCancel={handleCancel}
      />
    );
  }

  // Render text editor for non-tables
  if (isEditing) {
    return (
      <div className="relative group my-4">
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-2 border-purple-500 rounded-xl 
                     text-gray-900 dark:text-gray-100 font-mono text-base leading-relaxed
                     focus:outline-none focus:ring-2 focus:ring-purple-500 
                     resize-none overflow-hidden min-h-[100px]"
          placeholder="Enter markdown content..."
        />
        <div className="absolute bottom-2 right-2 flex gap-2">
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 
                       text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium
                       hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
          <button
            onClick={() => handleSave()}
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white 
                       rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <Check className="w-3 h-3" />
            Save
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">⌘+Enter</kbd> to save, <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Esc</kbd> to cancel
        </p>
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      className="relative group cursor-pointer rounded-lg transition-all duration-200
                 hover:bg-purple-50 dark:hover:bg-purple-900/20 
                 hover:ring-2 hover:ring-purple-300 dark:hover:ring-purple-700
                 -mx-4 px-4 py-1"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setIsEditing(true);
        }
      }}
      aria-label={isTable ? "Click to edit table" : "Click to edit this section"}
    >
      {children}
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 
                      transition-opacity pointer-events-none">
        <span className="text-xs text-purple-500 dark:text-purple-400 bg-white dark:bg-gray-900 
                         px-2 py-1 rounded-full shadow-sm border border-purple-200 dark:border-purple-800">
          {isTable ? "Click to edit table" : "Click to edit"}
        </span>
      </div>
    </div>
  );
};

/**
 * Main EditableMarkdown component
 * Provides inline editing capabilities for markdown content
 */
export const EditableMarkdown = ({ 
  content, 
  onChange, 
  onSave,
  className = "" 
}: EditableMarkdownProps) => {
  const [blocks, setBlocks] = useState<string[]>([]);
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setBlocks(parseMarkdownBlocks(content));
  }, [content]);

  const handleBlockEdit = useCallback((index: number, newContent: string) => {
    const newBlocks = [...blocks];
    newBlocks[index] = newContent;
    setBlocks(newBlocks);
    onChange(blocksToMarkdown(newBlocks));
  }, [blocks, onChange]);

  const handleFormat = useCallback((format: string) => {
    // This would apply formatting to selected text
    // For now, close the toolbar
    setToolbarPosition(null);
  }, []);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY
      });
    } else {
      setToolbarPosition(null);
    }
  }, []);

  return (
    <div 
      className={`editable-markdown ${className}`}
      onMouseUp={handleTextSelection}
    >
      <FormattingToolbar 
        position={toolbarPosition}
        onFormat={handleFormat}
        onClose={() => setToolbarPosition(null)}
      />
      
      <div className="response-content prose prose-xl max-w-none">
        {blocks.map((block, index) => (
          <EditableBlock
            key={`block-${index}-${block.substring(0, 20)}`}
            blockIndex={index}
            blockContent={block}
            onEdit={handleBlockEdit}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {block}
            </ReactMarkdown>
          </EditableBlock>
        ))}
      </div>
    </div>
  );
};

export default EditableMarkdown;

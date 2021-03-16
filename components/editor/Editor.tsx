import React, { KeyboardEvent, useCallback } from 'react';
import { Node, Range } from 'slate';
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  Slate,
} from 'slate-react';
import { isHotkey } from 'is-hotkey';
import { toggleMark, wrapLink } from 'editor/formatting';
import HoveringToolbar from './HoveringToolbar';

const HOTKEYS = [
  {
    hotkey: 'mod+b',
    callback: (editor: ReactEditor) => toggleMark(editor, 'bold'),
  },
  {
    hotkey: 'mod+i',
    callback: (editor: ReactEditor) => toggleMark(editor, 'italic'),
  },
  {
    hotkey: 'mod+u',
    callback: (editor: ReactEditor) => toggleMark(editor, 'underline'),
  },
  {
    hotkey: 'mod+e',
    callback: (editor: ReactEditor) => toggleMark(editor, 'code'),
  },
  {
    hotkey: 'mod+k',
    callback: (editor: ReactEditor) => {
      if (editor.selection && !Range.isCollapsed(editor.selection)) {
        const url = window.prompt('Enter link URL:');
        if (!url) return;
        wrapLink(editor, url);
      }
    },
  },
];

type Props = {
  className?: string;
  editor: ReactEditor;
  value: Array<Node>;
  setValue: (value: Array<Node>) => void;
};

export default function Editor(props: Props) {
  const { className, editor, value, setValue } = props;
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      // Handle keyboard shortcuts for adding marks
      for (const { hotkey, callback } of HOTKEYS) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (isHotkey(hotkey, event as any)) {
          event.preventDefault();
          callback(editor);
        }
      }
    },
    [editor]
  );

  const onSelect = useCallback(() => {
    /**
     * Add auto scrolling on type
     * Adapted from https://github.com/ianstormtaylor/slate/issues/3750
     */
    if (!editor.selection) return;
    try {
      /**
       * Need a try/catch because sometimes you get an error like:
       *
       * Error: Cannot resolve a DOM node from Slate node: {"type":"p","children":[{"text":"","by":-1,"at":-1}]}
       */
      const domPoint = ReactEditor.toDOMPoint(editor, editor.selection.focus);
      const node = domPoint[0];
      if (!node) return;
      const element = node.parentElement;
      if (!element) return;
      element.scrollIntoView({ block: 'nearest' });
    } catch (e) {
      /**
       * Empty catch. Do nothing if there is an error.
       */
    }
  }, [editor]);

  return (
    <Slate editor={editor} value={value} onChange={setValue}>
      <HoveringToolbar />
      <Editable
        className={`placeholder-gray-300 ${className}`}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Start typing here…"
        onKeyDown={onKeyDown}
        onSelect={onSelect}
        spellCheck
        autoFocus
      />
    </Slate>
  );
}

const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'heading-one':
      return (
        <h1 className="my-3 text-2xl font-semibold" {...attributes}>
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 className="my-3 text-xl font-semibold" {...attributes}>
          {children}
        </h2>
      );
    case 'heading-three':
      return (
        <h3 className="my-3 text-lg font-semibold" {...attributes}>
          {children}
        </h3>
      );
    case 'list-item':
      return (
        <li className="pl-1 my-2" {...attributes}>
          {children}
        </li>
      );
    case 'bulleted-list':
      return (
        <ul className="my-2 ml-8 list-disc" {...attributes}>
          {children}
        </ul>
      );
    case 'numbered-list':
      return (
        <ol className="my-2 ml-8 list-decimal" {...attributes}>
          {children}
        </ol>
      );
    case 'block-quote':
      return (
        <blockquote className="pl-4 my-3 border-l-4" {...attributes}>
          {children}
        </blockquote>
      );
    case 'link':
      return (
        <a
          className="underline cursor-pointer text-primary-500"
          href={element.url as string}
          onClick={() =>
            window.open(element.url as string, '_blank', 'noopener noreferrer')
          }
          {...attributes}
        >
          {children}
        </a>
      );
    default:
      return (
        <p className="my-3" {...attributes}>
          {children}
        </p>
      );
  }
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <span className="font-semibold">{children}</span>;
  }

  if (leaf.code) {
    children = <code className="bg-gray-200">{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

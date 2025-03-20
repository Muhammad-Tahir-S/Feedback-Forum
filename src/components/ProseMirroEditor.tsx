import { Bold, Code, Image, Italic, Link, List, ListOrdered, Paperclip, Video } from 'lucide-react';
import { baseKeymap, toggleMark } from 'prosemirror-commands';
import { history } from 'prosemirror-history';
import { ellipsis, emDash, inputRules, smartQuotes } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes, wrapInList } from 'prosemirror-schema-list';
import { EditorState, Plugin as ProseMirrorPlugin, PluginKey, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import React, { useEffect, useRef } from 'react';

const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
  marks: schema.spec.marks,
});

interface EditorButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const EditorButton: React.FC<EditorButtonProps> = ({ icon, onClick, className = '' }) => (
  <button className={`editor-btn ${className}`} onClick={onClick} type="button">
    {icon}
  </button>
);

interface ProseMirrorEditorProps {
  placeholder?: string;
  onChange?: (content: string) => void;
}

const placeholderPluginKey = new PluginKey('placeholder');

function placeholderPlugin(placeholder: string) {
  return new ProseMirrorPlugin({
    key: placeholderPluginKey,
    props: {
      decorations(state) {
        const decorations: Decoration[] = [];
        const doc = state.doc;

        if (doc.childCount === 1 && doc.firstChild?.nodeSize === 2) {
          decorations.push(
            Decoration.widget(1, () => {
              const placeholderEl = document.createElement('span');
              placeholderEl.classList.add('editor-placeholder');
              placeholderEl.textContent = placeholder;
              return placeholderEl;
            })
          );
        }

        return DecorationSet.create(doc, decorations);
      },
    },
  });
}

const ProseMirrorEditor: React.FC<ProseMirrorEditorProps> = ({ placeholder = 'Post description...', onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Create the initial editor state
    const state = EditorState.create({
      schema: mySchema,
      plugins: [
        placeholderPlugin(placeholder),
        history(),
        keymap(baseKeymap),
        // Fix: Pass the rules as an array to inputRules
        inputRules({
          rules: [...smartQuotes, ellipsis, emDash],
        }),
      ],
    });

    const view = new EditorView(editorRef.current, {
      state,
      dispatchTransaction(transaction: Transaction) {
        if (!view) return;
        const newState = view.state.apply(transaction);
        view.updateState(newState);

        if (onChange && transaction.docChanged) {
          // Convert editor content to HTML or text for the onChange callback
          const content = view.dom.innerHTML;
          onChange(content);
        }
      },
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [placeholder, onChange]);

  // Formatting commands
  const commands = {
    bold: () => {
      const view = viewRef.current;
      if (!view) return;
      const { state, dispatch } = view;
      const mark = mySchema.marks.strong;
      toggleMark(mark)(state, dispatch);
    },

    italic: () => {
      const view = viewRef.current;
      if (!view) return;
      const { state, dispatch } = view;
      const mark = mySchema.marks.em;
      toggleMark(mark)(state, dispatch);
    },

    bulletList: () => {
      const view = viewRef.current;
      if (!view) return;
      const { state, dispatch } = view;
      wrapInList(mySchema.nodes.bullet_list)(state, dispatch);
    },

    orderedList: () => {
      const view = viewRef.current;
      if (!view) return;
      const { state, dispatch } = view;
      wrapInList(mySchema.nodes.ordered_list)(state, dispatch);
    },

    link: () => {
      const view = viewRef.current;
      if (!view) return;
      const { state, dispatch } = view;
      const mark = mySchema.marks.link;
      const url = prompt('Enter link URL');
      if (url) {
        toggleMark(mark, { href: url })(state, dispatch);
      }
    },

    image: () => {
      // Placeholder for image upload functionality
      alert('Image upload functionality would go here');
    },

    // Default empty handler for buttons without specific actions
    noOp: () => {
      // No operation
    },
  };

  return (
    <div className="text-[15px] min-h-[110px] px-4 py-1 relative !text-base sm:!text-[15px] bg-transparent border-0">
      <div className="flex h-full w-full min-h-[80px]">
        <div className="relative flex flex-col flex-1 h-full w-full">
          <div className="flex-1 overflow-y-auto overflow-x-auto max-w-full w-full">
            <div ref={editorRef}></div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <EditorButton icon={<Image className="editor-icon" />} onClick={commands.image} />
          <EditorButton icon={<Bold className="editor-icon" />} onClick={commands.bold} />
          <EditorButton
            icon={<Italic className="editor-icon" />}
            onClick={commands.italic}
            className="hidden sm:flex"
          />
          <EditorButton icon={<Code className="editor-icon" />} onClick={commands.noOp} className="hidden sm:flex" />
          <EditorButton icon={<List className="editor-icon" />} onClick={commands.bulletList} />
          <EditorButton
            icon={<ListOrdered className="editor-icon" />}
            onClick={commands.orderedList}
            className="hidden sm:flex"
          />
          <EditorButton icon={<Link className="editor-icon" />} onClick={commands.link} />
          <EditorButton icon={<Code className="editor-icon" />} onClick={commands.noOp} className="hidden lg:flex" />
          <EditorButton
            icon={<Video className="editor-icon" />}
            onClick={commands.noOp}
            className="hidden lg:flex items-center justify-center w-6 h-6"
          />
          <EditorButton
            icon={<Paperclip className="editor-icon" />}
            onClick={commands.noOp}
            className="hidden lg:flex"
          />
        </div>
      </div>
    </div>
  );
};

export default ProseMirrorEditor;

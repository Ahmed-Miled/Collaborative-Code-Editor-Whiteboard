import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import "../../styles/documentEditor.css";

function DocumentEditor({ selectedDocument, socket }) {
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("javascript");
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);

  // Initialize content when document changes
  useEffect(() => {
    if (selectedDocument) {
      setContent(selectedDocument.content || "");
      setLanguage(selectedDocument.language || "javascript");

      // Join document room for real-time collaboration
      if (socket) {
        socket.emit("join-document", selectedDocument._id);
      }
    }

    return () => {
      // Leave document room on cleanup
      if (socket && selectedDocument) {
        socket.emit("leave-document", selectedDocument._id);
      }
    };
  }, [selectedDocument, socket]);

  // Listen for remote changes
  useEffect(() => {
    if (!socket) return;

    const handleRemoteChange = (data) => {
      if (data.documentId === selectedDocument?._id) {
        isRemoteChange.current = true;

        // Preserve cursor position when applying remote changes
        const editor = editorRef.current;
        if (editor) {
          const position = editor.getPosition();
          setContent(data.content);

          // Restore cursor position after content update
          setTimeout(() => {
            if (position) {
              editor.setPosition(position);
            }
            isRemoteChange.current = false;
          }, 0);
        } else {
          setContent(data.content);
          isRemoteChange.current = false;
        }
      }
    };

    socket.on("document-change", handleRemoteChange);

    return () => {
      socket.off("document-change", handleRemoteChange);
    };
  }, [socket, selectedDocument]);

  const handleEditorChange = (newValue) => {
    setContent(newValue || "");

    // Only emit if this is a local change (not from remote)
    if (!isRemoteChange.current && socket && selectedDocument) {
      socket.emit("document-edit", {
        documentId: selectedDocument._id,
        content: newValue || "",
      });
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Optional: Add custom keybindings or commands
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      console.log("Save triggered (Ctrl+S / Cmd+S)");
      // Implement save functionality here
    });
  };

  if (!selectedDocument) {
    return (
      <div className="editor-empty-state">
        <div className="editor-empty-content">
          <svg
            className="editor-empty-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="editor-empty-title">No Document Selected</h2>
          <p className="editor-empty-text">
            Select a document from the sidebar to start editing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="editor-title-section">
          <h2 className="editor-title">{selectedDocument.name}</h2>
          <span className="editor-language-badge">{language}</span>
        </div>
        <div className="editor-actions">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="editor-language-select"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="csharp">C#</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="sql">SQL</option>
            <option value="plaintext">Plain Text</option>
          </select>
        </div>
      </div>

      <div className="editor-monaco-container">
        <Editor
          height="100%"
          language={language}
          value={content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            quickSuggestions: true,
            snippetSuggestions: "inline",
            folding: true,
            lineNumbers: "on",
            renderWhitespace: "selection",
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
          }}
          loading={
            <div className="editor-loading">
              <div className="editor-spinner"></div>
              <p>Loading editor...</p>
            </div>
          }
        />
      </div>
    </div>
  );
}

export default DocumentEditor;

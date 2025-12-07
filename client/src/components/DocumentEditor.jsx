import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import "../../styles/documentEditor.css";

function DocumentEditor({ selectedDocument, socket }) {
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [saveStatus, setSaveStatus] = useState("saved"); // saved, saving, unsaved
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);

  // Initialize content when document changes
  useEffect(() => {
    if (selectedDocument && socket) {
      console.log("Document selected:", selectedDocument._id);

      // Don't set content immediately - wait for server to send latest content
      setSaveStatus("saved");

      // Join document room and request latest content
      socket.emit("join-document", selectedDocument._id);

      // Listen for the latest document content from server
      const handleDocumentLoaded = (data) => {
        if (data.documentId === selectedDocument._id) {
          console.log("Document loaded from database:", data);
          setContent(data.content || "");
          setLanguage(
            data.language || selectedDocument.language || "javascript"
          );
        }
      };

      socket.on("document-loaded", handleDocumentLoaded);

      return () => {
        // Leave document room on cleanup
        console.log("👋 Leaving document room:", selectedDocument._id);
        socket.emit("leave-document", selectedDocument._id.toString());
        socket.off("document-loaded", handleDocumentLoaded);
      };
    }
  }, [selectedDocument, socket]);

  // Listen for socket events
  useEffect(() => {
    if (!socket) {
      console.warn("Socket not available");
      return;
    }

    // Handle remote changes from other users
    const handleRemoteChange = (data) => {
      console.log("📥 Received remote change:", data);
      if (data.documentId === selectedDocument?._id.toString()) {
        console.log("✅ Applying remote change");
        isRemoteChange.current = true;

        const editor = editorRef.current;
        if (editor) {
          const position = editor.getPosition();
          setContent(data.content);

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
      } else {
        console.log("⚠️ Remote change for different document, ignoring");
      }
    };

    // Handle auto-save confirmation
    const handleAutoSaved = (data) => {
      if (data.documentId === selectedDocument?._id.toString()) {
        console.log("💾 Document auto-saved");
        setSaveStatus("saved");
      }
    };

    /*
    // Handle manual save confirmation
    const handleSaved = (data) => {
      if (data.documentId === selectedDocument?._id.toString()) {
        console.log("✅ Document saved:", data.message);
        setSaveStatus("saved");
      }
    };

    // Handle save by peer
    const handleSavedByPeer = (data) => {
      if (data.documentId === selectedDocument?._id.toString()) {
        console.log("👥 Document saved by another user");
        setSaveStatus("saved");
      }
    };
*/
    socket.on("document-change", handleRemoteChange);
    socket.on("document-auto-saved", handleAutoSaved);
    //socket.on("document-saved", handleSaved);
    //socket.on("document-saved-by-peer", handleSavedByPeer);

    return () => {
      socket.off("document-change", handleRemoteChange);
      socket.off("document-auto-saved", handleAutoSaved);
      //socket.off("document-saved", handleSaved);
      //socket.off("document-saved-by-peer", handleSavedByPeer);
    };
  }, [socket, selectedDocument]);

  const handleEditorChange = (newValue) => {
    setContent(newValue || "");
    setSaveStatus("unsaved");

    // Only emit if this is a local change
    if (!isRemoteChange.current && socket && selectedDocument) {
      console.log("📤 Emitting document edit for doc:", selectedDocument._id);
      socket.emit("document-edit", {
        documentId: selectedDocument._id.toString(),
        content: newValue || "",
      });
    }
  };

  /*
  const handleManualSave = () => {
    if (socket && selectedDocument) {
      console.log("💾 Manual save triggered for doc:", selectedDocument._id);
      setSaveStatus("saving");
      socket.emit("save-document", {
        documentId: selectedDocument._id.toString(),
        content: content,
      });
    }
  };
*/
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Add custom keybinding for save (Ctrl+S / Cmd+S)
   // editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
     // handleManualSave();
    //});
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

  // Save status indicator
  const getSaveStatusText = () => {
    switch (saveStatus) {
      case "saved":
        return "All changes saved";
      case "saving":
        return "Saving...";
      case "unsaved":
        return "Unsaved changes";
      default:
        return "";
    }
  };

  const getSaveStatusClass = () => {
    switch (saveStatus) {
      case "saved":
        return "save-status-saved";
      case "saving":
        return "save-status-saving";
      case "unsaved":
        return "save-status-unsaved";
      default:
        return "";
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="editor-title-section">
          <h2 className="editor-title">{selectedDocument.name}</h2>
          <span className="editor-language-badge">{language}</span>
          <span className={`editor-save-status ${getSaveStatusClass()}`}>
            {getSaveStatusText()}
          </span>
        </div>
        <div className="editor-actions">
          {/*
          <button
            className="editor-save-btn"
            onClick={handleManualSave}
            disabled={saveStatus === "saved"}
          >
            💾 Save
          </button>
          */}
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
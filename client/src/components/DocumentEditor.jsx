import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import "../../styles/documentEditor.css";

function DocumentEditor({ selectedDocument, socket }) {
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [saveStatus, setSaveStatus] = useState("saved");

  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);

  // Load content when document changes
  useEffect(() => {
    if (selectedDocument && socket) {
      socket.emit("join-document", selectedDocument._id);

      const handleLoaded = (data) => {
        if (data.documentId === selectedDocument._id) {
          setContent(data.content || "");
          setLanguage(data.language || "javascript");
        }
      };

      socket.on("document-loaded", handleLoaded);

      return () => {
        socket.emit("leave-document", selectedDocument._id);
        socket.off("document-loaded", handleLoaded);
      };
    }
  }, [selectedDocument, socket]);

  // Socket listeners for edits + language
  useEffect(() => {
    if (!socket) return;

    const handleRemoteChange = (data) => {
      if (data.documentId === selectedDocument?._id) {
        isRemoteChange.current = true;

        const editor = editorRef.current;
        const position = editor?.getPosition();

        setContent(data.content);

        setTimeout(() => {
          if (editor && position) editor.setPosition(position);
          isRemoteChange.current = false;
        }, 0);
      }
    };

    const handleAutoSaved = (data) => {
      if (data.documentId === selectedDocument?._id) {
        setSaveStatus("saved");
      }
    };

    // 🔥 NEW → Handle remote language updates
    const handleLanguageUpdated = (data) => {
      if (data.documentId === selectedDocument?._id) {
        setLanguage(data.language);
      }
    };

    socket.on("document-change", handleRemoteChange);
    socket.on("document-auto-saved", handleAutoSaved);
    socket.on("document-language-updated", handleLanguageUpdated);

    return () => {
      socket.off("document-change", handleRemoteChange);
      socket.off("document-auto-saved", handleAutoSaved);
      socket.off("document-language-updated", handleLanguageUpdated);
    };
  }, [socket, selectedDocument]);

  // Local typing handler
  const handleEditorChange = (newValue) => {
    setContent(newValue || "");
    setSaveStatus("unsaved");

    if (!isRemoteChange.current && socket && selectedDocument) {
      socket.emit("document-edit", {
        documentId: selectedDocument._id,
        content: newValue || "",
      });
    }
  };

  // Editor mount
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  // 🔥 Handle language select
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);

    if (socket && selectedDocument) {
      socket.emit("document-language-change", {
        documentId: selectedDocument._id,
        language: newLang,
      });
    }
  };

  // UI when no doc selected
  if (!selectedDocument) {
    return (
      <div className="editor-empty-state">
        <div className="editor-empty-content">
          <h2>No Document Selected</h2>
          <p>Select a document from the sidebar.</p>
        </div>
      </div>
    );
  }

  const getSaveStatusText = () =>
    saveStatus === "saved"
      ? "All changes saved"
      : saveStatus === "saving"
      ? "Saving..."
      : "Unsaved changes";

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="editor-title-section">
          <h2>{selectedDocument.name}</h2>
          <span className="editor-language-badge">{language}</span>
          <span className={`editor-save-status`}>{getSaveStatusText()}</span>
        </div>

        <div className="editor-actions">
          <select
            value={language}
            onChange={handleLanguageChange}
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
            wordWrap: "on",
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}

export default DocumentEditor;

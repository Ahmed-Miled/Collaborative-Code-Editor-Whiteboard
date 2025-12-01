import React, { useState, useEffect } from "react";

function DocumentEditor({ selectedDocument }) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (selectedDocument) {
      setContent(selectedDocument.content || "");
    }
  }, [selectedDocument]);

  const handleChange = (e) => {
    setContent(e.target.value);
    //  emit changes via socket for real-time collaboration
  };

  if (!selectedDocument) {
    return (
      <div className="document-editor">
        <h2>Select a document to start editing</h2>
      </div>
    );
  }

  return (
    <div className="document-editor">
      <h2>{selectedDocument.name}</h2>
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Start writing..."
      />
    </div>
  );
}

export default DocumentEditor;

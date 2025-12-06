import { useState } from "react";
import { updateRoomName, inviteUser } from "../api/api";
import { createDocument, updateDocument } from "../api/documents";

function RoomModal({ mode, data, roomId, onClose, onSuccess }) {
  const [modalValue, setModalValue] = useState(data.name || "");
  const [docName, setDocName] = useState("");
  const [docLanguage, setDocLanguage] = useState("javascript");
  const [docContent, setDocContent] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 3000);
  };

  const handleSave = async () => {
    try {
      if (mode === "edit-room") {
        if (!modalValue.trim()) {
          showError("Room name cannot be empty");
          return;
        }
        await updateRoomName(roomId, modalValue, token);
      }

      if (mode === "invite") {
        if (!modalValue.trim()) {
          showError("User ID cannot be empty");
          return;
        }
        const res = await inviteUser(roomId, modalValue);
        if (!res?.message) {
          showError("Failed to invite user");
          return;
        }
      }

      if (mode === "edit-document") {
        if (!modalValue.trim()) {
          showError("Document name cannot be empty");
          return;
        }
        await updateDocument(data.id, { name: modalValue }, token);
      }

      if (mode === "create-document") {
        if (!docName.trim()) {
          showError("Document name cannot be empty");
          return;
        }
        await createDocument(
          roomId,
          {
            name: docName,
            language: docLanguage,
            content: docContent,
          },
          token
        );
      }

      onSuccess();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Action failed";
      showError(msg);
      console.error(err);
    }
  };

  const renderContent = () => {
    if (mode === "create-document") {
      return (
        <>
          <h2>Create New Document</h2>

          <input
            type="text"
            value={docName}
            placeholder="Document name (e.g., main.js)"
            onChange={(e) => setDocName(e.target.value)}
            className="modal-input"
          />

          <select
            value={docLanguage}
            onChange={(e) => setDocLanguage(e.target.value)}
            className="modal-input"
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

          <textarea
            value={docContent}
            placeholder="Initial content (optional)"
            onChange={(e) => setDocContent(e.target.value)}
            className="modal-textarea"
            rows="6"
          />
        </>
      );
    }

    const titles = {
      "edit-room": "Edit Room Name",
      invite: "Invite User to Room",
      "edit-document": "Rename Document",
    };

    const placeholders = {
      "edit-room": "Enter new room name",
      invite: "User ID",
      "edit-document": "Enter new document name",
    };

    return (
      <>
        <h2>{titles[mode]}</h2>

        <input
          type="text"
          value={modalValue}
          placeholder={placeholders[mode]}
          onChange={(e) => setModalValue(e.target.value)}
          className="modal-input"
        />
      </>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {renderContent()}

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>
            Cancel
          </button>

          <button className="modal-save" onClick={handleSave}>
            {mode === "create-document" ? "Create" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomModal;
  
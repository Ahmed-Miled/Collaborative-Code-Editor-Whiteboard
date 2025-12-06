import { deleteDocument } from "../api/documents";

function DocumentsSection({
  documents,
  userId,
  ownerId,
  onSelectDocument,
  onCreateDocument,
  onEditDocument,
  onDeleteDocument,
  roomId,
}) {
  const token = localStorage.getItem("token");

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await deleteDocument(docId, token);
      onDeleteDocument();
    } catch (err) {
      console.error("Failed to delete document:", err);
      alert("Failed to delete document");
    }
  };

  return (
    <div className="documents-section">
      <h3>Documents:</h3>

      {documents.length === 0 ? (
        <p className="empty-docs">No documents yet. Create one!</p>
      ) : (
        <ul className="documents-list">
          {documents.map((doc) => (
            <li key={doc._id} className="document-item">
              <span
                className="doc-name-clickable"
                onClick={() => onSelectDocument(doc)}
              >
                {doc.name}
              </span>
              <div>
                <button
                  className="edit-doc-btn"
                  onClick={() => onEditDocument(doc)}
                >
                  Rename
                </button>

                <button
                  className="delete-doc-btn"
                  onClick={() => handleDeleteDocument(doc._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button className="create-doc-btn" onClick={onCreateDocument}>
        + Add Document
      </button>
    </div>
  );
}

export default DocumentsSection;

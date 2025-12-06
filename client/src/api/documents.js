const API_URL = import.meta.env.VITE_API_URL;
export async function updateDocumssent(docId, newName, token) {
  const res = await fetch(`${API_URL}/documents/${docId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: newName }),
  });

  if (!res.ok) throw new Error("Failed to update document");
  return res.json();
}


export async function createDocument(roomId, documentData, token) {
  const res = await fetch(`${API_URL}/documents/rooms/${roomId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(documentData), // { name, language, content }
  });

  if (!res.ok) throw new Error("Failed to create document");
  return res.json();
}


export async function getRoomDocuments(roomId, token) {
  const res = await fetch(`${API_URL}/documents/rooms/${roomId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch room documents");
  return res.json();
}


export async function getDocument(documentId, token) {
  const res = await fetch(`${API_URL}/documents/${documentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch document");
  return res.json();
}



export async function deleteDocument(documentId, token) {
  const res = await fetch(`${API_URL}/documents/${documentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to delete document");
  return res.json();
}


export async function updateDocument(documentId, updates, token) {
  const res = await fetch(`${API_URL}/documents/${documentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates), // { name?, language?, content? }
  });

  if (!res.ok) throw new Error("Failed to update document");
  return res.json();
}

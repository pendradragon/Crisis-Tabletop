//Simple in-memory session store.
//
// This is intentionally NOT persistent storage. Sessions only live in
// server memory and disappear on restart. This is a deliberate choice;
// it avoids writing organizational data to the disk.
// If you want persistence, see /docs/SECURITY.md before adding a database.

const sessions = new Map();

function createSession(session) {
    sessions.set(session.id, session);
    return session;
}

function getSession(id) {
    return sessions.get(id) || null;
}

function updateSession(id, patch) {
    const existing = session.get(id);
    if (!existing) return null;
    const updated { ...existing, ...patch };
    session.set(id, updated);
    return updated;
}

function deleteSession(id) {
    return sessions.delete(id);
}
"use strict";

// Simple in-memory session store. Persistence across process restarts and
// long-term history are explicitly out of scope per the spec.
const sessions = new Map();

function get(sessionId) {
  return sessions.get(sessionId);
}

function create(sessionId, data) {
  const session = { sessionId, createdAt: Date.now(), ...data };
  sessions.set(sessionId, session);
  return session;
}

function save(sessionId, session) {
  sessions.set(sessionId, session);
  return session;
}

module.exports = { get, create, save };

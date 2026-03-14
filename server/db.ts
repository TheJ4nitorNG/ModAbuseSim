import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'forum.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      role TEXT CHECK(role IN ('user','mod','admin')) DEFAULT 'user',
      reputation INTEGER DEFAULT 0,
      title TEXT DEFAULT 'Member',
      avatar TEXT DEFAULT NULL,
      signature TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      last_seen_at TEXT DEFAULT (datetime('now')),
      status TEXT CHECK(status IN ('active','banned')) DEFAULT 'active',
      post_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      locked INTEGER DEFAULT 0,
      sticky INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      reply_count INTEGER DEFAULT 0,
      last_post_at TEXT DEFAULT (datetime('now')),
      last_post_user_id INTEGER,
      FOREIGN KEY (author_user_id) REFERENCES users(id),
      FOREIGN KEY (last_post_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thread_id INTEGER NOT NULL,
      author_user_id INTEGER NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      edited_at TEXT,
      deleted INTEGER DEFAULT 0,
      mod_note TEXT,
      FOREIGN KEY (thread_id) REFERENCES threads(id),
      FOREIGN KEY (author_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporter_user_id INTEGER NOT NULL,
      target_type TEXT CHECK(target_type IN ('thread','post')) NOT NULL,
      target_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      status TEXT CHECK(status IN ('pending','resolved','dismissed')) DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (reporter_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS moderation_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_user_id INTEGER NOT NULL,
      target_user_id INTEGER,
      target_post_id INTEGER,
      target_thread_id INTEGER,
      action_type TEXT NOT NULL,
      action_payload TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (actor_user_id) REFERENCES users(id),
      FOREIGN KEY (target_user_id) REFERENCES users(id),
      FOREIGN KEY (target_post_id) REFERENCES posts(id),
      FOREIGN KEY (target_thread_id) REFERENCES threads(id)
    );

    CREATE TABLE IF NOT EXISTS bans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      mod_user_id INTEGER NOT NULL,
      reason_code TEXT NOT NULL,
      reason_text TEXT NOT NULL,
      severity INTEGER CHECK(severity BETWEEN 1 AND 5) DEFAULT 3,
      duration_hours INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT,
      active INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (mod_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS museum_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      verdict TEXT CHECK(verdict IN ('Contested','Unclear','Overturned','Canonized','Pending Review')) DEFAULT 'Pending Review',
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS museum_artifacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      museum_entry_id INTEGER NOT NULL,
      artifact_type TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      source_label TEXT NOT NULL,
      FOREIGN KEY (museum_entry_id) REFERENCES museum_entries(id)
    );

    CREATE TABLE IF NOT EXISTS rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rule_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      last_edited TEXT DEFAULT (datetime('now')),
      edited_by_user_id INTEGER,
      edit_note TEXT,
      FOREIGN KEY (edited_by_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export interface DbUser {
  id: number;
  username: string;
  password_hash: string | null;
  role: 'user' | 'mod' | 'admin';
  reputation: number;
  title: string;
  avatar: string | null;
  signature: string | null;
  created_at: string;
  last_seen_at: string;
  status: 'active' | 'banned';
  post_count: number;
}

export interface DbThread {
  id: number;
  author_user_id: number;
  title: string;
  body: string;
  created_at: string;
  locked: number;
  sticky: number;
  view_count: number;
  reply_count: number;
  last_post_at: string;
  last_post_user_id: number | null;
}

export interface DbPost {
  id: number;
  thread_id: number;
  author_user_id: number;
  body: string;
  created_at: string;
  edited_at: string | null;
  deleted: number;
  mod_note: string | null;
}

export interface DbReport {
  id: number;
  reporter_user_id: number;
  target_type: 'thread' | 'post';
  target_id: number;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface DbModerationAction {
  id: number;
  actor_user_id: number;
  target_user_id: number | null;
  target_post_id: number | null;
  target_thread_id: number | null;
  action_type: string;
  action_payload: string | null;
  created_at: string;
}

export interface DbBan {
  id: number;
  user_id: number;
  mod_user_id: number;
  reason_code: string;
  reason_text: string;
  severity: number;
  duration_hours: number;
  created_at: string;
  expires_at: string | null;
  active: number;
}

export interface DbMuseumEntry {
  id: number;
  user_id: number;
  created_at: string;
  title: string;
  summary: string;
  verdict: string;
}

export interface DbMuseumArtifact {
  id: number;
  museum_entry_id: number;
  artifact_type: string;
  content: string;
  created_at: string;
  source_label: string;
}

export interface DbRule {
  id: number;
  rule_number: number;
  title: string;
  description: string;
  last_edited: string;
  edited_by_user_id: number | null;
  edit_note: string | null;
}

export function getUsers(): DbUser[] {
  return db.prepare('SELECT * FROM users ORDER BY id').all() as DbUser[];
}

export function getUser(id: number): DbUser | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser | undefined;
}

export function getUserByUsername(username: string): DbUser | undefined {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as DbUser | undefined;
}

export function updateUserStatus(userId: number, status: 'active' | 'banned'): void {
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, userId);
}

export function updateUserLastSeen(userId: number): void {
  db.prepare(`UPDATE users SET last_seen_at = datetime('now') WHERE id = ?`).run(userId);
}

export function incrementUserPostCount(userId: number): void {
  db.prepare('UPDATE users SET post_count = post_count + 1 WHERE id = ?').run(userId);
}

export function updateUserReputation(userId: number, change: number): void {
  db.prepare('UPDATE users SET reputation = reputation + ? WHERE id = ?').run(change, userId);
}

export function getThreads(limit = 50): DbThread[] {
  return db.prepare(`
    SELECT * FROM threads 
    ORDER BY sticky DESC, last_post_at DESC 
    LIMIT ?
  `).all(limit) as DbThread[];
}

export function getRecentThreads(limit = 10): DbThread[] {
  return db.prepare(`
    SELECT * FROM threads 
    ORDER BY created_at DESC 
    LIMIT ?
  `).all(limit) as DbThread[];
}

export function getThread(id: number): DbThread | undefined {
  return db.prepare('SELECT * FROM threads WHERE id = ?').get(id) as DbThread | undefined;
}

export function createThread(authorId: number, title: string, body: string): number {
  const result = db.prepare(`
    INSERT INTO threads (author_user_id, title, body, last_post_user_id) 
    VALUES (?, ?, ?, ?)
  `).run(authorId, title, body, authorId);
  incrementUserPostCount(authorId);
  return result.lastInsertRowid as number;
}

export function incrementThreadViewCount(threadId: number): void {
  db.prepare('UPDATE threads SET view_count = view_count + 1 WHERE id = ?').run(threadId);
}

export function updateThreadReplyStats(threadId: number, userId: number): void {
  db.prepare(`
    UPDATE threads 
    SET reply_count = reply_count + 1, 
        last_post_at = datetime('now'),
        last_post_user_id = ?
    WHERE id = ?
  `).run(userId, threadId);
}

export function lockThread(threadId: number, locked: boolean): void {
  db.prepare('UPDATE threads SET locked = ? WHERE id = ?').run(locked ? 1 : 0, threadId);
}

export function getPostsForThread(threadId: number): DbPost[] {
  return db.prepare('SELECT * FROM posts WHERE thread_id = ? ORDER BY created_at ASC').all(threadId) as DbPost[];
}

export function getPost(id: number): DbPost | undefined {
  return db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as DbPost | undefined;
}

export function createPost(threadId: number, authorId: number, body: string): number {
  const result = db.prepare(`
    INSERT INTO posts (thread_id, author_user_id, body) 
    VALUES (?, ?, ?)
  `).run(threadId, authorId, body);
  updateThreadReplyStats(threadId, authorId);
  incrementUserPostCount(authorId);
  return result.lastInsertRowid as number;
}

export function deletePost(postId: number, modNote?: string): void {
  db.prepare('UPDATE posts SET deleted = 1, mod_note = ? WHERE id = ?').run(modNote || null, postId);
}

export function editPost(postId: number, newBody: string, modNote?: string): void {
  db.prepare(`
    UPDATE posts 
    SET body = ?, edited_at = datetime('now'), mod_note = ? 
    WHERE id = ?
  `).run(newBody, modNote || null, postId);
}

export function getUserPosts(userId: number, limit = 10): DbPost[] {
  return db.prepare(`
    SELECT * FROM posts 
    WHERE author_user_id = ? AND deleted = 0 
    ORDER BY created_at DESC 
    LIMIT ?
  `).all(userId, limit) as DbPost[];
}

export function getRecentPosts(limit = 10): (DbPost & { thread_title: string })[] {
  return db.prepare(`
    SELECT p.*, t.title as thread_title
    FROM posts p
    JOIN threads t ON p.thread_id = t.id
    WHERE p.deleted = 0
    ORDER BY p.created_at DESC
    LIMIT ?
  `).all(limit) as (DbPost & { thread_title: string })[];
}

export function getReports(status?: string): DbReport[] {
  if (status) {
    return db.prepare('SELECT * FROM reports WHERE status = ? ORDER BY created_at DESC').all(status) as DbReport[];
  }
  return db.prepare('SELECT * FROM reports ORDER BY created_at DESC').all() as DbReport[];
}

export function createReport(reporterUserId: number, targetType: 'thread' | 'post', targetId: number, reason: string): number {
  const result = db.prepare(`
    INSERT INTO reports (reporter_user_id, target_type, target_id, reason) 
    VALUES (?, ?, ?, ?)
  `).run(reporterUserId, targetType, targetId, reason);
  return result.lastInsertRowid as number;
}

export function updateReportStatus(reportId: number, status: 'pending' | 'resolved' | 'dismissed'): void {
  db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(status, reportId);
}

export function getModerationActions(limit = 50): DbModerationAction[] {
  return db.prepare('SELECT * FROM moderation_actions ORDER BY created_at DESC LIMIT ?').all(limit) as DbModerationAction[];
}

export function getUserModerationActions(userId: number): DbModerationAction[] {
  return db.prepare('SELECT * FROM moderation_actions WHERE target_user_id = ? ORDER BY created_at DESC').all(userId) as DbModerationAction[];
}

export function createModerationAction(
  actorUserId: number,
  actionType: string,
  targetUserId?: number,
  targetPostId?: number,
  targetThreadId?: number,
  payload?: object
): number {
  const result = db.prepare(`
    INSERT INTO moderation_actions (actor_user_id, target_user_id, target_post_id, target_thread_id, action_type, action_payload) 
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    actorUserId,
    targetUserId || null,
    targetPostId || null,
    targetThreadId || null,
    actionType,
    payload ? JSON.stringify(payload) : null
  );
  return result.lastInsertRowid as number;
}

export function getBans(activeOnly = false): DbBan[] {
  if (activeOnly) {
    return db.prepare('SELECT * FROM bans WHERE active = 1 ORDER BY created_at DESC').all() as DbBan[];
  }
  return db.prepare('SELECT * FROM bans ORDER BY created_at DESC').all() as DbBan[];
}

export function getUserBans(userId: number): DbBan[] {
  return db.prepare('SELECT * FROM bans WHERE user_id = ? ORDER BY created_at DESC').all(userId) as DbBan[];
}

export function createBan(
  userId: number,
  modUserId: number,
  reasonCode: string,
  reasonText: string,
  severity: number,
  durationHours: number
): number {
  let expiresAt = null;
  if (durationHours > 0) {
    const expires = new Date();
    expires.setHours(expires.getHours() + durationHours);
    expiresAt = expires.toISOString();
  }
  
  const result = db.prepare(`
    INSERT INTO bans (user_id, mod_user_id, reason_code, reason_text, severity, duration_hours, expires_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, modUserId, reasonCode, reasonText, severity, durationHours, expiresAt);
  
  updateUserStatus(userId, 'banned');
  
  return result.lastInsertRowid as number;
}

export function deactivateBan(banId: number): void {
  db.prepare('UPDATE bans SET active = 0 WHERE id = ?').run(banId);
}

export function getMuseumEntries(filters?: { reason?: string; year?: string; modId?: number; severity?: number }): DbMuseumEntry[] {
  let query = `
    SELECT DISTINCT me.* FROM museum_entries me
    LEFT JOIN bans b ON me.user_id = b.user_id
    WHERE 1=1
  `;
  const params: any[] = [];
  
  if (filters?.reason) {
    query += ' AND b.reason_code = ?';
    params.push(filters.reason);
  }
  if (filters?.year) {
    query += ' AND strftime("%Y", me.created_at) = ?';
    params.push(filters.year);
  }
  if (filters?.modId) {
    query += ' AND b.mod_user_id = ?';
    params.push(filters.modId);
  }
  if (filters?.severity) {
    query += ' AND b.severity = ?';
    params.push(filters.severity);
  }
  
  query += ' ORDER BY me.created_at DESC';
  
  return db.prepare(query).all(...params) as DbMuseumEntry[];
}

export function getMuseumEntry(id: number): DbMuseumEntry | undefined {
  return db.prepare('SELECT * FROM museum_entries WHERE id = ?').get(id) as DbMuseumEntry | undefined;
}

export function getMuseumEntryByUserId(userId: number): DbMuseumEntry | undefined {
  return db.prepare('SELECT * FROM museum_entries WHERE user_id = ?').get(userId) as DbMuseumEntry | undefined;
}

export function createMuseumEntry(userId: number, title: string, summary: string, verdict = 'Pending Review'): number {
  const result = db.prepare(`
    INSERT INTO museum_entries (user_id, title, summary, verdict) 
    VALUES (?, ?, ?, ?)
  `).run(userId, title, summary, verdict);
  return result.lastInsertRowid as number;
}

export function getMuseumArtifacts(entryId: number): DbMuseumArtifact[] {
  return db.prepare('SELECT * FROM museum_artifacts WHERE museum_entry_id = ? ORDER BY created_at ASC').all(entryId) as DbMuseumArtifact[];
}

export function createMuseumArtifact(entryId: number, artifactType: string, content: string, sourceLabel: string): number {
  const result = db.prepare(`
    INSERT INTO museum_artifacts (museum_entry_id, artifact_type, content, source_label) 
    VALUES (?, ?, ?, ?)
  `).run(entryId, artifactType, content, sourceLabel);
  return result.lastInsertRowid as number;
}

export function getRules(): DbRule[] {
  return db.prepare('SELECT * FROM rules ORDER BY rule_number ASC').all() as DbRule[];
}

export function updateRule(ruleId: number, title: string, description: string, editedByUserId: number, editNote: string): void {
  db.prepare(`
    UPDATE rules 
    SET title = ?, description = ?, last_edited = datetime('now'), edited_by_user_id = ?, edit_note = ? 
    WHERE id = ?
  `).run(title, description, editedByUserId, editNote, ruleId);
}

export function getRecentBans(limit = 5): (DbBan & { username: string })[] {
  return db.prepare(`
    SELECT b.*, u.username 
    FROM bans b 
    JOIN users u ON b.user_id = u.id 
    ORDER BY b.created_at DESC 
    LIMIT ?
  `).all(limit) as (DbBan & { username: string })[];
}

export function getOnlineUsers(): DbUser[] {
  return db.prepare(`
    SELECT * FROM users 
    WHERE datetime(last_seen_at) > datetime('now', '-15 minutes')
    AND status = 'active'
  `).all() as DbUser[];
}

export function getForumStats(): { totalThreads: number; totalPosts: number; totalUsers: number; newestUser: string } {
  const threads = db.prepare('SELECT COUNT(*) as count FROM threads').get() as { count: number };
  const posts = db.prepare('SELECT COUNT(*) as count FROM posts').get() as { count: number };
  const users = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  const newest = db.prepare('SELECT username FROM users ORDER BY created_at DESC LIMIT 1').get() as { username: string } | undefined;
  
  return {
    totalThreads: threads.count,
    totalPosts: posts.count,
    totalUsers: users.count,
    newestUser: newest?.username || 'None'
  };
}

export function isUserBanned(userId: number): boolean {
  const user = getUser(userId);
  return user?.status === 'banned';
}

export function createUser(username: string, passwordHash: string): number {
  const result = db.prepare(`
    INSERT INTO users (username, password_hash, role, title) 
    VALUES (?, ?, 'user', 'Newbie')
  `).run(username, passwordHash);
  return result.lastInsertRowid as number;
}

export function updateUserPassword(userId: number, passwordHash: string): void {
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, userId);
}

export function migrateAddPasswordColumn(): void {
  try {
    db.exec(`ALTER TABLE users ADD COLUMN password_hash TEXT`);
  } catch (e) {
    // Column already exists
  }
}

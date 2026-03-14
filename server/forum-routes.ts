import { Router, Request, Response } from 'express';
import * as db from './db';
import * as helpers from './helpers';
import * as auth from './auth';

export const authRouter = Router();
export const forumRouter = Router();

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    hasSeenWelcome?: boolean;
  }
}

authRouter.get('/welcome', (req: Request, res: Response) => {
  res.render('welcome', {
    title: 'Welcome - The Forum That Ate Itself',
    users: db.getUsers().slice(0, 15),
    currentUser: null,
    onlineUsers: db.getOnlineUsers(),
    stats: db.getForumStats(),
    recentBans: db.getRecentBans(5)
  });
});

authRouter.post('/dismiss-welcome', (req: Request, res: Response) => {
  req.session.hasSeenWelcome = true;
  res.redirect('/');
});

authRouter.get('/login', (req: Request, res: Response) => {
  res.render('login', {
    title: 'Login - The Forum That Ate Itself',
    error: null,
    users: db.getUsers().slice(0, 15),
    currentUser: null,
    onlineUsers: db.getOnlineUsers(),
    stats: db.getForumStats(),
    recentBans: db.getRecentBans(5)
  });
});

authRouter.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  const result = await auth.loginUser(username, password);
  
  if (!result.success || !result.user) {
    res.render('login', {
      title: 'Login - The Forum That Ate Itself',
      error: result.error,
      users: db.getUsers().slice(0, 15),
      currentUser: null,
      onlineUsers: db.getOnlineUsers(),
      stats: db.getForumStats(),
      recentBans: db.getRecentBans(5)
    });
    return;
  }
  
  req.session.userId = result.user.id;
  req.session.hasSeenWelcome = true;
  res.clearCookie('actingUserId');
  res.redirect('/');
});

authRouter.get('/register', (req: Request, res: Response) => {
  res.render('register', {
    title: 'Register - The Forum That Ate Itself',
    error: null,
    users: db.getUsers().slice(0, 15),
    currentUser: null,
    onlineUsers: db.getOnlineUsers(),
    stats: db.getForumStats(),
    recentBans: db.getRecentBans(5)
  });
});

authRouter.post('/register', async (req: Request, res: Response) => {
  const { username, password, confirm_password } = req.body;
  
  if (password !== confirm_password) {
    res.render('register', {
      title: 'Register - The Forum That Ate Itself',
      error: 'Passwords do not match',
      users: db.getUsers().slice(0, 15),
      currentUser: null,
      onlineUsers: db.getOnlineUsers(),
      stats: db.getForumStats(),
      recentBans: db.getRecentBans(5)
    });
    return;
  }
  
  const result = await auth.registerUser(username, password);
  
  if (!result.success) {
    res.render('register', {
      title: 'Register - The Forum That Ate Itself',
      error: result.error,
      users: db.getUsers().slice(0, 15),
      currentUser: null,
      onlineUsers: db.getOnlineUsers(),
      stats: db.getForumStats(),
      recentBans: db.getRecentBans(5)
    });
    return;
  }
  
  req.session.userId = result.userId;
  req.session.hasSeenWelcome = true;
  res.redirect('/');
});

authRouter.get('/logout', (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.clearCookie('actingUserId');
    res.redirect('/');
  });
});

forumRouter.use((req: Request, res: Response, next) => {
  if (!req.session.hasSeenWelcome && req.path !== '/welcome') {
    res.redirect('/welcome');
    return;
  }
  
  let loggedInUser = null;
  let displayUser = null;
  
  if (req.session.userId) {
    loggedInUser = db.getUser(req.session.userId);
    if (loggedInUser && loggedInUser.status === 'banned') {
      req.session.destroy(() => {});
      res.redirect('/login');
      return;
    }
    displayUser = loggedInUser;
  }
  
  if (loggedInUser && loggedInUser.role === 'admin' && req.cookies?.actingUserId) {
    const actingId = parseInt(req.cookies.actingUserId);
    if (actingId !== loggedInUser.id) {
      const actingUser = db.getUser(actingId);
      if (actingUser) {
        displayUser = actingUser;
      }
    }
  }
  
  if (loggedInUser) {
    db.updateUserLastSeen(loggedInUser.id);
  }
  
  res.locals.currentUser = displayUser;
  res.locals.loggedInUser = loggedInUser;
  res.locals.isLoggedIn = !!loggedInUser;
  res.locals.canPost = !!loggedInUser && loggedInUser.status !== 'banned';
  res.locals.users = db.getUsers().slice(0, 15);
  res.locals.onlineUsers = db.getOnlineUsers();
  res.locals.stats = db.getForumStats();
  res.locals.recentBans = db.getRecentBans(5);
  res.locals.flash = null;
  
  next();
});

forumRouter.get('/', (req: Request, res: Response) => {
  const threads = db.getThreads(50);
  
  const threadsWithAuthors = threads.map(thread => {
    const author = db.getUser(thread.author_user_id);
    const lastPoster = thread.last_post_user_id ? db.getUser(thread.last_post_user_id) : null;
    return {
      ...thread,
      author_username: author?.username || 'Unknown',
      last_post_username: lastPoster?.username || author?.username || 'Unknown'
    };
  });
  
  const recentPosts = db.getRecentPosts(10).map(post => {
    const author = db.getUser(post.author_user_id);
    return {
      ...post,
      author_username: author?.username || 'Unknown',
      author_role: author?.role || 'user'
    };
  });
  
  const recentThreads = db.getRecentThreads(10).map(thread => {
    const author = db.getUser(thread.author_user_id);
    return {
      ...thread,
      author_username: author?.username || 'Unknown',
      author_role: author?.role || 'user'
    };
  });
  
  res.render('index', {
    title: 'Forum Index - The Forum That Ate Itself',
    threads: threadsWithAuthors,
    recentPosts,
    recentThreads
  });
});

forumRouter.get('/thread/:id', (req: Request, res: Response) => {
  const threadId = parseInt(req.params.id);
  const thread = db.getThread(threadId);
  
  if (!thread) {
    res.status(404).render('layout', {
      title: 'Thread Not Found',
      body: '<div class="flash-message flash-error"><i class="fas fa-exclamation-triangle"></i> Thread not found or has been deleted.</div>'
    });
    return;
  }
  
  db.incrementThreadViewCount(threadId);
  
  const author = db.getUser(thread.author_user_id);
  const posts = db.getPostsForThread(threadId);
  
  const postsWithAuthors = posts.map(post => {
    const postAuthor = db.getUser(post.author_user_id);
    return {
      ...post,
      author_username: postAuthor?.username || 'Unknown',
      author_role: postAuthor?.role || 'user',
      author_title: postAuthor?.title || 'Member',
      author_post_count: postAuthor?.post_count || 0,
      author_reputation: postAuthor?.reputation || 0,
      author_joined: postAuthor?.created_at || '',
      author_signature: postAuthor?.signature || ''
    };
  });
  
  res.render('thread', {
    title: `${thread.title} - The Forum That Ate Itself`,
    thread: {
      ...thread,
      author_username: author?.username || 'Unknown',
      author_role: author?.role || 'user',
      author_title: author?.title || 'Member',
      author_post_count: author?.post_count || 0,
      author_reputation: author?.reputation || 0,
      author_joined: author?.created_at || '',
      author_signature: author?.signature || ''
    },
    posts: postsWithAuthors
  });
});

forumRouter.get('/new-thread', (req: Request, res: Response) => {
  res.render('new-thread', {
    title: 'New Thread - The Forum That Ate Itself'
  });
});

forumRouter.post('/new-thread', (req: Request, res: Response) => {
  const { title, body } = req.body;
  const loggedInUser = res.locals.loggedInUser;
  
  if (!loggedInUser) {
    res.redirect('/login');
    return;
  }
  
  if (loggedInUser.status === 'banned') {
    res.locals.flash = { type: 'error', message: 'You cannot create threads while banned.' };
    res.redirect('/');
    return;
  }
  
  if (!title || !body || title.trim().length === 0 || body.trim().length === 0) {
    res.locals.flash = { type: 'error', message: 'Title and body are required.' };
    res.render('new-thread', { title: 'New Thread - The Forum That Ate Itself' });
    return;
  }
  
  const threadId = db.createThread(loggedInUser.id, helpers.escapeHtml(title.trim()), helpers.escapeHtml(body.trim()));
  res.redirect(`/thread/${threadId}`);
});

forumRouter.post('/thread/:id/reply', (req: Request, res: Response) => {
  const threadId = parseInt(req.params.id);
  const { body } = req.body;
  const loggedInUser = res.locals.loggedInUser;
  
  const thread = db.getThread(threadId);
  if (!thread) {
    res.redirect('/');
    return;
  }
  
  if (thread.locked) {
    res.redirect(`/thread/${threadId}`);
    return;
  }
  
  if (!loggedInUser) {
    res.redirect('/login');
    return;
  }
  
  if (loggedInUser.status === 'banned') {
    res.redirect(`/thread/${threadId}`);
    return;
  }
  
  if (!body || body.trim().length === 0) {
    res.redirect(`/thread/${threadId}`);
    return;
  }
  
  db.createPost(threadId, loggedInUser.id, helpers.escapeHtml(body.trim()));
  res.redirect(`/thread/${threadId}`);
});

forumRouter.post('/report', (req: Request, res: Response) => {
  const { targetType, targetId, reason } = req.body;
  const loggedInUser = res.locals.loggedInUser;
  
  if (!loggedInUser || loggedInUser.status === 'banned') {
    res.redirect('/');
    return;
  }
  
  if (!targetType || !targetId || !reason) {
    res.redirect('/');
    return;
  }
  
  db.createReport(loggedInUser.id, targetType as 'thread' | 'post', parseInt(targetId), reason);
  
  if (targetType === 'thread') {
    res.redirect(`/thread/${targetId}`);
  } else {
    const post = db.getPost(parseInt(targetId));
    if (post) {
      res.redirect(`/thread/${post.thread_id}`);
    } else {
      res.redirect('/');
    }
  }
});

forumRouter.get('/rules', (req: Request, res: Response) => {
  const rules = db.getRules();
  
  res.render('rules', {
    title: 'Forum Rules - The Forum That Ate Itself',
    rules
  });
});

forumRouter.get('/museum', (req: Request, res: Response) => {
  const filters: { reason?: string; year?: string; severity?: number } = {
    reason: req.query.reason as string || undefined,
    year: req.query.year as string || undefined,
    severity: req.query.severity ? parseInt(req.query.severity as string) : undefined
  };
  
  const entries = db.getMuseumEntries(filters);
  
  const entriesWithDetails = entries.map(entry => {
    const user = db.getUser(entry.user_id);
    const bans = db.getUserBans(entry.user_id);
    return {
      ...entry,
      username: user?.username || 'Unknown User',
      ban_reason: bans.length > 0 ? bans[0].reason_code : null
    };
  });
  
  res.render('museum', {
    title: 'Cancelled User Museum - The Forum That Ate Itself',
    entries: entriesWithDetails,
    filters
  });
});

forumRouter.get('/museum/:id', (req: Request, res: Response) => {
  const entryId = parseInt(req.params.id);
  const entry = db.getMuseumEntry(entryId);
  
  if (!entry) {
    res.status(404).render('layout', {
      title: 'Exhibit Not Found',
      body: '<div class="flash-message flash-error"><i class="fas fa-exclamation-triangle"></i> Museum exhibit not found.</div>'
    });
    return;
  }
  
  const user = db.getUser(entry.user_id);
  const artifacts = db.getMuseumArtifacts(entryId);
  const bans = db.getUserBans(entry.user_id);
  const modActions = db.getUserModerationActions(entry.user_id).map(action => {
    const actor = db.getUser(action.actor_user_id);
    return {
      ...action,
      actor_username: actor?.username || 'Unknown Moderator'
    };
  });
  
  res.render('museum_detail', {
    title: `${entry.title} - Cancelled User Museum`,
    entry,
    user: user || { id: entry.user_id, username: 'Unknown', created_at: '', last_seen_at: '', post_count: 0, reputation: 0 },
    artifacts,
    bans,
    modActions
  });
});

forumRouter.get('/mod', (req: Request, res: Response) => {
  const currentUser = res.locals.currentUser;
  
  if (!currentUser || (currentUser.role !== 'mod' && currentUser.role !== 'admin')) {
    res.render('mod', {
      title: 'Mod Panel - Access Denied',
      pendingReports: [],
      recentActions: [],
      activeBans: []
    });
    return;
  }
  
  const pendingReports = db.getReports('pending').map(report => {
    const reporter = db.getUser(report.reporter_user_id);
    let targetUserId = null;
    if (report.target_type === 'post') {
      const post = db.getPost(report.target_id);
      targetUserId = post?.author_user_id;
    } else {
      const thread = db.getThread(report.target_id);
      targetUserId = thread?.author_user_id;
    }
    return {
      ...report,
      reporter_username: reporter?.username || 'Unknown',
      target_user_id: targetUserId
    };
  });
  
  const recentActions = db.getModerationActions(30).map(action => {
    const actor = db.getUser(action.actor_user_id);
    const target = action.target_user_id ? db.getUser(action.target_user_id) : null;
    return {
      ...action,
      actor_username: actor?.username || 'Unknown',
      target_username: target?.username || null
    };
  });
  
  const activeBans = db.getBans(true).map(ban => {
    const user = db.getUser(ban.user_id);
    return {
      ...ban,
      username: user?.username || 'Unknown'
    };
  });
  
  res.render('mod', {
    title: 'Mod Panel - The Forum That Ate Itself',
    pendingReports,
    recentActions,
    activeBans
  });
});

forumRouter.get('/mod/user/:id', (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const currentUser = res.locals.currentUser;
  
  if (!currentUser || (currentUser.role !== 'mod' && currentUser.role !== 'admin')) {
    res.redirect('/mod');
    return;
  }
  
  const user = db.getUser(userId);
  if (!user) {
    res.redirect('/mod');
    return;
  }
  
  const modActions = db.getUserModerationActions(userId).map(action => {
    const actor = db.getUser(action.actor_user_id);
    return {
      ...action,
      actor_username: actor?.username || 'Unknown'
    };
  });
  
  const bans = db.getUserBans(userId);
  
  res.render('user_profile', {
    title: `User: ${user.username} - Mod Panel`,
    user,
    modActions,
    bans
  });
});

forumRouter.post('/mod/action', (req: Request, res: Response) => {
  const currentUser = res.locals.currentUser;
  
  if (!currentUser || (currentUser.role !== 'mod' && currentUser.role !== 'admin')) {
    res.redirect('/mod');
    return;
  }
  
  const { action, targetType, targetId, userId, reportId, reason, reasonCode, reasonText, severity, duration, banId, amount } = req.body;
  
  switch (action) {
    case 'dismiss_report': {
      if (reportId) {
        db.updateReportStatus(parseInt(reportId), 'dismissed');
        db.createModerationAction(currentUser.id, 'dismiss_report', undefined, undefined, undefined, { reportId });
      }
      break;
    }
    
    case 'delete': {
      if (targetType === 'post' && targetId) {
        const post = db.getPost(parseInt(targetId));
        if (post) {
          const resolved = helpers.resolveAction('delete', 2, 0);
          db.deletePost(parseInt(targetId), reason || 'Content violation');
          db.createModerationAction(currentUser.id, 'delete', post.author_user_id, parseInt(targetId), undefined, { reason, rng: resolved.notes });
          
          if (reportId) {
            db.updateReportStatus(parseInt(reportId), 'resolved');
          }
          
          if (resolved.escalated && resolved.notes.some(n => n.includes('thread lock'))) {
            db.lockThread(post.thread_id, true);
            db.createModerationAction(currentUser.id, 'lock', undefined, undefined, post.thread_id, { reason: 'Escalated from post deletion' });
          }
        }
      }
      break;
    }
    
    case 'lock':
    case 'unlock': {
      if (targetType === 'thread' && targetId) {
        const thread = db.getThread(parseInt(targetId));
        if (thread) {
          db.lockThread(parseInt(targetId), action === 'lock');
          db.createModerationAction(currentUser.id, action, thread.author_user_id, undefined, parseInt(targetId), { reason });
        }
      }
      res.redirect(`/thread/${targetId}`);
      return;
    }
    
    case 'warn': {
      if (userId) {
        const targetUser = db.getUser(parseInt(userId));
        if (targetUser) {
          const resolved = helpers.resolveAction('warn', 2, targetUser.reputation);
          
          if (resolved.finalAction === 'ban') {
            const banReason = helpers.randomBanReason();
            const banId = db.createBan(
              parseInt(userId),
              currentUser.id,
              banReason.reasonCode,
              reason || banReason.reasonText,
              resolved.finalSeverity,
              resolved.durationHours
            );
            db.createModerationAction(currentUser.id, 'ban', parseInt(userId), undefined, undefined, {
              reason: reason || banReason.reasonText,
              severity: resolved.finalSeverity,
              duration: resolved.durationHours,
              escalatedFrom: 'warn',
              rng: resolved.notes
            });
            helpers.generateMuseumEntry(parseInt(userId), banId);
          } else {
            db.createModerationAction(currentUser.id, 'warn', parseInt(userId), undefined, undefined, {
              reason: reason || 'Verbal warning issued',
              rng: resolved.notes
            });
            db.updateUserReputation(parseInt(userId), -10);
          }
        }
      }
      break;
    }
    
    case 'ban': {
      if (userId) {
        const targetUser = db.getUser(parseInt(userId));
        if (targetUser) {
          const baseSeverity = parseInt(severity) || 3;
          const baseDuration = parseInt(duration) || 24;
          
          const resolved = helpers.resolveAction('ban', baseSeverity, targetUser.reputation);
          const finalDuration = resolved.durationHours !== 0 ? resolved.durationHours : baseDuration;
          
          const banId = db.createBan(
            parseInt(userId),
            currentUser.id,
            reasonCode || 'other',
            reasonText || helpers.randomBanReason().reasonText,
            resolved.finalSeverity,
            resolved.escalated && resolved.durationHours === 0 ? 0 : finalDuration
          );
          
          db.createModerationAction(currentUser.id, 'ban', parseInt(userId), undefined, undefined, {
            reason: reasonText || 'Ban executed',
            severity: resolved.finalSeverity,
            duration: resolved.escalated && resolved.durationHours === 0 ? 0 : finalDuration,
            rng: resolved.notes
          });
          
          helpers.generateMuseumEntry(parseInt(userId), banId);
        }
      }
      break;
    }
    
    case 'unban': {
      if (userId) {
        db.updateUserStatus(parseInt(userId), 'active');
        if (banId) {
          db.deactivateBan(parseInt(banId));
        }
        db.createModerationAction(currentUser.id, 'unban', parseInt(userId), undefined, undefined, { reason: 'Ban lifted' });
      }
      break;
    }
    
    case 'adjust_rep': {
      if (userId && amount) {
        const change = parseInt(amount);
        if (!isNaN(change)) {
          db.updateUserReputation(parseInt(userId), change);
          db.createModerationAction(currentUser.id, 'adjust_rep', parseInt(userId), undefined, undefined, { change });
        }
      }
      break;
    }
  }
  
  const referer = req.get('Referer') || '/mod';
  if (referer.includes('/mod/user/')) {
    res.redirect(referer);
  } else {
    res.redirect('/mod');
  }
});

forumRouter.post('/switch-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (userId) {
    res.cookie('actingUserId', userId, { httpOnly: true, maxAge: 86400000 });
  }
  const referer = req.get('Referer') || '/';
  res.redirect(referer);
});

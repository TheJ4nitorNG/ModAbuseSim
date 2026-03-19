import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import cookieParser from "cookie-parser";
import session from "express-session";
import { initDatabase, migrateAddPasswordColumn } from "./db";
import { seedDatabase, initializeAdminPassword } from "./seed";
import { forumRouter, authRouter } from "./forum-routes";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: number;
    hasSeenWelcome?: boolean;
  }
}

initDatabase();
migrateAddPasswordColumn();
seedDatabase();
initializeAdminPassword();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const sessionSecret = process.env.SESSION_SECRET || 'forum-that-ate-itself-secret-key';
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

app.use(express.static(path.join(__dirname, "public")));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (!reqPath.includes('.css') && !reqPath.includes('.js') && !reqPath.includes('.ico')) {
      log(`${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

app.use((req, res, next) => {
  const originalRender = res.render.bind(res);
  
  res.render = function(view: string, options?: object, callback?: (err: Error | null, html: string) => void) {
    const opts = {
      ...res.locals,
      ...options
    };
    
    if (view === 'layout') {
      return originalRender(view, opts, callback);
    }
    
    const layoutData = {
      ...opts,
      body: ''
    };
    
    app.render(view, opts, (err: Error | null, html: string) => {
      if (err) {
        if (callback) return callback(err, '');
        return next(err);
      }
      
      layoutData.body = html;
      
      originalRender('layout', layoutData, callback);
    });
  } as typeof res.render;
  
  next();
});

app.use(authRouter);
app.use(forumRouter);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  log(`Error: ${message}`, "error");
  
  res.status(status).render('layout', {
    title: 'Error - The Forum That Ate Itself',
    body: `<div class="flash-message flash-error"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`,
    users: [],
    currentUser: null,
    onlineUsers: [],
    stats: { totalThreads: 0, totalPosts: 0, totalUsers: 0, newestUser: 'None' },
    recentBans: []
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).render('layout', {
    title: 'Page Not Found - The Forum That Ate Itself',
    body: `
      <div class="empty-state" style="background: #fff; border: 1px solid #bbb; padding: 60px 20px;">
        <i class="fas fa-question-circle"></i>
        <h3>Page Not Found (404)</h3>
        <p>The page you're looking for doesn't exist or has been removed.</p>
        <p style="margin-top: 15px;"><a href="/" class="btn btn-primary">Return to Forum Index</a></p>
      </div>
    `,
    users: [],
    currentUser: null,
    onlineUsers: [],
    stats: { totalThreads: 0, totalPosts: 0, totalUsers: 0, newestUser: 'None' },
    recentBans: []
  });
});

const port = parseInt(process.env.PORT || "8080", 10);
httpServer.listen(
  {
    port,
    host: "0.0.0.0",
    reusePort: true,
  },
  () => {
    log(`The Forum That Ate Itself is running on port ${port}`);
    log(`Database initialized and seeded`);
  },
);

const Bean = require("../bean-webserver/bean");

// * This array would look like
// { userId: 1, token: 2304823904 }
const SESSIONS = [];

const USERS = [
  {
    id: 1,
    name: "Roronoa Zoro",
    username: "zoro67",
    password: "zoro67",
  },
  {
    id: 2,
    name: "Zoldyck killua",
    username: "killua67",
    password: "killua67",
  },
  {
    id: 3,
    name: "Hisoka",
    username: "hisoka67",
    password: "hisoka67",
  },
];

const POSTS = [
  {
    id: 1,
    userId: 1,
    title: "This is first post",
    body: "Phasellus quis enim arcu. Etiam vehicula nulla mauris, commodo commodo quam blandit a. Suspendisse potenti. Fusce non ligula eleifend, convallis tellus eget, elementum nunc. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut risus purus, efficitur eget mollis quis, ultricies nec massa. Mauris id porta nulla, eget lacinia nulla.",
  },
  {
    id: 2,
    userId: 2,
    title: "This is second post",
    body: "Phasellus quis enim arcu. Etiam vehicula nulla mauris, commodo commodo quam blandit a. Suspendisse potenti. Fusce non ligula eleifend, convallis tellus eget, elementum nunc. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut risus purus, efficitur eget mollis quis, ultricies nec massa. Mauris id porta nulla, eget lacinia nulla.",
  },
];

const server = new Bean();

const authMiddleware = (req, res, next) => {
  const protectedRoutes = [
    "GET /api/user",
    "PUT /api/user",
    "POST /api/posts",
    "DELETE /api/logout",
  ];

  if (protectedRoutes.indexOf(req.method + " " + req.url) !== -1) {
    if (!req.headers.cookie) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = req.headers.cookie.token;
    const session = SESSIONS.find((session) => session.token === token);
    if (session) {
      req.userId = session.userId;
      return next();
    } else {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    next();
  }
};

// * ------------ Middleware Functions -----------

// * For authentication
server.beforeEach((req, res, next) => {
  authMiddleware(req, res, next);
});

// * For JSON Parsing
server.beforeEach((req, res, next) => {
  if (req.headers["content-type"] === "application/json") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString("utf-8");
    });

    req.on("end", (chunk) => {
      body = JSON.parse(body);
      req.body = body;
      return next();
    });
  } else {
    next();
  }
});

// TODO Add this in future
server.static("public");

// * ------------ Files Routes -----------

server.route("get", "/", (req, res) => {
  res.status(200).sendFile("./public/index.html", "text/html");
});

server.route("get", "/login", (req, res) => {
  res.status(200).sendFile("./public/index.html", "text/html");
});

server.route("get", "/profile", (req, res) => {
  res.status(200).sendFile("./public/index.html", "text/html");
});

server.route("get", "/new-post", (req, res) => {
  res.status(200).sendFile("./public/index.html", "text/html");
});

server.route("get", "/scripts.js", (req, res) => {
  res.status(200).sendFile("./public/scripts.js", "text/javascript");
});

server.route("get", "/styles.css", (req, res) => {
  res.status(200).sendFile("./public/styles.css", "text/css");
});

// * ------------ JSON Routes -----------

// * Send the list of all the posts
server.route("get", "/api/posts", (req, res) => {
  const posts = POSTS.map((post) => {
    const user = USERS.find((user) => post.userId === user.id);
    post.author = user.name;
    return post;
  });
  res.status(200).json(posts);
});

// * Create new post
server.route("post", "/api/posts", (req, res) => {
  const title = req.body.title;
  const body = req.body.body;
  const newPost = { id: POSTS.length + 1, userId: req.userId, title, body };
  POSTS.unshift(newPost);
  res.status(201).json(newPost);
});

// * Send user info
server.route("get", "/api/user", (req, res) => {
  const user = USERS.find((user) => user.id === req.userId);
  return res.status(200).json({ username: user.username, name: user.name });
});

// * update the user
server.route("put", "/api/user", (req, res) => {
  // * Send the user's profile
  const user = USERS.find((user) => user.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { username, name, password } = req.body;
  user.username = username;
  user.name = name;

  // * Only update password if provided
  if (password) {
    user.password = password;
  }

  res
    .status(200)
    .json({
      username: user.username,
      name: user.name,
      password_satus: password ? "updated" : "not updated",
    });
});

// * ------------ AUTH Routes -----------

// * Log the user in and give them a token
server.route("post", "/api/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // * Check if user exists
  const user = USERS.find(
    (user) => user.username === username && user.password == password
  );
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password." });
  }
  const token = Math.floor(Math.random() * 1000000000).toString();

  // * Save the session
  SESSIONS.push({ userId: user.id, token });

  res.setHeader("Set-Cookie", `token=${token}; Path=/`);
  return res.status(200).json({ message: "Logged in successfully!" });
});

// * Log the user in and give them a token
server.route("delete", "/api/logout", (req, res) => {
  const sessionIndex = SESSIONS.findIndex(session => session.userId === req.userId);
  if(sessionIndex > -1) {
    SESSIONS.splice(sessionIndex, 1);
  }
  res.setHeader("Set-Cookie", `token=deleted; Path=/; Expires=${new Date(0)}`)
  return res.status(200).json({ message: 'Logged out successfully' });
});

server.listen(8082, () => {
  console.log("App started on 8082");
});

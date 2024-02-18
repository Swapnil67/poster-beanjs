const Bean = require('../bean-webserver/bean');

const USERS = [
  {
    id: 1,
    name: 'Roronoa Zoro',
    username: 'zoro67',
    password: 'zoro67'
  },
  {
    id: 2,
    name: 'Zoldyck killua',
    username: 'killua67',
    password: 'killua67'
  },
  {
    id: 3,
    name: 'Hisoka',
    username: 'hisoka67',
    password: 'hisoka67'
  }
]

const POSTS = [
  {
    id: 1,
    userId: 1,
    title: 'This is first post',
    body: 'Phasellus quis enim arcu. Etiam vehicula nulla mauris, commodo commodo quam blandit a. Suspendisse potenti. Fusce non ligula eleifend, convallis tellus eget, elementum nunc. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut risus purus, efficitur eget mollis quis, ultricies nec massa. Mauris id porta nulla, eget lacinia nulla.'
  },
  {
    id: 2,
    userId: 2,
    title: 'This is second post',
    body: 'Phasellus quis enim arcu. Etiam vehicula nulla mauris, commodo commodo quam blandit a. Suspendisse potenti. Fusce non ligula eleifend, convallis tellus eget, elementum nunc. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut risus purus, efficitur eget mollis quis, ultricies nec massa. Mauris id porta nulla, eget lacinia nulla.'
  }
]

const server = new Bean();

// * ------------ Files Routes -----------

server.route('get', '/', (req, res) => {
  res.status(200).sendFile('./public/index.html', 'text/html');
})

server.route('get', '/login', (req, res) => {
  res.status(200).sendFile('./public/index.html', 'text/html');
})

server.route('get', '/profile', (req, res) => {
  res.status(200).sendFile('./public/index.html', 'text/html');
})

server.route('get', '/scripts.js', (req, res) => {
  res.status(200).sendFile('./public/scripts.js', 'text/javascript');
})

server.route('get', '/styles.css', (req, res) => {
  res.status(200).sendFile('./public/styles.css', 'text/css');
})

// * ------------ JSON Routes -----------

server.route('get', '/api/posts', (req, res) => {
  const posts = POSTS.map(post => {
    const user = USERS.find(user => post.userId === user.id)
    post.author = user.name
    return post;
  })
  res.status(200).json(posts);
})


// * ------------ AUTH Routes -----------

server.route('post', '/api/login', (req, res) => {
  let body = '';
  req.on('data', (chunk) =>{
    body += chunk.toString('utf-8');
  })

  req.on('end', (chunk) => {
    body = JSON.parse(body);
    console.log("Body ", body);
    const username = body.username;
    const password = body.password;

    // * Check if user exists
    const user = USERS.find(user => (user.username === username && user.password == password))
    console.log("user: ", user);
    if(!user) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    return res.status(200).json({ message: "Logged in successfully!" });
  })
})



server.listen(8082, () => {
  console.log('App started on 8082');
})
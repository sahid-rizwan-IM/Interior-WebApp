const express = require('express');
const path = require('path');
const app = express();
const connectDB = require('./config/db');
const User = require('./server/models/users');
const projectlist = require('./server/models/projectlist');
const materialslist = require('./server/models/materialsList');

const PORT = 3000;
const session = require('express-session');

app.use(session({
  secret: 'yourSecretKeyHere',   // change to a strong secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true if using HTTPS
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

connectDB();

// jade view engine
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'server/views'));

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static files (css, images, js)
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => { 
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); 
  res.setHeader('Pragma', 'no-cache'); 
  res.setHeader('Expires', '0'); next(); 
});
app.use((req, res, next) => { 
  if (req.session && req.session.user) { 
    req.user = req.session.user;
  } next(); 
});

app.get('/', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/api/allMainProjects'); 
  }
  res.render('adminLogin');
});
require('./server/routes/allroutes')(app);

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

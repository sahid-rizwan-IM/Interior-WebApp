const express = require('express');
const path = require('path');
const app = express();
const connectDB = require('./config/db');
const User = require('./server/models/users');
const projectlist = require('./server/models/projectlist');

const PORT = 3000;

// connect mongodb
connectDB();

// 🟢 jade view engine
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'server/views'));

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static files (css, images, js)
app.use(express.static(path.join(__dirname, 'public')));


// routes
app.get('/', (req, res) => {
  res.render('adminLogin');
});
require('./server/routes/allroutes')(app);

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

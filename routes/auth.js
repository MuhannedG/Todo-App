const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  res.redirect('/register');
});

// GET registration page
router.get('/register', (req, res) => {
  res.render('register', { errors: [] });
});

// POST registration
router.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  // Insecure query using string concatenation
  const sql = "INSERT INTO users (username, password) VALUES ('" + username + "', '" + password + "')";
  db.run(sql, function(err) {
    if (err) {
      console.error(err);
      return res.render('register', { errors: [{ msg: 'Registration failed (username may exist).' }] });
    }
    res.redirect('/login');
  });
});

// GET login page
router.get('/login', (req, res) => {
  res.render('login', { errors: [] });
});

// POST login
router.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  // Insecure SQL query vulnerable to SQL injection
  const sql = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  db.get(sql, (err, user) => {
    if (err || !user) {
      return res.render('login', { errors: [{ msg: 'Invalid username or password.' }] });
    }
    // Store user details in session (insecurely)
    req.session.user = { id: user.id, username: user.username };
    res.redirect('/todos');
  });
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;

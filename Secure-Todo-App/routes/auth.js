const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const saltRounds = 10;

// GET redirection
router.get('/', (req, res) => {
    res.redirect('/register');
  });

// GET registration page
router.get('/register', (req, res) => {
  res.render('register', { errors: [] });
});

// POST registration
router.post('/register',
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('register', { errors: errors.array() });
    }
    const { username, password } = req.body;
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        return res.render('register', { errors: [{ msg: 'Error hashing password' }] });
      }
      const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
      db.run(sql, [username, hash], function(err) {
        if (err) {
          console.error(err);
          return res.render('register', { errors: [{ msg: 'Username already exists or database error' }] });
        }
        res.redirect('/login');
      });
    });
  }
);

// GET login page
router.get('/login', (req, res) => {
  res.render('login', { errors: [] });
});

// POST login
router.post('/login',
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('login', { errors: errors.array() });
    }
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, user) => {
      if (err || !user) {
        return res.render('login', { errors: [{ msg: 'Invalid username or password' }] });
      }
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          req.session.user = { id: user.id, username: user.username };
          return res.redirect('/todos');
        } else {
          return res.render('login', { errors: [{ msg: 'Invalid username or password' }] });
        }
      });
    });
  }
);

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;

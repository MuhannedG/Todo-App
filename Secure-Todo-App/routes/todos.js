const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../db');

// Middleware to ensure the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

// GET all todos for the logged-in user
router.get('/', isAuthenticated, (req, res) => {
  const sql = 'SELECT * FROM todos WHERE user_id = ?';
  db.all(sql, [req.session.user.id], (err, todos) => {
    if (err) {
      return res.send('Error retrieving todos');
    }
    res.render('todos', { todos });
  });
});

// POST add a new todo
router.post('/add', isAuthenticated,
  body('task').trim().isLength({ min: 1 }).withMessage('Task cannot be empty'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.redirect('/todos');
    }
    const { task } = req.body;
    const sql = 'INSERT INTO todos (user_id, task) VALUES (?, ?)';
    db.run(sql, [req.session.user.id, task], function(err) {
      if (err) {
        return res.send('Error adding todo');
      }
      res.redirect('/todos');
    });
  }
);

// POST mark a todo as completed
router.post('/complete', isAuthenticated, (req, res) => {
  const { id } = req.body;
  const sql = 'UPDATE todos SET completed = 1 WHERE id = ? AND user_id = ?';
  db.run(sql, [id, req.session.user.id], function(err) {
    if (err) {
      return res.send('Error updating todo');
    }
    res.redirect('/todos');
  });
});

// POST delete a todo
router.post('/delete', isAuthenticated, (req, res) => {
  const { id } = req.body;
  const sql = 'DELETE FROM todos WHERE id = ? AND user_id = ?';
  db.run(sql, [id, req.session.user.id], function(err) {
    if (err) {
      return res.send('Error deleting todo');
    }
    res.redirect('/todos');
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to check if the user is logged in
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

// GET all todos for the logged-in user
router.get('/', isAuthenticated, (req, res) => {
  const sql = "SELECT * FROM todos WHERE user_id = " + req.session.user.id;
  db.all(sql, (err, todos) => {
    if (err) {
      return res.send('Error retrieving todos.');
    }
    res.render('todos', { todos });
  });
});

// POST add a new todo
router.post('/add', isAuthenticated, (req, res) => {
  const task = req.body.task;
  // Insecure query: direct concatenation of input
  const sql = "INSERT INTO todos (user_id, task) VALUES (" + req.session.user.id + ", '" + task + "')";
  db.run(sql, function(err) {
    if (err) {
      return res.send('Error adding todo.');
    }
    res.redirect('/todos');
  });
});

// POST mark a todo as completed
router.post('/complete', isAuthenticated, (req, res) => {
  const id = req.body.id;
  const sql = "UPDATE todos SET completed = 1 WHERE id = " + id + " AND user_id = " + req.session.user.id;
  db.run(sql, function(err) {
    if (err) {
      return res.send('Error updating todo.');
    }
    res.redirect('/todos');
  });
});

// POST delete a todo
router.post('/delete', isAuthenticated, (req, res) => {
  const id = req.body.id;
  const sql = "DELETE FROM todos WHERE id = " + id + " AND user_id = " + req.session.user.id;
  db.run(sql, function(err) {
    if (err) {
      return res.send('Error deleting todo.');
    }
    res.redirect('/todos');
  });
});

module.exports = router;

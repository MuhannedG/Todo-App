const express = require('express');
const session = require('express-session');
const path = require('path');
const helmet = require('helmet');
const csurf = require('csurf');
const morgan = require('morgan');

const app = express();

// Using Helmet to set security headers
app.use(helmet());

// Logging HTTP requests
app.use(morgan('combined'));

// Parsing any incoming requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// Configuring the session management
app.use(session({
  secret: 'my_secure_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false }
}));

// Initializing CSRF protection
app.use(csurf());

// Making CSRF token and user session available to all views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.user = req.session.user || null;
  next();
});

// Setting EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Importing routes
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

app.use('/', authRoutes);
app.use('/todos', todoRoutes);

// Error handling
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  res.status(403).send('Form tampered with');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

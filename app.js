const express = require('express');
const session = require('express-session');
const path = require('path');
const morgan = require('morgan');

const app = express();

// Log HTTP requests
app.use(morgan('combined'));

// Parse incoming requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Insecure session configuration (for demo purposes only)
app.use(session({
  secret: 'insecure_secret', // Insecure secret and no environment variable used
  resave: true,
  saveUninitialized: true,
  cookie: { httpOnly: false, secure: false }
}));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import routes
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

app.use('/', authRoutes);
app.use('/todos', todoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Insecure server is running on port ${PORT}`);
});

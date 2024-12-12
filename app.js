// app.js

const express = require("express"); // Import the Express framework to create the web server
const session = require("express-session"); // Import express-session to manage user sessions
const passport = require("passport"); // Import Passport for user authentication
const crypto = require("crypto"); // Import crypto for cryptographic functions (not used directly here)
const routes = require("./routes"); // Import the routes dfined in the routes folder
const connection = require("./config/database"); // Import the PostgreSQL connection pool from the database config

// Load environment variables from the .env file
require("dotenv").config();

// Create an instance of the Express application
var app = express();

/**
 * -------------- GENERAL SETUP ----------------
 */
// Middleware to parse JSON and URL-encoded data
app.use(express.json());
// Middleware to parse URL-encoded data (form submissions)
app.use(express.urlencoded({ extended: true }));

/**
 * -------------- SESSION SETUP ----------------
 * Session: Used to store information about a user moving throughout the browser.
 * Session-store: what persistent memory are we storing our sessions in.
 */

// Import connect-pg-simple for storing session data in a PostgreSQL database
const pgStore = require("connect-pg-simple")(session);

// A session store connects the session data to a persistent storage, in our case a database.
// Create a new session store using the PostgreSQL connection pool
const sessionStore = new pgStore({ pool: connection });

// Set up the session middleware to manage user sessions
app.use(
  session({
    // The following are express-session "options".
    secret: process.env.SECRET, // Secret key used to sign the session ID cookie (stored in .env)
    resave: false, // Prevents resaving sessions that haven't been modified.
    saveUninitialized: true, // Saves new sessions that haven't been modified yet.
    store: sessionStore, // Use the PostreSQL session store to persist session data
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // Session cookie expires in 30 days.
  })
  /**
   * A note about how the cookie works. When a session is created the express session middleware is going to get this cookie on every request and take the value. Then it looks up this value session ID in the session store and confirms it's valid. If it's valid you can show the user content or gather data on the user such as how many times the user has visited the site.
   */
);

/**
 * -------------- Passport Authentication ----------------
 */

// Load the Passport configuration from the config/passport file
require("./config/passport");

// Initialize Passport middleware for handling authentication
app.use(passport.initialize());

// Use Passport to manage persistent login sessions
app.use(passport.session());

// Middleware to log the session and user information for debugging purposes
app.use((req, res, next) => {
  console.log(req.session);
  console.log(req.user);
  next();
});

/**
 * -------------- ROUTES ----------------
 */

// Imports all of the routes from ./routes/index.js
app.use(routes);

/**
 * -------------- SERVER ----------------
 */

// Server listens on http://localhost:3000
app.listen(3000, () => console.log(`App listening on port 3000!`));

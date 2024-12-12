// config/passport.js
/**
 * This file configures Passport.js to handle user authentication using the Local Strategy (username and password).
 * It defines how to verify a user's credentials, how to store user data in the session (serialization), and how to retrieve user data from the session (deserialization).
 * The file uses a PostgreSQL db to store and validate user credentials.
 */

const passport = require("passport"); // Import Passport
const LocalStrategy = require("passport-local").Strategy; // Import Local Strategry for username/password authentication
const pool = require("./database"); // Import the PostgreSQL connection pool.
const validatePassword = require("../lib/passwordUtils").validatePassword; // Import the function to validate the password by comparing hashes.

// These are custome fields to show how we can user custome fields.
// These field names match exactly what's on the name attribute in the forms.
const customFields = {
  usernameField: "uname",
  passwordField: "pw",
};

/**
 * -------------- VERIFY CALLBACK ----------------
 * Verifies user credentials during login.
 * This function is called by Passport when a login attempt is made. 
 * Fields in this function are populated by Passport framework. 
 * Note: The verify callback doesn't have to be a specific structure. 
 * The only thing that matters is the retur values you pass to the done callback. 
 * Passport expects specific return values to determine the authentication status. 
 * @param {String} username - The username submitted by the user.
 * @param {String} password - The password submitted by the user.

 * @param {function} done - A callback function that Passport uses to proceed with the login.
 * @returns 
 */
/**
 * Notes on the 'done()' callback: Takes 3 parameters: error, user, info.
 * error: an error object if there was an error during authentication.
 * user: The authenticated user object if authentication was successful.
 * info: an optional object containiner additional information about the authentication process.
 */
const verifyCallback = async (username, password, done) => {
  try {
    // Query the database to find a user by the provided username.
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    // Get the first user found (should only be one)
    const user = rows[0];
    console.log("im in verify callback");
    // If no user is found, return an error.
    if (!user) {
      /**
       * If there is no user in the db, return done(null, false, object).
       * This tells passport that there was no error, but the user was not found. Passport will return a 401 status.
       */
      return done(null, false, { message: "Incorrect username" });
    }

    // Validate the provided password against the stored hash and salt
    const isValid = validatePassword(password, user.hash, user.salt);
    // If the password is valid, proceed with the authenticated user.
    if (isValid) {
      return done(null, user);
    } else {
      // If password is invalid, return an error.
      return done(null, false, { message: "Incorrect password!" });
    }
  } catch (error) {
    // If there's an error during the database query, return the error.
    return done(error);
  }
};

/**
 * -------------- LOCAL STRATEGY ----------------
 * Create a new Local Strategy with custom fields and the verification callback.
 * This tells Passport how to handle username/password authentication.
 */
const strategy = new LocalStrategy(customFields, verifyCallback);

// Register the Local Strategy with Passport
passport.use(strategy);

/**
 * -------------- SERIALIZE USER ----------------
 * Defines how user data is stored in the session.
 * @param {object} user - The authenticated user object.
 * @param {function} done - A callback function to store the user ID in the session.
 */
passport.serializeUser((user, done) => {
  done(null, user.id); // Stores the user's ID in the session.
});

/**
 * -------------- DESERIALIZE USER ----------------
 * Defines how to retrieve user data from the session.
 * @param {number} id - The user ID stored in the session.
 * @param {function} done - A callback function to retrieve the user object from the database.
 */
passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    const user = rows[0];

    done(null, user);
  } catch (err) {
    done(err);
  }
});

/**
 * Notes on serialization and deserialization:
 * Without it, the server wouldn't remember who is logged in after the initial login request. Passport uses sessions to maintain this state between http requests.
 */

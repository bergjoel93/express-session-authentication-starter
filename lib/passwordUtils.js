// lib/passwordUtils.js
/**
 * This file provides two key functions for handling user passwords:
 * 1. genPassword: Generates a salt and a hashed password when a user creates or changes their password. This ensures passwords are stored securely by hashing them with a unique salt.
 * 2. validatePassword: Validates a user's login attempt by hashing the provided password with the stored salt and comparing it to the stored hash.
 *
 * These functions help protect user passwords by using cryptographic hashing techniques, making it difficult for attackers to compromise passwords evern if the database is breached.
 */

const crypto = require("crypto"); // Import the 'crypto' module for cryptographic functions like hashing and generating random bytes.

/**
 * -------------- GENERATE PASSWORD ----------------
 * Function to generate a salt and a hash for a given password.
 * This is used when a user creates a new account or changes their password.
 *
 * @param {string} password - The plain-text password provided by the user.
 * @returns {object} An object containing the salt and the generated hash.
 */

// generate password function when user makes new password.
function genPassword(password) {
  // Generate a 32-byte random salt and convert it to a hexadecimal string
  var salt = crypto.randomBytes(32).toString("hex");
  // Generate a hash using the password and the salt

  var genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  // Return the salt and the generated hash
  return {
    salt: salt,
    hash: genHash,
  };
}

/**
 * -------------- VALIDATE PASSWORD ----------------
 * Function to validate a user's password during login.
 * It hashes the provided password with the stored salt and compares it to the stored hash.
 *
 * @param {string} password - The plain-text password provided by the user during login.
 * @param {string} hash - The stored hash retrieved from the database.
 * @param {string} salt - The stored salt retrieved from the database.
 * @returns {boolean} True if the provided password matches the stored hash, false otherwise.
 */
function validatePassword(password, hash, salt) {
  // Hash the provided password with the stored salt using the same parameters as genPassword
  var hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  // Compare the newly generated hash with the stored hash
  return hash === hashVerify;
}
// Export the functions to make them available for use in other files.
module.exports.validatePassword = validatePassword;
module.exports.genPassword = genPassword;

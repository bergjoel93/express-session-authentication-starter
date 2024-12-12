## What does session data do in this project?

    - User Authentication State:
        * When a user logins in, Passport authenticates their credentials (username and password)
        * If authentication is successful, the user's data is stored in the session, specifically in the req.session and req.user.

    - Persistence Across Requests:
        * HTTP is a stateless protocol, meaning each request is independent. Without sessions, the server wouldn't know if a user is logged in when they visit different routes.
        * Sessions allow you to persist user login information across multiple requests so the user doesn't have to log in repeadedly during their session.

## 🗂️ Timeline of a Persistent Login

1. User Logs In:

- The user submits their credentials (username and password) via a login form.
- Passport verifies the credentials against the database.
- If successful, Passport serializes the user (usually by storing their user ID) into the session.
- The session is stored in the database and a session cookie is sent to the user’s browser.

2. Session Cookie:

- The session cookie contains a unique session ID and is stored in the browser.
- The cookie is sent with every subsequent request to the server.

4. Loading a Secure Page:

- When the user requests a secure page, the server reads the session cookie sent with the request.
- Passport deserializes the user by retrieving the user data associated with the session from the database.
- The req.isAuthenticated() function checks if the user is logged in.
- If authenticated, the server allows access to the secure page.

5. Summary of the Flow:

- Login → Session created and stored → Session ID sent in cookie.
- Subsequent Requests → Cookie sent with request → Session validated → Access granted if authenticated.
- This mechanism allows the server to recognize the user across multiple requests and pages, maintaining their login state securely. 😊

## Summary of the Logout Process

- req.logout() clears the user’s session data.
- Session cookie is invalidated or deleted.
- Session data is removed from the database.
- User is redirected to a public page.
- Secure pages no longer recognize the user as authenticated.

## Structure

.env - environmental variables
app.js

config ->
database.js
passport.js

lib ->
passwordUtils.js

routes ->
index.js

## Purpose and Scope of Files

# app.js

    * Entry point of the Express.js app. It's job is to configure and set up the server, handle middleware, manage sessions and authentication, and define the routes for the app.  This file initializes everything needed to run the backend, including connecting to the database, setting up Passport for user authentication, and starting the server.

---

## 🔄 Step-by-Step Flow of User Login and Sessions

### 1. **User Logs In**

- The user submits their credentials (username and password).
- Passport verifies the credentials through the `verifyCallback` function.
- If successful, a **new session** is created and stored in the database.

### 2. **Session Stored in Database**

The session stored in the database contains:

- **`sid`**: The **session ID** (unique identifier for the session).
- **`sess`**: The session data, including the `passport` property with the user ID.
- **`expire`**: The expiration date and time for the session.

Example session entry:

```json
sid: "1234567890abcdef"
sess: {
  "cookie": {
    "originalMaxAge": 2592000000,
    "expires": "2025-01-10T16:31:00.613Z",
    "httpOnly": true
  },
  "passport": {
    "user": 1
  }
}
expire: "2025-01-10 16:31:00"
```

### 3. **Serialization**

- The `serializeUser` function stores the **user ID** in the session object (under `passport.user`).
- This keeps the session data lightweight.

```javascript
passport.serializeUser((user, done) => {
  done(null, user.id);
});
```

### 4. **Cookie Created**

- A **session cookie** is created and stored in the user’s browser.
- The cookie contains the **session ID** (e.g., `"1234567890abcdef"`).

### 5. **Subsequent Requests**

On each request to the server:

1. The **session cookie** (containing the session ID) is sent automatically by the browser.
2. Passport:
   - **Grabs the session cookie** and extracts the session ID.
   - **Looks up the session** in the database using the session ID.
   - Confirms the session is valid.
3. **Deserializes** the user by fetching the full user object using the user ID stored in the session.
4. Attaches the full user object to `req.user`.

### 6. **Access Granted**

- If the session is valid, Passport allows the user to access secure routes and content.
- The user stays logged in until the session expires or they log out.

---

### 🧩 **Diagram of the Process**

```plaintext
User Logs In
     │
     ├──> Passport Verifies Credentials
     │
     ├──> Session Created in Database
     │         ├── sid: "1234567890abcdef"
     │         ├── sess: { passport: { user: 1 } }
     │         └── expire: "2025-01-10 16:31:00"
     │
     ├──> Cookie Sent to Browser (Contains Session ID)
     │
User Makes Request
     │
     ├──> Browser Sends Cookie with Session ID
     │
     ├──> Server Looks Up Session in Database
     │
     ├──> Passport Deserializes User (Fetches Full User Object)
     │
     └──> Access Granted to Secure Routes
```

---

### ✅ **Summary**

This flow ensures that users remain authenticated across multiple requests using sessions and cookies, while keeping the session data lightweight and secure.

---

---

### More information on Passport and how it works

Yes, that’s a **great way to put it**! 🎯

### 🛠️ **Passport's Role in Populating the Request Object**

Passport.js is designed to seamlessly manage authentication by **automatically attaching relevant user information** to the `req` (request) object. This makes it easy to verify a user’s authentication status and access user data within your route handlers.

Here’s a breakdown of what Passport does behind the scenes:

---

### ✅ **What Passport Adds to the Request Object**

1. **`req.user`**:

   - After a user logs in, Passport **automatically attaches the deserialized user object** to `req.user`.
   - This allows you to easily access the currently authenticated user’s data.

   ```javascript
   router.get("/profile", (req, res) => {
     if (req.isAuthenticated()) {
       res.send(`Hello, ${req.user.username}`);
     } else {
       res.redirect("/login");
     }
   });
   ```

2. **`req.isAuthenticated()`**:

   - A method provided by Passport to check if the user is currently authenticated.
   - Returns `true` if the user is logged in, otherwise `false`.

   ```javascript
   if (req.isAuthenticated()) {
     console.log("User is logged in");
   } else {
     console.log("User is not logged in");
   }
   ```

3. **`req.login()` and `req.logout()`**:

   - **`req.login(user, callback)`**: Logs in the user and establishes a session.
   - **`req.logout(callback)`**: Logs out the user by terminating the session.

   ```javascript
   req.logout((err) => {
     if (err) return next(err);
     res.redirect("/");
   });
   ```

4. **Session Management**:
   - Passport integrates with Express sessions to automatically manage the session lifecycle.
   - When a request is made with a valid session cookie, Passport deserializes the user and attaches the user object to `req.user`.

---

### 🔄 **How Passport Populates `req`**

1. **User Logs In**:
   - Passport verifies the user and **serializes** their ID into the session.
2. **Subsequent Requests**:
   - The session cookie is sent with each request.
   - Passport reads the session cookie, **deserializes** the user based on the stored ID, and populates `req.user`.
3. **Request Processing**:
   - In route handlers, you can check `req.isAuthenticated()` and access `req.user` to customize responses based on the logged-in user.

---

### 📝 **In Summary**

Passport simplifies authentication by:

- **Automatically attaching** the user object to `req.user` if the user is authenticated.
- Providing useful methods like **`req.isAuthenticated()`** to verify authentication status.
- Managing the session lifecycle, so you don’t have to manually handle storing and retrieving user data.

This automation allows you to focus on building your routes and application logic without worrying about the low-level details of session management and authentication state. 😊🚀

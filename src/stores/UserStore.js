import users from '../data/users.json';

/**
 * UserStore - Data access layer for user records
 * Implements the UserStore component from the Authentication & Compliance LLD.
 * User Stories: SCRUM-7164, SCRUM-7167
 */

/**
 * Find a user by username and password credentials.
 * @param {string} username - The username to match
 * @param {string} password - The password to validate
 * @returns {object|null} The user object (without password) if credentials match, or null
 */
export const findUserByCredentials = (username, password) => {
  if (!username || !password) {
    return null;
  }

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return null;
  }

  const { password: _pw, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Find a user by their unique ID.
 * @param {number} id - The user ID to look up
 * @returns {object|null} The user object (without password) if found, or null
 */
export const findUserById = (id) => {
  if (id === undefined || id === null) {
    return null;
  }

  const user = users.find((u) => u.id === Number(id));

  if (!user) {
    return null;
  }

  const { password: _pw, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Get the role for a given user ID.
 * @param {number} id - The user ID
 * @returns {string|null} The user's role, or null if user not found
 */
export const getUserRoles = (id) => {
  if (id === undefined || id === null) {
    return null;
  }

  const user = users.find((u) => u.id === Number(id));

  if (!user) {
    return null;
  }

  return user.role;
};

/**
 * Get all users (without passwords).
 * @returns {Array<object>} Array of user objects without password fields
 */
export const getAllUsers = () => {
  return users.map((u) => {
    const { password: _pw, ...userWithoutPassword } = u;
    return userWithoutPassword;
  });
};

/**
 * Validate that a password meets minimum requirements.
 * @param {string} password - The password to validate
 * @returns {boolean} True if password meets requirements
 */
export const validatePassword = (username, password) => {
  if (!username || !password) {
    return false;
  }

  if (typeof password !== 'string' || password.length < 8) {
    return false;
  }

  const user = users.find((u) => u.username === username);

  if (!user) {
    return false;
  }

  return user.password === password;
};
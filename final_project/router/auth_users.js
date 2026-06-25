const express = require('express');
const jwt     = require('jsonwebtoken');
let books     = require('./booksdb.js');
const regd_users = express.Router();

let users = [];

const isValid = (username) => username && !users.find(u => u.username === username);
const authenticatedUser = (username, password) => !!users.find(u => u.username === username && u.password === password);

regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)                return res.status(400).json({ message: 'Username and password are required' });
  if (!authenticatedUser(username, password)) return res.status(401).json({ message: 'Invalid username or password' });

  const accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });
  req.session.authorization = { accessToken };
  return res.status(200).json({ message: `User ${username} successfully logged in`, token: accessToken });
});

regd_users.put('/auth/review/:isbn', (req, res) => {
  const { isbn }     = req.params;
  const review       = req.query.review;
  const { username } = req.user;

  if (!books[isbn]) return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  if (!review)      return res.status(400).json({ message: 'Provide review text as query param: ?review=...' });

  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: `Review for ISBN ${isbn} by ${username} saved`, reviews: books[isbn].reviews });
});

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const { isbn }     = req.params;
  const { username } = req.user;

  if (!books[isbn])                   return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  if (!books[isbn].reviews[username]) return res.status(404).json({ message: `No review by ${username} for ISBN ${isbn}` });

  delete books[isbn].reviews[username];
  return res.status(200).json({ message: `Review by ${username} for ISBN ${isbn} deleted`, reviews: books[isbn].reviews });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

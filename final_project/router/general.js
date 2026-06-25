const express  = require('express');
let books      = require('./booksdb.js');
let isValid    = require('./auth_users.js').isValid;
let users      = require('./auth_users.js').users;
const public_users = express.Router();

public_users.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });
  if (!isValid(username))     return res.status(409).json({ message: `Username "${username}" is already taken` });
  users.push({ username, password });
  return res.status(201).json({ message: `User "${username}" registered successfully` });
});

public_users.get('/', async (req, res) => {
  try {
    const allBooks = await new Promise((resolve, reject) =>
      books ? resolve(books) : reject(new Error('Could not retrieve books'))
    );
    return res.status(200).json(allBooks);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const book = await new Promise((resolve, reject) => {
      const b = books[req.params.isbn];
      b ? resolve(b) : reject(new Error(`Book with ISBN ${req.params.isbn} not found`));
    });
    return res.status(200).json(book);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

public_users.get('/author/:author', async (req, res) => {
  try {
    const query = req.params.author.toLowerCase();
    const results = await new Promise((resolve, reject) => {
      const found = Object.entries(books)
        .filter(([, b]) => b.author.toLowerCase().includes(query))
        .map(([isbn, b]) => ({ isbn, ...b }));
      found.length ? resolve(found) : reject(new Error(`No books found by author matching "${req.params.author}"`));
    });
    return res.status(200).json(results);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

public_users.get('/title/:title', async (req, res) => {
  try {
    const query = req.params.title.toLowerCase();
    const results = await new Promise((resolve, reject) => {
      const found = Object.entries(books)
        .filter(([, b]) => b.title.toLowerCase().includes(query))
        .map(([isbn, b]) => ({ isbn, ...b }));
      found.length ? resolve(found) : reject(new Error(`No books found with title matching "${req.params.title}"`));
    });
    return res.status(200).json(results);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});


public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: `Book with ISBN ${req.params.isbn} not found` });
  const reviews = book.reviews;
  return res.status(200).json(
    Object.keys(reviews).length ? reviews : { message: 'No reviews yet for this book', reviews }
  );
});

module.exports.general = public_users; 

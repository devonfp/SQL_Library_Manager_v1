var express = require('express');
var router = express.Router();
var Book = require('../models').Book
const path = require('path');
var app = express();


// view engine setup
  app.set('views', './views');
  app.set('view engine', 'pug');

/* GET home page. */
router.get('/', async function(req, res, next) {
  const books = await Book.findAll();
  console.log(books);
  res.json(books);
});

router.get('/books', async function(req, res, next) {
  const books = await Book.findAll();
  res.render('index', { title: 'Book List', books });
});

router.get('/books/new', async function(req, res, next) {
  res.render('new-book', { title: 'New Book' });
});

router.post('/books/new', async function(req, res, next) {
  const { title, author, genre, year } = req.body;
  const book = await Book.create({ title, author, genre, year });
  res.redirect('/books/' + book.id);
});

router.get('/books/:id', async function(req, res, next) {
  const bookId = req.params.id;
  const book = await Book.findByPk(bookId);
  if (book) {
    res.render('book-detail', { title: book.title, book });
  } else {
    const error = new Error('Book not found');
    error.status = 404;
    next(error);
  }
});

router.post('/books/:id', async function(req, res, next) {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).send('Book not found');
    }
    try {
      await book.update(req.body);
      res.send('Book updated successfully');
    } catch (err) {
      res.status(400).send(err.message);
    }
  });

router.post('/books/:id/delete', async function(req, res, next) {
  const book = await Book.findByPk(req.params.id);
  if (!book) {
    return res.status(404).send('Book not found');
  }
  try {
    await book.destroy();
    res.send('Book deleted successfully');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Sets up middleware to catch undefined routes
router.use((req, res, next) => {
  const error = new Error('Sorry, the page you requested could not be found.');
  error.status = 404;
  next(error);
});

// Sets up error handling middleware
router.use((error, req, res, next) => {
  res.status(error.status || 500);
  if (error.status === 404) {
  res.send('Sorry! It appears the page you requested could not be found.');
  console.log('Sorry! It appears the page you requested could not be found.');
  } else {
    res.json({ error: error.message });
  }
});

module.exports = router;

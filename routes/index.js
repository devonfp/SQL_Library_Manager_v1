var express = require('express');
var Book = require('../models').Book
const path = require('path');
var app = express();


// view engine setup
  app.set('views', './views');
  app.set('view engine', 'pug');



/*Home Page*/
app.get('/', async function(req, res, next) {
  //const books = await Book.findAll();
  //console.log(books);
  //res.json(books);
  res.redirect('/books');
});

app.get('/books', async function(req, res, next) {
  const books = await Book.findAll();
  res.render('index', { title: 'Book List', books });
});




/* New Book Page*/
app.get('/books/new', async function(req, res, next) {
  res.render('new-book', { title: 'New Book' });
});

app.post('/books/new', async function(req, res, next) {
  const { title, author, genre, year } = req.body;
  const book = await Book.create({ title, author, genre, year });
  res.redirect('/books/' + book.id);
});




/* Update-Book Page*/
app.get('/books/:id', async function(req, res, next) {
  const bookId = req.params.id;
  const book = await Book.findByPk(bookId);
  if (book) {
    res.render('update-book', { title: book.title, book });
  } else {
    const error = new Error('Book not found');
    error.status = 404;
    next(error);
  }
});

app.post('/books/:id', async function(req, res, next) {
  const { title, author, genre, year } = req.body;
    const book = await Book.findByPk(req.params.id);
    await book.update({ title, author, genre, year });
    res.redirect(`/books/`);
});



/* Update-book Page delete button*/
app.post('/books/:id/delete', async function(req, res, next) {
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
app.use((req, res, next) => {
  const error = new Error('Sorry, the page you requested could not be found.');
  error.status = 404;
  next(error);
});

// Sets up error handling middleware
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  if (error.status === 404) {
  res.send('Sorry! It appears the page you requested could not be found.');
  } else {
    res.json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

module.exports = app;

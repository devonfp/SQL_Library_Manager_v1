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

//app.post('/books/new', async function(req, res, next) {
//const book = await Book.create(req.body);
  //res.redirect('/books/');
//});


  app.post('/books/new', async (req, res, next) => {
    const book = await Book.create(req.body).catch(error => {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => ({ field: err.path, message: err.message }));
        res.render('new-book', { 
          title: 'New Book', 
          book: req.body, 
          errors: errors 
        });
      } else {
        next(error);
      }
    });
    if (book) res.redirect('/books/');
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

/*
app.post('/books/:id', async function(req, res, next) {
  const { title, author, genre, year } = req.body;
    const book = await Book.findByPk(req.params.id);
    await book.update({ title, author, genre, year });
    console.log('redirecting to /books');
    res.redirect('/books');
  });
*/


app.post('/books/:id', async function(req, res, next) {
  const { title, author, genre, year } = req.body;
  const book = await Book.findByPk(req.params.id);

  if (!book) {
    const error = new Error('Book not found');
    error.status = 404;
    return next(error);
  }

  try {
    await book.update({
      title,
      author,
      genre,
      year,
    });

    res.redirect('/books');
  } catch (error) {
    if (
      error.name === 'SequelizeValidationError' ||
      error.name === 'SequelizeUniqueConstraintError'
    ) {
      const errors = error.errors.map((err) => err.message);

      res.render('update-book', {
        title: 'Update Book',
        book,
        errors,
      });
    } else {
      throw error;
    }
  }
});



/* Update-book Page delete button*/
app.post('/books/:id/delete', async function(req, res, next) {
  const book = await Book.findByPk(req.params.id);
  if (!book) {
    return res.status(404).send('Book not found');
  }
  try {
    await book.destroy();
    //res.send('Book deleted successfully');
    res.redirect('/books');
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



//const port = process.env.PORT || 3000;
//app.listen(port, () => console.log(`Server running on port ${port}`));

module.exports = app;

const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
  return users.some((user) => user.username === username);
};

const getAllBooks = () => {
  return books;
};

// Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.status(404).json({ message: "Missing username or password" });
    } else if (doesExist(username)) {
      return res.status(404).json({ message: "user already exists." });
    } else {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered.  Please login." });
    }
  });

  // Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).json({ books: books });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
      return res.status(200).json(book);
  } else {
      return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const booksByAuthor = Object.values(books).filter(book => book.author === author);

  if (booksByAuthor.length > 0) {
      return res.status(200).json({ books: booksByAuthor });
  } else {
      return res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const booksByTitle = Object.values(books).filter(book => book.title === title);

  if (booksByTitle.length > 0) {
      return res.status(200).json({ books: booksByTitle });
  } else {
      return res.status(404).json({ message: "No books found with this title" });
  }
});

/* Get the book list available in the shop
public_users.get("/", async (req, res) => {
  try {
    const allBooks = await getAllBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (e) {
    res.status(500).send(e);
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
    const targetISBN = parseInt(req.params.isbn);
    const targetBook = await books[targetISBN];
    if (!targetBook) {
      return res.status(404).json({ message: "ISBN not found." });
    } else {
      return res.status(200).json(targetBook);
    }
  });
  
  // Get book details based on author
  public_users.get("/author/:author", async (req, res) => {
    // get array of matching book objects
    const matchingBooks = Object.values(await books).filter(
      (book) => book.author.toLowerCase() === req.params.author.toLowerCase()
    );
    if (matchingBooks.length > 0) {
      return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    } else {
      return res.status(404).json({ message: "No books by that author." });
    }
  });
  
  // Get all books based on title
  public_users.get("/title/:title", async (req, res) => {
    const matchingTitle = Object.values(await books).filter(
      (book) => book.title.toLowerCase() === req.params.title.toLowerCase()
    )[0];
    if (matchingTitle) {
      return res.status(200).json(matchingTitle);
    } else {
      return res.status(404).json({ message: "Title not found." });
    }
  }); */

// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book && book.reviews) {
        return res.status(200).json({ reviews: book.reviews });
    } else {
        return res.status(404).json({ message: "No reviews found for this book" });
    }
});

module.exports.general = public_users;

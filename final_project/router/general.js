const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const{username, password} = req.body;
  if(username && password){
    const findExistingUser = users.filter((user)=> user.username == username);
    if(findExistingUser.length > 0) res.status(409).send(JSON.stringify({message: 'Username already esists'}, null, 4))
    else{
        try{
            users.push({username: username, password: password});
            res.status(200).send(JSON.stringify({message: 'Registration successfull!'}, null, 4));
        }
        catch(err){
            res.status(400).send(JSON.stringify({message: 'Failed to create'}))
        }
}
  }
  else{
    res.status(400).send(JSON.stringify({message: 'Request could not be processed!'}))
  }
})

// Get the book list available in the shop
public_users.get('/', (req, res)=>{
        return new Promise((resolve, reject) => {
            if (books) {
                resolve(books);
            } else {
                reject(new Error('No books available'));
            }
        })
        .then(books => {
            if (books.length > 0) {
                res.status(200).send(JSON.stringify({ books }, null, 4));
            } else {
                res.status(404).send(JSON.stringify({ message: 'Books not found' }, null, 4));
            }
        })
        .catch(err => {
            res.status(500).send(JSON.stringify({ message: 'Internal server error', error: err.message }, null, 4));
        });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
     new Promise((resolve, reject) => {
        let bookByIsbn = null;
        for (let key in books) {
            if (books.hasOwnProperty(key)) {
                let book = books[key];
                if (book.hasOwnProperty('isbn') && book.isbn === isbn) {
                    bookByIsbn = book;
                    break; 
                }
            }
        }
        resolve(bookByIsbn);
    })
        .then(book => {
            if (book) {
                res.status(200).send(JSON.stringify({ book }, null, 4));
            } else {
                res.status(404).send(JSON.stringify({ message: 'Book with this ISBN was not found.' }, null, 4));
            }
        })
        .catch(err => {
            // Handle any unexpected errors
            res.status(500).send(JSON.stringify({ message: 'Internal server error', error: err.message }, null, 4));
        });
});


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    new Promise((resolve, reject) => {
        let booksByAuthor = [];

        for (let key in books) {
            if (books.hasOwnProperty(key)) {
                let book = books[key];
                if (book.hasOwnProperty('author') && book.author === author) {
                    booksByAuthor.push(book);
                }
            }
        }
        resolve(booksByAuthor);
    })
        .then(booksByAuthor => {
            if (booksByAuthor.length > 0) {
                res.status(200).send(JSON.stringify({ booksByAuthor }, null, 4));
            } else {
                res.status(404).send(JSON.stringify({ message: 'No books found by this author.' }, null, 4));
            }
        })
        .catch(err => {
            // Handle any unexpected errors
            res.status(500).send(JSON.stringify({ message: 'Internal server error', error: err.message }, null, 4));
        });
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    new Promise((resolve, reject) => {
        let foundBook = null;

        for (let key in books) {
            if (books.hasOwnProperty(key)) {
                let book = books[key];
                if (book.hasOwnProperty('title') && book.title === title) {
                    foundBook = book;
                    break;
                }
            }
        }
        resolve(foundBook);
    })
        .then(foundBook => {
            if (foundBook) {
                res.status(200).send(JSON.stringify({ foundBook }, null, 4));
            } else {
                res.status(404).send(JSON.stringify({ message: 'Book with this title was not found.' }, null, 4));
            }
        })
        .catch(err => {
            res.status(500).send(JSON.stringify({ message: 'Internal server error', error: err.message }, null, 4));
        });
});




//  Get book review
public_users.get('/review/:isbn',function (req, res) {
        const isbn = req.params.isbn;
        let bookReviews = [];
        
        for (let key in books) {
          if (books.hasOwnProperty(key)) {
            let book = books[key];
            
            if (book.hasOwnProperty('isbn') && book.isbn === isbn) {
              bookReviews.push(book.reviews)
            }
          }
        }
      
        if (bookReviews.length > 0) {
          res.status(200).send(JSON.stringify({bookReviews}, null, 4));
        } else {
          res.status(404).send({ message: 'Book with this ISBN has no reviews.' });
        }
});

module.exports.general = public_users;

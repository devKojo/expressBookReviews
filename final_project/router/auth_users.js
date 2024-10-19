const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const secret = '2593d997caadb20382531ade1a8296b9d79b664978190cc8cd550720335c2bb2bbfb92b2cbf33eb48000e8d552e56ccf2145acde829e04ce9d2feaf8191fcccd';
const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
const findUser = users.find((item)=> (item.username == username) && (item.password == password));
    return findUser;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const algorithm = { algorithm: 'RS256' };
    const{username, password} = req.body;
    const result = {user: authenticatedUser(username, password)}.user;
    if(result.username){
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            data: {user: result.username, email: ''},
            algorithm,
          }, secret);
          if(token) res.status(200).send(JSON.stringify({message: 'Login successful!', token: token}, null, 4))
          else res.status(401).send(JSON.stringify({message: 'Authentication failed'}, null, 4))
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review, token } = req.body;

    try {
        const decodedToken = jwt.verify(token, secret);
        const { username } = decodedToken;

        if (!username) {
            return res.status(401).send(JSON.stringify({ message: "User not authenticated."}, null, 4));
        }

        if (!review) {
            return res.status(400).send(JSON.stringify({ message: "Review content is required."}, null, 4));
        }

        const book = Object.values(books).find(book => book.isbn === isbn);
        if (!book) {
            return res.status(404).send({ message: "Book not found." });
        }

        book.reviews[username] = review;
        const action = book.reviews[username] ? "updated" : "added";
        return res.status(200).send(JSON.stringify({ message: `Review ${action} successfully!`, reviews: book.reviews }, null, 4));
    } catch (err) {
        return res.status(401).send(JSON.stringify({ message: "Invalid token." }, null, 4));
    }
});

//Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { token } = req.body;

    try {
        const decodedToken = jwt.verify(token, secret);
        const { username } = decodedToken;

        if (!username) {
            return res.status(401).send(JSON.stringify({ message: "User not authenticated." }, null, 4));
        }

        const book = Object.values(books).find(book => book.isbn === isbn);

        if (!book) {
            return res.status(404).send(JSON.stringify({ message: "Book not found." }, null, 4));
        }

        if (!book.reviews[username]) {
            return res.status(404).send(JSON.stringify({ message: "Review not found for this user." }, null, 4));
        }

        delete book.reviews[username];

        return res.status(200).send(JSON.stringify({ message: "Review deleted successfully!", reviews: book.reviews }, null, 4));
    } catch (err) {
        return res.status(401).send(JSON.stringify({ message: "Invalid token." }, null, 4));
    }
});


  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

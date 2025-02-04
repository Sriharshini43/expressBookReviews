const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// User login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const accessToken = jwt.sign({ username }, "secretkey", { expiresIn: "1h" });
    return res.status(200).json({ message: "Login successful", accessToken });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
        const decoded = jwt.verify(token.split(" ")[1], "secretkey");
        const username = decoded.username;
        
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }
        
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }
        
        books[isbn].reviews[username] = review;
        return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
        const decoded = jwt.verify(token.split(" ")[1], "secretkey");
        const username = decoded.username;
        
        if (!books[isbn] || !books[isbn].reviews || !books[isbn].reviews[username]) {
            return res.status(404).json({ message: "Review not found" });
        }
        
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

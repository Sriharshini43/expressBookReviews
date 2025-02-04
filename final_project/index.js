const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session setup
app.use(session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Temporary users list
let users = [];

// Utility function to check if username exists
const doesExist = (username) => {
    return users.some(user => user.username === username);
};

// Utility function to authenticate user credentials
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Register a new user
app.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (doesExist(username)) {
        return res.status(400).json({ message: "User already exists!" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User successfully registered. Now you can login." });
});

// Login endpoint
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid login. Check username and password." });
    }

    let accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });

    req.session.authorization = { accessToken, username };

    return res.status(200).json({ message: "User successfully logged in", accessToken });
});

// Middleware to protect /customer/auth/* routes
app.use("/customer/auth/*", (req, res, next) => {
    if (!req.session.authorization) {
        return res.status(403).json({ message: "User not logged in" });
    }

    let token = req.session.authorization.accessToken;
    
    jwt.verify(token, "access", (err, user) => {
        if (err) {
            return res.status(403).json({ message: "User not authenticated" });
        }
        req.user = user;
        next();
    });
});

const PORT = 3000;
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

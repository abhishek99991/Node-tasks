const express = require("express");

const app = express();

// Custom middleware
function addUser(req, res, next) {
  req.user = "Guest";
  next();
}

// Apply middleware to /welcome
app.get("/welcome", addUser, (req, res) => {
  res.send(`<h1>Welcome, ${req.user}!</h1>`);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

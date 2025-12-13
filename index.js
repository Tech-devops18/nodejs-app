const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Node.js app deployed using Jenkins Pipeline');
});

app.listen(3000, () => {
  console.log('App running on port 3000');
});

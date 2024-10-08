const express = require("express");
const app = express();
const userRoutes = require('./routes/userRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
userRoutes(app);

const port = 3000 || process.env.PORT;


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

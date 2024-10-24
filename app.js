const express = require("express");
const app = express();
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const botRoutes =  require('./routes/botRoutes');
const fileRoutes = require('./routes/fileRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
userRoutes(app);
chatRoutes(app);
botRoutes(app);
fileRoutes(app);

const port = 3000 || process.env.PORT;


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

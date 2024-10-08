const mongoClient = require("../utils/db");
const Bot = require("./bots");
const bcrypt = require("bcrypt");

//create the user schema
const userSchema = new mongoClient.client.Schema({
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  bots: [
    {
      type: mongoClient.client.Schema.Types.ObjectId,
      ref: "Bot",
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (!this.isModified(password)) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoClient.client.model("User", userSchema);
module.exports = User;

const mongoose = require("mongoose");

const env = require("dotenv");

env.config({ path: "./config.env" });

const app = require("./app");

const db = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Connection Succesful");
  });
// .catch((err) => console.err(err));
const port = process.env.PORT;
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`App Runing on Port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log("Unhandled Rejection! SHUTTING DOWN");
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.log("Unhandled Exception ! SHUTTING DOWN");
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message, err.stack);
  console.log("Uncaught Exception!. Shouting down...");
  process.exit(1);
});

const port = process.env.PORT || 3000;

//Database Connection
const DB = process.env.DATABASE;
mongoose.set("strictQuery", false);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connected successfully!");
  })
  .catch((error) => {
    console.log("Not connected to the database!!", error.message);
  });

//Server Connection
const server = app.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled Rejection!. Shouting down...");
  server.close(() => {
    process.exit(1);
  });
});

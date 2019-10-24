require("dotenv").config();
const express = require("express");
const session = require("express-session");
const massive = require("massive");
const { CONNECTION_STRING, SESSION_SECRET } = process.env;
const authCtrl = require("./controllers/authController");
const treasureCtrl = require("./controllers/treasureController");

const app = express();

const PORT = 4000;

massive(CONNECTION_STRING).then(dbInstance => {
  app.set("db", dbInstance);
});

app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET
  })
);

app.use(express.json());

app.post("/auth/register", authCtrl.register);
app.post("/auth/login", authCtrl.login);
app.get("/auth/logout", authCtrl.logout);

app.listen(PORT, () => console.log(`app is listening on port: ${PORT}`));

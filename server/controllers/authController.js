const bcrypt = require("bcrypt");

module.exports = {
  register: async (req, res) => {
    const { username, password, isAdmin } = req.body;
    const db = await req.app.get("db");
    const result = await db.get_user(username);
    //Get the database instance and run the sql file get_user, passing in username.
    //This query will check the database to see if the username is already taken.
    // Since this query is asynchronous, make sure to use the await keyword to ensure
    //that the promise resolves before the rest of the code executes.
    const existingUser = await result[0];

    if (existingUser) {
      res.status(409).json("Username taken");
    } else {
      const salt = await bcrypt.genSaltSync(10);
      const hash = await bcrypt.hash(password, salt);
      const registeredUser = await db.register_user(isAdmin, username, hash);
      const user = await registeredUser[0];

      req.session.user = {
        isAdmin: user.is_admin,
        id: user.id,
        username: user.username
      };
      res.status(201).send(user);
    }
  },

  login: async (req, res) => {
    const { username, password } = req.body;
    const db = req.app.get("db");
    const foundUser = await db.get_user(username);
    const user = foundUser[0];

    if (!user) {
      return res.status(401).json("User not found");
    }
    const isAuthenticated = bcrypt.compareSync(password, user.hash);
    if (!isAuthenticated) {
      return res.status(403).send("incorrect password");
    }
    req.session.user = {
      isAdmin: user.is_admin,
      id: user.id,
      username: user.username
    };
    return res.send(req.session.user);
  },

  logout: async (req, res) => {
    req.session.destroy();
    return res.sendStatus(200);
  }
};

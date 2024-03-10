require("dotenv").config();

const express = require("express");
app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");

const helpFuncs = require("./helpFunc");

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//for JWT
//переменые для хранение хэдэров карэнтюзера и токона(в идиале переделать)
let user;
let refreshTokens = [];
//переменые для хранение хэдэров карэнтюзера и токона(в идиале переделать)

let users = [{ username: "gg", password: "gg" }];

//create

app.post("/create", (req, res) => {
  const { username, password, flag } = req.body;
  user = users.find((u) => u.username == username);

  if (!flag) {
    if (user.username == username)
      res.send({ mass: "user already created", alrdCreate: true });
    else {
      users.push({ username: username, password: password });

      console.log(users);
      res.send({ mass: "new user logged" });
    }
  } else {
    if (user == undefined)
      res.send({ mass: "user dont exist", donExist: true });
    else {
      user.password = password;
      // console.log(username);
      res.send({ mass: "new password setted" });
    }
  }
});

//create

  //обработка аксестокена
  app.post("/posts", helpFuncs.authenticateToken, (req, res) => {
    res.json({ success: true });
  });

  //создание токенов
  app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "" || password === "") {
      res.json({ mass: "Username or password incorrect", status: false });
    }
    user = users.find((u) => {
      return u.username === username && u.password === password;
    });

    if (user) {
      const accessToken = helpFuncs.generateAccessToken(user);
      const refreshToken = jwt.sign(
        { username: user.username },
        process.env.REFRESH_TOKEN_SECRET
      );
      refreshTokens.push(refreshToken);

      res.json({
        accessToken: accessToken,
        refreshToken: refreshToken,
        status: true,
      });
    } else {
      res.json({ mass: "Username or password incorrect", status: false });
    }
  });
  //создание токенов

  app.post("/token", (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null || undefined) return res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err) => {
      if (err) return res.sendStatus(403);
      const accessToken = helpFuncs.generateAccessToken(user);
      //console.log('creating new atoken');
      res.json({ accessToken: accessToken });
    });
  });

//for JWT

//for basket and else
let basket = [];
let sumOfProducts = 0;

app.get("/basket", (req, res) => {
  //basket
  sumOfProducts = 0;

  for (let i = 0; i < basket.length; i++) {
    sumOfProducts += basket[i].price; //default
  }

  res.json({ basket: basket, sum: sumOfProducts });
});

app.post("/basket", (req, res) => {
  const { product, price } = req.body;
  basket.push(product); //added new dish into basket
  res.json(basket);
});

app.post("/delete", (req, res) => {
  let delObj = req.body; //name of deleted object
  console.log(delObj);

  for (let i = 0; i < basket.length; i++) {
    if (basket[i].name === delObj.product.name) {
      sumOfProducts = sumOfProducts - basket[i].price;
      console.log(`sum=${sumOfProducts}`);
      basket.splice(i, 1);
    }
  }

  res.json(`deleted object ---${delObj.product.name}`);
});

app.post("/buy", (req, res) => {
  //result of transaction
  const { balance } = req.body;
  let tsum = sumOfProducts; //to properly send data to front;

  if (balance >= sumOfProducts && basket != []) {
    basket = [];
    sumOfProducts = 0; //full reset main values for next cycle
    res.json({ success: true, sum: tsum, basket: basket });
  } else if (balance <= sumOfProducts) {
    res.json({ success: false });
  }
});

app.listen(3001);

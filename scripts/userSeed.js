const mongoose = require("mongoose");
const db = require("../models");
mongoose.Promise = global.Promise;
const bcrypt = require('bcryptjs');

const pw = bcrypt.hashSync("1234", bcrypt.genSaltSync(10), null);
const pw2 = bcrypt.hashSync("1111", bcrypt.genSaltSync(10), null);

// This file empties the User collection and inserts the users below

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost/vandelay_rental"
);

const userSeed = [
  {
    username: "Strangebrewer",
    password: pw,
    pwChangeAttempts: 0,
    firstName: "Keith",
    lastName: "Allmon",
    email: "BKAShambala@gmail.com",
    street: "830 N, 500 W, Apt #132",
    city: "Bountiful",
    state: "UT",
    zipcode: 84010,
    phone: "8018666301",
    waivers: [],
    reservations: [],
    registrations: [],
    pastRentals: [],
    admin: true,
    dev: true

  },
  {
    username: "bmorin",
    password: pw2,
    pwChangeAttempts: 0,
    firstName: "Brandon",
    lastName: "hdah",
    email: "brandonmorin@gmail.com",
    street: "5700 Ferron Dr",
    city: "Taylorsville",
    state: "UT",
    zipcode: 84129,
    phone: "8018243638",
    waivers: [],
    reservations: [],
    registrations: [],
    pastRentals: [],
    admin: true,
    dev: true
  },
  {
    username: "ben",
    password: pw,
    pwChangeAttempts: 0,
    firstName: "Ben",
    lastName: "Caler",
    email: "b.wayne@me.com",
    street: "The Place to Be",
    city: "Lehi",
    state: "UT",
    zipcode: 84043,
    phone: "8013693718",
    waivers: [],
    reservations: [],
    registrations: [],
    pastRentals: [],
    admin: true,
    dev: true
  },
  {
    username: "Nicknard",
    firstName: "Joe",
    lastName: "Dirt",
    pwChangeAttempts: 0,
    email: "Dood@gmail.com",
    street: "123 Home St",
    city: "Bountiful",
    state: "UT",
    zipcode: 84010,
    phone: "1234567890",
    waivers: [],
    reservations: [],
    registrations: [],
    pastRentals: [],
    admin: true,
    dev: true
  },
  {
    username: "Doofy",
    password: pw,
    pwChangeAttempts: 0,
    firstName: "Mr",
    lastName: "Sillyface",
    email: "Why@gmail.com",
    street: "123 Home St",
    city: "Bountiful",
    state: "UT",
    zipcode: 84010,
    phone: "6788991254",
    waivers: [],
    reservations: [],
    registrations: [],
    pastRentals: [],
    admin: true,
    dev: false
  },
  {
    username: "Corbster",
    password: pw,
    pwChangeAttempts: 0,
    firstName: "Yo",
    lastName: "Goofball",
    email: "isthatyou@gmail.com",
    street: "123 Home St",
    city: "Nowheresville",
    state: "UT",
    zipcode: 84999,
    phone: "1230987654",
    waivers: [],
    reservations: [],
    registrations: [],
    pastRentals: [],
    admin: true,
    dev: true
  }
]

db.User
  .remove({})
  .then(() => db.User.collection.insertMany(userSeed))
  .then(data => {
    let cartArray = [];
    for (let i = 0; i < data.ops.length; i++) {
      const element = data.insertedIds[i];
      const cartObject = {
        customerId: element,
        tempReservations: [],
        tempRegistrations: []
      };
      cartArray.push(cartObject);
    }
    db.ShoppingCart.collection.insertMany(cartArray)
      .then(() => {
        console.log(data.insertedCount + " records inserted!");
        process.exit(0);
      });
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
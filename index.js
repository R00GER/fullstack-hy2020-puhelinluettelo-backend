const express = require("express");
const app = express();
const mongoose = require("mongoose");

require("dotenv").config();

const morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");
const { response } = require("express");

app.use(express.static("build"));
app.use(express.json());
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :new-person"
  )
);

app.use(cors());

morgan.token("new-person", (req, res) => {
  return JSON.stringify(req.body);
});

app.get("/api/persons", (req, res) => {
  Person.find().then((returnedPersons) => {
    res.json(returnedPersons);
  });
});

app.get("/info", (req, res) => {
  const date = new Date();

  Person.find()
    .then((result) => {
      res.send(
        `<p>Phonebook has info for ${result.length} people</p>
      <p>${date}</p>`
      );
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) res.json(person);
      else res.status(404).end();
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;
  const id = req.params.id;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(id, person, { new: true })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findByIdAndRemove(id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons/", (req, res, next) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "content missing",
    });
  }

  const generateID = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
  };

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => savedPerson.toJSON())
    .then((savedAndFormattedPerson) => {
      res.json(savedAndFormattedPerson);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (req, res) => {
  res.status(404).json({ error: "Unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (err, req, res, next) => {
  console.log(err.name);
  if (err.name === "CastError") {
    return res.status(400).json({ error: "malformatted id" });
  } else if (err.name === "ValidationError") {
    return res
      .status(400)
      .json({error: err.message});
  }

  next(err);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
const url = process.env.MONGODB_URI;

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(url);
    console.log("Connected to database");
  })
  .catch((error) => {
    console.log("error connecting to database:", error.message);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

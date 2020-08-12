const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :new-person"
  )
);

app.use(cors());
app.use(express.static('build'))

let persons = [];

morgan.token("new-person", (req, res) => {
  return JSON.stringify(req.body);
});

app.get("/api/persons", (req, res) => {
  const person = req.body;
  persons.concat(person);
  res.json(persons);
});

app.get("/info", (req, res) => {
  const personsTotal = persons.length;
  const date = new Date();

  res.send(
    `<p>Phonebook has info for ${personsTotal} people</p>
    <p>${date}</p>`
  );
});

app.get("/api/persons/:id", (req, res) => {
  const id = +req.params.id;
  const person = persons.find((person) => person.id === id);

  if (person) res.json(person);
  else res.status(404).end();
});

app.delete("/api/persons/:id", (req, res) => {
  const id = +req.params.id;
  persons = persons.filter((person) => person.id !== id);
  res.status(204).end();
});

app.post("/api/persons/", (req, res) => {
  const person = req.body;

  const generateID = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
  };

  if (req.body.name === "" || req.body.number === "") {
    return res.status(400).json({
      error: "content missing",
    });
  }

  const newPerson = {
    name: req.body.name,
    number: req.body.number,
    id: generateID(1000),
  };

  persons = persons.concat(newPerson);

  res.json(newPerson);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

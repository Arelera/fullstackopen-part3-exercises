const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
// adds the frontend aswell somehow, checks build files index file. kinca crazy
app.use(express.static('build'));
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      req.body ? JSON.stringify(req.body) : null,
    ].join(' ');
  })
);

let persons = [
  {
    id: 1,
    name: 'Bob',
    number: '1423534-246-234',
  },
  {
    id: 2,
    name: 'Mane',
    number: '3452-363756-123',
  },
  {
    id: 3,
    name: 'Jay',
    number: '',
  },
];

app.get('/info', (req, res) => {
  res.send(`
    <p>Phonebook has info for ${persons.length} people.</p>
    <p>${new Date()}</p>
  `);
});

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const wantedPerson = persons.find((person) => person.id === id);
  res.json(wantedPerson);
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);
  res.status(204).end();
});

app.post('/api/persons', (req, res) => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((p) => p.id)) : 0;

  if (!req.body.name) {
    return res.status(400).json({
      error: 'name missing',
    });
  } else if (persons.map((p) => p.name).includes(req.body.name)) {
    return res.status(400).json({
      error: 'name must be unique',
    });
  }

  const person = { ...req.body, id: maxId + 1 };
  persons.push(person);
  res.send();
});

app.put('/api/persons/:id', (req, res) => {
  const id = req.params.id;

  persons = persons.filter((person) => person.id !== id);
  res.send();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// the app was not bad but some stuff is broken now, especially on frontend
// for example, if a new or updated user fails validation,
// it's still added to the fronted state.

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const Person = require('./models/person');
const { Mongoose } = require('mongoose');
const { response } = require('express');

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

// let persons = [
//   {
//     id: 1,
//     name: 'Bob',
//     number: '1423534-246-234',
//   },
//   {
//     id: 2,
//     name: 'Mane',
//     number: '3452-363756-123',
//   },
//   {
//     id: 3,
//     name: 'Jay',
//     number: '555-111-2222',
//   },
// ];

app.get('/info', (req, res) => {
  res.send(`
    <p>Phonebook has info for ${persons.length} people.</p>
    <p>${new Date()}</p>
  `);
});

app.get('/api/persons', (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      next(error);
    });
});

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;
  Person.findByIdAndDelete(id)
    .then((result) => {
      res.status(204).send();
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });

  // persons = persons.filter((person) => person.id !== id);
  // res.status(204).end();
});

// const malformatteddIdHandler = (error, req, res, next) => {
//   console.log(error.message);

//   if (error.name === 'CastError') {
//     return response.status(400).send();
//   }

//   next(error);
// };

// app.use(malformatteddIdHandler);

app.post('/api/persons', (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({
      error: 'name missing',
    });
  }
  // TODO: disallow adding of same name people
  const newPerson = new Person(req.body);

  newPerson.save().then((result) => {
    console.log('Person saved', result);
  });
});

app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;
  const newPerson = { id, ...req.body };
  Person.findByIdAndUpdate(id, newPerson, {
    new: true,
    useFindAndModify: true,
    runValidators: true,
  })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
  res.status(500).send();

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

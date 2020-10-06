require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.DB_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

if (!process.env[3]) {
  console.log('inside < 4');
  Person.find({}).then((res) => {
    console.log(res);
    mongoose.connection.close();
  });
} else {
  const newPerson = new Person({
    name: process.argv[2],
    number: process.argv[3],
  });

  newPerson.save().then((res) => {
    console.log('Person saved!');
    console.log('result: ', res);
    mongoose.connection.close();
  });
  console.log('notok');
}
console.log('ok');

const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://thatodice:${password}@cluster0.1agzy.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set('strictQuery', false);

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 3) {
  // Display all entries in the phonebook
  Person.find({}).then(result => {
    console.log("Phonebook:");
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  }).catch(error => {
    console.error("Error fetching phonebook entries:", error);
    mongoose.connection.close();
    process.exit(1);
  });
} else if (process.argv.length === 5) {
  // Add a new entry to the phonebook
  const name = process.argv[3];
  const number = process.argv[4];

  const person = new Person({
    name: name,
    number: number,
  });

  person.save().then(result => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  }).catch(error => {
    console.error("Error adding person:", error);
    mongoose.connection.close();
    process.exit(1);
  });
} else if (process.argv.length > 5) {
  console.log('too many arguments');
  mongoose.connection.close();
  process.exit(1);
} else {
  console.log('give name and number as arguments when adding a person');
  mongoose.connection.close();
  process.exit(1);
}
require('dotenv').config();
const Person = require('./models/person');
const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(express.json());

app.use(express.static('dist'));

morgan.token('postData', (req) => {
    if (req.method === 'POST') {
      return JSON.stringify(req.body)
    }
    return '';
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'));



app.get('/', (request, response) => {
    response.send('<h1>Phone book!</h1>')
  });
  
app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        response.json(result)
      })
  });

  app.get('/info', async (request, response) => {
    const requestTime = new Date();
    
    try {
      const phonebookinfo = await countPeople();
      console.log("testcount value:", phonebookinfo); // Add this line
      if (typeof phonebookinfo === 'undefined') {
        console.error("testcount is undefined before response");
      }
  
      response.send(`
        <p>Phonebook has info for ${phonebookinfo} people</p>
        <p>${requestTime}</p>
      `);
    } catch (error) {
      console.error("Error in /info:", error);
      response.status(500).send("Internal Server Error");
    }
  });
  
  async function countPeople() {
    try {
      const count = await Person.countDocuments({});
      console.log(`Number of people in the database: ${count}`);
      return count;
    } catch (error) {
      console.error('Error counting people:', error);
      return 0; // Or throw an error, or return a default value
    }
  }

  app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
      response.json(person)
    })
  });

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    person = persons.filter(person => person.id !== id)
  
    response.status(204).end()
  });

  app.post('/api/persons', (request, response) => {
    const body = request.body
  
    if (!body.name || !body.number) {
      return response.status(400).json({ error: 'content missing' })
    }
  
    const person = new Person({
      name: body.name,
      number: body.number,
    })
  
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
  })

  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  app.use(unknownEndpoint);
  
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  });
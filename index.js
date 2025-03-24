require('dotenv').config()
const Person = require('./models/person')
const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())

app.use(express.static('dist'))

morgan.token('postData', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'))


//Default route
app.get('/', (request, response) => {
  response.send('<h1>Phone book!</h1>')
})
  
// Get all phonebook entries
app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => {
    response.json(result)
  })
})

//Get info about phonebook
app.get('/info', async (request, response) => {
  const requestTime = new Date()
    
  try {
    const phonebookinfo = await countPeople()
    console.log('testcount value:', phonebookinfo) 
    if (typeof phonebookinfo === 'undefined') {
      console.error('phonebookinfo is undefined before response')
    }
  
    response.send(`
        <p>Phonebook has info for ${phonebookinfo} people</p>
        <p>${requestTime}</p>
      `)
  } catch (error) {
    console.error('Error in /info:', error)
    response.status(500).send('Internal Server Error')
  }
})
  
//function for Counting the number of entries
async function countPeople() {
  try {
    const count = await Person.countDocuments({})
    console.log(`Number of people in the database: ${count}`)
    return count
  } catch (error) {
    console.error('Error counting people:', error)
    return 0 // Or throw an error, or return a default value
  }
};

//Get a specific entry
app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})


//Delete an entry
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end(result)
    })
    .catch(error => next(error))
})

//Create an entry
app.post('/api/persons', (request, response, next) => {
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
    .catch(error => next(error))
})

//Update an entry
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  
  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      if (!updatedPerson) {
        return response.status(404).json({ error: 'Person not found' })
      }
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
  
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  
  next(error)
}
  
// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

  
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
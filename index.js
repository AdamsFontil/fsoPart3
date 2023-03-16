// console.log('Hello backend')

// const http = require('http')
require('dotenv').config()
const Person = require('./models/person')

const express = require('express')
const morgan = require('morgan');
const app = express()
const cors = require('cors')



const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }

  morgan.token('body', (req, res) => JSON.stringify(req.body));

  const testConfig = ':method :url :status :res[content-length] - :response-time ms :body';

  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }


  const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    }

    next(error)
  }


app.use(express.json())
app.use(requestLogger)
app.use(express.static('build'))
// app.use(morgan('tiny'));
app.use(morgan(testConfig));
app.use(cors())


app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  // response.json(persons)
  console.log('test get all')
  console.log('person',Person)
  Person.find({}).then(persons => {
    response.json(persons)
    console.log('persons',persons)
  })


})

app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
      response.send(`Phonebook has info on ${persons.length} people<br>${new Date()}`);

    })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})


app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      console.log(result)
      response.status(204).end()
    })
    .catch(error => next(error))
})


app.post('/api/persons', async (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  const existingPerson = await Person.findOne({ name: body.name })

  if (existingPerson) {
    console.log('Name already exists in the database')
    console.log(existingPerson)
    const updatedPerson = await Person.findOneAndUpdate(
      { name: body.name },
      { number: body.number },
      { new: true }
    )
    response.json(updatedPerson)
  } else {
    const person = new Person({
      name: body.name,
      number: body.number
    })

    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
  }
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})



  app.use(unknownEndpoint)

  // this has to be the last loaded middleware.
  app.use(errorHandler)


const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

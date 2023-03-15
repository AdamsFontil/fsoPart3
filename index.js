// console.log('Hello backend')

// const http = require('http')
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


app.use(express.json())
app.use(requestLogger)
app.use(express.static('build'))
// app.use(morgan('tiny'));
app.use(morgan(testConfig));
app.use(cors())

let persons = [
    {
      "id": 1,
      "name": "Arto Hellas",
      "number": "040-123456"
    },
    {
      "id": 2,
      "name": "Ada Lovelace",
      "number": "39-44-5323523"
    },
    {
      "id": 3,
      "name": "Dan Abramov",
      "number": "12-43-234345"
    },
    {
      "id": 4,
      "name": "Mary Poppendieck",
      "number": "39-23-6423122"
    }
]


app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
  console.log('test get all')


})

app.get('/info', (request, response) => {
    console.log(persons.length)
    response.send(`Phonebook has info on ${persons.length} people<br>${new Date()}`);
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => {
      console.log(person.id, typeof person.id, id, typeof id, person.id === id)
      return person.id === id
    })
    if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
  })


  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
  })


  const generateId = () => {
    let newId = Math.floor(Math.random() * 1000)
    if (persons.some(p => p.id === newId)) {
      newId = generateId()
    } else {
      return newId
    }
  }


  app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log('test post')

    if (!body.name || !body.number) {
      return response.status(400).json({
        error: 'name or number missing'
      })
    }
    const duplicate = persons.find(person => person.name === body.name)

    if (duplicate) {
    console.log('Name already exists in the array')
    console.log(duplicate)
    return response.status(400).json({
        error: 'name must be unique'
    })
    }

    const person = {
      id: generateId(),
      name: body.name,
      number: body.number,

    }

    persons = persons.concat(person)

    response.json(person)
  })




  app.use(unknownEndpoint)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

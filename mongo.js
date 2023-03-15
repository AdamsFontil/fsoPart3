const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
`mongodb+srv://adamsfuntil:${password}@phonebookdb.43qtgwd.mongodb.net/?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name: name,
  number: number
})

if (process.argv.length<4) {
  console.log('everyone from db')
  // Person
  // .find({})
  // .then(persons=> {
  //   console.log('everyone from db')
  //   console.log(persons)
  //   mongoose.connection.close()
  // })
  Person
  .find({})
  .then(result => {
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })

} else {

person.save().then(result => {
  console.log(`added ${person.name} number ${person.number}`)
  console.log(result)
  mongoose.connection.close()
})

}

import express from 'express'
import { PORT } from './config.js'
import UserRepository from './user-repository.js'

const app = express()
app.use(express.json())
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await UserRepository.login({ username, password })
    res.send(user)
  } catch (error) {
    res.status(401).send(error.message)
  }
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body
  console.log(req.body)

  try {
    const id = await UserRepository.create({ username, password })
    res.send({ id })
  } catch (error) {
    res.status(400).send(error.message)
  }
})

app.post('/logout', (req, res) => {
  res.send('<h1>Logout</h1>')
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

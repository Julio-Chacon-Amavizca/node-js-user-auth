import express from 'express'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'

import { PORT, SECRET_JWT } from './config.js'
import UserRepository from './user-repository.js'

const app = express()

app.set('view engine', 'ejs')

app.use(express.json())
app.use(cookieParser())

app.use((req, res, next) => {
  const token = req.cookies.access_token
  let data = null
  req.session = { user: null }
  try {
    data = jwt.verify(token, SECRET_JWT)
    req.session.user = data
  } catch (error) { }

  next()
})

app.get('/', (req, res) => {
  const { user } = req.session
  res.render('index', user)
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await UserRepository.login({ username, password })
    const token = jwt.sign({ id: user._id, username: user.username }, SECRET_JWT, {
      expiresIn: '1h'
    })

    res
      .cookie('access_token', token, {
        httpOnly: true, // no se puede acceder desde el cliente
        secure: process.env.NODE_ENV === 'production', // solo se envía en HTTPS
        sameSite: 'strict', // solo se envía si la solicitud es en el mismo sitio
        maxAge: 1000 * 60 * 60 // 1 hora
      })
      .send({ user, token })
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
  res
    .clearCookie('access_token')
    .json({ message: 'Logged out' })
})

app.get('/protected', async (req, res) => {
  const { user } = req.session
  if (!user) {
    return res.status(401).send('Unauthorized')
  }
  res.render('protected', user)
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

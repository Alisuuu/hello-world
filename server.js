const path = require('path')
const express = require('express')
const axios = require('axios')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const apiKey = process.env.HB_API_KEY

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'))
})

let computer
app.get('/computer', async (req, res) => {
  if (computer) {
    res.send(computer)
    return
  }
  try {
    const resp = await axios.post('https://engine.hyperbeam.com/v0/vm', {}, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    })
    computer = resp.data
    res.send(computer)
  } catch (error) {
    console.error(error)
    res.status(500).send("Erro ao conectar à API da Hyperbeam")
  }
})

io.on('connection', socket => {
  console.log('Usuário conectado:', socket.id)

  socket.on('chat message', msg => {
    io.emit('chat message', msg)
  })

  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id)
  })
})

const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})

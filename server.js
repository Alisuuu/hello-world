const path = require('path')
const express = require('express')
const axios = require('axios')
const app = express()

// API Key Check
const apiKey = process.env.HB_API_KEY

if (!apiKey || apiKey === "") {
    console.error("API Key is not set, did you set the HB_API_KEY environment variable to your API key?")
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'))
})

// Get a cloud computer object. If no object exists, create it.
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

// Use a porta fornecida pelo Render, ou 8080 localmente
const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const express = require('express')
const app = new express()
const path = require('path')

app.use(express.static('public1'))

app.get('/', (request, response) => {
    response.sendFile(path.resolve(__dirname, 'pages/index.html'))
})

app.listen(4000, () => {
    console.log('App listening on port 4000')
})
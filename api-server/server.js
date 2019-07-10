import app from './app.js'

const port = process.env.PORT || 3333

app.server = app.listen(port, () => {
  console.log(`server running @ http://localhost:${port}`)
})

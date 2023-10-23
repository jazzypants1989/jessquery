import express from "express"

const app = express()
const PORT = 3000

let requestCounter = 0

app.use(express.static("tests"))

let firstRequestTime = null

app.get("/data", (req, res) => {
  requestCounter++

  // note the time at which the request was made
  firstRequestTime = firstRequestTime || new Date()
  console.log(
    `Request #${requestCounter} received at ${new Date().toLocaleTimeString()}, first request at ${firstRequestTime.toLocaleTimeString()}`
  )

  // Mock an error for the first 5 requests
  if (requestCounter <= 5) {
    res.status(500).send("Something went wrong!")
  } else {
    // note the difference in the response time
    const responseTime = new Date()
    res.send(
      `Request #${requestCounter} took ${
        Number(responseTime) - Number(firstRequestTime)
      } milliseconds`
    )
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

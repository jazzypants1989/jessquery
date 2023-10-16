import http from "http"

// const server = http.createServer((req, res) => {
//   // Allow requests from any origin
//   res.setHeader("Access-Control-Allow-Origin", "*")

//   // Set other CORS headers as needed
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type")

//   // Respond with the data
//   res.writeHead(200, { "Content-Type": "application/octet-stream" })

//   res.write("Hello World\n")

//   // Simulate streaming by sending chunks of data every 1 second
//   const intervalId = setInterval(() => {
//     res.write(`${new Date().toLocaleTimeString()}\n`)
//   }, 1000)

//   // End the stream and clear the interval after 5 seconds
//   setTimeout(() => {
//     clearInterval(intervalId)
//     res.end()
//   }, 5000)

//   // Clear the interval if the client disconnects before 5 seconds
//   res.on("close", () => clearInterval(intervalId))
// })

// server.listen(8080, () => {
//   console.log("Server is running on port 8080")
// })

const server = http.createServer((req, res) => {
  // Allow requests from any origin
  res.setHeader("Access-Control-Allow-Origin", "*")

  // Set other CORS headers as needed
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  // Check if the client requested SSE
  if (req.headers.accept && req.headers.accept === "text/event-stream") {
    // Set headers for SSE
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    })

    // Send an event every second
    const intervalId = setInterval(() => {
      res.write(
        `data: The server time is: ${new Date().toLocaleTimeString()}\n\n`
      )
    }, 1000)

    // Close the connection when the client disconnects
    req.on("close", () => {
      clearInterval(intervalId)
      res.end()
    })
  } else {
    // Handle other requests (e.g., API requests, static files, etc.)
    res.writeHead(404)
    res.end()
  }
})

server.listen(8080, () => {
  console.log("Server is running on port 8080")
})

import http from "http"

const port = 3000

const server = http.createServer((req, res) => {
  console.log(req.method)
  // Set CORS headers to allow requests from 'http://localhost:5500'
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5500")
  res.setHeader("Access-Control-Allow-Methods", "POST") // Adjust to your allowed methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type") // Adjust to your allowed headers

  if (req.method === "OPTIONS") {
    // Respond to preflight requests with a 200 OK status
    res.statusCode = 200
    res.end()
    return
  }

  if (req.method === "POST") {
    let requestData = ""

    req.on("data", (chunk) => {
      requestData += chunk
    })

    req.on("end", () => {
      console.log("Received data:")
      console.log(requestData)
      res.statusCode = 200
      res.end(
        requestData +
          "\n" +
          "JESSE IS THE BEST" +
          "\n" +
          new Date().toLocaleTimeString()
      )
    })
  } else {
    res.statusCode = 404
    res.end("Not Found")
  }
})

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

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

// const server = http.createServer((req, res) => {
//   // Allow requests from any origin
//   res.setHeader("Access-Control-Allow-Origin", "*")

//   // Set other CORS headers as needed
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type")

//   // Check if the client requested SSE
//   if (req.headers.accept && req.headers.accept === "text/event-stream") {
//     // Set headers for SSE
//     res.writeHead(200, {
//       "Content-Type": "text/event-stream",
//       "Cache-Control": "no-cache",
//       "Connection": "keep-alive",
//     })

//     // Send an event every second
//     const intervalId = setInterval(() => {
//       res.write(
//         `data: The server time is: ${new Date().toLocaleTimeString()}\n\n`
//       )
//     }, 1000)

//     // Close the connection when the client disconnects
//     req.on("close", () => {
//       clearInterval(intervalId)
//       res.end()
//     })
//   } else {
//     // Handle other requests (e.g., API requests, static files, etc.)
//     res.writeHead(404)
//     res.end()
//   }
// })

// server.listen(8080, () => {
//   console.log("Server is running on port 8080")
// })

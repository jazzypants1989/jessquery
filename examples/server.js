import http from "http"
import url from "url"

// // ** Submissions **

// const server = http.createServer((req, res) => {
//   console.log(req.method, req.url)

//   // Set CORS headers
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:5500")
//   res.setHeader("Access-Control-Allow-Methods", "POST")
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type")

//   if (req.method === "OPTIONS") {
//     res.statusCode = 200
//     res.end()
//     return
//   }

//   if (req.method === "POST") {
//     const queryParams = new url.URL(req.url, `http://${req.headers.host}`)
//       .searchParams

//     const delay = parseInt(queryParams.get("delay")) || 0

//     let requestData = ""

//     req.on("data", (chunk) => {
//       requestData += chunk
//     })

//     req.on("end", () => {
//       setTimeout(() => {
//         // Use setTimeout here
//         console.log("Received data:")
//         console.log(requestData)
//         res.statusCode = 200
//         res.end(
//           requestData +
//             "\n" +
//             "JESSE IS THE BEST" +
//             "\n" +
//             new Date().toLocaleTimeString()
//         )
//       }, delay) // Delay the response by the specified amount
//     })
//   } else {
//     res.statusCode = 404
//     res.end("Not Found")
//   }
// })

// server.listen(3000, () => {
//   console.log(`click here: http://localhost:3000`)
// })

// ** STREAMING **

const server = http.createServer((req, res) => {
  // Allow requests from any origin
  res.setHeader("Access-Control-Allow-Origin", "*")

  // Set other CORS headers as needed
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  // Respond with the data
  res.writeHead(200, { "Content-Type": "application/octet-stream" })

  res.write("<h1>hello</h1>")

  // Simulate streaming by sending chunks of data every 1 second
  const intervalId = setInterval(() => {
    res.write(`<p>${new Date().toLocaleTimeString()} \n</p>`)
    res.write(`<script>console.log("hello")</script>`)
  }, 1000)

  // End the stream and clear the interval after 5 seconds
  setTimeout(() => {
    clearInterval(intervalId)
    res.end()
  }, 5000)

  // Clear the interval if the client disconnects before 5 seconds
  res.on("close", () => clearInterval(intervalId))
})

server.listen(8080, () => {
  console.log("Server is running on port 8080")
})

// ** SERVER SENT EVENTS **

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

// // **RETRIES**
// let requestCounter = 0
// let firstRequestTime = null

// const server = http.createServer((req, res) => {
//   const parsedUrl = new url.URL(req.url, `http://${req.headers.host}`)

//   console.log(req.method, req.url)

//   // Set CORS headers
//   res.setHeader("Access-Control-Allow-Origin", "*")
//   res.setHeader("Access-Control-Allow-Methods", "GET")
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type")

//   if (req.method === "OPTIONS") {
//     res.statusCode = 200
//     res.end()
//     return
//   }

//   if (req.method === "GET" && parsedUrl.pathname === "/data") {
//     requestCounter++

//     // note the time at which the request was made
//     firstRequestTime = firstRequestTime || new Date()
//     console.log(
//       `Request #${requestCounter} received at ${new Date().toLocaleTimeString()}, first request at ${firstRequestTime.toLocaleTimeString()}`
//     )

//     // Mock an error for the first 5 requests
//     if (requestCounter <= 5) {
//       res.statusCode = 500
//       res.end("Something went wrong!")
//     } else {
//       // note the difference in the response time
//       const responseTime = new Date()
//       res.end(
//         `Request #${requestCounter} took ${
//           Number(responseTime) - Number(firstRequestTime)
//         } milliseconds`
//       )
//     }
//   } else {
//     res.statusCode = 404
//     res.end("Not Found")
//   }
// })

// server.listen(3000, () => {
//   console.log(`Server is running on http://localhost:${3000}`)
// })

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieparser = require("cookie-parser");
const { connectDB } = require("./config/db");
const { handleSocketConnection } = require("./utility/Socket.utility");

// connectDB();
const { Server } = require("socket.io");
const http = require("http");
var qs = require('qs')

const server = http.createServer(app);

// instantiate socket.io
const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: "http://localhost:3000", // ✅ frontend URL
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

handleSocketConnection(io);

const cors = require("cors");
const { verifyJWT } = require("./utility/AuthJWT.utility");

// make io globally accessible
app.set("io",io);
app.set('query parser', function (str) {
  return qs.parse(str, { /* custom options */ })
})
app.use(express.static('uploads'))
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);
app.use(cookieparser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/user", require("./routes/user.route"));
app.use("/api/posts", require("./routes/posts.route"));
app.use("/api/rooms", require("./routes/rooms.route"));
app.use("/api/notifications", require("./routes/notifications.route"));
app.use("/api/messages", require("./routes/messages.route"));
app.use("/api/comments", require("./routes/comments.route"))

server.listen(5000, () => {
  console.log(`Server is listening at: 5000`);
});

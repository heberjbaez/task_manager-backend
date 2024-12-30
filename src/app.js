const express = require("express")
const mongoose = require("mongoose")
const taskRoutes = require("./routes/task.routes")
const bodyParser = require("body-parser")
const cors = require("cors")

process.loadEnvFile()
const port = process.env.PORT || 3000

const app = express()

app.use(cors({ origin: "http://localhost:5173" }))
app.use(bodyParser.json())

mongoose.connect(process.env.MONGO_URL, { dbName: process.env.MONGO_DB_NAME })
const db = mongoose.connection

app.use("/tasks", taskRoutes)

app.listen(port, () => {
    console.log("Port:", port)
})
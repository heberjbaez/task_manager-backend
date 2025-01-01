const express = require("express")
const router = express.Router()
const Task = require("../models/task.model")
const { body, validationResult } = require("express-validator")

const getTasks = async (req, res, next) => {
    let task;
    const { id } = req.params

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).json({
            message: "El ID no existe"
        })
    }

    try {
        task = await Task.findById(id)
        if (!task) {
            return res.status(404).json({ message: "La tarea no existe" })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }

    res.task = task
    next()
}

//Obtener todas las tareas

router.get("/", async (req, res) => {
    try {
        const tasks = await Task.find()
        console.log(tasks)
        if (tasks.length === 0) {
            return res.status(204).json([])
        }
        res.json(tasks)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Crear una nueva tarea 

router.post("/", [
    body("title")
        .notEmpty().withMessage("El título es obligatorio!")
        .trim()
        .isLength({ min: 1 }).withMessage("El título no puede estar vacío!"),
    body("description")
        .optional()
        .isString().withMessage("La descripción debe ser texto"),
], async (req, res) => {

    const completed = false
    const createdAt = new Intl.DateTimeFormat('es-AR').format(new Date());

    const { title,
        description,
    } = req?.body

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const task = new Task({
        title,
        description,
        completed,
        createdAt
    })

    try {
        const newTask = await task.save()
        console.log(newTask)
        res.status(201).json(newTask)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

router.get("/:id", getTasks, async (req, res) => {
    res.json(res.task)
})

router.put("/:id", getTasks, async (req, res) => {
    try {
        const task = res.task
        task.title = req.body.title || task.title
        task.description = req.body.description || task.description
        task.completed = typeof req.body.completed !== "undefined" ? req.body.completed : task.completed;

        const updatedTask = await task.save()
        res.json(updatedTask)
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
})

router.patch("/:id", getTasks, async (req, res) => {
    if (!req.body.title && !req.body.description && !req.body.completed) {
        res.status(400).json({
            message: "Al menos uno de estos campos debe ser enviado: Título, descripción o si la tarea fué completada"
        })
    }

    try {
        const task = res.task
        task.title = req.body.title || task.title
        task.description = req.body.description || task.description
        task.completed = req.body.completed || task.completed

        const updatedTask = await task.save()
        res.json(updatedTask)
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
})

router.delete("/:id", getTasks, async (req, res) => {
    try {
        const task = res.task
        await task.deleteOne({
            _id: task._id
        })
        res.json({
            message: `La tarea ${task.title} fué eliminada`
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router
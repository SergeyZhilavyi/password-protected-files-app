const mongoose = require("mongoose")

const File = new mongoose.Schema({
    path: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    password: String,
    downloadCount: {
        type: Number,
        required: true,
        default: 0
    }
})

module.exports = mongoose.model("File", File)

//  originalName позволяет сохранить файл с оригинальным названием , а не с сгенерированным именем, который храниться в папке uploads
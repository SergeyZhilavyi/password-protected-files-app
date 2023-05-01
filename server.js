require("dotenv").config() // Библиотека для работы с файлами .env
const multer = require("multer")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const File = require("./models/File")
const express = require("express")
const app = express()
// Используется в логике маршрута "/file/:id"
// Настройка "extended: true" говорит, что (req.body) будет содержать любые значения, а "extended: false"  только строки
app.use(express.urlencoded({ extended: true })) // Извлечение данных из тела запроса, и добавление их объект запроса (req.body)

const upload = multer({dest: "uploads"})
mongoose.connect(process.env.DATABASE_URL)
app.set("view engine", "ejs")

app.get('/', (req, res) => {
    res.render("index") // Шаблон index.ejs
})

// При переходе выполняется загрузка файла, который указан в поле с именем "file".
// Файл будет загружен в папку uploads. Эта папка автоматически сгенерируется при запуске приложения.
app.post('/upload', upload.single("file"), async (req, res) => {
    const fileData = {
        path: req.file.path,
        originalName: req.file.originalname,
    }

    if (req.body.password != null && req.body.password !== "") {
        fileData.password = await bcrypt.hash(req.body.password, 10)
    }

    const file = await File.create(fileData)
    
    // Создали ссылку на файл 
    res.render("index", { fileLink: `${req.headers.origin}/file/${file.id}` })
})

// Запрос "get" будет вызывать функцию для скачивания файла, а "post" для отправки введённого пароля на проверку
app.route("/file/:id").get(handleDownload).post(handleDownload)

async function handleDownload(req, res)  {
    const file = await File.findById(req.params.id)

    if (file.password != null) {
        if (req.body.password == null) {
          res.render("password") // переход на страницу для ввода пароля
          return
        }
    
        // Проверка правильности указанного пароля
        if (!(await bcrypt.compare(req.body.password, file.password))) {
          res.render("password", { error: true })
          return
        }
    }

    file.downloadCount++
    await file.save()
    console.log(file.downloadCount)

    // Перейдя по данному адресу выполниться скачивание файла на Ваш компьютер
    res.download(file.path, file.originalName)
}

app.listen(process.env.PORT)
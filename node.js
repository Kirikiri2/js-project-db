const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());

// Настройка multer для сохранения файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Получение всех изображений
app.get('/api/images', (req, res) => {
  db.all('SELECT * FROM images ORDER BY created_at ASC', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Ошибка при получении изображений' });
    }
    res.json(rows);
  });
});

// Загрузка изображения
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не загружен' });
  }
  const url = `/uploads/${req.file.filename}`;
  const filename = req.file.filename;

  const sql = `INSERT INTO images (filename, url) VALUES (?, ?)`;
  db.run(sql, [filename, url], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Ошибка при сохранении в базе' });
    }
    res.json({ id: this.lastID, filename, url });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});

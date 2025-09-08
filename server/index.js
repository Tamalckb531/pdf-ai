import express from 'express'
import cors from 'cors'
import multer from 'multer'

const upload = multer({ dest: "uploads/" });

const app = express();

app.use(cors());

//? All routes
app.get('/', (req, res) => {
    return res.json({ status: "All Good" });
});

app.post('/upload/pdf', upload.single('pdf'), (req, res) => {
    return res.json({ message: 'uploaded' });
});

app.listen(8000, () => console.log("Server started on PORT : 8000"));
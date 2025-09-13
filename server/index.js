import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { Queue } from 'bullmq'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { GoogleGenerativeAI } from "@google/generative-ai";



const genAI = new GoogleGenerativeAI("AIzaSyBTQAW2u5ZSxFDEhfQo-b9me3GpO1osanQ");

const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const queue = new Queue("file-upload-queue", {
    connection: {
        host: 'localhost',
        port: '6379',
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

const app = express();

app.use(cors());

//? All routes
app.get('/', (req, res) => {
    return res.json({ status: "All Good" });
});

app.get('/chat', async (req, res) => {
    const userQuery = 'What is the core skill of this applicant ?';

    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: "AIzaSyBTQAW2u5ZSxFDEhfQo-b9me3GpO1osanQ",
        model: "gemini-embedding-001",
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: 'http://localhost:6333',
        collectionName: 'pdf-docs'
    });

    const ret = vectorStore.asRetriever({
        k: 2,
    });

    const result = await ret.invoke(userQuery);

    const SYSTEM_PROMPT = ` You are a helpful AI Assistant who answers the query base on the available context from PDF File.
    Context : ${JSON.stringify(result)}`;

    const chat = model.startChat({
        history: [
            {
                role: "system",
                parts: [{ text: SYSTEM_PROMPT }],
            },
            {
                role: "user",
                parts: [{ text: userQuery }],
            },
        ],
    });

    const chatRes = await chat.sendMessage();
    const response = chatRes.response.text();

    return res.json({ response });
})

app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
    await queue.add(
        'file-ready',
        JSON.stringify({
            filename: req.file.originalname,
            destination: req.file.destination,
            path: req.file.path,
        })
    )
    return res.json({ message: 'uploaded' });
});

app.listen(8000, () => console.log("Server started on PORT : 8000"));
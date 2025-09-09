import { Worker } from "bullmq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { QdrantVectorStore } from "@langchain/qdrant"
import { Document } from "@langchain/core/documents"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { CharacterTextSplitter } from "@langchain/textsplitters"

console.log("Worker running fine");


const worker = new Worker(
    'file-upload-queue',
    async (job) => {
        console.log("Job: ", job.data);
        const data = JSON.parse(job.data);
        const loader = new PDFLoader(data.path);
        const docs = await loader.load();

        const textSplitter = new CharacterTextSplitter({
            chunkSize: 300,
            chunkOverlap: 0,
        });
        const texts = await textSplitter.splitText(docs);
        console.log(texts);

    },
    {
        concurrency: 100,
        connection: {
            host: 'localhost',
            port: '6379',
        }
    }
)
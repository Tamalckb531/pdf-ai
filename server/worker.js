import { Worker } from "bullmq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { QdrantVectorStore } from "@langchain/qdrant"
import { Document } from "@langchain/core/documents"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { CharacterTextSplitter } from "@langchain/textsplitters"
import { QdrantClient } from "@qdrant/js-client-rest";

console.log("Worker running fine");


const worker = new Worker(
    'file-upload-queue',
    async (job) => {
        try {
            console.log("Job: ", job.data);
            const data = JSON.parse(job.data);
            const loader = new PDFLoader(data.path);
            const docs = await loader.load();

            const embeddings = new GoogleGenerativeAIEmbeddings({
                apiKey: "AIzaSyBTQAW2u5ZSxFDEhfQo-b9me3GpO1osanQ",
                model: "gemini-embedding-001",
            });
            console.log("Embedding created");

            // await embeddings.embedQuery("hello world");
            // console.log("Embedding query done");

            const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
                url: 'http://localhost:6333',
                collectionName: 'pdf-docs'
            });
            console.log("Vector store created");

            await vectorStore.addDocuments(docs);
            console.log("All docs are added to vector store");
        } catch (err) {
            console.error("Job failed with error:", err);
        }
    }
    ,
    {
        concurrency: 1,
        connection: {
            host: 'localhost',
            port: '6379',
        }
    }
)
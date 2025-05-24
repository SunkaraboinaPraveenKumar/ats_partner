import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { action } from "./_generated/server.js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel.js"; // Import Id type

// Helper to get Google GenAI Embeddings model
const getEmbeddingsModel = () =>
  new GoogleGenerativeAIEmbeddings({
    apiKey: 'AIzaSyCyt4M5nw7tHsM8gMlA61Oq10K23Lf5z4E',
    model: "text-embedding-004", // 768 dimensions
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    title: "Resume Document for ATS", // A descriptive title
  });

export const ingest = action({
    args: {
        splitText: v.array(v.string()), // Expect an array of text chunks
        userId: v.id("users"), // Expect the user's ID as a users table ID
    },
    handler: async (ctx, args) => {
        console.log(`Ingesting ${args.splitText.length} text chunks for user ${args.userId}`);
        try {
             await ConvexVectorStore.fromTexts(
                args.splitText, // Array of text chunks
                { userId: args.userId }, // Metadata for each document - associating chunks with the user ID
                getEmbeddingsModel(),
                { ctx }
            );
            console.log(`Ingestion completed for user ${args.userId}`);
             return 'Ingestion Completed';
        } catch (error) {
            console.error(`Error during ingestion for user ${args.userId}:`, error);
            throw error; // Re-throw the error after logging
        }
    },
});

export const search = action({
    args: {
        query: v.string(),
        userId: v.id("users"), // Expect the user's ID to filter results
    },
    handler: async (ctx, args) => {
        console.log(`Searching for "${args.query}" for user ${args.userId}`);
        try {
            const vectorStore = new ConvexVectorStore(
                getEmbeddingsModel(),
                { ctx }
            );
            
            // Perform similarity search with proper filter syntax
            const results = await vectorStore.similaritySearch(
                args.query, 
                10, 
                // Filter by userId in metadata
                (q) => q.eq("metadata.userId", args.userId)
            );
            
            console.log(`Found ${results.length} search results for user ${args.userId}`);
            
            // Langchain Document objects might contain non-JSON serializable parts,
            // so we manually construct the output to be safe.
            return results.map(doc => ({
                pageContent: doc.pageContent,
                metadata: doc.metadata, // Metadata should include userId
            }));
        } catch (error) {
            console.error(`Error during search for user ${args.userId}:`, error);
             throw error; // Re-throw the error after logging
        }
    },
});
// api/resume-loader/route.tsx
import { NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
// We will likely need RecursiveCharacterTextSplitter later for context size management
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Correct import for newer versions
import { ConvexClient } from "convex/browser"; // To call Convex query from API route
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Assuming your Convex functions are accessible like this
const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Initialize Google GenAI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
    try {
        const { storageId } = await req.json();

        if (!storageId) {
            return NextResponse.json({ error: "Missing storageId" }, { status: 400 });
        }

        // 1. Get the public URL for the storage ID from Convex
        // You will need a Convex query like `files.getUrl`
        const fileUrl = await convex.query(api.files.getUrl, {
            storageId: storageId as Id<"_storage">, // Cast to Convex Id type
        });

        if (!fileUrl) {
            return NextResponse.json({ error: "Could not get file URL from Convex" }, { status: 404 });
        }

        // 2. Fetch the PDF file content from the URL
        const response = await fetch(fileUrl);
        if (!response.ok) {
            return NextResponse.json({ error: `Failed to fetch PDF: ${response.statusText}` }, { status: response.status });
        }
        const data = await response.blob();

        // 3. Load and extract text from PDF
        const loader = new WebPDFLoader(data);
        const docs = await loader.load();

        let resumeText = '';
        docs.forEach(doc => {
            resumeText += doc.pageContent;
        });

        // 4. Use Gemini to extract skills
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using 1.5-flash as it's generally good for this task

        const skillExtractionPrompt = `
        Extract a list of key skills from the following resume text.
        Provide the output as a JSON array of strings.

        Example JSON format:
        ["Skill 1", "Skill 2", "Skill 3"]

        Resume Text:
        ${resumeText}
        `;

        // Note: Gemini 1.5 models can handle longer contexts,
        // but for very long resumes, you might need to chunk
        // the resumeText and process chunks or summarize first.
        // For now, we process the full extracted text.

        const result = await model.generateContent(skillExtractionPrompt);
        const geminiResponse = result.response;
        const rawSkillsText = geminiResponse.text();

        let extractedSkills: string[] = [];
        try {
            // Attempt to parse the JSON array from the response
            // Often the response might be wrapped in markdown, e.g., ```json[...]```
            const jsonMatch = rawSkillsText.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch && jsonMatch[1]) {
                extractedSkills = JSON.parse(jsonMatch[1]);
            } else {
                 // Fallback parsing if no markdown code block
                 extractedSkills = JSON.parse(rawSkillsText);
            }

            // Ensure the result is an array of strings
            if (!Array.isArray(extractedSkills) || !extractedSkills.every(item => typeof item === 'string')) {
                 console.error("Gemini response was not a valid JSON array of strings:", rawSkillsText);
                 extractedSkills = []; // Reset if parsing fails or format is incorrect
            }

        } catch (parseError) {
            console.error("Failed to parse Gemini skills response:", parseError);
            extractedSkills = []; // Return empty array on error
        }


        // 5. Return the extracted text and skills
        return NextResponse.json({
            resumeText: resumeText,
            extractedSkills: extractedSkills,
            fileUrl:fileUrl
        });

    } catch (error) {
        console.error("Error processing resume:", error);
        return NextResponse.json({ error: "Failed to process resume" }, { status: 500 });
    }
}

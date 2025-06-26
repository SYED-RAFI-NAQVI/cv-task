// src/app/api/process-cvs/route.js
import { NextRequest, NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// Initialize the Gemini AI model
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.2,
  apiKey: process.env.GOOGLE_API_KEY,
  maxOutputTokens: 2048,
});

// Clean JSON response helper
function cleanJSONResponse(content) {
  try {
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.replace(/```json\s*|\s*```/g, "");
    } else if (cleanContent.startsWith("{")) {
      // Already JSON-like, remove any trailing markdown backticks
      cleanContent = cleanContent.replace(/\s*```\s*$/g, "");
    }

    // Parse the JSON string into an object
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("Error cleaning JSON response:", error);
    throw new Error(`Invalid JSON response: ${error.message}`);
  }
}

// Main API endpoint
export async function POST(request) {
  try {
    console.log("🤖 Starting AI-powered CV analysis...");

    // Get form data from request
    const formData = await request.formData();
    const files = formData.getAll("files");
    const jobTitle = formData.get("jobTitle");
    const jobDescription = formData.get("jobDescription");

    console.log(`📊 Processing ${files.length} CVs for: ${jobTitle}`);

    // Prepare data for each CV
    const cvData = await Promise.all(
      files.map(async (file, index) => {
        const fileName = file.name;
        console.log(
          `📂 Preparing CV ${index + 1}/${files.length}: ${fileName}`
        );

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64PDF = buffer.toString("base64");

        // Extract name from filename for fallback
        const nameFromFilename = fileName
          .replace(".pdf", "")
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize words

        return {
          fileName,
          base64PDF, // Send full PDF data without truncation
          nameFromFilename,
        };
      })
    );

    console.log("🧠 Sending CVs to Gemini for analysis...");

    // Make a single call to Gemini API with all CVs
    const response = await llm.invoke(`
      You are an expert AI recruitment agent. I'll provide you with a job description and ${
        files.length
      } candidate resumes in base64 format.
      Your task is to analyze each resume, extract key information, and rank candidates by suitability.
      
      JOB TITLE: ${jobTitle}
      
      JOB DESCRIPTION:
      ${jobDescription}
      
      ${cvData
        .map(
          (cv, index) => `
      CANDIDATE ${index + 1}:
      Filename: ${cv.fileName}
      Name (if not found in resume): ${cv.nameFromFilename}
      Base64 PDF: ${cv.base64PDF}
      ---
      `
        )
        .join("\n")}
      
      For each candidate, analyze their resume and provide:
      1. Name (from resume or use provided filename-based name)
      2. Current job title
      3. Years of experience
      4. Experience level (junior/mid/senior)
      5. Technical skills list
      6. Education
      7. Match score (0-100)
      8. Recommendation (interview/consider/review/reject)
      9. 2-3 key strengths relevant to the role
      10. 2-3 areas to probe further or concerns
      11. Brief summary of fit
      
      Order candidates by match score (highest first).
      
      Also calculate:
      - Highest score among all candidates
      - Average score
      - Number of candidates recommended for interview or consideration
      
      Return your analysis as a JSON object with this format:
      {
        "results": [
          {
            "id": 1,
            "fileName": "filename.pdf",
            "name": "Candidate Name",
            "experience": "Years of experience",
            "currentTitle": "Job title",
            "matchScore": 85,
            "summary": "Brief assessment",
            "keyStrengths": ["Strength 1", "Strength 2"],
            "potentialConcerns": ["Concern 1", "Concern 2"],
            "recommendation": "interview",
            "technicalSkills": ["Skill 1", "Skill 2"],
            "experienceLevel": "mid",
            "similarityScore": 0.75
          }
          // More candidates...
        ],
        "summary": {
          "topScore": 85,
          "averageScore": 70,
          "recommendedCandidates": 3
        }
      }
      
      Respond with ONLY the JSON object, no explanations or formatting.
    `);

    // Parse the response
    const analysisData = cleanJSONResponse(response.content);

    // Validate response structure
    if (!analysisData.results || !Array.isArray(analysisData.results)) {
      throw new Error("Invalid response format from AI");
    }

    // Ensure proper filename mapping
    const finalResults = analysisData.results.map((result, index) => {
      // Make sure each result has the correct filename from original CVs
      if (index < cvData.length) {
        result.fileName = cvData[index].fileName;
      }
      return result;
    });

    console.log("🎉 AI CV analysis completed successfully!");

    // Return the formatted response
    return NextResponse.json(
      {
        success: true,
        jobTitle,
        results: finalResults,
        totalCandidates: finalResults.length,
        processedAt: new Date().toISOString(),
        summary: analysisData.summary || {
          topScore: Math.max(...finalResults.map((r) => r.matchScore || 0), 0),
          averageScore: finalResults.length
            ? finalResults.reduce((sum, r) => sum + (r.matchScore || 0), 0) /
              finalResults.length
            : 0,
          recommendedCandidates: finalResults.filter(
            (r) =>
              r.recommendation === "interview" ||
              r.recommendation === "consider"
          ).length,
        },
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error("❌ Error processing CVs:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error processing CVs",
      },
      {
        status: 500,
      }
    );
  }
}

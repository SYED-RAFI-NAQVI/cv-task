// src/app/api/process-cvs/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.2,
  apiKey: process.env.GOOGLE_API_KEY,
});

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "embedding-004",
  apiKey: process.env.GOOGLE_API_KEY,
});

function cleanJSONResponse(content) {
  try {
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const jsonStart = cleanContent.indexOf("{");
    const jsonEnd = cleanContent.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
    }

    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("JSON parsing error:", error);
    throw new Error("Invalid JSON response from AI");
  }
}

function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

async function extractTextFromPDF(buffer, fileName) {
  try {
    const uint8Array = new Uint8Array(buffer);
    let text = "";
    for (let i = 0; i < uint8Array.length - 1; i++) {
      const char = uint8Array[i];

      if (char >= 32 && char <= 126) {
        text += String.fromCharCode(char);
      } else if (char === 10 || char === 13) {
        text += " ";
      }
    }

    text = text
      .replace(/[^\w\s@.\-()]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (text.length > 100) {
      return text.substring(0, 5000);
    }

    return `CV for ${fileName
      .replace(/\.[^/.]+$/, "")
      .replace(
        /[-_*]/g,
        " "
      )}. Advanced text extraction required for full content.`;
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    return `CV document: ${fileName}. Text extraction failed - please ensure file is a valid PDF.`;
  }
}

async function extractCandidateDataWithAI(cvText, fileName) {
  const extractionPrompt = `
You are an AI agent specialized in extracting structured data from CV/resume text. 

CV TEXT:
${cvText.substring(0, 3000)}

FILENAME: ${fileName}

Extract the following information and return ONLY a valid JSON object (no markdown, no extra text):
{
  "name": "candidate full name",
  "email": "email address if found or empty string",
  "phone": "phone number if found or empty string", 
  "currentTitle": "current or most recent job title",
  "experience": "years of experience or experience level",
  "location": "location/city if mentioned or empty string",
  "skills": ["skill1", "skill2", "skill3"],
  "education": "highest education degree",
  "summary": "brief 1-2 sentence professional summary"
}

Rules:
- Return ONLY the JSON object, nothing else
- If information is not found, use empty string "" for text fields or empty array [] for skills
- For name, if not clearly found, derive from filename
- Extract 3-8 most relevant technical skills
- Be accurate and don't make up information

RESPONSE (JSON only):`;

  try {
    const response = await llm.invoke(extractionPrompt);
    const extractedData = cleanJSONResponse(response.content);

    if (!extractedData.name) {
      extractedData.name = fileName
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_*]/g, " ");
    }

    return extractedData;
  } catch (error) {
    console.error("Error in AI extraction:", error);

    return {
      name: fileName.replace(/\.[^/.]+$/, "").replace(/[-_*]/g, " "),
      email: "",
      phone: "",
      currentTitle: "",
      experience: "Not specified",
      location: "",
      skills: [],
      education: "",
      summary: "CV data extraction failed - manual review required",
    };
  }
}

async function calculateSemanticSimilarity(jobDescription, candidateTexts) {
  try {
    console.log("🔍 Generating embeddings for semantic similarity...");
    const jobEmbedding = await embeddings.embedQuery(jobDescription);

    const candidateEmbeddings = await Promise.all(
      candidateTexts.map((text) =>
        embeddings.embedQuery(text.substring(0, 2000))
      )
    );

    const similarities = candidateEmbeddings.map((candidateEmb) =>
      cosineSimilarity(jobEmbedding, candidateEmb)
    );

    return similarities;
  } catch (error) {
    console.error("Error calculating semantic similarity:", error);
    return candidateTexts.map(() => 0.5);
  }
}
async function generateAIMatchingAnalysis(
  candidateData,
  cvText,
  jobTitle,
  jobDescription,
  similarityScore
) {
  const analysisPrompt = `
You are an expert AI recruitment agent. Analyze how well this candidate matches the job requirements.

JOB TITLE: ${jobTitle}

JOB DESCRIPTION & REQUIREMENTS:
${jobDescription}

CANDIDATE PROFILE:
Name: ${candidateData.name}
Current Title: ${candidateData.currentTitle}
Experience: ${candidateData.experience}
Skills: ${candidateData.skills.join(", ")}
Education: ${candidateData.education}
Summary: ${candidateData.summary}

SEMANTIC SIMILARITY SCORE: ${Math.round(similarityScore * 100)}%

CV TEXT EXCERPT:
${cvText.substring(0, 1500)}

Analyze this candidate and provide ONLY a JSON response (no markdown, no extra text):
{
  "matchScore": 85,
  "summary": "professional 2-3 sentence assessment of candidate fit",
  "keyStrengths": ["strength1", "strength2", "strength3"],
  "potentialConcerns": ["concern1", "concern2"],
  "recommendation": "interview",
  "technicalSkills": ["relevant skill1", "relevant skill2"],
  "experienceLevel": "senior",
  "culturalFit": "high",
  "reasoningExplanation": "explanation for score and recommendation"
}

Scoring Guidelines:
- 90-100: Exceptional match, rare find
- 80-89: Strong match, should interview  
- 70-79: Good potential, worth considering
- 60-69: Some fit, needs careful review
- Below 60: Poor fit for this role

Recommendation options: "interview", "consider", "review", "reject"
Experience levels: "junior", "mid", "senior", "lead"
Cultural fit: "high", "medium", "low"

RESPONSE (JSON only):`;

  try {
    const response = await llm.invoke(analysisPrompt);
    const analysis = cleanJSONResponse(response.content);

    analysis.matchScore = Math.min(
      Math.max(parseInt(analysis.matchScore) || 0, 0),
      100
    );

    analysis.keyStrengths = analysis.keyStrengths || [
      "Professional background",
    ];
    analysis.potentialConcerns = analysis.potentialConcerns || [];
    analysis.technicalSkills =
      analysis.technicalSkills || candidateData.skills.slice(0, 3);

    return analysis;
  } catch (error) {
    console.error("Error in AI analysis:", error);

    const fallbackScore = Math.min(Math.round(similarityScore * 75 + 25), 100);
    return {
      matchScore: fallbackScore,
      summary: `Candidate shows ${
        fallbackScore >= 70 ? "good" : "moderate"
      } alignment with job requirements based on semantic analysis.`,
      keyStrengths: ["Professional background", "Relevant experience"],
      potentialConcerns: fallbackScore < 70 ? ["Requires detailed review"] : [],
      recommendation:
        fallbackScore >= 80
          ? "consider"
          : fallbackScore >= 60
          ? "review"
          : "reject",
      technicalSkills: candidateData.skills.slice(0, 3),
      experienceLevel: "unknown",
      culturalFit: "medium",
      reasoningExplanation:
        "Analysis based on semantic similarity and available CV data",
    };
  }
}

export async function POST(request) {
  try {
    console.log("🤖 Starting AI-powered CV analysis...");
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Google API key not configured. Please add GOOGLE_API_KEY to your .env.local file.",
        },
        { status: 500 }
      );
    }

    const data = await request.formData();
    const jobTitle = data.get("jobTitle");
    const jobDescription = data.get("jobDescription");
    const files = data.getAll("files");

    if (!jobTitle || !jobDescription || !files || files.length === 0) {
      return NextResponse.json(
        {
          error: "Missing required fields: jobTitle, jobDescription, or files",
        },
        { status: 400 }
      );
    }

    console.log(`📊 Processing ${files.length} CVs for: ${jobTitle}`);

    const candidatesData = [];
    const candidateTexts = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.type !== "application/pdf") {
        console.warn(`⚠️ Skipping non-PDF file: ${file.name}`);
        continue;
      }

      try {
        console.log(`🔍 Processing CV ${i + 1}/${files.length}: ${file.name}`);

        const buffer = await file.arrayBuffer();
        const cvText = await extractTextFromPDF(buffer, file.name);

        if (!cvText || cvText.length < 30) {
          console.warn(`⚠️ Insufficient text extracted from ${file.name}`);
          continue;
        }

        console.log(`🧠 AI extracting candidate data from ${file.name}...`);
        const candidateData = await extractCandidateDataWithAI(
          cvText,
          file.name
        );

        candidatesData.push({
          ...candidateData,
          fileName: file.name,
          cvText,
          index: i,
        });

        candidateTexts.push(cvText);
      } catch (error) {
        console.error(`❌ Error processing ${file.name}:`, error);
        continue;
      }
    }

    if (candidatesData.length === 0) {
      return NextResponse.json(
        {
          error:
            "No valid CV files could be processed. Please ensure files are valid PDFs.",
        },
        { status: 400 }
      );
    }

    console.log(`✅ Successfully processed ${candidatesData.length} CVs`);

    console.log("📈 Calculating semantic similarity scores...");
    const similarityScores = await calculateSemanticSimilarity(
      `${jobTitle}\n${jobDescription}`,
      candidateTexts
    );

    console.log("🤖 Running AI matching analysis...");
    const results = [];

    for (let i = 0; i < candidatesData.length; i++) {
      const candidate = candidatesData[i];
      const similarityScore = similarityScores[i] || 0;

      console.log(
        `🔍 AI analyzing candidate ${i + 1}/${candidatesData.length}: ${
          candidate.name
        }`
      );

      const analysis = await generateAIMatchingAnalysis(
        candidate,
        candidate.cvText,
        jobTitle,
        jobDescription,
        similarityScore
      );

      results.push({
        id: i + 1,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        fileName: candidate.fileName,
        experience: candidate.experience,
        currentTitle: candidate.currentTitle,
        location: candidate.location,
        education: candidate.education,
        matchScore: analysis.matchScore,
        summary: analysis.summary,
        keyStrengths: analysis.keyStrengths,
        potentialConcerns: analysis.potentialConcerns,
        recommendation: analysis.recommendation,
        technicalSkills: analysis.technicalSkills,
        experienceLevel: analysis.experienceLevel,
        culturalFit: analysis.culturalFit,
        reasoningExplanation: analysis.reasoningExplanation,
        similarityScore: Math.round(similarityScore * 100),
        processedAt: new Date().toISOString(),
      });
    }

    results.sort((a, b) => b.matchScore - a.matchScore);

    console.log("🎉 AI CV analysis completed successfully!");

    return NextResponse.json({
      success: true,
      jobTitle,
      results,
      totalCandidates: results.length,
      processedAt: new Date().toISOString(),
      summary: {
        topScore: results[0]?.matchScore || 0,
        averageScore: Math.round(
          results.reduce((sum, r) => sum + r.matchScore, 0) / results.length
        ),
        recommendedCandidates: results.filter(
          (r) => r.recommendation === "interview"
        ).length,
        aiProcessingNote: "All analysis powered by Google Gemini AI agents",
      },
    });
  } catch (error) {
    console.error("❌ Error in AI CV processing:", error);

    return NextResponse.json(
      {
        error: "AI processing failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

# AI CV Screening Platform

## What We Vibe Coded Together 🚀

Built an AI-powered CV screening app that automatically analyzes and ranks job candidates. Started with a frontend idea and ended up with a full recruitment platform!

## The Journey

**Started with**: Basic Next.js app concept  
**Ended with**: Complete AI recruitment tool with drag-and-drop, scoring, and recommendations

### What We Built

- **Clean UI**: Modern React interface with Tailwind + shadcn/ui
- **Smart Upload**: Drag-and-drop for PDF resumes (fixed the button click issue too!)
- **AI Brain**: Google Gemini + FAISS vector search for candidate matching
- **Real Results**: Match scores, skill extraction, interview recommendations
- **Sample Data**: 5 full-stack dev resumes + "Load Sample Data" button

### The Tech Vibes

```
Frontend: Next.js 14 + TypeScript + Tailwind
Backend: Next.js API routes (/api/process-cvs)
AI Magic: Google Gemini + Langchain + FAISS
UI: shadcn/ui components
Files: PDF parsing and analysis
```

## Quick Run

```bash
cd cv-task
npm install
npm run dev
```

Hit http://localhost:3000 → Click "Load Sample Data" → See the magic!

## The Flow

1. Upload job description + CV PDFs
2. AI analyzes everything (with a cool progress bar)
3. Get ranked candidates with scores and insights
4. Make hiring decisions faster

## What We Figured Out

- How to integrate multiple AI services seamlessly
- Building intuitive file upload with proper error handling
- Creating a scoring system that actually makes sense
- Making the UI feel professional but not boring
- Structuring a full-stack app that could scale

## Files We Touched

```
cv-task/           # Complete Next.js app (frontend + API routes)
  ├── src/app/api/ # Backend API routes for CV processing
  └── src/app/     # Frontend pages and components
backend(demo)/     # Reference: example schema, migrations, seed data
public/cvs/        # Sample PDFs we added
```

## Backend Implementation

**Current**: Built with Next.js API routes (`/api/process-cvs`) - everything integrated in one app  
**Demo Folder**: `backend(demo)/` contains example schema, migrations, seed data for reference

We used Next.js server-side functionality for this task. Could build a separate backend with dedicated APIs, but Next.js API routes handled everything we needed for the CV processing workflow.

**Result**: A complete full-stack AI recruitment tool built entirely with Next.js. Frontend + backend + AI - all in one! ✨

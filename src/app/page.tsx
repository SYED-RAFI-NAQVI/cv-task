"use client";

import { useState, ChangeEvent, DragEvent, JSX } from "react";
import {
  Upload,
  FileText,
  Brain,
  Download,
  Trophy,
  Star,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Candidate {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  fileName: string;
  experience: string;
  currentTitle?: string;
  matchScore: number;
  summary: string;
  keyStrengths?: string[];
  potentialConcerns?: string[];
  recommendation: "interview" | "consider" | "review" | "reject";
  technicalSkills?: string[];
  experienceLevel?: string;
  similarityScore?: number;
  processedAt?: string;
}

interface ProcessingSummary {
  topScore: number;
  averageScore: number;
  recommendedCandidates: number;
}

interface APIResponse {
  success: boolean;
  jobTitle: string;
  results: Candidate[];
  totalCandidates: number;
  processedAt: string;
  summary: ProcessingSummary;
  error?: string;
  message?: string;
}

interface ScoreBarProps {
  score: number;
}

export default function Home(): JSX.Element {
  const [jobTitle, setJobTitle] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [results, setResults] = useState<Candidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [summary, setSummary] = useState<ProcessingSummary | null>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files || []);
    const pdfFiles = files.filter(
      (file: File) => file.type === "application/pdf"
    );

    if (files.length !== pdfFiles.length) {
      setError("Only PDF files are supported");
      return;
    }

    const oversizedFiles = pdfFiles.filter(
      (file: File) => file.size > 10 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      setError(
        "Some files are larger than 10MB. Please compress and try again."
      );
      return;
    }

    setError(null);
    setUploadedFiles((prev: File[]) => [...prev, ...pdfFiles]);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFiles = files.filter(
      (file: File) => file.type === "application/pdf"
    );

    if (files.length !== pdfFiles.length) {
      setError("Only PDF files are supported");
      return;
    }

    setError(null);
    setUploadedFiles((prev: File[]) => [...prev, ...pdfFiles]);
  };

  const removeFile = (index: number): void => {
    setUploadedFiles((prev: File[]) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!jobTitle || !jobDescription || uploadedFiles.length === 0) {
      setError("Please fill all fields and upload at least one CV");
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("jobTitle", jobTitle);
      formData.append("jobDescription", jobDescription);

      uploadedFiles.forEach((file: File) => {
        formData.append("files", file);
      });

      const progressInterval = setInterval(() => {
        setProcessingProgress((prev: number) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 1000);

      const response = await fetch("/api/process-cvs", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (!response.ok) {
        const errorData: APIResponse = await response.json();
        throw new Error(
          errorData.message || errorData.error || "Failed to process CVs"
        );
      }

      const data: APIResponse = await response.json();

      if (data.success) {
        setResults(data.results);
        setSummary(data.summary);
        setShowResults(true);
      } else {
        throw new Error(data.error || "Processing failed");
      }
    } catch (err) {
      console.error("Error processing CVs:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while processing CVs";
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const ScoreBar = ({ score }: ScoreBarProps): JSX.Element => {
    const getScoreColor = (score: number): string => {
      if (score >= 90) return "bg-green-500";
      if (score >= 80) return "bg-blue-500";
      if (score >= 70) return "bg-yellow-500";
      return "bg-red-500";
    };

    const getScoreIcon = (score: number): JSX.Element | null => {
      if (score >= 90) return <Trophy className="w-3 h-3 text-yellow-500" />;
      if (score >= 80) return <Star className="w-3 h-3 text-blue-500" />;
      return null;
    };

    return (
      <div className="flex items-center gap-2">
        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${getScoreColor(
              score
            )}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex items-center gap-1">
          {getScoreIcon(score)}
          <span className="text-sm font-semibold">{score}%</span>
        </div>
      </div>
    );
  };

  const downloadCV = (fileName: string): void => {
    alert(
      `Download functionality for ${fileName} - implement file storage download`
    );
  };

  const loadSampleData = async (): Promise<void> => {
    setJobTitle("Full Stack Developer");
    setJobDescription(
      "Looking for a versatile full-stack developer to help build our MVP. Perfect for someone who loves wearing multiple hats! You will be responsible for both frontend and backend development using modern technologies.\n\nRequirements:\n• JavaScript, React, Node.js, MongoDB\n• 2+ years experience\n• Strong problem-solving skills\n• Experience with RESTful APIs\n• Knowledge of version control (Git)\n• Ability to work in a fast-paced startup environment"
    );

    try {
      const pdfFiles = [
        "full-stack-application-developer-resume-example.pdf",
        "full-stack-developer-resume-example.pdf",
        "full-stack-software-developer-resume-example.pdf",
        "full-stack-web-developer-resume-example.pdf",
        "senior-full-stack-developer-resume-example.pdf",
      ];

      const filePromises = pdfFiles.map(async (filename) => {
        const response = await fetch(`/cvs/${filename}`);
        const blob = await response.blob();
        return new File([blob], filename, { type: "application/pdf" });
      });

      const files = await Promise.all(filePromises);
      setUploadedFiles(files);
      setError(null);
    } catch (error) {
      setError("Failed to load sample PDFs");
    }
  };

  const resetForm = (): void => {
    setShowResults(false);
    setJobTitle("");
    setJobDescription("");
    setUploadedFiles([]);
    setResults([]);
    setSummary(null);
    setError(null);
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {jobTitle}
              </h1>
              <p className="text-muted-foreground">
                {results.length} candidates analyzed and ranked by AI
              </p>
            </div>
            <Button onClick={resetForm}>New Analysis</Button>
          </div>

          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Top Score</p>
                      <p className="text-lg font-semibold">
                        {summary.topScore}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Average Score
                      </p>
                      <p className="text-lg font-semibold">
                        {summary.averageScore}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Recommended
                      </p>
                      <p className="text-lg font-semibold">
                        {summary.recommendedCandidates}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          <div className="grid gap-4">
            {results.map((candidate: Candidate, index: number) => (
              <Card
                key={candidate.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold">
                          {candidate.name}
                        </h3>
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                        {candidate.matchScore >= 90 && (
                          <Badge className="bg-green-600 hover:bg-green-700">
                            <Trophy className="w-3 h-3 mr-1" />
                            Top Match
                          </Badge>
                        )}
                        {candidate.matchScore >= 80 &&
                          candidate.matchScore < 90 && (
                            <Badge className="bg-blue-600 hover:bg-blue-700">
                              <Star className="w-3 h-3 mr-1" />
                              Strong Fit
                            </Badge>
                          )}
                        <Badge variant="outline">
                          {candidate.recommendation}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                        {candidate.currentTitle && (
                          <span>💼 {candidate.currentTitle}</span>
                        )}
                        <span>⏱️ {candidate.experience}</span>
                        <span>📄 {candidate.fileName}</span>
                        {candidate.email && <span>📧 {candidate.email}</span>}
                      </div>

                      <p className="text-foreground mb-4 leading-relaxed">
                        {candidate.summary}
                      </p>

                      {/* Key Strengths */}
                      {candidate.keyStrengths &&
                        candidate.keyStrengths.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-foreground mb-1">
                              Key Strengths:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {candidate.keyStrengths.map(
                                (strength: string, i: number) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {strength}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Technical Skills */}
                      {candidate.technicalSkills &&
                        candidate.technicalSkills.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-foreground mb-1">
                              Technical Skills:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {candidate.technicalSkills.map(
                                (skill: string, i: number) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {skill}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Potential Concerns */}
                      {candidate.potentialConcerns &&
                        candidate.potentialConcerns.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-yellow-700 mb-1">
                              Areas for Review:
                            </p>
                            <ul className="text-sm text-yellow-600">
                              {candidate.potentialConcerns.map(
                                (concern: string, i: number) => (
                                  <li key={i}>• {concern}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadCV(candidate.fileName)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download CV
                        </Button>
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <div className="mb-4">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          AI Match Score
                        </p>
                        <ScoreBar score={candidate.matchScore} />
                      </div>

                      {candidate.similarityScore !== undefined && (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-1">
                            Vector Similarity
                          </p>
                          <p className="text-xs font-medium">
                            {candidate.similarityScore}%
                          </p>
                        </div>
                      )}

                      {candidate.experienceLevel && (
                        <div className="mb-3">
                          <Badge variant="outline" className="text-xs">
                            {candidate.experienceLevel}
                          </Badge>
                        </div>
                      )}

                      <Badge
                        variant={
                          candidate.recommendation === "interview"
                            ? "default"
                            : candidate.recommendation === "consider"
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          candidate.recommendation === "interview"
                            ? "bg-green-600 hover:bg-green-700"
                            : candidate.recommendation === "consider"
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-yellow-600 hover:bg-yellow-700"
                        }
                      >
                        {candidate.recommendation === "interview"
                          ? "Interview"
                          : candidate.recommendation === "consider"
                          ? "Consider"
                          : "Review"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {results.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No results to display</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Processing CVs with AI
            </h3>
            <p className="text-muted-foreground mb-6">
              Analyzing {uploadedFiles.length} candidates using Langchain +
              Gemini
            </p>
            <Progress value={processingProgress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {Math.round(processingProgress)}% complete - This may take a few
              minutes
            </p>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsProcessing(false);
                    setError(null);
                    setProcessingProgress(0);
                  }}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">AI CV Screening Platform</h1>
          <p className="text-muted-foreground mb-4">
            Powered by Langchain + Google Gemini
          </p>
          <Button
            onClick={loadSampleData}
            variant="outline"
            className="mb-4 bg-blue-200 hover:bg-blue-300 cursor-pointer"
          >
            <FileText className="w-4 h-4 mr-2" />
            Load Sample Data
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Create Job Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Job Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title</label>
              <Input
                value={jobTitle}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setJobTitle(e.target.value)
                }
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Job Description & Requirements
              </label>
              <Textarea
                value={jobDescription}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setJobDescription(e.target.value)
                }
                placeholder="Describe the role, responsibilities, requirements, and ideal candidate profile..."
                rows={6}
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Upload CVs (PDF files, max 10MB each)
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground mb-2">
                  Drop PDF files here or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="cv-upload"
                />
                <label
                  htmlFor="cv-upload"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                >
                  Choose Files
                </label>
              </div>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Uploaded Files ({uploadedFiles.length})
                </label>
                <div className="space-y-2">
                  {uploadedFiles.map((file: File, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={
                !jobTitle || !jobDescription || uploadedFiles.length === 0
              }
              className="w-full"
              size="lg"
            >
              <Brain className="w-4 h-4 mr-2" />
              Start AI Analysis ({uploadedFiles.length} files)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

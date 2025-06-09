import { useState, useEffect } from 'react';

/**
 * Service that periodically updates candidate CV analysis in the background
 * Runs every hour to ensure recruiters see the most up-to-date recommendations
 */
export function useCVAnalysisScheduler() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const [error, setError] = useState(null);

  const runCVAnalysis = async () => {
    try {
      setIsRunning(true);
      console.log('Starting scheduled CV analysis update:', new Date().toISOString());
      
      // Step 1: Fetch all available candidates
      const candidatesResponse = await fetch('/api/candidate/get-available-candidates');
      
      if (!candidatesResponse.ok) {
        throw new Error(`Failed to fetch available candidates: ${candidatesResponse.status}`);
      }
      
      const candidates = await candidatesResponse.json();
      console.log(`Found ${candidates.length} available candidates for CV analysis`);
      
      // Step 2: Process each candidate's CV
      for (const candidate of candidates) {
        try {
          const cvId = candidate.cvId;
          const fileCV = candidate.fileCV;
          
          if (!cvId) {
            console.warn(`Candidate ${candidate.id} (${candidate.fullname}) has no CV ID, skipping`);
            continue;
          }
          
          if (!fileCV) {
            console.warn(`Candidate ${candidate.id} (${candidate.fullname}) has no CV file, skipping`);
            continue;
          }
          
          // Step 2a: Delete existing CV analysis
          const deleteResponse = await fetch(`/api/cv-job-matches/delete-cv-analysis/${cvId}`, {
            method: 'DELETE'
          });
          
          if (!deleteResponse.ok) {
            console.warn(`Failed to delete existing CV analysis for CV ID ${cvId}: ${deleteResponse.status}`);
            // Continue anyway to try to create new analysis
          }
          
          // Step 2b: Analyze the CV
          await analyzeCandidateCV(candidate.id, cvId, fileCV);
          
          console.log(`Successfully analyzed CV ID ${cvId} for candidate ${candidate.fullname}`);
        } catch (candidateError) {
          console.error(`Error processing candidate ${candidate.id} (${candidate.fullname}):`, candidateError);
          // Continue with next candidate
        }
      }
      
      const timestamp = new Date().toISOString();
      setLastRun(timestamp);
      console.log('Completed scheduled CV analysis update:', timestamp);
      
      // Store the last run time in localStorage for persistence
      localStorage.setItem('lastCVAnalysisRun', timestamp);
    } catch (err) {
      console.error('Error in scheduled CV analysis:', err);
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  // Function to analyze a candidate's CV
  const analyzeCandidateCV = async (candidateId, cvId, cvUrl) => {
    try {
      const token = localStorage.getItem('token');
      
      // Extract text from CV (handles both PDF and image files)
      const extractRes = await fetch(`/api/ocr/extract/${candidateId}?fileUrl=${encodeURIComponent(cvUrl)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!extractRes.ok) {
        throw new Error(`Failed to extract text from CV URL: ${extractRes.status}`);
      }
      
      const cvText = await extractRes.text();
      
      // Analyze CV with extracted text
      const analyzeRes = await fetch(`http://127.0.0.1:8000/api/analyze/cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cv_text: cvText,
          cv_id: cvId,
        }),
      });
      
      if (!analyzeRes.ok) {
        throw new Error(`API request failed with status ${analyzeRes.status}`);
      }
      
      const data = await analyzeRes.json();
      
      // Get the recommendations count and log
      const recommendationsCount = Array.isArray(data) ? data.length : 0;
      console.log(`CV analyzed successfully. Found ${recommendationsCount} job recommendations for CV ID ${cvId}`);
      
      return data;
    } catch (error) {
      console.error(`Error analyzing CV ${cvId}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Initialize lastRun from localStorage if available
    const storedLastRun = localStorage.getItem('lastCVAnalysisRun');
    if (storedLastRun) {
      setLastRun(storedLastRun);
    }

    // Run initially if it's never been run or it's been more than an hour
    const shouldRunNow = !storedLastRun || 
      (new Date().getTime() - new Date(storedLastRun).getTime() > 60 * 60 * 1000);
    
    if (shouldRunNow) {
      runCVAnalysis();
    }

    // Set up hourly interval
    const intervalId = setInterval(runCVAnalysis, 60 * 60 * 1000); // Run every hour

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return { isRunning, lastRun, error, runCVAnalysis };
} 
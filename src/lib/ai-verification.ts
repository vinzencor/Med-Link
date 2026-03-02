/**
 * AI-powered document verification service
 * Uses OpenAI GPT-4 Vision to verify documents and validate CVs
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface DocumentVerificationResult {
  isValid: boolean;
  documentType: string;
  confidence: number;
  extractedData?: {
    name?: string;
    licenseNumber?: string;
    expiryDate?: string;
    issueDate?: string;
    issuingAuthority?: string;
  };
  issues?: string[];
  aiAnalysis: string;
}

export interface CVValidationResult {
  isCV: boolean;
  confidence: number;
  hasRequiredSections: boolean;
  sections: string[];
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  issues?: string[];
  aiAnalysis: string;
}

/**
 * Convert PDF file to base64 for OpenAI Vision API
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Verify a document (license, certificate, ID) using AI
 */
export async function verifyDocument(
  file: File,
  documentType: 'license' | 'certificate' | 'id' | 'other'
): Promise<DocumentVerificationResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const base64Data = await fileToBase64(file);

    const prompt = `You are a document verification expert. Analyze this ${documentType} document and provide a detailed verification report.

Please analyze:
1. Is this a valid ${documentType} document?
2. Extract key information (name, license/ID number, issue date, expiry date, issuing authority)
3. Check for signs of tampering or forgery
4. Verify document authenticity indicators
5. Rate confidence level (0-100%)

Respond in JSON format:
{
  "isValid": boolean,
  "documentType": "license|certificate|id|other",
  "confidence": number (0-100),
  "extractedData": {
    "name": "string or null",
    "licenseNumber": "string or null",
    "expiryDate": "YYYY-MM-DD or null",
    "issueDate": "YYYY-MM-DD or null",
    "issuingAuthority": "string or null"
  },
  "issues": ["array of issues found"],
  "analysis": "detailed analysis text"
}`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${file.type};base64,${base64Data}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      isValid: result.isValid,
      documentType: result.documentType,
      confidence: result.confidence,
      extractedData: result.extractedData,
      issues: result.issues || [],
      aiAnalysis: result.analysis,
    };
  } catch (error: any) {
    console.error('Document verification error:', error);
    throw new Error(`Document verification failed: ${error.message}`);
  }
}

/**
 * Validate if uploaded file is a CV/Resume using AI (ATS validation)
 */
export async function validateCV(file: File): Promise<CVValidationResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const base64Data = await fileToBase64(file);

    const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze this document and determine if it's a valid CV/Resume.

Please check:
1. Is this document a CV/Resume? (not a random document, image, or other file)
2. Does it contain typical CV sections? (contact info, experience, education, skills)
3. Rate the CV quality (excellent/good/fair/poor)
4. List all sections found
5. Identify any issues or missing critical sections
6. Confidence level (0-100%)

Respond in JSON format:
{
  "isCV": boolean,
  "confidence": number (0-100),
  "hasRequiredSections": boolean,
  "sections": ["array of sections found"],
  "quality": "excellent|good|fair|poor",
  "issues": ["array of issues"],
  "analysis": "detailed analysis"
}`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${file.type};base64,${base64Data}`,
                },
              },
            ],
          },
        ],
        max_tokens: 800,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      isCV: result.isCV,
      confidence: result.confidence,
      hasRequiredSections: result.hasRequiredSections,
      sections: result.sections || [],
      quality: result.quality,
      issues: result.issues || [],
      aiAnalysis: result.analysis,
    };
  } catch (error: any) {
    console.error('CV validation error:', error);
    throw new Error(`CV validation failed: ${error.message}`);
  }
}


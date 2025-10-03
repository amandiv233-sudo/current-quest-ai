import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UploadResult {
  success: number;
  failed: number;
  errors: string[];
}

export const BulkMCQUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();

  const parseMCQBlock = (block: string) => {
    const lines = block.trim().split('\n');
    const mcq: any = {
      mcq_type: 'General'
    };
    
    let currentField = '';
    let optionsStarted = false;

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      if (line.startsWith('Category:')) {
        mcq.category = line.replace('Category:', '').trim();
      } else if (line.startsWith('Sub-Category:')) {
        mcq.subcategory = line.replace('Sub-Category:', '').trim();
      } else if (line.startsWith('Difficulty:')) {
        mcq.difficulty = line.replace('Difficulty:', '').trim().toLowerCase();
      } else if (line.startsWith('MCQ Date:')) {
        const dateStr = line.replace('MCQ Date:', '').trim();
        const [day, month, year] = dateStr.split('-');
        mcq.mcq_date = `${year}-${month}-${day}`;
      } else if (line.startsWith('Type:')) {
        mcq.mcq_type = line.replace('Type:', '').trim();
      } else if (line.startsWith('Question:')) {
        mcq.question = line.replace('Question:', '').trim();
        currentField = 'question';
      } else if (line === 'Options:') {
        optionsStarted = true;
      } else if (optionsStarted && line.match(/^[A-D]\)/)) {
        const option = line.substring(0, 1).toLowerCase();
        const value = line.substring(2).trim();
        mcq[`option_${option}`] = value;
      } else if (line.startsWith('Correct Answer:')) {
        mcq.correct_answer = line.replace('Correct Answer:', '').trim();
      } else if (line.startsWith('Explanation:')) {
        mcq.explanation = line.replace('Explanation:', '').trim();
        currentField = 'explanation';
      } else if (currentField === 'question' && !optionsStarted) {
        mcq.question += ' ' + line;
      } else if (currentField === 'explanation') {
        mcq.explanation += ' ' + line;
      }
    }

    return mcq;
  };

  const validateMCQ = (mcq: any): string | null => {
    if (!mcq.category) return 'Missing Category';
    if (!mcq.question) return 'Missing Question';
    if (!mcq.option_a || !mcq.option_b || !mcq.option_c || !mcq.option_d) 
      return 'Missing one or more options';
    if (!mcq.correct_answer || !['A', 'B', 'C', 'D'].includes(mcq.correct_answer)) 
      return 'Invalid or missing Correct Answer';
    if (!mcq.explanation) return 'Missing Explanation';
    if (!['easy', 'medium', 'hard'].includes(mcq.difficulty)) 
      return 'Invalid Difficulty';
    if (!['General', 'Current Affairs'].includes(mcq.mcq_type))
      return 'Invalid Type';
    
    return null;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const text = await file.text();
      const blocks = text.split('---').filter(block => block.trim());
      
      const result: UploadResult = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (let i = 0; i < blocks.length; i++) {
        try {
          const mcq = parseMCQBlock(blocks[i]);
          const validationError = validateMCQ(mcq);
          
          if (validationError) {
            result.failed++;
            result.errors.push(`Question ${i + 1}: ${validationError}`);
            continue;
          }

          const { error } = await supabase.from('manual_mcqs').insert({
            question: mcq.question,
            option_a: mcq.option_a,
            option_b: mcq.option_b,
            option_c: mcq.option_c,
            option_d: mcq.option_d,
            correct_answer: mcq.correct_answer,
            explanation: mcq.explanation,
            category: mcq.category,
            subcategory: mcq.subcategory || null,
            difficulty: mcq.difficulty,
            mcq_date: mcq.mcq_date || new Date().toISOString().split('T')[0],
            mcq_type: mcq.mcq_type,
            question_type: 'mcq',
            is_active: true
          });

          if (error) {
            result.failed++;
            result.errors.push(`Question ${i + 1}: Database error - ${error.message}`);
          } else {
            result.success++;
          }
        } catch (err) {
          result.failed++;
          result.errors.push(`Question ${i + 1}: Parsing error`);
        }
      }

      setResult(result);
      
      if (result.success > 0) {
        toast({
          title: "Upload Complete",
          description: `Successfully added ${result.success} MCQs${result.failed > 0 ? `. ${result.failed} failed.` : ''}`,
        });
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Upload MCQs</CardTitle>
        <CardDescription>
          Upload a formatted .txt or .docx file with multiple MCQs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                .txt or .docx file with formatted MCQs
              </p>
            </div>
            <Input
              id="file-upload"
              type="file"
              accept=".txt,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          
          {uploading && (
            <p className="text-sm text-muted-foreground text-center">Processing file...</p>
          )}
        </div>

        {result && (
          <div className="space-y-3">
            <Alert variant={result.failed === 0 ? "default" : "destructive"}>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Upload Complete: {result.success} questions added successfully
              </AlertDescription>
            </Alert>
            
            {result.failed > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {result.failed} questions failed
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">
                      View Errors
                    </summary>
                    <ul className="mt-2 space-y-1 text-xs">
                      {result.errors.slice(0, 10).map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                      {result.errors.length > 10 && (
                        <li>... and {result.errors.length - 10} more errors</li>
                      )}
                    </ul>
                  </details>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="bg-muted p-4 rounded-lg text-xs space-y-2">
          <p className="font-semibold">Required Format:</p>
          <pre className="whitespace-pre-wrap text-xs">
{`Category: Static GK
Sub-Category: Awards & Honours
Difficulty: Medium
Type: General
MCQ Date: 03-10-2025
Question: Sample question?
Options:
A) Option A
B) Option B
C) Option C
D) Option D
Correct Answer: A
Explanation: Sample explanation
---`}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

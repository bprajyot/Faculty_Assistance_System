import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import './Quiz.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const GENAI_API_KEY = 'AIzaSyC9Lv74WbFRgZCs-k0h2ka0mMXKOura2Sk';

const App = () => {
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [showQuestions, setShowQuestions] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [generateLoading, setGenerateLoading] = useState(false);

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const extractTextFromPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      setTextContent(fullText.trim());
      return fullText.trim();
    } catch (error) {
      throw new Error('Error reading PDF: ' + error.message);
    }
  };

  const generateMCQs = async (numQuestions) => {
    setGenerateLoading(true);
    setProgress(30);
    try {
      const text = textContent;
      if (!text.trim()) {
        throw new Error('No text could be extracted from the PDF');
      }

      const maxLength = 30000;
      const truncatedText =
        text.length > maxLength ? text.slice(0, maxLength) + '...' : text;

      const prompt = `
        Create ${numQuestions} multiple-choice questions based on this text. For each question:
        1. Create a clear, specific question
        2. Provide 4 options (A, B, C, D)
        3. Indicate the correct answer
        4. Format as valid JSON

        Text: ${truncatedText}

        Response format:
        {
          "mcqs": [
            {
              "question": "question text",
              "options": {
                "A": "first option",
                "B": "second option",
                "C": "third option",
                "D": "fourth option"
              },
              "correct_answer": "A"
            }
          ]
        }
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GENAI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API Error: ${errorData.error?.message || 'Unknown error'}`
        );
      }

      const data = await response.json();

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }

      const mcqsText = data.candidates[0].content.parts[0].text;
      const jsonMatch = mcqsText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      setQuizData(JSON.parse(jsonMatch[0]));
      setProgress(100);
    } catch (error) {
      showError(`Failed to generate MCQs: ${error.message}`);
      console.error('Error:', error);
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      showError('Please select a PDF file');
      return;
    }

    try {
      setLoading(true);
      setProgress(30);

      const text = await extractTextFromPDF(file);
      if (!text.trim()) {
        throw new Error('No text could be extracted from the PDF');
      }
      setProgress(60);

      setProgress(100);
    } catch (error) {
      showError(error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const downloadQuestions = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(quizData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'mcq_questions.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="container max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">MCQ Quiz Generator</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <section className="box">
        <h2 className="text-xl font-semibold mb-4">Upload PDF</h2>
        <div className="space-y-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="block w-full"
          />
          <div>
            <label htmlFor="numQuestions" className="block mb-2">
              Number of questions:
            </label>
            <input
              type="number"
              id="numQuestions"
              min="1"
              max="20"
              defaultValue="5"
              className="border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="flex space-x-4 mt-4">
          {quizData ? (
            <>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => setShowQuestions((prev) => !prev)}
              >
                {showQuestions ? 'Hide Questions' : 'Check Questions'}
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={downloadQuestions}
              >
                Download Questions
              </button>
            </>
          ) : (
            <button
              onClick={async () => {
                const numQuestions = document.getElementById('numQuestions').value;
                await generateMCQs(numQuestions);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded"
              disabled={loading || generateLoading}
            >
              {generateLoading ? 'Generating Questions...' : 'Generate Questions'}
            </button>
          )}
        </div>
      </section>

      {showQuestions && quizData && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Question</th>
                <th>Options</th>
                <th>Correct Answer</th>
              </tr>
            </thead>
            <tbody>
              {quizData.mcqs.map((mcq, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{mcq.question}</td>
                  <td>
                    {Object.entries(mcq.options).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {value}
                      </div>
                    ))}
                  </td>
                  <td className="correct-answer">{mcq.correct_answer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default App;

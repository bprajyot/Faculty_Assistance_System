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
  const [showQuestions, setShowQuestions] = useState(false); // New state to toggle showing questions

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
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText.trim();
    } catch (error) {
      throw new Error('Error reading PDF: ' + error.message);
    }
  };

  const generateMCQs = async (text, numQuestions) => {
    try {
      const maxLength = 30000;
      const truncatedText = text.length > maxLength ? 
        text.slice(0, maxLength) + "..." : 
        text;

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

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GENAI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
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

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new Error(`Failed to generate MCQs: ${error.message}`);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const numQuestions = document.getElementById('numQuestions').value;

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

      const mcqs = await generateMCQs(text, numQuestions);
      setProgress(100);

      setQuizData(mcqs);
    } catch (error) {
      showError(error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const downloadMCQs = () => {
    const doc = new jsPDF();
    
    let yPos = 20;
    const lineHeight = 10;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    doc.setFontSize(16);
    doc.text('Multiple Choice Questions', margin, yPos);
    yPos += lineHeight * 2;

    doc.setFontSize(12);
    quizData.mcqs.forEach((mcq, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      const questionText = `Question ${index + 1}: ${mcq.question}`;
      const splitQuestion = doc.splitTextToSize(questionText, maxWidth);
      doc.text(splitQuestion, margin, yPos);
      yPos += lineHeight * splitQuestion.length;

      Object.entries(mcq.options).forEach(([key, value]) => {
        const optionText = `${key}: ${value}`;
        const splitOption = doc.splitTextToSize(optionText, maxWidth);
        doc.text(splitOption, margin + 5, yPos);
        yPos += lineHeight * splitOption.length;
      });

      doc.setTextColor(0, 100, 0);
      doc.text(`Correct Answer: ${mcq.correct_answer}`, margin, yPos);
      doc.setTextColor(0, 0, 0);
      
      yPos += lineHeight * 2;
    });

    doc.save('mcq_questions.pdf');
  };

  return (
    <div className="container max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">MCQ Quiz Generator</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <section className="border rounded p-6 mb-6">
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
        
        {loading && (
          <div className="mt-4">
            <p>Generating MCQs...</p>
            <div className="bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-green-600 h-2.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </section>

      {quizData && (
        <section className="border rounded p-6">
          <div className="flex space-x-4">
            <button
              onClick={downloadMCQs}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Download PDF
            </button>
            <button
              onClick={() => setShowQuestions(prev => !prev)} // Toggle display of questions
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Check Questions
            </button>
          </div>

          {/* Conditionally render the list of questions only when "Check Questions" is clicked */}
          {showQuestions && (
            <ul className="mt-6" style={{ listStyleType: 'decimal', paddingLeft: '20px' }}>
              {quizData.mcqs.map((mcq, index) => (
                <li key={index} style={{ marginBottom: '10px' }}>
                  <strong>{index + 1}. </strong>{mcq.question}
                  <ul style={{ listStyleType: 'none', paddingLeft: '20px' }}>
                    {Object.entries(mcq.options).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {value}
                      </li>
                    ))}
                    <li style={{ color: 'green', fontWeight: 'bold' }}>
                      Correct Answer: {mcq.correct_answer}
                    </li>
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};

export default App;

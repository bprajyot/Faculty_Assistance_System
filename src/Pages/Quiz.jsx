// App.js
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import './Quiz.css';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';


const GENAI_API_KEY = 'AIzaSyC9Lv74WbFRgZCs-k0h2ka0mMXKOura2Sk';

const App = () => {
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload', 'quiz', 'result'

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

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=AIzaSyC9Lv74WbFRgZCs-k0h2ka0mMXKOura2Sk`, {
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
      setUserAnswers(new Array(mcqs.mcqs.length).fill(null));
      setCurrentQuestionIndex(0);
      setCurrentStep('quiz');
    } catch (error) {
      showError(error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const saveAnswer = (answer) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const downloadMCQs = () => {
    const doc = new jsPDF();
    
    let yPos = 20;
    const lineHeight = 10;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    // Add title
    doc.setFontSize(16);
    doc.text('Multiple Choice Questions', margin, yPos);
    yPos += lineHeight * 2;

    // Add questions and answers
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

  const submitQuiz = () => {
    let score = 0;
    quizData.mcqs.forEach((mcq, index) => {
      if (userAnswers[index] === mcq.correct_answer) score++;
    });
    setCurrentStep('result');
  };

  return (
    <div className="container max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">MCQ Quiz Generator and Test</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {currentStep === 'upload' && (
        <section className="border rounded p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 1: Upload PDF</h2>
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
      )}

      {currentStep === 'quiz' && quizData && (
        <section className="border rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Step 2: Take the Quiz</h2>
          <div className="mb-6">
            <div className="font-semibold mb-2">
              Question {currentQuestionIndex + 1} of {quizData.mcqs.length}
            </div>
            <p className="text-lg mb-4">{quizData.mcqs[currentQuestionIndex].question}</p>
            <div className="space-y-3">
              {Object.entries(quizData.mcqs[currentQuestionIndex].options).map(([key, value]) => (
                <label key={key} className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name={`question${currentQuestionIndex}`}
                    value={key}
                    checked={userAnswers[currentQuestionIndex] === key}
                    onChange={() => saveAnswer(key)}
                    className="mr-3"
                  />
                  {key}: {value}
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              disabled={currentQuestionIndex === quizData.mcqs.length - 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
            <button
              onClick={submitQuiz}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Submit
            </button>
          </div>
        </section>
      )}

      {currentStep === 'result' && quizData && (
        <section className="border rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Quiz Results</h2>
          {quizData.mcqs.map((mcq, index) => {
            const isCorrect = userAnswers[index] === mcq.correct_answer;
            return (
              <div
                key={index}
                className={`mb-6 p-4 rounded ${
                  isCorrect ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <p className="font-semibold">Question {index + 1}: {mcq.question}</p>
                <p>Your answer: {userAnswers[index] ? 
                  `${userAnswers[index]}: ${mcq.options[userAnswers[index]]}` : 
                  'Not answered'
                }</p>
                <p className="text-green-700">
                  Correct answer: {mcq.correct_answer}: {mcq.options[mcq.correct_answer]}
                </p>
              </div>
            );
          })}
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">
              Final Score: {userAnswers.filter((answer, index) => 
                answer === quizData.mcqs[index].correct_answer
              ).length} out of {quizData.mcqs.length}
              ({((userAnswers.filter((answer, index) => 
                answer === quizData.mcqs[index].correct_answer
              ).length / quizData.mcqs.length) * 100).toFixed(2)}%)
            </h3>
            <button
              onClick={downloadMCQs}
              className="px-4 py-2 bg-blue-500 text-white rounded mr-4"
            >
              Download MCQs with Answers
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Start New Quiz
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default App;
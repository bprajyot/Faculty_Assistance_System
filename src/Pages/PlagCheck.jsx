import React, { useState } from 'react';

// Your component code
const PlagiarismChecker = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFile1Change = (e) => setFile1(e.target.files[0]);
  const handleFile2Change = (e) => setFile2(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!file1 || !file2) {
      setError('Both files must be uploaded.');
      return;
    }

    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);

    try {
      const response = await fetch('http://localhost:5000/plagcheck', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'An unexpected error occurred.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Document Plagiarism Checker</h1>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <label htmlFor="file1" className="form-label">
            Upload Original Document
          </label>
          <input
            type="file"
            id="file1"
            className="form-control"
            onChange={handleFile1Change}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="file2" className="form-label">
            Upload Created Document
          </label>
          <input
            type="file"
            id="file2"
            className="form-control"
            onChange={handleFile2Change}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Check Plagiarism
        </button>
      </form>

      {result && (
        <div className="mt-5">
          <h3 className="text-center">Results</h3>
          <p>
            <strong>Word-Level Similarity:</strong> {result.word_similarity}%
          </p>
          <p>
            <strong>Sentence-Level Similarity:</strong> {result.sentence_similarity}%
          </p>
          <p>
            <strong>Plagiarism Percentage:</strong> {result.plagiarism_percentage}%
          </p>
          {result.plagiarism_percentage < 20 ? (
            <div className="alert alert-success">The document is mostly original.</div>
          ) : result.plagiarism_percentage < 50 ? (
            <div className="alert alert-warning">
              There are some similarities between the documents.
            </div>
          ) : (
            <div className="alert alert-danger">Significant plagiarism detected!</div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-5 alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default PlagiarismChecker;

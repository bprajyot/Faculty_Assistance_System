import React, { useState } from "react";
import Loader from "../Components/Loader";
import axios from "axios";
import { ref, set } from "firebase/database"; // Import for saving to Realtime Database
import { auth } from '../Firebase';
import { getDatabase } from 'firebase/database';
import { app } from '../Firebase';
import { useNavigate } from 'react-router-dom';  // Importing the useNavigate hook
import "./Attendance.css";

const db = getDatabase(app);

function AttendancePage() {
  const navigate = useNavigate();  // Initialize the navigate function

  const [selectedImage, setSelectedImage] = useState(null);
  const [attendanceResults, setAttendanceResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState("");
  const [subject, setSubject] = useState("");
  const [division, setDivision] = useState("");

  const subjects = ["ANN", "OS", "AI", "DV", "CC"];
  const divisions = ["TY CSAI A", "SY CSAI A", "SY CSAI B"];

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedImage || !date || !subject || !division) {
      alert("Please fill all fields and select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("date", date);
    formData.append("subject", subject);
    formData.append("division", division);

    setIsLoading(true);

    try {
      // Send the image to your backend for processing
      const response = await axios.post(
        "http://127.0.0.1:5000/take_attendance",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const results = response.data.attendance || [];
      setAttendanceResults(results);
      alert("Image uploaded and attendance results received.");
    } catch (error) {
      console.error("Error uploading image or processing data:", error);
      alert("Failed to process attendance. Check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!attendanceResults.length) {
      alert("No attendance results to save.");
      return;
    }

    try {
      // Save attendance data to Firebase Realtime Database with structure
      const attendanceRef = ref(db, `attendance/${date}/${division}`);
      await set(attendanceRef, { attendance: attendanceResults });

      alert("Attendance data saved successfully!");

      // Redirect to home page after successful submission
      navigate('/home');  // Assuming the home page route is '/home'
    } catch (error) {
      console.error("Error saving data to Firebase:", error);
      alert("Failed to save attendance data. Check the console for details.");
    }
  };

  return (
    <div className="container">
      {!attendanceResults.length && !isLoading && (
        <>
          <h1 className="title">Take Attendance</h1>
          <p className="description">
            Upload an image of your class and select the required fields.
          </p>

          <div className="form-container">
            <div className="form-group" style={{ width: "18rem" }}>
              <label htmlFor="date">Date:</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ width: "18rem" }}>
              <label htmlFor="subject">Subject:</label>
              <select
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                <option value="">Select Subject</option>
                {subjects.map((sub, index) => (
                  <option key={index} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ width: "18rem" }}>
              <label htmlFor="division">Division:</label>
              <select
                id="division"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
              >
                <option value="">Select Division</option>
                {divisions.map((div, index) => (
                  <option key={index} value={div}>
                    {div}
                  </option>
                ))}
              </select>
            </div>

            <input type="file" accept="image/*" onChange={handleImageChange} />

            <button className="uploadButton" onClick={handleUpload}>
              📤 Upload Image
            </button>
          </div>
        </>
      )}

      {isLoading && (
        <div className="loader-container">
          <Loader />
        </div>
      )}

      {/* Show table only if there are attendance results */}
      {!isLoading && attendanceResults.length > 0 && (
        <div className="results">
          <h2>Attendance Results:</h2>
          <table className="attendance-table" style={{ width: '80vw' }}>
            <thead>
              <tr>
                <th>PRN</th>
                <th>Name</th>
                <th>Role No.</th>
              </tr>
            </thead>
            <tbody>
              {attendanceResults.map((result, index) => (
                <tr key={index}>
                  <td>{result.prn}</td>
                  <td>{result.name}</td>
                  <td>{result.roll_number}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="submitButton" onClick={handleSubmit}>
            ✔️ Submit Attendance
          </button>
        </div>
      )}
    </div>
  );
}

export default AttendancePage;

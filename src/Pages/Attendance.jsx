import React from "react";
import "./Attendance.css"; // Import the CSS file

function AttendancePage() {
  return (
    <div className="container">
      <h1 className="title">Take Attendance</h1>
      <p className="description">
        Upload an image of your class and we'll take care of the rest.
      </p>
      <button className="uploadButton">📤 Upload image</button>
    </div>
  );
}

export default AttendancePage;

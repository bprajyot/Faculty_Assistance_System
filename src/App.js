import './App.css';
import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Check, X, Link as LinkIcon } from 'lucide-react';
import Navbar from './Components/Navbar';
import { ToastContainer } from 'react-toastify';
import Signup from './Components/SignUp';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './Components/SignIn';
import StudentsGrid from './Pages/StudentsGrid';
import AddStudent from './Pages/AddStudent';
import Home from './Pages/Home';
import Attendance from './Pages/Attendance';
import Report from './Pages/Report';
import Students from './Pages/Students';
import Quiz from './Pages/Quiz';
import ProjectTracker from './Pages/ProjectTracker';

function App() {
  return (
    <div className="App">
      
        <Navbar/>
        {/* <Loader/> */}
      <Router>
        <Routes>
            <Route path='/signup' element={<Signup/>} />
            <Route path='/signin' element={<SignIn/>} />
            <Route path='/addstudents' element={<AddStudent/>} />
            <Route path = '/' element = {<Home/>}/>
            <Route path = '/home' element = {<Home/>}/>
            <Route path = '/takeattendance' element = {<Attendance/>}/>
            <Route path = '/report' element = {<Report/>}/>
            <Route path = '/studentlist' element = {<Students/>}/>
            <Route path='/studentgrid' element={<StudentsGrid/>} />
            <Route path='/quiz' element={<Quiz/>} />
            <Route path='/tracker' element={<ProjectTracker/>} />
        </Routes>
      </Router>
      <ToastContainer />
    </div>
  );
}

export default App;

import React, { useState } from 'react'
import Home from '../Pages/Home'
import Attendance from '../Pages/Attendance'
import Report from '../Pages/Report'
import Students from '../Pages/Students'
import './Navbar.css'
import { BrowserRouter as Router, a, Routes, Route } from 'react-router-dom'
import StudentsGrid from '../Pages/StudentsGrid'

export default function Navbar() {

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    }
    return (
        <Router>
            <nav style={{ width: '100%' }}>
                <div className='navbar'>
                    <div className='navbar-logo'>
                        <a style = {{textDecoration: "none", color: "white"}}onClick={toggleMenu} href='/home'>
                            <strong>Faculty Assistance System</strong>
                        </a>
                    </div>

                    <div className='menu' onClick={toggleMenu}>
                        <div className='menu-icon'></div>
                        <div className='menu-icon'></div>
                        <div className='menu-icon'></div>
                    </div>

                    <ul className={isMenuOpen ? 'navbar-links active' : 'navbar-links'}>
                        {/* <li><a onClick={toggleMenu} href='/home'>Home</a></li> */}
                        <li><a onClick={toggleMenu} href='/takeattendance'>Take Attendance</a></li>
                        <li><a onClick={toggleMenu} href='/quiz'>Quiz</a></li>
                        <li><a onClick={toggleMenu} href='/addstudents'>Add Students</a></li>
                        <li><a onClick={toggleMenu} href='/signin'>LogIn</a></li>
                    </ul>
                </div>

            </nav>



        </Router>
    )
}

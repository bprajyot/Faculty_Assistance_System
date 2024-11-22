import { React, useState } from 'react';
import './SignUp.css';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Firebase';
import { getDatabase, ref, set } from 'firebase/database';
import { app } from '../Firebase';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';  // Import the loader component
import { toast, ToastContainer } from 'react-toastify';  // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css';  // Import Toastify CSS

const db = getDatabase(app);

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [Name, setName] = useState("");
  const [facultyID, setFacultyID] = useState("");
  const [loading, setLoading] = useState(false);  // Loading state

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);  // Set loading to true when process starts
    try {
      // Create the user with email and password
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;

      if (user) {
        // If user creation is successful, save their data in the database
        await putData(Name, facultyID, email);
        console.log("User created and data saved:", user);
        
        // Redirect to the home page after successful sign-up
        navigate('/home');
        toast.success("User Registered Successfully", {
          position: "top-center",
          autoClose: 3000,  // Optional: auto close after 3 seconds
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message, {  // Use toast.error for error messages
        position: "bottom-center",
        autoClose: 5000,  // Optional: auto close after 5 seconds
      });
    } finally {
      setLoading(false);  // Stop the loader when process ends
    }
  }

  const putData = (Name, facultyID, email) => {
    return set(ref(db, `Faculties/${facultyID}`), {
      facultyID: facultyID,
      Name: Name,
      email: email
    })
    .then(() => {
      console.log('Data saved successfully!');
    })
    .catch((error) => {
      console.error('Error saving data:', error);
    });
  }

  if (loading) {
    return <Loader />;  // Show the loader while loading
  }

  return (
    <div>
      <ToastContainer />  {/* Render ToastContainer once in the component */}
      <div className="rectangle">
        <div className="inner">
          <h1>Sign Up</h1>   
          <hr/><br/>
          <div className="formandimg">
            <div className="img">
              <img src="loginimg.png" style={{paddingTop: "2rem"}} alt="Login illustration"/>              
            </div>

            <div className="form" style = {{marginLeft: "2rem"}}>
              <div className="form-group">
                <label style={{textAlign: "left"}}>Name</label>
                <input
                  type="text"
                  value={Name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Faculty ID</label>
                <input
                  type="text"
                  value={facultyID}
                  onChange={(e) => setFacultyID(e.target.value)}
                  placeholder="Enter your facutly id"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button onClick={handleSubmit} type="submit" className="submit-btn">Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

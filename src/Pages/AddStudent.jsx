import { React, useState } from 'react';
import './AddStudent.css';
import { getDatabase, ref, set, get } from 'firebase/database';
import { app, storage } from '../Firebase';
import { useNavigate } from 'react-router-dom';
import Loader from '../Components/Loader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const db = getDatabase(app);

export default function StudentDetails() {
    const [email, setEmail] = useState("");
    const [PRN, setPRN] = useState("");
    const [name, setName] = useState("");
    const [division, setDivision] = useState("");
    const [roll, setRoll] = useState("");
    const [year, setYear] = useState("");
    const [branch, setBranch] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const existingStudentRef = ref(db, `Students/${PRN}`);
            const snapshot = await get(existingStudentRef);
            if (snapshot.exists()) {
                toast.error("PRN already exists!", {
                    position: "bottom-center",
                    autoClose: 5000,
                });
                return;
            }

            await putData(name, PRN, email, division, roll, image);
            toast.success("Student Details Saved Successfully", {
                position: "top-center",
                autoClose: 3000,
            });

            navigate('/home');
        } catch (error) {
            console.error('Error during form submission:', error);
            toast.error("Error saving student details", {
                position: "bottom-center",
                autoClose: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    const uploadImage = async (image) => {
        try {
            const imageRef = storageRef(storage, `images/${image.name}`);
            await uploadBytes(imageRef, image);
            const imageUrl = await getDownloadURL(imageRef);
            return imageUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const putData = async (name, PRN, email, division, roll, image) => {
        let imageUrl = null;
        if (image) {
            imageUrl = await uploadImage(image);
        }

        return set(ref(db, `Students/${PRN}`), {
            Name: name,
            PRN: PRN,
            Email: email,
            Division: division,
            RollNumber: roll,
            image: imageUrl,
        });
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div>
            <ToastContainer />
            <div className="rectangle">
                <div className="inner">
                    <h1>Student Details</h1>
                    <hr /><br />
                    <div className="formandimg">
                        <div>
                            <div style={{ width: "150%" }}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter Full Name of the Student"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>PRN</label>
                                    <input
                                        type="number"
                                        value={PRN}
                                        onChange={(e) => setPRN(e.target.value)}
                                        placeholder="Enter PRN of the Student"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter email of the Student"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Add Image</label>
                                    <input type="file" onChange={handleImageChange} />
                                </div>
                            </div>
                        </div>
                        <div className="form">
                            <div>
                                <div className="form-group">
                                    <label>Year</label>
                                    <input
                                        type="text"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        placeholder="Enter Year of the Student"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Branch</label>
                                    <input
                                        type="text"
                                        value={branch}
                                        onChange={(e) => setBranch(e.target.value)}
                                        placeholder="Enter Branch of the Student"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Division</label>
                                    <input
                                        type="text"
                                        value={division}
                                        onChange={(e) => setDivision(e.target.value)}
                                        placeholder="Enter Division of the Student"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Roll Number</label>
                                    <input
                                        type="number"
                                        value={roll}
                                        onChange={(e) => setRoll(e.target.value)}
                                        placeholder="Enter Roll Number of the Student"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleSubmit} type="submit" className="submit-btn">Submit</button>
                </div>
            </div>
        </div>
    );
}

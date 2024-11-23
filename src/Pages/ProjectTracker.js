import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Check, X, Link as LinkIcon } from 'lucide-react';
import './Tracker.css';
const ProjectTracker = () => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    gitRepo: '',
    students: [],
    checkpoints: []
  });
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState({ show: false, projectId: null });
  const [showAddCheckpoint, setShowAddCheckpoint] = useState({ show: false, projectId: null });
  const [newStudent, setNewStudent] = useState({ name: '', prn: '' });
  const [newCheckpoint, setNewCheckpoint] = useState({ title: '', deadline: '' });

  // Load projects from local storage
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  // Save projects to local storage
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const addProject = () => {
    if (newProject.title && newProject.description) {
      const projectToAdd = {
        ...newProject,
        id: Date.now(),
        createdAt: new Date().toLocaleDateString()
      };
      setProjects([...projects, projectToAdd]);
      setNewProject({ title: '', description: '', gitRepo: '', students: [], checkpoints: [] });
      setShowAddProject(false);
    }
  };

  const addStudent = (projectId) => {
    if (newStudent.name && newStudent.prn) {
      setProjects(projects.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            students: [...project.students, {
              id: Date.now(),
              name: newStudent.name,
              prn: newStudent.prn
            }]
          };
        }
        return project;
      }));
      setNewStudent({ name: '', prn: '' });
      setShowAddStudent({ show: false, projectId: null });
    }
  };

  const addCheckpoint = (projectId) => {
    if (newCheckpoint.title && newCheckpoint.deadline) {
      setProjects(projects.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            checkpoints: [...project.checkpoints, {
              id: Date.now(),
              title: newCheckpoint.title,
              deadline: newCheckpoint.deadline,
              completed: false
            }]
          };
        }
        return project;
      }));
      setNewCheckpoint({ title: '', deadline: '' });
      setShowAddCheckpoint({ show: false, projectId: null });
    }
  };

  const toggleCheckpoint = (projectId, checkpointId) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          checkpoints: project.checkpoints.map(checkpoint => {
            if (checkpoint.id === checkpointId) {
              return { ...checkpoint, completed: !checkpoint.completed };
            }
            return checkpoint;
          })
        };
      }
      return project;
    }));
  };

  const deleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(project => project.id !== projectId));
    }
  };

  const deleteStudent = (projectId, studentId) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          students: project.students.filter(student => student.id !== studentId)
        };
      }
      return project;
    }));
  };

  const deleteCheckpoint = (projectId, checkpointId) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          checkpoints: project.checkpoints.filter(checkpoint => checkpoint.id !== checkpointId)
        };
      }
      return project;
    }));
  };

  return (
    <div className="min-h-scree p-6" >
      <div className="container" style={{maxWidth: '100vw', color: "white"}}>
        <div className="flex justify-between items-center mb-8" style = {{color: "#141B2D"}}>
          <h1 className="text-4xl font-bold" style = {{color: "white"}}>Project Tracker</h1>
          <button
            onClick={() => setShowAddProject(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <PlusCircle className="mr-2" /> Add New Project
          </button>
        </div>

        {/* Add Project Modal */}
        {showAddProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className=" p-6 rounded-lg shadow-xl w-96" style = {{color: "#141B2D"}}>
              <h2 className="text-2xl font-semibold mb-4">Create New Project</h2>
              <input
                type="text"
                placeholder="Project Title"
                className="w-full p-2 border rounded mb-4"
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
              />
              <textarea
                placeholder="Project Description"
                className="w-full p-2 border rounded mb-4 h-32"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              />
              <input
                type="url"
                placeholder="Git Repository URL (optional)"
                className="w-full p-2 border rounded mb-4"
                value={newProject.gitRepo}
                onChange={(e) => setNewProject({...newProject, gitRepo: e.target.value})}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddProject(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={addProject}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Student Modal */}
        {showAddStudent.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="p-6 rounded-lg shadow-xl w-96" style = {{backgroundColor: "#2d4161"}}>
              <h2 className="text-2xl font-semibold mb-4">Add Student</h2>
              <input
                type="text"
                placeholder="Student Name"
                className="w-full p-2 border rounded mb-4"
                value={newStudent.name}
                style = {{color : "#141B2D"}}
                onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
              />
              <input
                type="text"
                placeholder="PRN Number"
                className="w-full p-2 border rounded mb-4"
                value={newStudent.prn}
                style = {{color : "#141B2D"}}
                onChange={(e) => setNewStudent({...newStudent, prn: e.target.value})}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddStudent({ show: false, projectId: null })}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addStudent(showAddStudent.projectId)}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Add Student
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Checkpoint Modal */}
        {showAddCheckpoint.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
              <h2 className="text-2xl font-semibold mb-4">Add Checkpoint</h2>
              <input
                type="text"
                placeholder="Checkpoint Title"
                className="w-full p-2 border rounded mb-4"
                value={newCheckpoint.title}
                style = {{color : "#141B2D"}}
                onChange={(e) => setNewCheckpoint({...newCheckpoint, title: e.target.value})}
              />
              <input
                type="date"
                className="w-full p-2 border rounded mb-4"
                value={newCheckpoint.deadline}
                style = {{color : "#141B2D"}}
                onChange={(e) => setNewCheckpoint({...newCheckpoint, deadline: e.target.value})}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddCheckpoint({ show: false, projectId: null })}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addCheckpoint(showAddCheckpoint.projectId)}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Add Checkpoint
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {projects.map(project => (
            <div
              key={project.id}
              className="rounded-lg shadow-md p-6 relative flex flex-col"
              style = {{backgroundColor: "#2d4161 "}}
            >
              {/* Project Header */}
              <div className="flex justify-between items-start mb-4" style = {{color: "white"}}>
                <div>
                  <h2 className="text-2xl font-bold text-white">{project.title}</h2>
                  <p className="text-sm" style = {{color : "white"}}>Created: {project.createdAt}</p>
                </div>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 />
                </button>
              </div>

              {/* Project Description */}
              <p className=" mb-4" style = {{color : "white"}}>{project.description}</p>

              {/* Git Repo Link */}
              {project.gitRepo && (
                <div className="mb-4 flex items-center">
                  <LinkIcon size={16} className="mr-2 text-gray-500" />
                  <a
                    href={project.gitRepo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 truncate"
                  >
                    Repository Link
                  </a>
                </div>
              )}

              {/* Students Section */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">Students</h3>
                  <button
                    onClick={() => setShowAddStudent({ show: true, projectId: project.id })}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <PlusCircle size={20} style = {{color: "white"}}/>
                  </button>
                </div>
                {project.students.map(student => (
                  <div
                    key={student.id}
                    className="flex justify-between items-center p-2 rounded mb-1"
                    style = {{backgroundColor: "#4c6ea4 "}}
                  >
                    <div                    >
                      <span className="font-medium">{student.name}</span>
                      <span className="text-sm ml-2" style = {{color : "white"}}> {student.prn}</span>
                    </div>
                    <button
                      onClick={() => deleteStudent(project.id, student.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Checkpoints Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">Checkpoints</h3>
                  <button
                    onClick={() => setShowAddCheckpoint({ show: true, projectId: project.id })}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <PlusCircle size={20} style = {{color: "white"}}/>
                  </button>
                </div>
                {project.checkpoints.map(checkpoint => (
                  <div
                    key={checkpoint.id}
                    className="flex justify-between items-center p-2 rounded mb-1"
                    style = {{backgroundColor: "#4c6ea4 "}}
                  >
                    <div>
                    <div className={`${checkpoint.completed ? 'line-through' : ''}`}
                      style = {{color : "white"}}
                    >

                        {checkpoint.title}
                      </div>
                      <div className="text-sm" style = {{color : "white"}}>
                        {new Date(checkpoint.deadline).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleCheckpoint(project.id, checkpoint.id)}
                        cclassName={`p-1 rounded ${checkpoint.completed ? 'text-green-500' : 'text-gray-400'}`}

                      >
                        {checkpoint.completed ? <Check size={16} /> : <X size={16} />}
                      </button>
                      <button
                        onClick={() => deleteCheckpoint(project.id, checkpoint.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-xl text-gray-500">
              No projects yet. Click "Add New Project" to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTracker;
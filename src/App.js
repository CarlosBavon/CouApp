import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

// Set base URL for API calls
const API_BASE_URL = "https://couappback.onrender.com";

function App() {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authData, setAuthData] = useState({
    email: "",
    password: "",
    name: "",
  });

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
      fetchEntries(token);
    }
  }, []);

  const fetchEntries = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/entries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries(response.data);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  const handleAuth = (e) => {
    e.preventDefault();

    if (isRegistering) {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/register`, authData);
      // After successful registration, switch to login
      setIsRegistering(false);
      alert("Registration successful! Please login.");
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        email: authData.email,
        password: authData.password,
      });

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setIsLoggedIn(true);
      setUser(user);
      fetchEntries(token);
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.message || "Login failed");
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (newEntry.trim() === "") return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/entries`,
        { text: newEntry },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEntries([response.data, ...entries]);
      setNewEntry("");
    } catch (error) {
      console.error("Error adding entry:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setEntries([]);
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>Our Special Journal</h1>
          <p>Just for me and mine 💕</p>

          <form onSubmit={handleAuth}>
            {isRegistering && (
              <input
                type="text"
                placeholder="Your Name"
                value={authData.name}
                onChange={(e) =>
                  setAuthData({ ...authData, name: e.target.value })
                }
                required
              />
            )}

            <input
              type="email"
              placeholder="Your Email"
              value={authData.email}
              onChange={(e) =>
                setAuthData({ ...authData, email: e.target.value })
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={authData.password}
              onChange={(e) =>
                setAuthData({ ...authData, password: e.target.value })
              }
              required
            />

            <button type="submit">
              {isRegistering ? "Create Account" : "Login"}
            </button>
          </form>

          <p className="auth-toggle">
            {isRegistering
              ? "Already have an account? "
              : "Don't have an account? "}
            <span onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? "Login" : "Register"}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header>
        <h1>Our Love Journal</h1>
        <div className="user-info">
          <span>Hello, {user?.name}!</span>
          <button onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <div className="journal-container">
        <div className="add-entry">
          <h2>Add a new memory</h2>
          <form onSubmit={handleAddEntry}>
            <textarea
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="Share your thoughts, memories, or feelings..."
              rows="4"
            />
            <button type="submit">Save Memory</button>
          </form>
        </div>

        <div className="entries-list">
          <h2>Our Memories</h2>
          {entries.length === 0 ? (
            <p>No entries yet. Share your first memory!</p>
          ) : (
            entries.map((entry) => (
              <div key={entry._id || entry.id} className="entry">
                <div className="entry-header">
                  <span className="author">
                    {entry.author?.name || entry.author}
                  </span>
                  <span className="date">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
                <p>{entry.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

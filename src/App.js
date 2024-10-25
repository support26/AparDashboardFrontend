import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // We'll create this file for styling
import DashboardManager from './DashboardManager';
import Navbar from './Navbar';
import Footer from './Footer';
import Swal from 'sweetalert2';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [userRole, setUserRole] = useState(null);
    const [dashboards, setDashboards] = useState([]);
    const [selectedDashboard, setSelectedDashboard] = useState(null);
    const [isOtpButtonDisabled, setIsOtpButtonDisabled] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            verifyToken(token);
        }
    }, []);

    const verifyToken = async (token) => {
        try {
            const response = await axios.post('https://dashboards-backend.anaxee.com/verify-token', { token });
            if (response.data.valid) {
                setIsAuthenticated(true);
                setEmail(response.data.email);
                setUserRole(response.data.role);
                fetchDashboards(token);
            }
        } catch (error) {
            console.error('Error verifying token:', error);
            handleLogout();
        }
    };

    const fetchDashboards = async (token) => {
        try {
            const response = await axios.get('https://dashboards-backend.anaxee.com/dashboards', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDashboards(response.data);
        } catch (error) {
            console.error('Error fetching dashboards:', error);
        }
    };

    const handleGetOtp = async () => {
        if (isOtpButtonDisabled) return;

        setIsOtpButtonDisabled(true);
        try {
            await axios.post('https://dashboards-backend.anaxee.com/send-otp', { email });
            Swal.fire({
                icon: 'success',
                title: 'OTP Sent',
                text: 'The OTP has been sent to your email!',
                confirmButtonText: 'OK'
            });
        } catch (error) {
            console.error('Error sending OTP:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: 'Error sending OTP. Please try again.',
                confirmButtonText: 'OK'
            });
        } finally {
            // Re-enable the button after 5 seconds
            setTimeout(() => setIsOtpButtonDisabled(false), 10000);
        }
    };

    const handleOtpSubmit = async () => {
        try {
            const response = await axios.post('https://dashboards-backend.anaxee.com/verify-otp', { email, otp });
            if (response.data.message === 'Login successful!') {
                localStorage.setItem('authToken', response.data.token);
                setIsAuthenticated(true);
                setUserRole(response.data.role);
                fetchDashboards(response.data.token);
                Swal.fire({
                    icon: 'success',
                    title: 'Login Successful',
                    text: '',
                    confirmButtonText: 'OK'
                });
                // Clear the OTP after successful submission
                setOtp('');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            Swal.fire({
                icon: 'error',
                title: 'Invalid OTP',
                text: 'Please try again.',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.post('https://dashboards-backend.anaxee.com/logout', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Swal.fire({
                icon: 'Success',
                title: 'Logout Successful',
                text: '',
                confirmButtonText: 'OK'
            });
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            localStorage.removeItem('authToken');
            setIsAuthenticated(false);
            setEmail('');
            setUserRole(null);
            setDashboards([]);
            setSelectedDashboard(null);
        }
    };

    return (
        <div className="app">
            <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
            <div className="app-container">
                {isAuthenticated ? (
                    <div className="dashboard-container">
                        <h1>Welcome, {email}!</h1>
                        <p className="user-role"></p>
                        <div className="dashboard-selector">
                            <select onChange={(e) => setSelectedDashboard(e.target.value)}>
                                <option value="">Select a dashboard</option>
                                {dashboards.map((dashboard) => (
                                    <option key={dashboard.id} value={dashboard.id}>
                                        {dashboard.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {selectedDashboard && (
                            <div className="dashboard-frame">   
                                <iframe
                                    title="Metabase Dashboard"
                                    src={dashboards.find(d => d.id === parseInt(selectedDashboard)).url}
                                    frameBorder="0"
                                    width="100%"
                                    height="800px"
                                    allowTransparency
                                ></iframe>
                            </div>
                        )}
                        {userRole === 'admin' && <DashboardManager />}
                    </div>
                ) : (
                    <div className="login-container">
                        <h2>Login</h2>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                        />
                        <button 
                            onClick={handleGetOtp} 
                            disabled={isOtpButtonDisabled}
                        >
                            {isOtpButtonDisabled ? 'Wait 5s' : 'Get OTP'}
                        </button>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                        />
                        <button onClick={handleOtpSubmit}>Submit OTP</button>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default App;

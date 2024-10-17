import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

// Add this function at the beginning of your DashboardManager component
const authAxios = axios.create({
    baseURL: 'https://dashboards-backend.anaxee.com',
    headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
});

function DashboardManager({ onDashboardsChange }) {
    const [dashboards, setDashboards] = useState([]);
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [allowedRoles, setAllowedRoles] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchDashboards();
    }, []);

    const fetchDashboards = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('https://dashboards-backend.anaxee.com/dashboards', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDashboards(response.data);
        } catch (error) {
            console.error('Error fetching dashboards:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        console.log('Sending request with token:', token);
        try {
            if (editingId) {
                await axios.put(`https://dashboards-backend.anaxee.com/dashboards/${editingId}`, 
                    { title, url, allowedRoles },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post('https://dashboards-backend.anaxee.com/dashboards', 
                    { title, url, allowedRoles },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            setTitle('');
            setUrl('');
            setAllowedRoles([]);
            setEditingId(null);
            fetchDashboards();
            if (typeof onDashboardsChange === 'function') {
                onDashboardsChange();
            }
            Swal.fire({
                icon: 'Success',
                title: 'Dashboard Saved',
                text: '',
                confirmButtonText: 'OK'
            });
        } catch (error) {
            console.error('Error saving dashboard:', error.response ? error.response.data : error);
            Swal.fire({
                icon: 'Failed',
                title: 'Login Successful',
                text: '',
                confirmButtonText: 'OK'
            });
            Swal.fire({
                icon: 'Failed',
                title: 'Error saving dashbaord',
                text: '',
                confirmButtonText: 'OK'
            });
            // alert(`Error saving dashboard: ${error.response ? error.response.data.message : error.message}`);
        }
    };

    const handleEdit = (dashboard) => {
        setTitle(dashboard.title);
        setUrl(dashboard.url);
        setAllowedRoles(JSON.parse(dashboard.allowed_roles || '[]'));
        setEditingId(dashboard.id);
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('authToken');
        try {
            await axios.delete(`https://dashboards-backend.anaxee.com/dashboards/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDashboards();
            if (typeof onDashboardsChange === 'function') {
                onDashboardsChange();
            }
        } catch (error) {
            console.error('Error deleting dashboard:', error);
        }
    };

    const handleRoleChange = (role) => {
        setAllowedRoles(prev => 
            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
        );
    };

    return (
        <div>
            <h2>Manage Dashboards</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Dashboard Title"
                    required
                />
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Dashboard URL"
                    required
                />
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={allowedRoles.includes('user1')}
                            onChange={() => handleRoleChange('user1')}
                        /> User1
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={allowedRoles.includes('user2')}
                            onChange={() => handleRoleChange('user2')}
                        /> User2
                    </label>
                </div>
                <button type="submit">{editingId ? 'Update' : 'Add'} Dashboard</button>
            </form>
            <ul>
                {dashboards.map((dashboard) => (
                    <li key={dashboard.id}>
                        {dashboard.title} - {dashboard.url}
                        <br />
                        Allowed Roles: {JSON.parse(dashboard.allowed_roles || '[]').join(', ')}
                        <button onClick={() => handleEdit(dashboard)}>Edit</button>
                        <button onClick={() => handleDelete(dashboard.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default DashboardManager;

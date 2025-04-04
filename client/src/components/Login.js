import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css'


const Login = () => {

    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            navigate('/');
        }
        catch (error) {
            setError(error.message);
            console.log('Login error:', error);
        }
    }

    return (
        <div className='login-container'>
            <div className='login-form'>
                <h2 className='form-title'>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label>user name </label>
                        <input
                            name='userName'
                            type='text'
                            placeholder='User Name'
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        >
                        </input>
                    </div>
                    <div className='form-group'>
                        <label>password </label>
                        <input
                            name='password'
                            type='password'
                            placeholder='Password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        >
                        </input>
                    </div>
                    <button className='login-btn' type='submit'>Login</button>
                    {error && <div className='error-message'>{error}</div>}
                </form>

            </div>
        </div>
    )

}

export default Login;
import React, { useState } from 'react';
import { resendVerification } from './api/index';

const ResendVerification = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await resendVerification(email);
        if (response.error) {
            setMessage(response.error);
        } else {
            setMessage('Verification email sent successfully.');
        }
    };

    return (
        <div>
            <h1>Resend Verification Email</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit">Resend Email</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ResendVerification;

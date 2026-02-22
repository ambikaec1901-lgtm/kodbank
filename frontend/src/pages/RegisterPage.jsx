import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_BASE from '../config'

export default function RegisterPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        uid: '', username: '', password: '', email: '', phone: '', role: 'Customer'
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const res = await axios.post(`${API_BASE}/api/register`, form)
            setSuccess(res.data.message)
            setTimeout(() => navigate('/login'), 1800)
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page">
            <div className="card">
                {/* Logo */}
                <div className="logo-row">
                    <div className="logo-icon">🏦</div>
                    <span className="logo-text">KodBank</span>
                </div>

                <h2 className="page-title" style={{ marginTop: 20 }}>Create Account</h2>
                <p className="page-subtitle">Join KodBank and get ₹1,00,000 instantly</p>

                {/* Alerts */}
                {error && (
                    <div className="alert alert-error">
                        <span>⚠️</span> {error}
                    </div>
                )}
                {success && (
                    <div className="alert alert-success">
                        <span>✅</span> {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Row 1 */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">UID</label>
                            <input
                                id="reg-uid"
                                className="form-input"
                                name="uid"
                                placeholder="e.g. KOD001"
                                value={form.uid}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input
                                id="reg-username"
                                className="form-input"
                                name="username"
                                placeholder="e.g. johndoe"
                                value={form.username}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            id="reg-password"
                            className="form-input"
                            type="password"
                            name="password"
                            placeholder="Min 6 characters"
                            value={form.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            id="reg-email"
                            className="form-input"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Row 2 */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input
                                id="reg-phone"
                                className="form-input"
                                name="phone"
                                placeholder="+91 9876543210"
                                value={form.phone}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <select
                                id="reg-role"
                                className="form-select"
                                name="role"
                                value="Customer"
                                disabled
                            >
                                <option value="Customer">Customer</option>
                            </select>
                        </div>
                    </div>

                    {/* Balance note */}
                    <div style={{
                        background: 'rgba(0, 200, 83, 0.08)',
                        border: '1px solid rgba(0, 200, 83, 0.2)',
                        borderRadius: 10,
                        padding: '10px 14px',
                        marginBottom: 20,
                        fontSize: 13,
                        color: '#00e67699',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        🎁 <span style={{ color: '#00e676', fontWeight: 600 }}>Welcome Bonus: ₹1,00,000</span>&nbsp;will be added to your account
                    </div>

                    <button id="reg-submit" className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? <><span className="spinner"></span>Creating Account...</> : '🚀 Create Account'}
                    </button>
                </form>

                <div className="link-row">
                    Already have an account?{' '}
                    <a href="/login">Sign In →</a>
                </div>
            </div>
        </div>
    )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_BASE from '../config'

export default function LoginPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ username: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await axios.post(`${API_BASE}/api/login`, form, {
                withCredentials: true
            })
            navigate('/userdashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.')
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

                <h2 className="page-title" style={{ marginTop: 20 }}>Welcome Back</h2>
                <p className="page-subtitle">Sign in to access your account</p>

                {/* Lock icon divider */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 28
                }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    <span style={{ fontSize: 20 }}>🔐</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-error">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            id="login-username"
                            className="form-input"
                            name="username"
                            placeholder="Enter your username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            id="login-password"
                            className="form-input"
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Security note */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 20,
                        fontSize: 13,
                        color: 'var(--text-muted)'
                    }}>
                        <span>🔒</span>
                        <span>Your session is protected with JWT authentication</span>
                    </div>

                    <button id="login-submit" className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? <><span className="spinner"></span>Signing In...</> : '🔓 Sign In to KodBank'}
                    </button>
                </form>

                <div className="link-row">
                    New to KodBank?{' '}
                    <a href="/register">Create Account →</a>
                </div>
            </div>
        </div>
    )
}

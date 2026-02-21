import { useState } from 'react'

export default function SettingsView({ profile, onLogout }) {
    const [activeTab, setActiveTab] = useState('profile')
    const [notifs, setNotifs] = useState({ transactions: true, promotions: false, security: true, balance: true })
    const [theme, setTheme] = useState('light')

    const toggle = (key) => setNotifs(p => ({ ...p, [key]: !p[key] }))

    return (
        <div className="view-wrap">
            <div className="view-heading">Settings</div>
            <div className="view-sub">Manage your account preferences and security</div>

            <div className="settings-layout">
                {/* Tabs */}
                <div className="settings-tabs">
                    {[
                        { key: 'profile', icon: '👤', label: 'Profile' },
                        { key: 'security', icon: '🔐', label: 'Security' },
                        { key: 'notifs', icon: '🔔', label: 'Notifications' },
                        { key: 'prefs', icon: '🎨', label: 'Preferences' },
                    ].map(t => (
                        <button
                            key={t.key}
                            className={`settings-tab ${activeTab === t.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(t.key)}
                        >
                            <span>{t.icon}</span> {t.label}
                        </button>
                    ))}
                    <button className="settings-tab logout-tab" onClick={onLogout}>
                        <span>🚪</span> Sign Out
                    </button>
                </div>

                {/* Content */}
                <div className="settings-content">

                    {/* PROFILE */}
                    {activeTab === 'profile' && (
                        <div className="db-card">
                            <div className="db-card-title" style={{ marginBottom: 24 }}>Profile Information</div>
                            <div className="settings-avatar-row">
                                <div className="settings-big-avatar">
                                    {profile?.username?.slice(0, 2).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 18, color: '#1a1f36' }}>{profile?.username}</div>
                                    <div style={{ color: '#6b7280', fontSize: 14 }}>{profile?.role}</div>
                                </div>
                            </div>
                            <div className="settings-fields">
                                {[
                                    { label: 'User ID', val: profile?.uid },
                                    { label: 'Username', val: profile?.username },
                                    { label: 'Email', val: profile?.email },
                                    { label: 'Phone', val: profile?.phone },
                                    { label: 'Role', val: profile?.role },
                                ].map((f, i) => (
                                    <div key={i} className="settings-field">
                                        <label className="tf-label">{f.label}</label>
                                        <input className="tf-input" value={f.val || ''} readOnly style={{ background: '#f8f9fe' }} />
                                    </div>
                                ))}
                            </div>
                            <button className="tf-btn" style={{ maxWidth: 220, marginTop: 8 }}
                                onClick={() => alert('Profile editing coming soon!')}>
                                ✏️ Edit Profile
                            </button>
                        </div>
                    )}

                    {/* SECURITY */}
                    {activeTab === 'security' && (
                        <div className="db-card">
                            <div className="db-card-title" style={{ marginBottom: 24 }}>Security Settings</div>
                            <div className="security-items">
                                {[
                                    { icon: '🔑', title: 'Change Password', sub: 'Last changed: Never', btn: 'Change', danger: false },
                                    { icon: '📲', title: '2-Factor Auth', sub: 'Adds extra security layer', btn: 'Enable', danger: false },
                                    { icon: '📋', title: 'Login Activity', sub: 'View recent login sessions', btn: 'View', danger: false },
                                    { icon: '🗑', title: 'Delete Account', sub: 'Permanently remove your account', btn: 'Delete', danger: true },
                                ].map((s, i) => (
                                    <div key={i} className="security-row">
                                        <div className="security-row-icon">{s.icon}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, color: '#1a1f36', fontSize: 14 }}>{s.title}</div>
                                            <div style={{ color: '#9ca3af', fontSize: 12 }}>{s.sub}</div>
                                        </div>
                                        <button
                                            className={s.danger ? 'sec-btn danger' : 'sec-btn'}
                                            onClick={() => alert(`${s.title} coming soon!`)}
                                        >
                                            {s.btn}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* NOTIFICATIONS */}
                    {activeTab === 'notifs' && (
                        <div className="db-card">
                            <div className="db-card-title" style={{ marginBottom: 24 }}>Notifications</div>
                            {[
                                { key: 'transactions', title: 'Transaction Alerts', sub: 'Notified for every debit/credit' },
                                { key: 'security', title: 'Security Alerts', sub: 'Login, password change, etc.' },
                                { key: 'balance', title: 'Low Balance Alerts', sub: 'Notify when balance is low' },
                                { key: 'promotions', title: 'Promotions & Offers', sub: 'Exclusive offers from KodBank' },
                            ].map(n => (
                                <div key={n.key} className="notif-row">
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#1a1f36', fontSize: 14 }}>{n.title}</div>
                                        <div style={{ color: '#9ca3af', fontSize: 12 }}>{n.sub}</div>
                                    </div>
                                    <button
                                        className={`toggle-btn ${notifs[n.key] ? 'on' : 'off'}`}
                                        onClick={() => toggle(n.key)}
                                    >
                                        <span className="toggle-knob" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* PREFERENCES */}
                    {activeTab === 'prefs' && (
                        <div className="db-card">
                            <div className="db-card-title" style={{ marginBottom: 24 }}>Preferences</div>

                            <div className="tf-label" style={{ marginBottom: 10 }}>Theme</div>
                            <div className="theme-row">
                                {['light', 'dark', 'system'].map(t => (
                                    <button
                                        key={t}
                                        className={`theme-btn ${theme === t ? 'active' : ''}`}
                                        onClick={() => setTheme(t)}
                                    >
                                        {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '🖥️'} {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <div className="tf-label" style={{ margin: '24px 0 10px' }}>Language</div>
                            <select className="tf-input" style={{ maxWidth: 260, appearance: 'auto' }}>
                                <option>English (India)</option>
                                <option>हिन्दी</option>
                                <option>தமிழ்</option>
                                <option>తెలుగు</option>
                            </select>

                            <div className="tf-label" style={{ margin: '24px 0 10px' }}>Currency Display</div>
                            <select className="tf-input" style={{ maxWidth: 260, appearance: 'auto' }}>
                                <option>₹ Indian Rupee (INR)</option>
                                <option>$ US Dollar (USD)</option>
                            </select>

                            <button className="tf-btn" style={{ maxWidth: 220, marginTop: 28 }}
                                onClick={() => alert('Preferences saved!')}>
                                💾 Save Preferences
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../dashboard.css'

// ─── VIEWS ─────────────────────────────────────────────────────────────────────
import AccountsView from '../views/AccountsView'
import CardsView from '../views/CardsView'
import TransferView from '../views/TransferView'
import BillsView from '../views/BillsView'
import SettingsView from '../views/SettingsView'

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const TRANSACTIONS = [
    { id: 1, name: 'Jenny Wilson', txId: '2425666', type: 'Money In', amount: +455, date: '20 Dec 24', avatar: 'JW' },
    { id: 2, name: 'Robert Fox', txId: '2425667', type: 'Money Out', amount: -455, date: '20 Dec 24', avatar: 'RF' },
    { id: 3, name: 'Jacob Jones', txId: '2425668', type: 'Money In', amount: +1200, date: '19 Dec 24', avatar: 'JJ' },
    { id: 4, name: 'Seema Patel', txId: '2425669', type: 'Money Out', amount: -800, date: '18 Dec 24', avatar: 'SP' },
    { id: 5, name: 'Arjun Sharma', txId: '2425670', type: 'Money In', amount: +3500, date: '17 Dec 24', avatar: 'AS' },
]

const FAVOURITES = [
    { name: 'Kathryn Murphy', role: 'Savings Account', avatar: 'KM' },
    { name: 'Wade Warren', role: 'Current Account', avatar: 'WW' },
]

const INSIGHTS = [
    { month: 'Jan', out: 60, in: 40 },
    { month: 'Mar', out: 80, in: 55 },
    { month: 'May', out: 50, in: 70 },
    { month: 'Jul', out: 75, in: 60 },
    { month: 'Sep', out: 85, in: 50 },
    { month: 'Nov', out: 65, in: 80 },
    { month: 'Dec', out: 55, in: 65 },
]

const NAV_ITEMS = [
    { icon: '⊞', label: 'Dashboard', key: 'dashboard' },
    { icon: '👤', label: 'My Accounts', key: 'accounts' },
    { icon: '💳', label: 'My Cards', key: 'cards' },
    { icon: '↗', label: 'Fund Transfer', key: 'transfer' },
    { icon: '🧾', label: 'Bill Payment', key: 'bills' },
    { icon: '⚙', label: 'Settings', key: 'settings' },
]

const AVATAR_COLORS = ['#4f63d2', '#e85d7a', '#2ec4b6', '#f7971e', '#6c63ff', '#00b4d8']

function getAvatarColor(name = '') {
    const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0)
    return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return { text: 'Good Morning', emoji: '🌅' }
    if (h < 17) return { text: 'Good Afternoon', emoji: '☀️' }
    return { text: 'Good Evening', emoji: '🌙' }
}

// ─── ANIMATED BALANCE ──────────────────────────────────────────────────────────
function AnimatedBalance({ target }) {
    const [val, setVal] = useState(0)
    useEffect(() => {
        if (!target) return
        const dur = 1400, start = performance.now()
        const frame = (now) => {
            const p = Math.min((now - start) / dur, 1)
            const e = 1 - Math.pow(1 - p, 4)
            setVal(Math.floor(e * target))
            if (p < 1) requestAnimationFrame(frame)
            else setVal(target)
        }
        requestAnimationFrame(frame)
    }, [target])
    return <>{val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
}

// ─── BAR CHART ─────────────────────────────────────────────────────────────────
function InsightsChart() {
    const max = 100
    return (
        <div className="db-chart-wrap">
            <div className="db-chart-legend">
                <span className="db-legend-dot" style={{ background: '#c7d4f8' }}></span> Money out
                <span className="db-legend-dot" style={{ background: '#4f63d2', marginLeft: 12 }}></span> Money in
            </div>
            <div className="db-chart-bars">
                {INSIGHTS.map((d, i) => (
                    <div key={i} className="db-chart-col">
                        <div className="db-bar-group">
                            <div className="db-bar db-bar-out" style={{ height: `${(d.out / max) * 160}px` }} />
                            <div className="db-bar db-bar-in" style={{ height: `${(d.in / max) * 160}px` }} />
                        </div>
                        <span className="db-chart-label">{d.month}</span>
                    </div>
                ))}
            </div>
            <div className="db-chart-axis">
                {[100, 80, 60, 40, 20, 0].map(v => <span key={v}>{v}k</span>)}
            </div>
        </div>
    )
}

// ─── PROFILE SLIDE PANEL ───────────────────────────────────────────────────────
function ProfilePanel({ profile, onClose, onLogout, onNavigate }) {
    if (!profile) return null
    const initials = profile.username ? profile.username.slice(0, 2).toUpperCase() : 'U'
    const since = profile.created_at
        ? new Date(profile.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'N/A'
    return (
        <>
            <div className="db-profile-overlay" onClick={onClose} />
            <div className="db-profile-panel">
                <div className="db-pp-header">
                    <div className="db-pp-avatar" style={{ background: getAvatarColor(profile.username) }}>{initials}</div>
                    <div>
                        <div className="db-pp-name">{profile.username}</div>
                        <div className="db-pp-role">{profile.role}</div>
                    </div>
                    <button className="db-pp-close" onClick={onClose}>✕</button>
                </div>

                <div className="db-pp-balance-card">
                    <div className="db-pp-bal-label">Account Balance</div>
                    <div className="db-pp-bal-amount">₹{Number(profile.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <div className="db-pp-bal-sub">Available • KodBank Savings</div>
                </div>

                <div className="db-pp-info">
                    {[
                        { icon: '🆔', label: 'User ID', val: profile.uid },
                        { icon: '✉️', label: 'Email', val: profile.email },
                        { icon: '📱', label: 'Phone', val: profile.phone },
                        { icon: '📅', label: 'Member Since', val: since },
                        { icon: '🔐', label: 'Account Type', val: profile.role },
                    ].map((row, i) => (
                        <div key={i} className="db-pp-info-row">
                            <span className="db-pp-info-icon">{row.icon}</span>
                            <div>
                                <div className="db-pp-info-label">{row.label}</div>
                                <div className="db-pp-info-val">{row.val}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Nav from Profile Panel */}
                <div style={{ padding: '0 24px', marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, fontWeight: 600 }}>
                        Quick Navigate
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                            { icon: '💳', label: 'My Cards', key: 'cards' },
                            { icon: '↗', label: 'Transfer', key: 'transfer' },
                            { icon: '🧾', label: 'Pay Bills', key: 'bills' },
                            { icon: '⚙', label: 'Settings', key: 'settings' },
                        ].map(q => (
                            <button
                                key={q.key}
                                onClick={() => { onNavigate(q.key); onClose() }}
                                style={{
                                    background: '#f8f9fe', border: '1px solid #e8eaf0', borderRadius: 10,
                                    padding: '10px 8px', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                                    color: '#374151', display: 'flex', alignItems: 'center', gap: 6,
                                    fontFamily: 'Inter, sans-serif', transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#e0e7ff'}
                                onMouseLeave={e => e.currentTarget.style.background = '#f8f9fe'}
                            >
                                {q.icon} {q.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button className="db-pp-logout" onClick={onLogout} id="btn-profile-logout">
                    🚪 Sign Out
                </button>
            </div>
        </>
    )
}

// ─── DASHBOARD HOME VIEW ───────────────────────────────────────────────────────
function DashboardHome({ profile, onGoTransfer }) {
    const [balance, setBalance] = useState(null)
    const [balanceFetched, setFetched] = useState(false)
    const [loadingBalance, setLoadingBal] = useState(false)
    const [balanceError, setBalanceErr] = useState('')
    const navigate = useNavigate()

    const handleCheckBalance = async () => {
        setLoadingBal(true)
        setBalanceErr('')
        try {
            const res = await axios.get('http://localhost:5000/api/balance', { withCredentials: true })
            setBalance(res.data.balance)
            setFetched(true)
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to fetch balance.'
            setBalanceErr(msg)
            if (msg.includes('login') || msg.includes('expired') || msg.includes('Invalid'))
                setTimeout(() => navigate('/login'), 2000)
        } finally {
            setLoadingBal(false)
        }
    }

    return (
        <>
            <div className="db-row">
                {/* Balance Card */}
                <div className="db-card db-balance-col">
                    <div className="db-card-header">
                        <span className="db-card-title">Balance</span>
                        <button className="db-card-more">⋮</button>
                    </div>

                    {balanceFetched && balance !== null ? (
                        <>
                            <div className="db-balance-amount">₹<AnimatedBalance target={balance} /></div>
                            <div className="db-balance-sub">Available</div>
                            <div className="db-balance-sparkline">
                                <svg viewBox="0 0 200 60" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#4f63d2" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#4f63d2" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,50 C20,40 40,10 60,20 S100,5 120,15 S160,30 200,10 L200,60 L0,60 Z" fill="url(#sparkGrad)" />
                                    <path d="M0,50 C20,40 40,10 60,20 S100,5 120,15 S160,30 200,10" fill="none" stroke="#4f63d2" strokeWidth="2" />
                                </svg>
                            </div>
                        </>
                    ) : (
                        <div className="db-balance-cta">
                            <div className="db-balance-placeholder">——</div>
                            <div className="db-balance-sub" style={{ marginBottom: 24 }}>
                                {balanceError
                                    ? <span style={{ color: '#e85d7a' }}>⚠ {balanceError}</span>
                                    : 'Click to reveal your balance'}
                            </div>
                            <button id="btn-check-balance" className="db-check-btn" onClick={handleCheckBalance} disabled={loadingBalance}>
                                {loadingBalance ? '⏳ Verifying...' : '💳 Check Balance'}
                            </button>
                        </div>
                    )}

                    {/* Favourite Transfers */}
                    <div className="db-fav-section">
                        <div className="db-fav-header">
                            <span>Favourite Transfers</span>
                            <button className="db-see-all" onClick={onGoTransfer}>See All</button>
                        </div>
                        {FAVOURITES.map((f, i) => (
                            <div key={i} className="db-fav-row">
                                <div className="db-fav-avatar" style={{ background: getAvatarColor(f.name) }}>{f.avatar}</div>
                                <div className="db-fav-info">
                                    <div className="db-fav-name">{f.name}</div>
                                    <div className="db-fav-role">{f.role}</div>
                                </div>
                                <button className="db-fav-send" onClick={onGoTransfer}>→</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Insights */}
                <div className="db-card db-insights-col">
                    <div className="db-card-header">
                        <span className="db-card-title">Insights</span>
                        <button className="db-card-more">⋮</button>
                    </div>
                    <InsightsChart />
                </div>
            </div>

            {/* Transactions */}
            <div className="db-card db-tx-card">
                <div className="db-card-header">
                    <span className="db-card-title">Transaction</span>
                    <button className="db-card-more">⋮</button>
                </div>
                <table className="db-tx-table">
                    <thead>
                        <tr><th>Name</th><th>ID</th><th>Status</th><th>Amount</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                        {TRANSACTIONS.map(tx => (
                            <tr key={tx.id}>
                                <td>
                                    <div className="db-tx-name-cell">
                                        <div className="db-tx-avatar" style={{ background: getAvatarColor(tx.name) }}>{tx.avatar}</div>
                                        {tx.name}
                                    </div>
                                </td>
                                <td className="db-tx-id">{tx.txId}</td>
                                <td>
                                    <span className={`db-tx-badge ${tx.type === 'Money In' ? 'in' : 'out'}`}>{tx.type}</span>
                                </td>
                                <td className={`db-tx-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                                    {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                </td>
                                <td className="db-tx-date">{tx.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

// ─── PAGE TITLE MAP ────────────────────────────────────────────────────────────
const PAGE_TITLES = {
    dashboard: null,
    accounts: 'My Accounts',
    cards: 'My Cards',
    transfer: 'Fund Transfer',
    bills: 'Bill Payment',
    settings: 'Settings',
}

// ─── MAIN SHELL ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [activeNav, setActiveNav] = useState('dashboard')
    const [showProfile, setShowProfile] = useState(false)
    const [notifCount] = useState(3)
    const greeting = getGreeting()

    useEffect(() => {
        axios.get('http://localhost:5000/api/profile', { withCredentials: true })
            .then(res => setProfile(res.data))
            .catch(() => navigate('/login'))
    }, [navigate])

    const handleLogout = async () => {
        await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true })
        navigate('/login')
    }

    const initials = profile?.username ? profile.username.slice(0, 2).toUpperCase() : '...'
    const displayName = profile?.username
        ? profile.username.charAt(0).toUpperCase() + profile.username.slice(1)
        : '...'

    // Page title shown in topbar when not on dashboard
    const pageTitle = PAGE_TITLES[activeNav]

    return (
        <div className="db-shell">
            {/* ── SIDEBAR ────────────────────────────────────────────────── */}
            <aside className="db-sidebar">
                <div className="db-sidebar-logo">
                    <div className="db-logo-mark">K</div>
                    <span className="db-logo-name">KodBank</span>
                </div>
                <nav className="db-nav">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.key}
                            id={`nav-${item.key}`}
                            className={`db-nav-item ${activeNav === item.key ? 'active' : ''}`}
                            onClick={() => { setActiveNav(item.key); setShowProfile(false) }}
                        >
                            <span className="db-nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* ── MAIN ───────────────────────────────────────────────────── */}
            <div className="db-main">

                {/* ── TOPBAR ───────────────────────────────────────────────── */}
                <header className="db-topbar">
                    <div className="db-greeting">
                        {pageTitle
                            ? <h1>{pageTitle}</h1>
                            : <h1>{greeting.text} {greeting.emoji}</h1>
                        }
                    </div>
                    <div className="db-topbar-right">
                        <button className="db-notif-btn" id="btn-notifications" onClick={() => alert('No new notifications!')}>
                            🔔
                            {notifCount > 0 && <span className="db-notif-badge">{notifCount}</span>}
                        </button>
                        <button
                            id="btn-profile-toggle"
                            className="db-profile-btn"
                            onClick={() => setShowProfile(v => !v)}
                        >
                            <div className="db-topbar-avatar" style={{ background: getAvatarColor(profile?.username || '') }}>
                                {initials}
                            </div>
                            <span className="db-profile-name">{displayName}</span>
                            <span className="db-profile-chevron">{showProfile ? '▲' : '▾'}</span>
                        </button>
                    </div>
                </header>

                {/* ── CONTENT  ─────────────────────────────────────────────── */}
                <div className="db-content">
                    {activeNav === 'dashboard' && (
                        <DashboardHome profile={profile} onGoTransfer={() => setActiveNav('transfer')} />
                    )}
                    {activeNav === 'accounts' && <AccountsView profile={profile} />}
                    {activeNav === 'cards' && <CardsView profile={profile} />}
                    {activeNav === 'transfer' && <TransferView />}
                    {activeNav === 'bills' && <BillsView />}
                    {activeNav === 'settings' && (
                        <SettingsView profile={profile} onLogout={handleLogout} />
                    )}
                </div>
            </div>

            {/* ── PROFILE PANEL ────────────────────────────────────────────── */}
            {showProfile && (
                <ProfilePanel
                    profile={profile}
                    onClose={() => setShowProfile(false)}
                    onLogout={handleLogout}
                    onNavigate={(key) => setActiveNav(key)}
                />
            )}
        </div>
    )
}

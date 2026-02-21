import { useState } from 'react'

const CATEGORIES = [
    { icon: '⚡', label: 'Electricity', color: '#fef3c7', text: '#d97706' },
    { icon: '💧', label: 'Water', color: '#e0f7fa', text: '#0284c7' },
    { icon: '🔥', label: 'Gas', color: '#fee2e8', text: '#e85d7a' },
    { icon: '📡', label: 'Internet', color: '#e0e7ff', text: '#4f63d2' },
    { icon: '📱', label: 'Mobile', color: '#d1f7e4', text: '#059669' },
    { icon: '📺', label: 'DTH / TV', color: '#f3e8ff', text: '#9333ea' },
]

const RECENT_BILLS = [
    { name: 'BESCOM Electricity', due: '₹1,240', due_date: '25 Feb', icon: '⚡', paid: false },
    { name: 'Jio Fiber Internet', due: '₹999', due_date: '28 Feb', icon: '📡', paid: false },
    { name: 'BWSSB Water Bill', due: '₹320', due_date: '01 Mar', icon: '💧', paid: true },
]

export default function BillsView() {
    const [activeCat, setActiveCat] = useState(null)
    const [consumerNo, setConsumerNo] = useState('')
    const [fetched, setFetched] = useState(false)
    const [paying, setPaying] = useState(false)
    const [paid, setPaid] = useState(false)

    const handleFetch = () => { if (consumerNo) setFetched(true) }

    const handlePay = () => {
        setPaying(true)
        setTimeout(() => { setPaying(false); setPaid(true) }, 1800)
    }

    const resetForm = () => { setActiveCat(null); setConsumerNo(''); setFetched(false); setPaid(false) }

    return (
        <div className="view-wrap">
            <div className="view-heading">Bill Payment</div>
            <div className="view-sub">Pay all your utility bills quickly and easily</div>

            {/* Categories */}
            {!activeCat && (
                <>
                    <div className="db-card">
                        <div className="db-card-title" style={{ marginBottom: 18 }}>Select Category</div>
                        <div className="bill-cat-grid">
                            {CATEGORIES.map((c, i) => (
                                <button
                                    key={i}
                                    className="bill-cat-btn"
                                    style={{ background: c.color }}
                                    onClick={() => { setActiveCat(c); setFetched(false); setPaid(false); setConsumerNo('') }}
                                >
                                    <span className="bill-cat-icon">{c.icon}</span>
                                    <span className="bill-cat-label" style={{ color: c.text }}>{c.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Bills */}
                    <div className="db-card" style={{ marginTop: 24 }}>
                        <div className="db-card-header">
                            <span className="db-card-title">Upcoming Bills</span>
                            <span style={{ fontSize: 13, color: '#4f63d2', fontWeight: 600, cursor: 'pointer' }}>See All</span>
                        </div>
                        {RECENT_BILLS.map((b, i) => (
                            <div key={i} className="bill-row">
                                <div className="bill-row-icon">{b.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div className="bill-name">{b.name}</div>
                                    <div className="bill-due">Due: {b.due_date}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="bill-amount">{b.due}</div>
                                    {b.paid
                                        ? <span className="db-tx-badge in" style={{ fontSize: 11 }}>Paid</span>
                                        : <button className="bill-pay-btn" onClick={() => setActiveCat(CATEGORIES[0])}>Pay Now</button>
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Payment Form */}
            {activeCat && !paid && (
                <div className="db-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <button onClick={resetForm} className="tf-back-btn" style={{ margin: 0 }}>←</button>
                        <div className="bill-cat-icon-lg" style={{ background: activeCat.color }}>{activeCat.icon}</div>
                        <div>
                            <div className="db-card-title">{activeCat.label} Bill</div>
                            <div style={{ fontSize: 13, color: '#9ca3af' }}>Enter consumer details</div>
                        </div>
                    </div>

                    <label className="tf-label">Consumer / Account Number</label>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                        <input
                            className="tf-input"
                            style={{ flex: 1 }}
                            placeholder="Enter consumer number"
                            value={consumerNo}
                            onChange={e => setConsumerNo(e.target.value)}
                        />
                        <button className="tf-btn" style={{ width: 'auto', padding: '0 20px' }} onClick={handleFetch} disabled={!consumerNo}>
                            Fetch
                        </button>
                    </div>

                    {fetched && (
                        <>
                            <div className="bill-detail-box">
                                <div className="bill-det-row"><span>Consumer Name</span><strong>{activeCat.label} Customer</strong></div>
                                <div className="bill-det-row"><span>Consumer No.</span><strong>{consumerNo}</strong></div>
                                <div className="bill-det-row"><span>Bill Period</span><strong>Jan 2026</strong></div>
                                <div className="bill-det-row"><span>Due Date</span><strong>25 Feb 2026</strong></div>
                                <div className="bill-det-row" style={{ borderBottom: 'none' }}>
                                    <span>Amount Due</span>
                                    <strong style={{ color: '#4f63d2', fontSize: 18 }}>₹1,240.00</strong>
                                </div>
                            </div>
                            <button className="tf-btn" onClick={handlePay} disabled={paying} style={{ marginTop: 20 }}>
                                {paying ? '⏳ Processing...' : `Pay ₹1,240.00`}
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Success */}
            {paid && (
                <div className="db-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
                    <div className="success-circle">✓</div>
                    <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#1a1f36', margin: '20px 0 8px' }}>
                        Bill Paid!
                    </h2>
                    <p style={{ color: '#6b7280', marginBottom: 20 }}>
                        {activeCat.icon} {activeCat.label} bill of <strong>₹1,240.00</strong> paid successfully.
                    </p>
                    <div className="tx-ref-box">
                        <span>Reference No.</span>
                        <strong>KOD{Date.now().toString().slice(-8)}</strong>
                    </div>
                    <button className="tf-btn" onClick={resetForm} style={{ marginTop: 24 }}>Pay Another Bill</button>
                </div>
            )}
        </div>
    )
}

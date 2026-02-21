import { useState } from 'react'

const CARDS = [
    {
        id: 1,
        type: 'Visa Debit',
        number: '4821 **** **** 9032',
        holder: 'TESTUSER',
        expiry: '08/28',
        cvv: '***',
        color: ['#1a1a2e', '#16213e'],
        network: 'VISA',
        status: 'Active',
    },
    {
        id: 2,
        type: 'RuPay Debit',
        number: '6521 **** **** 7741',
        holder: 'TESTUSER',
        expiry: '03/27',
        cvv: '***',
        color: ['#0f4c75', '#1b6ca8'],
        network: 'RuPay',
        status: 'Active',
    },
]

export default function CardsView({ profile }) {
    const [selected, setSelected] = useState(0)
    const [showNum, setShowNum] = useState(false)
    const card = CARDS[selected]
    const holder = profile?.username?.toUpperCase() || card.holder

    return (
        <div className="view-wrap">
            <div className="view-heading">My Cards</div>
            <div className="view-sub">Manage your debit and credit cards</div>

            <div className="cards-layout">
                {/* Card Visual */}
                <div className="card-visual-wrap">
                    <div className="card-visual" style={{ background: `linear-gradient(135deg, ${card.color[0]}, ${card.color[1]})` }}>
                        <div className="cardv-top">
                            <div className="cardv-chip">💳</div>
                            <div className="cardv-network">{card.network}</div>
                        </div>
                        <div className="cardv-number">
                            {showNum ? card.number : card.number.replace(/\d{4}/, '••••')}
                        </div>
                        <div className="cardv-bottom">
                            <div>
                                <div className="cardv-label">CARD HOLDER</div>
                                <div className="cardv-val">{holder}</div>
                            </div>
                            <div>
                                <div className="cardv-label">EXPIRES</div>
                                <div className="cardv-val">{card.expiry}</div>
                            </div>
                            <div>
                                <div className="cardv-label">CVV</div>
                                <div className="cardv-val">{showNum ? '***' : card.cvv}</div>
                            </div>
                        </div>
                    </div>

                    {/* Card Selector */}
                    <div className="card-tabs">
                        {CARDS.map((c, i) => (
                            <button
                                key={c.id}
                                className={`card-tab ${selected === i ? 'active' : ''}`}
                                onClick={() => setSelected(i)}
                            >
                                {c.type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Card Controls */}
                <div className="card-controls">
                    <div className="db-card" style={{ marginBottom: 20 }}>
                        <div className="db-card-header">
                            <span className="db-card-title">Card Controls</span>
                            <span className={`status-badge ${card.status === 'Active' ? 'active' : 'inactive'}`}>
                                ● {card.status}
                            </span>
                        </div>
                        <div className="ctrl-grid">
                            {[
                                { icon: '👁', label: showNum ? 'Hide Details' : 'Show Details', action: () => setShowNum(v => !v) },
                                { icon: '🔒', label: 'Lock Card', action: () => alert('Card locked!') },
                                { icon: '🔑', label: 'Change PIN', action: () => alert('Change PIN flow coming soon!') },
                                { icon: '🌐', label: 'Online Limit', action: () => alert('Limit settings coming soon!') },
                                { icon: '📵', label: 'Block Card', action: () => alert('Block card coming soon!') },
                                { icon: '🔄', label: 'Replace Card', action: () => alert('Replacement request coming soon!') },
                            ].map((ctrl, i) => (
                                <button key={i} className="ctrl-btn" onClick={ctrl.action}>
                                    <span className="ctrl-icon">{ctrl.icon}</span>
                                    <span className="ctrl-label">{ctrl.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="db-card">
                        <div className="db-card-title" style={{ marginBottom: 14 }}>Card Limits</div>
                        {[
                            { label: 'Daily ATM Limit', used: 2000, max: 25000 },
                            { label: 'Online Transaction', used: 15000, max: 100000 },
                            { label: 'POS / Tap to Pay', used: 5000, max: 50000 },
                        ].map((lim, i) => (
                            <div key={i} className="limit-row">
                                <div className="limit-info">
                                    <span className="limit-label">{lim.label}</span>
                                    <span className="limit-val">₹{lim.used.toLocaleString('en-IN')} / ₹{lim.max.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="limit-bar-bg">
                                    <div className="limit-bar-fill" style={{ width: `${(lim.used / lim.max) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

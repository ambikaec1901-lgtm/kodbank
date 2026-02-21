import { useState } from 'react'

const CONTACTS = [
    { name: 'Kathryn Murphy', account: 'XXXX 4821', bank: 'KodBank', avatar: 'KM', color: '#4f63d2' },
    { name: 'Wade Warren', account: 'XXXX 9032', bank: 'HDFC Bank', avatar: 'WW', color: '#e85d7a' },
    { name: 'Jenny Wilson', account: 'XXXX 7712', bank: 'SBI', avatar: 'JW', color: '#059669' },
    { name: 'Jacob Jones', account: 'XXXX 3341', bank: 'Axis Bank', avatar: 'JJ', color: '#d97706' },
]

export default function TransferView() {
    const [step, setStep] = useState(1)          // 1=select, 2=enter amount, 3=success
    const [selected, setSelected] = useState(null)
    const [amount, setAmount] = useState('')
    const [note, setNote] = useState('')
    const [mode, setMode] = useState('IMPS')
    const [loading, setLoading] = useState(false)

    const handleContinue = () => {
        if (step === 1 && selected !== null) setStep(2)
        else if (step === 2 && amount && Number(amount) > 0) {
            setLoading(true)
            setTimeout(() => { setLoading(false); setStep(3) }, 1800)
        }
    }

    const reset = () => { setStep(1); setSelected(null); setAmount(''); setNote('') }

    return (
        <div className="view-wrap">
            <div className="view-heading">Fund Transfer</div>
            <div className="view-sub">Transfer money instantly and securely</div>

            {/* Steps Indicator */}
            <div className="steps-row">
                {['Select Recipient', 'Enter Amount', 'Done'].map((s, i) => (
                    <div key={i} className={`step-item ${step > i ? 'done' : step === i + 1 ? 'active' : ''}`}>
                        <div className="step-circle">{step > i + 1 ? '✓' : i + 1}</div>
                        <span>{s}</span>
                    </div>
                ))}
            </div>

            {/* Step 1 — Select Recipient */}
            {step === 1 && (
                <div className="db-card">
                    <div className="db-card-title" style={{ marginBottom: 18 }}>Select Recipient</div>
                    {CONTACTS.map((c, i) => (
                        <div
                            key={i}
                            className={`transfer-contact ${selected === i ? 'selected' : ''}`}
                            onClick={() => setSelected(i)}
                        >
                            <div className="db-fav-avatar" style={{ background: c.color }}>{c.avatar}</div>
                            <div style={{ flex: 1 }}>
                                <div className="db-fav-name">{c.name}</div>
                                <div className="db-fav-role">{c.bank} • {c.account}</div>
                            </div>
                            <div className={`select-radio ${selected === i ? 'checked' : ''}`} />
                        </div>
                    ))}
                    <button className="tf-btn" onClick={handleContinue} disabled={selected === null}>
                        Continue →
                    </button>
                </div>
            )}

            {/* Step 2 — Enter Amount */}
            {step === 2 && (
                <div className="db-card">
                    <div className="db-card-title" style={{ marginBottom: 4 }}>Transfer to</div>
                    <div className="tf-recipient-pill">
                        <div className="db-fav-avatar" style={{ background: CONTACTS[selected].color }}>
                            {CONTACTS[selected].avatar}
                        </div>
                        <div>
                            <div className="db-fav-name">{CONTACTS[selected].name}</div>
                            <div className="db-fav-role">{CONTACTS[selected].bank}</div>
                        </div>
                        <button className="tf-change" onClick={() => setStep(1)}>Change</button>
                    </div>

                    <div className="tf-amount-box">
                        <span className="tf-currency-symbol">₹</span>
                        <input
                            className="tf-amount-input"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            min="1"
                            autoFocus
                        />
                    </div>

                    {/* Quick amounts */}
                    <div className="tf-quick-row">
                        {[500, 1000, 2000, 5000].map(a => (
                            <button key={a} className="tf-quick-btn" onClick={() => setAmount(String(a))}>
                                ₹{a.toLocaleString('en-IN')}
                            </button>
                        ))}
                    </div>

                    {/* Transfer mode */}
                    <div className="tf-mode-row">
                        {['IMPS', 'NEFT', 'RTGS'].map(m => (
                            <button
                                key={m}
                                className={`tf-mode-btn ${mode === m ? 'active' : ''}`}
                                onClick={() => setMode(m)}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    <div className="form-group" style={{ marginTop: 16 }}>
                        <label className="tf-label">Remark (optional)</label>
                        <input
                            className="tf-input"
                            placeholder="e.g. Rent, Groceries…"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                        />
                    </div>

                    <button className="tf-btn" onClick={handleContinue} disabled={!amount || loading}>
                        {loading ? '⏳ Processing...' : `Send ₹${Number(amount || 0).toLocaleString('en-IN')} via ${mode}`}
                    </button>
                    <button className="tf-back-btn" onClick={() => setStep(1)}>← Back</button>
                </div>
            )}

            {/* Step 3 — Success */}
            {step === 3 && (
                <div className="db-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
                    <div className="success-circle">✓</div>
                    <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#1a1f36', margin: '20px 0 8px' }}>
                        Transfer Successful!
                    </h2>
                    <p style={{ color: '#6b7280', marginBottom: 24 }}>
                        ₹{Number(amount).toLocaleString('en-IN')} sent to <strong>{CONTACTS[selected].name}</strong> via {mode}
                    </p>
                    <div className="tx-ref-box">
                        <span>Reference No.</span>
                        <strong>KOD{Date.now().toString().slice(-8)}</strong>
                    </div>
                    <button className="tf-btn" onClick={reset} style={{ marginTop: 24 }}>
                        Make Another Transfer
                    </button>
                </div>
            )}
        </div>
    )
}

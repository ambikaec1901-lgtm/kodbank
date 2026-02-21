export default function AccountsView({ profile }) {
    const balance = profile?.balance ?? 0
    const savingsBalance = (balance * 0.7).toFixed(2)
    const currentBalance = (balance * 0.3).toFixed(2)

    const fmt = (n) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })

    const accounts = [
        {
            type: 'Savings Account',
            number: 'XXXX XXXX 4821',
            ifsc: 'KODB0001234',
            branch: 'KodBank Main Branch',
            balance: savingsBalance,
            color: ['#4f63d2', '#6c7fff'],
            icon: '🏦',
        },
        {
            type: 'Current Account',
            number: 'XXXX XXXX 9032',
            ifsc: 'KODB0001235',
            branch: 'KodBank Digital Branch',
            balance: currentBalance,
            color: ['#0ea5e9', '#38bdf8'],
            icon: '💼',
        },
    ]

    return (
        <div className="view-wrap">
            <div className="view-heading">My Accounts</div>
            <div className="view-sub">Manage all your bank accounts in one place</div>

            <div className="acc-grid">
                {accounts.map((acc, i) => (
                    <div key={i} className="acc-card" style={{ background: `linear-gradient(135deg, ${acc.color[0]}, ${acc.color[1]})` }}>
                        <div className="acc-card-top">
                            <div>
                                <div className="acc-card-type">{acc.type}</div>
                                <div className="acc-card-number">{acc.number}</div>
                            </div>
                            <span style={{ fontSize: 32 }}>{acc.icon}</span>
                        </div>
                        <div className="acc-card-balance">
                            <div className="acc-bal-label">Available Balance</div>
                            <div className="acc-bal-amount">₹{fmt(acc.balance)}</div>
                        </div>
                        <div className="acc-card-footer">
                            <div>
                                <div className="acc-meta-label">IFSC Code</div>
                                <div className="acc-meta-val">{acc.ifsc}</div>
                            </div>
                            <div>
                                <div className="acc-meta-label">Branch</div>
                                <div className="acc-meta-val">{acc.branch}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="db-card" style={{ marginTop: 24 }}>
                <div className="db-card-header">
                    <span className="db-card-title">Quick Actions</span>
                </div>
                <div className="qa-grid">
                    {[
                        { icon: '⬇️', label: 'Deposit', color: '#d1f7e4', text: '#059669' },
                        { icon: '⬆️', label: 'Withdraw', color: '#fde8ec', text: '#e85d7a' },
                        { icon: '↗️', label: 'Transfer', color: '#e0e7ff', text: '#4f63d2' },
                        { icon: '📊', label: 'Statement', color: '#fef3c7', text: '#d97706' },
                        { icon: '🔒', label: 'Block', color: '#f3e8ff', text: '#9333ea' },
                        { icon: '📞', label: 'Support', color: '#e0f7fa', text: '#0284c7' },
                    ].map((q, i) => (
                        <button key={i} className="qa-btn">
                            <div className="qa-icon" style={{ background: q.color, color: q.text }}>{q.icon}</div>
                            <span className="qa-label">{q.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

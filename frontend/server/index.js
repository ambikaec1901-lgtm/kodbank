import 'dotenv/config';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = 5000;
const JWT_SECRET = 'kodbank_super_secret_key_2026';

// Middleware
app.use(express.json());
app.use(cookieParser());
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://kodbank-two.vercel.app',
    /\.vercel\.app$/,
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true); // allow server-to-server
        const allowed = ALLOWED_ORIGINS.some(o =>
            typeof o === 'string' ? o === origin : o.test(origin)
        );
        callback(allowed ? null : new Error('CORS blocked'), allowed);
    },
    credentials: true
}));

// ─── 1. REGISTER ───────────────────────────────────────────────────────────────
app.post('/api/register', async (req, res) => {
    const { uid, username, password, email, phone, role } = req.body;

    if (!uid || !username || !password || !email || !phone) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    if (role && role !== 'Customer') {
        return res.status(400).json({ error: 'Only Customer role is allowed.' });
    }

    try {
        // Check if uid or username already exists
        const existing = db.prepare('SELECT * FROM KodUser WHERE uid = ? OR username = ?').get(uid, username);
        if (existing) {
            return res.status(409).json({ error: 'UID or username already exists.' });
        }

        // Encrypt password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user with default balance = 100000
        db.prepare(`
      INSERT INTO KodUser (uid, username, password, email, phone, role, balance)
      VALUES (?, ?, ?, ?, ?, ?, 100000)
    `).run(uid, username, hashedPassword, email, phone, role || 'Customer');

        return res.status(201).json({ message: 'Registration successful! Please login.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error during registration.' });
    }
});

// ─── 2. LOGIN ──────────────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        // 1. Get data from database
        const user = db.prepare('SELECT * FROM KodUser WHERE username = ?').get(username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // 2. Compare password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // 3. Generate JWT — username as Subject, role as Claim, signed with secret key
        const token = jwt.sign(
            { sub: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 4. Store JWT in UserToken table
        db.prepare('INSERT INTO UserToken (username, token) VALUES (?, ?)').run(user.username, token);

        // 5. Send token in cookie
        res.cookie('jwt_token', token, {
            httpOnly: true,
            maxAge: 3600000, // 1 hour
            sameSite: 'lax'
        });

        // 6. Send success response
        return res.status(200).json({ message: 'Login successful!', username: user.username });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error during login.' });
    }
});

// ─── 3. CHECK BALANCE ──────────────────────────────────────────────────────────
app.get('/api/balance', (req, res) => {
    // 1. Get JWT from cookie
    const token = req.cookies.jwt_token;

    if (!token) {
        return res.status(401).json({ error: 'No token found. Please login first.' });
    }

    try {
        // 2. Verify token signature & 3. Check expiry
        const decoded = jwt.verify(token, JWT_SECRET);

        // 4. Extract username from token
        const username = decoded.sub;

        // 5. Fetch balance from KodUser table
        const user = db.prepare('SELECT balance, username FROM KodUser WHERE username = ?').get(username);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // 6. Send balance to client
        return res.status(200).json({ balance: user.balance, username: user.username });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session expired. Please login again.' });
        }
        return res.status(401).json({ error: 'Invalid token. Please login again.' });
    }
});

// ─── 4. PROFILE ────────────────────────────────────────────────────────────────
app.get('/api/profile', (req, res) => {
    const token = req.cookies.jwt_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = db.prepare('SELECT uid, username, email, phone, role, balance, created_at FROM KodUser WHERE username = ?').get(decoded.sub);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        return res.status(200).json(user);
    } catch (err) {
        if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Session expired.' });
        return res.status(401).json({ error: 'Invalid token.' });
    }
});

// ─── 5. LOGOUT ─────────────────────────────────────────────────────────────────
app.post('/api/logout', (req, res) => {
    res.clearCookie('jwt_token');
    return res.status(200).json({ message: 'Logged out successfully.' });
});

// ─── 5. CHECK AUTH STATUS ──────────────────────────────────────────────────────
app.get('/api/auth/status', (req, res) => {
    const token = req.cookies.jwt_token;
    if (!token) return res.status(401).json({ loggedIn: false });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return res.status(200).json({ loggedIn: true, username: decoded.sub });
    } catch {
        return res.status(401).json({ loggedIn: false });
    }
});

// ─── BUILT-IN BANKING AI (No API key needed) ───────────────────────────────
function getBankingReply(msg, username) {
    const name = username ? username.charAt(0).toUpperCase() + username.slice(1) : 'there';
    const greet = `Hello ${name}! `;

    const topics = [
        {
            keys: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste'],
            reply: () => `${greet}👋 I'm your **KodBank AI Assistant**! I'm here to help you with all your banking and finance questions.\n\nYou can ask me about:\n- 💰 Savings & budgeting tips\n- 📊 How interest works\n- 💳 Credit cards & loans\n- 🔒 Account security\n- ↗ Fund transfers\n- 🧾 Bill payments\n\nWhat would you like to know?`
        },
        {
            keys: ['balance', 'how much', 'account balance', 'check balance', 'available'],
            reply: () => `To check your **account balance**, ${name}:\n\n1. Click **Dashboard** in the left sidebar\n2. Click the **"💳 Check Balance"** button\n3. Your balance will appear with a live animation\n\n💡 **Tip:** Your balance is secured with JWT authentication — only you can view it after logging in.`
        },
        {
            keys: ['save', 'saving', 'savings', 'save money', 'how to save'],
            reply: () => `Here are **top savings strategies** for you, ${name}:\n\n**1. 50/30/20 Rule**\n- 50% → Needs (rent, food, bills)\n- 30% → Wants (entertainment, dining)\n- 20% → Savings & investments\n\n**2. Automate savings**\nSet up an automatic transfer to savings account every month\n\n**3. Emergency fund first**\nBuild 3–6 months of expenses as emergency fund before investing\n\n**4. Cut unnecessary subscriptions**\nReview monthly recurring charges and cancel unused ones\n\n**5. Use the 24-hour rule**\nWait 24 hours before any non-essential purchase over ₹500`
        },
        {
            keys: ['interest', 'interest rate', 'fd', 'fixed deposit', 'rd', 'recurring'],
            reply: () => `**How bank interest works:**\n\n**Savings Account Interest**\n- Typically 2.5% – 7% per annum\n- Calculated daily on closing balance\n- Credited quarterly or monthly\n\n**Fixed Deposit (FD)**\n- Higher rates: 6.5% – 8.5% p.a.\n- Lock-in period: 7 days to 10 years\n- Better for long-term goals\n\n**Recurring Deposit (RD)**\n- Monthly fixed deposits\n- Similar rates to FD\n- Good for building savings habit\n\n💡 **Formula:** Simple Interest = (P × R × T) / 100\nFor ₹1,00,000 at 7% for 1 year = **₹7,000 interest**`
        },
        {
            keys: ['transfer', 'send money', 'fund transfer', 'neft', 'imps', 'upi', 'rtgs'],
            reply: () => `**Fund Transfer Methods in India:**\n\n| Method | Limit | Speed | Available |\n|--------|-------|-------|-----------|\n| **UPI** | ₹1–2 Lakh | Instant | 24×7 |\n| **IMPS** | ₹5 Lakh | Instant | 24×7 |\n| **NEFT** | No limit | 30 min | 24×7 |\n| **RTGS** | ₹2L+ | Instant | Bank hours |\n\n**To transfer in KodBank:**\n1. Click **"↗ Fund Transfer"** in the sidebar\n2. Enter beneficiary details\n3. Enter amount and confirm\n\n⚠️ Always verify the recipient's account number before transferring!`
        },
        {
            keys: ['credit', 'credit score', 'cibil', 'credit card'],
            reply: () => `**Credit Score Guide (CIBIL Score):**\n\n| Score | Rating | Impact |\n|-------|--------|--------|\n| 750–900 | 🟢 Excellent | Best loan rates |\n| 700–749 | 🟡 Good | Decent rates |\n| 650–699 | 🟠 Fair | Higher rates |\n| Below 650 | 🔴 Poor | May be rejected |\n\n**How to improve your credit score:**\n1. ✅ Pay bills & EMIs on time — most important!\n2. ✅ Keep credit utilization below 30%\n3. ✅ Don't apply for multiple loans at once\n4. ✅ Maintain old credit accounts\n5. ✅ Check your report annually at CIBIL.com\n\n💡 A score of **750+** gets you the best interest rates on loans!`
        },
        {
            keys: ['loan', 'home loan', 'personal loan', 'car loan', 'emi', 'borrow'],
            reply: () => `**Loan Types at a Glance:**\n\n**Home Loan**\n- Rate: 8.5% – 10.5% p.a.\n- Tenure: up to 30 years\n- Tax benefit under Section 80C & 24(b)\n\n**Personal Loan**\n- Rate: 10% – 24% p.a.\n- Tenure: 1–5 years\n- No collateral required\n\n**Car Loan**\n- Rate: 7.5% – 13% p.a.\n- Tenure: 1–7 years\n\n**EMI Formula:**\nEMI = P × r × (1+r)^n / ((1+r)^n – 1)\nwhere r = monthly rate, n = months\n\n💡 **Tip:** For ₹5L personal loan at 12% for 3 years, EMI ≈ **₹16,607/month**`
        },
        {
            keys: ['budget', 'budgeting', 'expense', 'spending', 'monthly budget', 'plan'],
            reply: () => `**Monthly Budget Template** (for ₹50,000 salary):\n\n| Category | Amount | % |\n|----------|--------|-|\n| 🏠 Rent/Housing | ₹15,000 | 30% |\n| 🍱 Food & Groceries | ₹8,000 | 16% |\n| 🚌 Transport | ₹3,000 | 6% |\n| 💡 Utilities & Bills | ₹2,500 | 5% |\n| 📱 Phone & Internet | ₹1,000 | 2% |\n| 🎯 Entertainment | ₹3,000 | 6% |\n| 💊 Health | ₹1,500 | 3% |\n| 💰 **Savings** | **₹10,000** | **20%** |\n| 🚨 Emergency Fund | ₹3,000 | 6% |\n| 📦 Miscellaneous | ₹3,000 | 6% |\n\n💡 Track every expense for 1 month to know where your money goes!`
        },
        {
            keys: ['invest', 'investment', 'mutual fund', 'sip', 'stock', 'share', 'equity'],
            reply: () => `**Investment Options in India (Beginner to Advanced):**\n\n**🟢 Safe (Low Risk)**\n- PPF: 7.1% p.a., tax-free\n- FD: 6.5–8.5% p.a., guaranteed\n- NSC: 7.7% p.a., 5-year lock-in\n\n**🟡 Moderate Risk**\n- Debt Mutual Funds: 6–9% returns\n- Balanced/Hybrid Funds: 8–12%\n- Gold ETF: inflation hedge\n\n**🔴 Higher Risk, Higher Return**\n- Equity Mutual Funds (SIP): 12–15% long-term\n- Direct Stocks: variable\n- Index Funds: tracks Nifty/Sensex\n\n**Start with SIP:**\n₹2,000/month in index fund for 20 years at 12% = **₹19.8 Lakhs!** 🚀\n\n💡 *Always invest only what you can afford to lose in high-risk options.*`
        },
        {
            keys: ['security', 'secure', 'safe', 'fraud', 'otp', 'phishing', 'hacked', 'protect'],
            reply: () => `**KodBank Security Best Practices:**\n\n**🔐 Password Security**\n- Use 12+ character passwords with symbols\n- Never use birthdays or names\n- Use different passwords for each account\n- Enable two-factor authentication (2FA)\n\n**🚫 Fraud Prevention**\n- ❌ Never share OTP with anyone — banks NEVER ask!\n- ❌ Don't click links in suspicious SMS/emails\n- ❌ Don't install remote access apps\n- ✅ Always verify URLs before logging in\n\n**📱 Account Safety**\n- Log out when using public computers\n- Check your transaction history regularly\n- Set up transaction alerts via SMS/email\n\n**🆘 If you suspect fraud:**\nCall your bank immediately and block your card!`
        },
        {
            keys: ['bill', 'pay bill', 'payment', 'electricity', 'water', 'phone', 'recharge'],
            reply: () => `**Bill Payment in KodBank:**\n\n1. Click **"🧾 Bill Payment"** in the sidebar\n2. Choose category (Electricity, Water, Phone, etc.)\n3. Enter your customer/account number\n4. Verify amount and pay\n\n**Supported bill types:**\n- ⚡ Electricity (BESCOM, TNEB, MSEB etc.)\n- 🌊 Water supply\n- 📱 Mobile recharge & postpaid\n- 📺 DTH & cable TV\n- 🏠 Society maintenance\n- 🌐 Broadband/Internet\n\n💡 **Tip:** Set up auto-pay for recurring bills to avoid late payment charges!`
        },
        {
            keys: ['tax', 'income tax', '80c', 'tds', 'itr', 'deduction'],
            reply: () => `**Income Tax Saving Guide (FY 2024-25):**\n\n**Section 80C (up to ₹1.5 Lakh deduction):**\n- ELSS Mutual Funds (best returns, 3yr lock)\n- PPF (safe, 7.1%)\n- EPF contributions\n- Life Insurance Premium\n- Home Loan principal repayment\n\n**Other Deductions:**\n- 80D: Health insurance premium (₹25,000)\n- 80E: Education loan interest (no limit)\n- 24(b): Home loan interest (₹2 Lakh)\n- HRA exemption if living on rent\n\n**New Tax Regime (2024):**\n- No deductions, but lower rates\n- Best if investments < ₹1.5L\n\n💡 **Tip:** File ITR by July 31 to avoid penalties!`
        },
        {
            keys: ['thank', 'thanks', 'great', 'nice', 'good', 'helpful', 'awesome'],
            reply: () => `You're welcome, ${name}! 😊\n\nI'm glad I could help! If you have more questions about:\n- 💰 Savings & investments\n- 📊 Account management\n- 💳 Loans & credit\n- 🔒 Security tips\n\n...just ask anytime. I'm always here! 🤖\n\n*KodBank AI — Your 24/7 Financial Assistant*`
        },
        {
            keys: ['what can you do', 'help', 'what do you know', 'features', 'capabilities'],
            reply: () => `**KodBank AI Assistant — What I can help with:**\n\n💰 **Banking**\n- Check balance, transfers, bill payments\n- Account types and features\n\n📈 **Finance**\n- Savings strategies & budgeting\n- Investment options (FD, SIP, stocks)\n- Interest rate calculations\n\n💳 **Credit & Loans**\n- Credit score improvement\n- Loan types, EMI calculations\n- Loan eligibility tips\n\n🔒 **Security**\n- Fraud prevention\n- Account security best practices\n\n📊 **Tax**\n- Deductions under 80C, 80D\n- ITR filing tips\n\nJust type your question and I'll answer right away! 🚀`
        },
    ];

    // Find best matching topic
    for (const topic of topics) {
        if (topic.keys.some(k => msg.includes(k))) {
            return topic.reply();
        }
    }

    // Generic fallback
    return `Hello ${name}! 🤖 I'm the **KodBank AI Assistant**.\n\nI can help you with:\n- 💰 **Savings** — strategies, goals, tips\n- 📊 **Interest rates** — FD, savings, loans\n- 💳 **Credit score** — how to improve it\n- ↗ **Transfers** — UPI, NEFT, IMPS explained\n- 🧾 **Bill payments** — how to pay in KodBank\n- 📈 **Investments** — SIP, mutual funds, stocks\n- 🔒 **Security** — protect your account\n- 📅 **Budgeting** — monthly budget templates\n\nTry asking: *"How can I save money?"* or *"Explain credit scores"* 😊`;
}

// ─── 6. AI CHAT (Hugging Face Space / HF Inference API) ───────────────────────

//
//  Priority order (from .env):
//  1. HF_SPACE_URL  → calls YOUR deployed HuggingFace Space (image architecture)
//  2. HF_API_KEY    → calls HF Inference API directly (no Space needed)
//  3. DEEPSEEK_API_KEY → fallback to DeepSeek platform API
//
app.post('/api/chat', async (req, res) => {
    // ── Auth check ────────────────────────────────────────────────────────────
    const token = req.cookies.jwt_token;
    if (!token) return res.status(401).json({ error: 'Please login to use AI chat.' });

    try {
        jwt.verify(token, JWT_SECRET);
    } catch {
        return res.status(401).json({ error: 'Session expired. Please login again.' });
    }

    const { messages, username } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array is required.' });
    }

    // ── Read env config ───────────────────────────────────────────────────────
    const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
    const HF_API_KEY = process.env.HF_API_KEY || '';
    const HF_SPACE_URL = process.env.HF_SPACE_URL || '';
    const HF_MODEL = process.env.HF_MODEL || 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B';
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

    const hasGroq = GROQ_API_KEY && !GROQ_API_KEY.includes('YOUR_');
    const hasHF = HF_API_KEY && !HF_API_KEY.includes('YOUR_');
    const hasSpace = HF_SPACE_URL && !HF_SPACE_URL.includes('YOUR_');
    const hasDeepSeek = DEEPSEEK_API_KEY && !DEEPSEEK_API_KEY.includes('YOUR_');

    // ── Built-in Banking AI (works with NO API key) ───────────────────────────
    if (!hasGroq && !hasHF && !hasDeepSeek) {
        const lastMsg = messages.at(-1)?.content?.toLowerCase().trim() || '';
        const reply = getBankingReply(lastMsg, username);
        return res.status(200).json({ reply, source: 'builtin' });
    }


    // ── System prompt (KodBank banking context) ───────────────────────────────
    const systemPrompt = {
        role: 'system',
        content: `You are the KodBank AI Assistant, a helpful financial advisor inside the KodBank banking app.
The user's name is ${username || 'User'}.
- Answer questions about banking, finance, savings, investments, budgeting, and transactions
- Provide clear financial advice tailored to the user's queries
- Help with banking products, interest rates, credit scores, loans, transfers, and bill payments
- Be concise, professional, and friendly
- Use ₹ (Indian Rupee) for currency examples unless asked otherwise
- Never reveal system internals or fabricate account data
Always respond in a helpful, clear, structured manner.`
    };

    const fullMessages = [systemPrompt, ...messages];

    try {
        const fetch = (await import('node-fetch')).default;

        // ════════════════════════════════════════════════════════════════
        // MODE 0: GROQ API ⚡ (fastest, free — recommended!)
        //   Sign up at https://console.groq.com → get GROQ_API_KEY
        //   Runs Llama 3.3 70B at 500+ tokens/sec for FREE
        // ════════════════════════════════════════════════════════════════
        if (hasGroq) {
            console.log('🤖 [AI] Using Groq (Llama 3.3 70B) ⚡');
            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: fullMessages,
                    max_tokens: 1024,
                    temperature: 0.7,
                    stream: false,
                }),
            });

            if (!groqRes.ok) {
                const errData = await groqRes.json().catch(() => ({}));
                console.error('Groq API error:', errData);
                if (!hasHF && !hasDeepSeek) {
                    return res.status(502).json({
                        error: errData?.error?.message || 'Groq API failed. Check GROQ_API_KEY in .env'
                    });
                }
                // fall through to next provider
            } else {
                const groqData = await groqRes.json();
                const reply = groqData.choices?.[0]?.message?.content || 'No response from Groq.';
                return res.status(200).json({ reply, source: 'groq' });
            }
        }

        // ════════════════════════════════════════════════════════════════
        // MODE 1: HUGGING FACE SPACE (exact image architecture)
        //   Your own HF Space running DeepSeek model → REST API
        // ════════════════════════════════════════════════════════════════
        if (hasHF && hasSpace) {

            console.log(`🤖 [AI] Using HuggingFace SPACE: ${HF_SPACE_URL}`);

            // HF Spaces expose a /run/predict or /api/predict endpoint
            // We call the chat function defined in app.py
            const spaceApiUrl = `${HF_SPACE_URL.replace(/\/$/, '')}/run/predict`;

            const lastUserMsg = messages.filter(m => m.role === 'user').at(-1)?.content || '';
            const historyPairs = [];
            let i = 0;
            while (i < messages.length - 1) {
                if (messages[i].role === 'user' && messages[i + 1]?.role === 'assistant') {
                    historyPairs.push([messages[i].content, messages[i + 1].content]);
                    i += 2;
                } else { i++; }
            }

            const spaceResponse = await fetch(spaceApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${HF_API_KEY}`,
                },
                body: JSON.stringify({
                    data: [lastUserMsg, historyPairs, username || 'User']
                }),
            });

            if (!spaceResponse.ok) {
                const errText = await spaceResponse.text().catch(() => '');
                console.error('HF Space error:', spaceResponse.status, errText);
                // Fall through to HF Inference API
            } else {
                const spaceData = await spaceResponse.json();
                const reply = spaceData?.data?.[0] || spaceData?.data?.[1]?.at(-1)?.[1] || 'No response from Space.';
                return res.status(200).json({ reply, source: 'hf-space' });
            }
        }

        // ════════════════════════════════════════════════════════════════
        // MODE 2: HUGGING FACE INFERENCE API (OpenAI-compatible)
        //   Direct model inference on HF servers — no Space needed
        // ════════════════════════════════════════════════════════════════
        if (hasHF) {
            console.log(`🤖 [AI] Using HuggingFace Inference API: ${HF_MODEL}`);

            const hfEndpoint = `https://api-inference.huggingface.co/models/${HF_MODEL}/v1/chat/completions`;

            const hfResponse = await fetch(hfEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${HF_API_KEY}`,
                },
                body: JSON.stringify({
                    model: HF_MODEL,
                    messages: fullMessages,
                    max_tokens: 1024,
                    temperature: 0.7,
                    stream: false,
                }),
            });

            if (!hfResponse.ok) {
                const errData = await hfResponse.json().catch(() => ({}));
                console.error('HF Inference API error:', errData);
                // Fall through to DeepSeek
                if (!hasDeepSeek) {
                    return res.status(502).json({
                        error: errData?.error?.message || 'HuggingFace AI service failed. Check your HF_API_KEY or try again.'
                    });
                }
            } else {
                const hfData = await hfResponse.json();
                const reply = hfData.choices?.[0]?.message?.content || 'No response received.';
                return res.status(200).json({ reply, source: 'hf-inference' });
            }
        }

        // ════════════════════════════════════════════════════════════════
        // MODE 3: DEEPSEEK PLATFORM API (fallback)
        // ════════════════════════════════════════════════════════════════
        if (hasDeepSeek) {
            console.log('🤖 [AI] Using DeepSeek Platform API (fallback)');

            const dsResponse = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: fullMessages,
                    max_tokens: 1024,
                    temperature: 0.7,
                    stream: false,
                }),
            });

            if (!dsResponse.ok) {
                const errData = await dsResponse.json().catch(() => ({}));
                return res.status(502).json({
                    error: errData?.error?.message || 'AI service unavailable. Please try again.'
                });
            }

            const dsData = await dsResponse.json();
            const reply = dsData.choices?.[0]?.message?.content || 'No response received.';
            return res.status(200).json({ reply, source: 'deepseek' });
        }

    } catch (err) {
        console.error('AI chat error:', err);
        return res.status(500).json({ error: 'Failed to connect to AI service. Check your internet connection.' });
    }
});


// ─── Export for Vercel serverless OR start locally ────────────────────────────
export { app };

if (process.env.NODE_ENV !== 'production' || process.env.LOCAL_SERVER) {
    app.listen(PORT, () => {
        console.log(`\n🏦 KodBank Server running at http://localhost:${PORT}`);
        console.log(`   Database: SQLite (bank.db)`);
        console.log(`   JWT Auth: Enabled`);
        console.log(`   CORS:     http://localhost:5173\n`);
    });
}

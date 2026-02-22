/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   KodBank AI — HuggingFace Space Auto-Setup Script          ║
 * ║   Run: node scripts/setup-hf-space.js                       ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * This script will automatically:
 *   1. Verify your HuggingFace token
 *   2. Create the "kodbank-ai" Space on your HF account
 *   3. Upload app.py, requirements.txt, README.md
 *   4. Update your .env with the Space URL
 *   5. Print the live Space URL when done
 *
 * Prerequisites:
 *   - Add HF_API_KEY=hf_xxxxx to your .env file
 *     Get token at: https://huggingface.co/settings/tokens
 */

import 'dotenv/config';
import { createRepo, uploadFiles, whoAmI } from '@huggingface/hub';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// ── Colors for terminal output ────────────────────────────────
const c = {
    green: (s) => `\x1b[32m${s}\x1b[0m`,
    blue: (s) => `\x1b[34m${s}\x1b[0m`,
    yellow: (s) => `\x1b[33m${s}\x1b[0m`,
    red: (s) => `\x1b[31m${s}\x1b[0m`,
    bold: (s) => `\x1b[1m${s}\x1b[0m`,
    dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

function log(emoji, msg) { console.log(`${emoji}  ${msg}`); }
function ok(msg) { console.log(c.green(`✅  ${msg}`)); }
function info(msg) { console.log(c.blue(`ℹ️   ${msg}`)); }
function step(n, msg) { console.log(c.bold(c.blue(`\n[${n}] ${msg}`))); }
function warn(msg) { console.log(c.yellow(`⚠️   ${msg}`)); }
function fail(msg) { console.error(c.red(`❌  ${msg}`)); process.exit(1); }

// ── Read .env helpers ─────────────────────────────────────────
function updateEnv(key, value) {
    const envPath = path.join(ROOT, '.env');
    let content = readFileSync(envPath, 'utf-8');

    // Replace if exists, otherwise append
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
        content = content.replace(regex, `${key}=${value}`);
    } else {
        content += `\n${key}=${value}`;
    }
    writeFileSync(envPath, content, 'utf-8');
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
    console.log('\n' + c.bold('╔══════════════════════════════════════════════╗'));
    console.log(c.bold('║   🤖 KodBank AI — HuggingFace Space Setup   ║'));
    console.log(c.bold('╚══════════════════════════════════════════════╝\n'));

    // ── Step 1: Check token ───────────────────────────────────
    step(1, 'Checking HuggingFace token...');

    const HF_TOKEN = process.env.HF_API_KEY;

    if (!HF_TOKEN || HF_TOKEN === 'YOUR_HF_API_KEY_HERE' || !HF_TOKEN.startsWith('hf_')) {
        console.log('');
        warn('HF_API_KEY not found or invalid in your .env file');
        console.log('\nTo get your free HuggingFace token:');
        console.log(c.blue('  1. Go to → https://huggingface.co/settings/tokens'));
        console.log(c.blue('  2. Click "New token"'));
        console.log(c.blue('  3. Name: kodbank  |  Role: Write'));
        console.log(c.blue('  4. Click Generate & copy it'));
        console.log(c.blue('  5. Open .env and set:  HF_API_KEY=hf_your_token'));
        console.log(c.blue('  6. Run this script again: node scripts/setup-hf-space.js'));
        console.log('');
        process.exit(0);
    }

    const credentials = { accessToken: HF_TOKEN };

    // Get the authenticated user's username
    let username;
    try {
        const user = await whoAmI({ credentials });
        username = user.name;
        ok(`Logged in as: ${c.bold(username)}`);
    } catch (err) {
        fail(`Invalid HuggingFace token. Please check HF_API_KEY in your .env\n   Error: ${err.message}`);
    }

    const SPACE_NAME = 'kodbank-ai';
    const repoId = `${username}/${SPACE_NAME}`;
    const spaceUrl = `https://huggingface.co/spaces/${repoId}`;
    const spaceApiUrl = `https://${username.toLowerCase()}-${SPACE_NAME}.hf.space`;

    // ── Step 2: Create Space ──────────────────────────────────
    step(2, `Creating HuggingFace Space: ${c.bold(repoId)}`);

    try {
        await createRepo({
            repo: { type: 'space', name: repoId },
            credentials,
            sdk: 'gradio',
            private: false,
        });
        ok(`Space created: ${c.blue(spaceUrl)}`);
    } catch (err) {
        if (err.message?.includes('409') || err.message?.includes('already') || err.message?.includes('exist')) {
            warn(`Space "${repoId}" already exists — will overwrite files.`);
        } else {
            fail(`Failed to create Space: ${err.message}`);
        }
    }

    // ── Step 3: Upload files ──────────────────────────────────
    step(3, 'Uploading files to Space...');

    const hfDir = path.join(ROOT, 'hf-space');
    const filesToUpload = ['app.py', 'requirements.txt', 'README.md'];

    const files = filesToUpload.map(filename => {
        const filePath = path.join(hfDir, filename);
        let content;
        try {
            content = readFileSync(filePath);
        } catch {
            fail(`File not found: ${filePath}`);
        }
        return {
            path: filename,
            content: new Blob([content]),
        };
    });

    try {
        await uploadFiles({
            repo: { type: 'space', name: repoId },
            credentials,
            files,
            commitTitle: '🤖 KodBank AI: Initial Space setup',
        });
        filesToUpload.forEach(f => ok(`Uploaded: ${f}`));
    } catch (err) {
        fail(`Failed to upload files: ${err.message}`);
    }

    // ── Step 4: Update .env ───────────────────────────────────
    step(4, 'Updating your .env file...');

    try {
        updateEnv('HF_SPACE_URL', spaceApiUrl);
        updateEnv('HF_API_KEY', HF_TOKEN);
        ok(`.env updated with HF_SPACE_URL = ${spaceApiUrl}`);
    } catch (err) {
        warn(`Could not update .env automatically: ${err.message}`);
        info(`Please manually add to .env:\n   HF_SPACE_URL=${spaceApiUrl}`);
    }

    // ── Done! ─────────────────────────────────────────────────
    console.log('\n' + c.green('═'.repeat(52)));
    console.log(c.bold(c.green('🎉  HuggingFace Space created successfully!')));
    console.log(c.green('═'.repeat(52)));
    console.log('');
    console.log(c.bold('  Space URL:  ') + c.blue(spaceUrl));
    console.log(c.bold('  API URL:    ') + c.blue(spaceApiUrl));
    console.log('');
    console.log(c.yellow('  ⏳ The Space is now building (takes ~2-3 minutes)'));
    console.log(c.yellow('     Watch build progress at: ' + spaceUrl));
    console.log('');
    console.log(c.bold('  Next steps:'));
    console.log('  1. Wait for Space to finish building (watch the URL above)');
    console.log('  2. Start your server:  ' + c.blue('node server/index.js'));
    console.log('  3. Start frontend:     ' + c.blue('npm run dev'));
    console.log('  4. Open KodBank → Click "🤖 Chat with AI" → Ask anything!');
    console.log('');
    console.log(c.dim('  The server will automatically use your HF Space for AI chat.'));
    console.log('');
}

main().catch(err => {
    console.error(c.red('\n❌ Unexpected error:'), err.message);
    process.exit(1);
});

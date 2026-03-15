# WriteAI — AI Grammar & Writing Assistant

A full-stack AI writing assistant built with React + Supabase Auth + API

## Features
- Grammar & Spelling correction
- Paraphrasing (Formal / Casual / Academic / Persuasive)
- Clarity Score with sentence breakdown
- Compare Versions with word-level diff highlighting
- Full authentication (Sign up, Login, Forgot/Reset Password)
- Protected routes & user dashboard

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Supabase
1. Create a project at https://supabase.com
2. Go to Project Settings → API
3. Open `src/supabaseClient.js` and replace:
   - `SUPABASE_URL` with your Project URL
   - `SUPABASE_ANON_KEY` with your anon/public key

### 3. Configure Supabase Auth (in Supabase Dashboard)
- Authentication → URL Configuration → Site URL: `http://localhost:3000`
- Add Redirect URL: `http://localhost:3000/reset-password`

### 4. Configure Anthropic API
The app calls the Anthropic API directly from the browser.
In a production app, proxy this through your backend to keep the API key secret.
For development, the API key is handled by the Claude.ai environment.

### 5. Run
```bash
npm start
```

## File Structure
```
src/
├── supabaseClient.js
├── App.jsx
├── context/
│   └── AuthContext.jsx
├── components/
│   ├── ProtectedRoute.jsx
│   └── Navbar.jsx
└── pages/
    ├── Login.jsx
    ├── Register.jsx
    ├── ForgotPassword.jsx
    ├── ResetPassword.jsx
    ├── Dashboard.jsx
    └── WritingAssistant.jsx
```

## Routes
| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Sign in |
| `/register` | Public | Create account |
| `/forgot-password` | Public | Request reset email |
| `/reset-password` | Public | Set new password |
| `/dashboard` | Protected | Home after login |
| `/assistant` | Protected | Writing tool |

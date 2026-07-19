# Setup & Contribution Guide

This guide describes how to run and test the simulation engine and the web portal locally.

---

## 1. Prerequisites
- Node.js (v18+)
- pnpm (v8+)
- Python (3.10+)
- Supabase account/local CLI setup

---

## 2. Web Portal Setup
1. Navigate to the portal:
   ```bash
   cd portal
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set environment variables in `portal/.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ADMIN_PASSWORD="admin-genesis"
   ```
4. Run the development server:
   ```bash
   pnpm run dev
   ```
5. Build for production:
   ```bash
   pnpm run build
   ```

---

## 3. Simulation Engine Setup
1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate # or venv\Scripts\activate on Windows
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run tests:
   ```bash
   pytest
   ```

# EduLead Deployment Guide: Vercel + Render (Free Tier)

This step-by-step guide walks you through hosting **EduLead** online with **Vercel** (Frontend) and **Render** (Python Backend).

---

## 🚀 Step 1: Push Project to GitHub

If you haven't pushed your code to GitHub yet, create a new repository on [github.com](https://github.com/new) (e.g. named `edulead-crm`) and run:

```bash
# In your project folder:
git remote add origin https://github.com/YOUR_USERNAME/edulead-crm.git
git branch -M main
git push -u origin main
```

---

## 🐍 Step 2: Deploy Backend to Render (Free)

1. Go to [render.com](https://render.com) and log in with your GitHub account.
2. Click **"New +"** in the top navigation and select **"Web Service"**.
3. Choose **"Build and deploy from a Git repository"** and select your `edulead-crm` repository.
4. Configure the service settings:
   - **Name:** `edulead-api` (or any name you choose)
   - **Region:** Any (e.g., Singapore or Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** `server_python` ⚠️ *(Important!)*
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python run.py`
   - **Instance Type:** `Free`
5. Click **"Deploy Web Service"**.
6. Once deployed (typically 1–2 minutes), copy your Render public URL:  
   👉 `https://edulead-crm-lksk.onrender.com`

> **Verify:** Visit `https://edulead-crm-lksk.onrender.com/api/health` in your browser. You will see `{"status":"online", "app":"EduLead API (Python + SQL)"}`.

---

## ⚡ Step 3: Deploy Frontend to Vercel (Free)

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** ➔ **"Project"**.
3. Import your `edulead-crm` GitHub repository.
4. In the **Configure Project** screen:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and choose `client` ⚠️ *(Important!)*
5. Expand the **Environment Variables** section and add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://edulead-api-xxxx.onrender.com` *(Paste your Render URL from Step 2)*
6. Click **"Deploy"**.

---

## ✅ Step 4: Test Your Live System

Once Vercel finishes deploying, click on your live Vercel URL (e.g., `https://edulead-client.vercel.app`):
1. The login screen will open with pre-filled credentials.
2. Click **"Sign In to Portal"** (or use the 1-click demo role buttons).
3. The dashboard will load with live statistics fetched from your Render Python API.
4. Try creating a new lead or scheduling a follow-up to test end-to-end database persistence!

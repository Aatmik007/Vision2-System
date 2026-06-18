# Vision2System - AI-Powered Product Idea to System Design Platform

Vision2System is an AI-powered SaaS platform that transforms raw product concepts into production-ready system architectures, database schemas, API specifications, and detailed implementation blueprints. Equipped with a real-time collaborative workspace, version-controlled history, and interactive diagramming, Vision2System bridges the gap between ideation and engineering execution.

---

## 🚀 Key Features

*   **🧠 AI-Powered System Generation**: Convert simple text prompts into complete system designs using advanced Generative AI models.
*   **📊 Interactive Architecture Canvas**: Inspect, move, and connect system components (API Gateways, Microservices, Databases) on a live grid powered by React Flow.
*   **📄 Automated Technical Documentation**: Instantly generates four main categories of documentation:
    *   **PRD**: Functional requirements, user stories, and system flows.
    *   **Database Schema**: Mongoose/MongoDB data model configurations.
    *   **API Design**: Endpoint routing, HTTP methods, headers, and payload structures.
    *   **Implementation Roadmap**: Step-by-step phased execution guide.
*   **👥 Real-Time Collaboration**: Socket.io integration brings live cursor tracking, instant node updates, spatial comments, and concurrent markdown editing.
*   **⏱️ Version Control & Snapshots**: Save design states with descriptive commit logs, view project history timelines, and rollback to any previous version.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: Next.js (React)
*   **Styling**: TailwindCSS & Framer Motion (for modern glassmorphic animations)
*   **Interactive Canvas**: React Flow
*   **Icons**: Lucide React

### Backend & Database
*   **Runtime**: Node.js & Express
*   **Database**: MongoDB (Mongoose ODM)
*   **Real-time Protocol**: Socket.io (WebSockets)
*   **AI Engine**: Google Gemini API (`gemini-1.5-flash` model via `@google/generative-ai` SDK)

---

## 🌐 Connection & Architecture Details

### API Reverse Proxy Configuration
To ensure seamless communication without CORS issues during development, the system uses a reverse proxy routing `/api` and websocket channels directly to the Node.js backend.

### WebSocket Events Lifecycle
*   `join-project`: Attaches users to a collaborative project room and broadcasts presence details.
*   `cursor-move`: Synchronizes active mouse cursor coordinates across all concurrent team members.
*   `node-change`: Syncs visual React Flow node coordinate shifts and component links.
*   `doc-change`: Transmits live keystrokes on markdown documentation editors.
*   `new-comment`: Broadcasts spatial annotations on the architecture layout.

---

## 💻 Local Development Setup

Follow these steps to run Vision2System on your local machine:

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v16+)
*   [MongoDB](https://www.mongodb.com/try/download/community) (running locally or via MongoDB Atlas)

### 2. Environment Variables Configuration
Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/vision2system
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If `GEMINI_API_KEY` is omitted, the application automatically falls back to an offline mock generator so you can still fully demo the workspace functionalities.)*

### 3. Installation
Install all dependencies for both frontend and backend using npm workspaces:
```bash
npm run install-all
```

### 4. Run the Application
Start both the backend server and frontend development server concurrently:
```bash
npm run dev
```

The services will be available at:
*   **Frontend Client**: `http://localhost:3000` (Next.js/Vite Dev Server)
*   **Backend API**: `http://localhost:5000` (Node/Express Server)

---

## 📝 License
This project is licensed under the MIT License.

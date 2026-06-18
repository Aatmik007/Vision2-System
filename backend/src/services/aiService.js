import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API client
const geminiKey = process.env.GEMINI_API_KEY || '';
const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

// Helper to generate mock fallback data for a smooth initial experience
const getMockData = (idea) => {
  const normalized = idea.toLowerCase();
  const title = idea.charAt(0).toUpperCase() + idea.slice(1);
  
  // Custom nodes based on the prompt type
  const isEcom = normalized.includes('shop') || normalized.includes('store') || normalized.includes('commerce') || normalized.includes('marketplace');
  const isSaaS = normalized.includes('saas') || normalized.includes('app') || normalized.includes('tool');
  
  const nodes = [
    { id: '1', type: 'input', position: { x: 250, y: 50 }, data: { label: 'Client App (React/Vite)', tech: 'Vite, Tailwind, Axios', description: 'Web Client interface' } },
    { id: '2', type: 'default', position: { x: 250, y: 150 }, data: { label: 'API Gateway', tech: 'Express, JWT, CORS', description: 'Routes and authorizes requests' } },
    { id: '3', type: 'default', position: { x: 100, y: 270 }, data: { label: 'Auth Service', tech: 'Node.js, BCrypt', description: 'Handles authentication & sessions' } },
    { id: '4', type: 'default', position: { x: 400, y: 270 }, data: { label: isEcom ? 'Product Service' : 'Core Business Engine', tech: 'Node.js, Express', description: 'Business Logic endpoints' } },
    { id: '5', type: 'output', position: { x: 100, y: 400 }, data: { label: 'User Store (MongoDB)', tech: 'MongoDB Mongoose', description: 'Stores user accounts' } },
    { id: '6', type: 'output', position: { x: 400, y: 400 }, data: { label: isEcom ? 'Product DB (PostgreSQL)' : 'App Database (MongoDB)', tech: 'Mongoose / Prisma', description: 'Transactional entity records' } }
  ];

  const edges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, label: 'HTTPS' },
    { id: 'e2-3', source: '2', target: '3', label: 'Route auth' },
    { id: 'e2-4', source: '2', target: '4', label: 'API call' },
    { id: 'e3-5', source: '3', target: '5', label: 'Query' },
    { id: 'e4-6', source: '4', target: '6', label: 'Write/Read' }
  ];

  return {
    analysis: {
      businessModel: `Subscription SaaS or transactional fee platform based on the concept: "${title}". Offers automated orchestration, cloud analytics, and integrations.`,
      entities: ['User', 'Workspace', 'BillingProfile', 'Transaction', 'AuditLog', isEcom ? 'Product' : 'ServiceItem'],
      workflows: [
        'User registration & organization setup',
        'Service consumption or purchase workflow',
        'Webhook delivery and real-time dashboard notifications',
        'Version control and data snapshotting'
      ],
      risks: [
        'Rate limit exhaustion on integrated partner APIs',
        'Data consistency across microservices during network partition',
        'Concurrency conflicts in real-time collaboration sessions'
      ]
    },
    prd: `# Product Requirements Document (PRD) - ${title}

## 1. Executive Summary
${title} is a web-scale system designed to solve bottlenecks in real-time resource allocation and automated pipeline triggers.

## 2. User Personas
- **Developer Dan**: Needs robust APIs and Swagger files to integrate external platforms.
- **Product Manager Pam**: Needs visual flowcharts and clear product requirements.

## 3. Functional Requirements
- **FR-1**: Users can register and configure billing profiles.
- **FR-2**: Real-time canvas collaboration for live team editing.
- **FR-3**: Automated version history snapshots and single-click rollbacks.

## 4. Non-Functional Requirements
- **NFR-1**: Page loading speed under 1.5 seconds globally.
- **NFR-2**: System design visualizer response under 200ms.
`,
    database: `## Database Design Schema

### MongoDB Mongoose Layout
\`\`\`javascript
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: String,
  plan: { type: String, enum: ['free', 'pro'] },
  createdAt: Date
});

const ProjectSchema = new mongoose.Schema({
  title: String,
  ownerId: ObjectId,
  collaborators: [ObjectId]
});
\`\`\`

### Alternative MySQL Relational Schema
\`\`\`sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  plan ENUM('free', 'pro') DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`
`,
    apiDesign: `## REST API Specifications

### Auth Endpoints
- **POST /api/auth/register**: Register new user profiles.
- **POST /api/auth/login**: Log in and return JWT token.

### Projects Engine
- **GET /api/projects**: Fetch all workspaces for the authenticated user.
- **POST /api/projects**: Create a new workspace canvas.
- **PUT /api/projects/:id**: Save layout configurations.
`,
    roadmap: `# Development Roadmap

## Phase 1: MVP Setup (Weeks 1-3)
- Initialize backend, routers, database connections, and JWT authorization middlewares.
- Render React Flow canvas with custom draggable components.

## Phase 2: Live Collaboration & AI Engine (Weeks 4-6)
- Setup Socket.io triggers for mouse movements and state broadcasts.
- Integrate Gemini APIs to analyze code structures.
`,
    technicalDocs: `# Technical Documentation

This section outlines architectural boundaries, deployment procedures, and guidelines.

## Hosting & Setup
- **Frontend**: Deploy static assets via Vercel CDN.
- **Backend**: Host Express app inside a container on AWS ECS / Railway.
- **Database**: Spin up a cluster on MongoDB Atlas.
`,
    architecture: { nodes, edges }
  };
};

export const generateSystemDesign = async (idea) => {
  if (!genAI) {
    console.warn("GEMINI_API_KEY is not defined. Falling back to structured Mock Data.");
    return getMockData(idea);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an elite Lead Solutions Architect.
      Analyze the following startup/application idea and output a complete system design in JSON format.
      Idea: "${idea}"

      The output MUST be a JSON object containing precisely these keys. Do not include any markdown backticks or text outside the JSON:
      {
        "analysis": {
          "businessModel": "Text summarizing business model",
          "entities": ["array of entities"],
          "workflows": ["array of workflows"],
          "risks": ["array of risks"]
        },
        "prd": "Markdown content for Product Requirements Document",
        "database": "Markdown content specifying schemas (MongoDB mongoose and SQL schemas)",
        "apiDesign": "Markdown content detailing API routes and Swagger spec",
        "roadmap": "Markdown content detailing a dev roadmap",
        "technicalDocs": "Markdown content for developer documentation",
        "architecture": {
          "nodes": [
            { "id": "1", "type": "input", "position": { "x": 250, "y": 50 }, "data": { "label": "Client Interface", "tech": "React", "description": "Web client" } },
            ... (suggest a realistic, production-ready set of 5-8 nodes matching this idea including DB, gateways, caching, etc.)
          ],
          "edges": [
            { "id": "e1-2", "source": "1", "target": "2", "animated": true, "label": "API Call" }
            ... (connect the suggested nodes logically)
          ]
        }
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Clean text in case Gemini wraps the JSON in ```json ... ```
    let cleanText = text;
    if (text.startsWith('```json')) {
      cleanText = text.substring(7, text.length - 3).trim();
    } else if (text.startsWith('```')) {
      cleanText = text.substring(3, text.length - 3).trim();
    }

    const design = JSON.parse(cleanText);
    return design;
  } catch (error) {
    console.error("Gemini AI API Call failed, falling back to mock data:", error);
    return getMockData(idea);
  }
};

export const rewriteDocumentSection = async (content, action) => {
  if (!genAI) {
    if (action === 'shorter') return content.substring(0, Math.floor(content.length / 2)) + '...';
    if (action === 'longer') return content + '\n\nAdditionally, this service operates within a high-throughput pipeline designed to auto-scale dynamically under spikes in user connection loads.';
    return `[Polished Version] ${content}`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      Rewrite the following text based on the instruction: "${action}".
      Text: "${content}"
      Return only the rewritten text, without any additional explanations.
    `;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini Rewrite failed:", error);
    return content;
  }
};

const modifyKeywords = [
  { keys: ['redis', 'cache'], label: 'Redis Cache', tech: 'Redis (In-Memory)', desc: 'Accelerates data queries and stores sessions.' },
  { keys: ['kafka', 'rabbit', 'mq', 'message', 'queue'], label: 'Message Broker', tech: 'Apache Kafka / RabbitMQ', desc: 'Handles asynchronous event pub/sub streams.' },
  { keys: ['postgres', 'mysql', 'sql'], label: 'Relational DB', tech: 'PostgreSQL / MySQL', desc: 'Stores relational transactional schema records.' },
  { keys: ['auth', 'jwt', 'login'], label: 'Auth Service', tech: 'OAuth2 / JWT Provider', desc: 'Authorizes client requests and issues identity tokens.' },
  { keys: ['s3', 'aws', 'storage', 'bucket'], label: 'Object Storage', tech: 'AWS S3 / Cloud Storage', desc: 'Hosts user assets, image uploads, and static logs.' },
  { keys: ['search', 'elastic'], label: 'Search Engine', tech: 'Elasticsearch', desc: 'Provides full-text indexing and fast lookups.' }
];

export const modifySystemDesign = async (idea, currentNodes, currentEdges, modificationPrompt) => {
  const runFallback = () => {
    const normalized = modificationPrompt.toLowerCase();
    let label = '';
    let tech = 'Generic Service';
    let desc = `Added via prompt: "${modificationPrompt}"`;

    const match = modifyKeywords.find(item => item.keys.some(k => normalized.includes(k)));
    if (match) {
      label = match.label;
      tech = match.tech;
      desc = match.desc;
    } else {
      label = modificationPrompt.length > 25 ? modificationPrompt.substring(0, 22) + '...' : modificationPrompt;
      label = label.charAt(0).toUpperCase() + label.slice(1);
    }

    const newId = (currentNodes.length + 1).toString();
    const mockNode = {
      id: newId,
      type: 'serviceNode',
      position: { x: 300 + Math.random() * 100, y: 300 + Math.random() * 100 },
      data: { label, tech, description: desc }
    };

    const sourceId = currentNodes[0]?.id || '1';
    const mockEdge = {
      id: `e-${sourceId}-${newId}`,
      source: sourceId,
      target: newId,
      animated: true,
      label: 'AI Stream'
    };

    return {
      nodes: [...currentNodes, mockNode],
      edges: [...currentEdges, mockEdge]
    };
  };

  if (!genAI) {
    console.warn("GEMINI_API_KEY is not defined. Falling back to Mock Modification.");
    return runFallback();
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an elite Lead Solutions Architect.
      We have an existing system design for the product idea: "${idea}".
      The current nodes on the canvas are: ${JSON.stringify(currentNodes)}
      The current connections/edges are: ${JSON.stringify(currentEdges)}
      
      The user wants to modify this architecture with the following request: "${modificationPrompt}".
      
      Generate the updated layout of ALL nodes and edges.
      Your output must incorporate the request. You can add new nodes, modify/reposition existing nodes, or add/modify connection edges.
      Every node MUST have the format:
      {
        "id": "unique_string_id",
        "type": "serviceNode",
        "position": { "x": number, "y": number },
        "data": {
          "label": "Service Name",
          "tech": "Technologies used (e.g. Node.js, Redis)",
          "description": "Short explanation of service responsibilities"
        }
      }
      
      And every edge MUST have the format:
      {
        "id": "e-source-target",
        "source": "source_node_id",
        "target": "target_node_id",
        "animated": boolean,
        "label": "connection type / description"
      }
      
      The output MUST be a JSON object containing precisely these keys. Do not include any markdown backticks or text outside the JSON:
      {
        "nodes": [...],
        "edges": [...]
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    let cleanText = text;
    if (text.startsWith('```json')) {
      cleanText = text.substring(7, text.length - 3).trim();
    } else if (text.startsWith('```')) {
      cleanText = text.substring(3, text.length - 3).trim();
    }

    const design = JSON.parse(cleanText);
    return design;
  } catch (error) {
    console.error("Gemini modify design failed, falling back to mock modification:", error);
    return runFallback();
  }
};


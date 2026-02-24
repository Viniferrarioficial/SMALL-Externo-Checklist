import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("visitlog.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL, -- 'ADMIN', 'GESTOR', 'VENDEDOR'
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cnpj TEXT,
    region TEXT
  );

  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    client_id INTEGER,
    date TEXT NOT NULL,
    type TEXT NOT NULL, -- 'PROSPECCAO', 'NEGOCIACAO', 'RELACIONAMENTO', 'POS_VENDA'
    result TEXT NOT NULL, -- 'ALCANCADO', 'PARCIAL', 'NAO_ALCANCADO'
    volume REAL,
    competitor TEXT,
    summary TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );
`);

// Seed initial data if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (name, email, role) VALUES (?, ?, ?)").run("Ricardo Mendes", "ricardo@visitlog.com", "VENDEDOR");
  db.prepare("INSERT INTO users (name, email, role) VALUES (?, ?, ?)").run("Ana Silva", "ana@visitlog.com", "GESTOR");
  db.prepare("INSERT INTO users (name, email, role) VALUES (?, ?, ?)").run("João Silva", "joao@visitlog.com", "ADMIN");
  
  db.prepare("INSERT INTO clients (name, cnpj, region) VALUES (?, ?, ?)").run("Supermercados Alvorada", "12.345.678/0001-01", "Belo Horizonte, MG");
  db.prepare("INSERT INTO clients (name, cnpj, region) VALUES (?, ?, ?)").run("Farmácia Vida Saudável", "98.765.432/0001-99", "Nova Lima, MG");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/stats", (req, res) => {
    const totalVisits = db.prepare("SELECT COUNT(*) as count FROM visits").get() as any;
    const uniqueClients = db.prepare("SELECT COUNT(DISTINCT client_id) as count FROM visits").get() as any;
    
    res.json({
      totalVisits: totalVisits.count,
      uniqueClients: uniqueClients.count,
      opportunities: "R$ 1.2M",
      visitsByPeriod: [
        { label: "Sem 1", value: 40 },
        { label: "Sem 2", value: 65 },
        { label: "Sem 3", value: 90 },
        { label: "Sem 4", value: 55 },
      ]
    });
  });

  app.get("/api/visits", (req, res) => {
    const visits = db.prepare(`
      SELECT v.*, u.name as user_name, c.name as client_name, c.region
      FROM visits v
      JOIN users u ON v.user_id = u.id
      JOIN clients c ON v.client_id = c.id
      ORDER BY v.date DESC
    `).all();
    res.json(visits);
  });

  app.post("/api/visits", (req, res) => {
    const { user_id, client_name, cnpj, region, date, type, result, volume, competitor, summary } = req.body;
    
    // Simple client management: find or create
    let client = db.prepare("SELECT id FROM clients WHERE name = ?").get(client_name) as any;
    if (!client) {
      const result = db.prepare("INSERT INTO clients (name, cnpj, region) VALUES (?, ?, ?)").run(client_name, cnpj, region);
      client = { id: result.lastInsertRowid };
    }

    const visitResult = db.prepare(`
      INSERT INTO visits (user_id, client_id, date, type, result, volume, competitor, summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(user_id || 1, client.id, date, type, result, volume, competitor, summary);

    res.json({ id: visitResult.lastInsertRowid });
  });

  app.get("/api/users", (req, res) => {
    const users = db.prepare("SELECT * FROM users").all();
    res.json(users);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

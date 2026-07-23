import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function hash(value) {
  return crypto.createHash('sha256').update(value || '').digest('hex');
}
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    const adminEmail = process.env.ADMIN_EMAIL || 'direction@crij-mayotte.fr';
    const adminPassword = process.env.ADMIN_PASSWORD || 'CRIJ-MAYOTTE-2026';
    const db = {
      users: [{id: crypto.randomUUID(), name: 'Direction CRIJ Mayotte', email: adminEmail, role: 'direction', password: hash(adminPassword)}],
      volunteers: [],
      actions: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}
function writeDB(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase() === String(email || '').toLowerCase() && u.password === hash(password));
  if (!user) return res.status(401).json({error: 'Identifiants incorrects'});
  res.json({user: {id:user.id, name:user.name, email:user.email, role:user.role}});
});

app.get('/api/bootstrap', (req,res) => {
  const db = readDB();
  res.json({users: db.users.map(({password,...u})=>u), volunteers: db.volunteers, actions: db.actions});
});

app.post('/api/admin/users', (req,res) => {
  const {name,email,password,role} = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({error:'Champs obligatoires'});
  const db = readDB();
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) return res.status(409).json({error:'Cet email existe déjà'});
  const user = {id:crypto.randomUUID(), name, email, role, password:hash(password)};
  db.users.push(user); writeDB(db);
  const {password:_, ...safe} = user; res.status(201).json(safe);
});

app.put('/api/admin/users/:id', (req,res) => {
  const db = readDB();
  const user = db.users.find(u=>u.id===req.params.id);
  if (!user) return res.status(404).json({error:'Compte introuvable'});
  const {name,email,password,role} = req.body;
  if (name) user.name=name;
  if (email) user.email=email;
  if (role) user.role=role;
  if (password) user.password=hash(password);
  writeDB(db);
  const {password:_, ...safe} = user; res.json(safe);
});

app.delete('/api/admin/users/:id', (req,res) => {
  const db = readDB();
  if (db.users.length <= 1) return res.status(400).json({error:'Impossible de supprimer le dernier compte'});
  db.users = db.users.filter(u=>u.id!==req.params.id);
  writeDB(db); res.json({ok:true});
});

app.post('/api/volunteers', (req,res) => {
  const db = readDB();
  const volunteer = {id:crypto.randomUUID(), createdAt:new Date().toISOString(), ...req.body};
  db.volunteers.push(volunteer); writeDB(db); res.status(201).json(volunteer);
});
app.put('/api/volunteers/:id', (req,res) => {
  const db = readDB();
  const v = db.volunteers.find(x=>x.id===req.params.id);
  if (!v) return res.status(404).json({error:'Volontaire introuvable'});
  Object.assign(v, req.body); writeDB(db); res.json(v);
});
app.delete('/api/volunteers/:id', (req,res) => {
  const db = readDB(); db.volunteers = db.volunteers.filter(x=>x.id!==req.params.id); writeDB(db); res.json({ok:true});
});

app.post('/api/actions', (req,res) => {
  const db=readDB();
  const action={id:crypto.randomUUID(), createdAt:new Date().toISOString(), ...req.body};
  db.actions.push(action); writeDB(db); res.status(201).json(action);
});
app.delete('/api/actions/:id', (req,res) => {
  const db=readDB(); db.actions=db.actions.filter(x=>x.id!==req.params.id); writeDB(db); res.json({ok:true});
});

app.get('*', (req,res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`CRIJ Mayotte app running on port ${PORT}`));

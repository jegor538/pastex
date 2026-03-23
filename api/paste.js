// api/paste.js
import fs from 'fs';
import path from 'path';

const DATA_FILE = '/tmp/pastes.json';

function readPastes() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch(e) {}
  return {};
}

function writePastes(pastes) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(pastes), 'utf8');
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export default async function handler(req, res) {
  // GET request = retrieve paste
  if (req.method === 'GET') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).send('Missing id parameter');
    }
    
    const pastes = readPastes();
    const paste = pastes[id];
    
    if (!paste) {
      return res.status(404).send('Paste not found');
    }
    
    // Return RAW TEXT (no HTML)
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(paste.content);
  }
  
  // POST request = create paste
  if (req.method === 'POST') {
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Empty content' });
    }
    
    const pastes = readPastes();
    let id = generateId();
    while (pastes[id]) {
      id = generateId();
    }
    
    pastes[id] = {
      content: content,
      created: Date.now()
    };
    
    writePastes(pastes);
    return res.json({ id });
  }
  
  // Any other method
  res.status(405).json({ error: 'Method not allowed' });
}

// api/create.js
import fs from 'fs';

const file = '/tmp/pastes.json';

function read() {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file));
  } catch(e) {}
  return {};
}

function write(data) {
  fs.writeFileSync(file, JSON.stringify(data));
}

function id() {
  return Math.random().toString(36).substring(2, 10);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'POST only'});
  
  const {content} = req.body;
  if (!content || !content.trim()) return res.status(400).json({error: 'empty'});
  
  const pastes = read();
  let newId = id();
  while (pastes[newId]) newId = id();
  
  pastes[newId] = {content, created: Date.now()};
  write(pastes);
  
  res.json({id: newId});
}

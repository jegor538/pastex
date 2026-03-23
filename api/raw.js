// api/raw.js
import fs from 'fs';

const file = '/tmp/pastes.json';

function read() {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file));
  } catch(e) {}
  return {};
}

export default async function handler(req, res) {
  const {id} = req.query;
  if (!id) return res.status(400).send('no id');
  
  const pastes = read();
  const paste = pastes[id];
  
  if (!paste) return res.status(404).send('not found');
  
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(paste.content);
}

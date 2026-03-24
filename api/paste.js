// api/paste.js
export default async function handler(req, res) {
  const redisUrl = 'https://secure-bat-82381.upstash.io';
  const redisToken = 'gQAAAAAAAUHNAAIncDExNzJkYTBmZWQwNDc0ZjY2ODliOTk5NjhkNzBjOTg5ZXAxODIzODE';
  
  // GET = retrieve paste
  if (req.method === 'GET') {
    const { id, p } = req.query;
    if (!id) return res.status(400).send('Missing id');
    
    try {
      const response = await fetch(`${redisUrl}/get/${id}`, {
        headers: { Authorization: `Bearer ${redisToken}` }
      });
      const data = await response.json();
      
      if (!data.result) return res.status(404).send('Not found');
      
      let paste = data.result;
      if (paste.startsWith('"') && paste.endsWith('"')) {
        paste = JSON.parse(paste);
      } else {
        paste = JSON.parse(paste);
      }
      
      // Check password
      if (paste.password) {
        if (!p || p !== paste.password) {
          return res.status(401).send('Password required');
        }
      }
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(paste.content);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error');
    }
  }
  
  // POST = create paste
  if (req.method === 'POST') {
    const { content, password } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Empty' });
    }
    
    const id = Math.random().toString(36).substring(2, 10);
    
    const pasteData = {
      content: content,
      created: Date.now()
    };
    
    if (password && password.trim()) {
      pasteData.password = password.trim();
    }
    
    try {
      await fetch(`${redisUrl}/set/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${redisToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(JSON.stringify(pasteData))
      });
      return res.json({ id });
    } catch (err) {
      return res.status(500).json({ error: 'Failed' });
    }
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}

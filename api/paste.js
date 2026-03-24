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
      
      // Check if it's password protected (starts with "PASS:")
      let content = data.result;
      if (content.startsWith('"') && content.endsWith('"')) {
        content = content.slice(1, -1);
      }
      
      if (content.startsWith('PASS:')) {
        // Format: PASS:hash:actual_content
        const parts = content.split(':', 3);
        const storedPass = parts[1];
        const actualContent = parts[2];
        
        if (!p || p !== storedPass) {
          return res.status(401).send('Password required');
        }
        return res.send(actualContent);
      }
      
      // No password, return as is
      return res.send(content);
    } catch (err) {
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
    
    let toStore = content;
    if (password && password.trim()) {
      toStore = `PASS:${password.trim()}:${content}`;
    }
    
    try {
      await fetch(`${redisUrl}/set/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${redisToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(toStore)
      });
      return res.json({ id });
    } catch (err) {
      return res.status(500).json({ error: 'Failed' });
    }
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}

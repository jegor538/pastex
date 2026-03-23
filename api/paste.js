// api/paste.js
export default async function handler(req, res) {
  // YOUR UPSTASH CREDENTIALS (hardcoded for now)
  const redisUrl = 'https://secure-bat-82381.upstash.io';
  const redisToken = 'gQAAAAAAAUHNAAIncDExNzJkYTBmZWQwNDc0ZjY2ODliOTk5NjhkNzBjOTg5ZXAxODIzODE';
  
  // GET = retrieve paste
  if (req.method === 'GET') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).send('Missing id');
    }
    
    try {
      const response = await fetch(`${redisUrl}/get/${id}`, {
        headers: { Authorization: `Bearer ${redisToken}` }
      });
      const data = await response.json();
      
      if (!data.result) {
        return res.status(404).send('Paste not found');
      }
      
      let content = data.result;
      if (content.startsWith('"') && content.endsWith('"')) {
        content = content.slice(1, -1);
      }
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(content);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
  }
  
  // POST = create paste
  if (req.method === 'POST') {
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Empty content' });
    }
    
    const id = Math.random().toString(36).substring(2, 10);
    
    try {
      await fetch(`${redisUrl}/set/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${redisToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      });
      
      return res.json({ id });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to save paste' });
    }
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}

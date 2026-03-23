// api/paste.js
export default async function handler(req, res) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
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
        return res.status(404).send('Paste not found or expired');
      }
      
      // Remove quotes if present (Redis returns quoted string)
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
    
    // Generate random 8-character ID
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
  
  // Any other method
  res.status(405).json({ error: 'Method not allowed' });
}

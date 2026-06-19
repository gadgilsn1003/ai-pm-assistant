export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { updates } = req.body;

  if (!updates) {
    return res.status(400).json({ error: 'No updates provided' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert AI project management assistant. Analyze the team updates and return a JSON object with exactly this structure:
{
  "executive_summary": "2-3 sentence project status summary",
  "overall_status": "On Track" | "At Risk" | "Blocked",
  "priority_actions": [
    { "task": "task description", "owner": "team/person", "due": "timeframe", "priority": "Critical" | "High" | "Medium" }
  ],
  "risks": [
    { "risk": "risk description", "owner": "team/person", "impact": "impact description", "level": "High" | "Medium" | "Low" }
  ],
  "timeline": {
    "current_sprint": ["Day: action item"],
    "next_sprint": ["action item"],
    "milestones": ["milestone"]
  },
  "sentiment": "Stable" | "Positive" | "Concerning" | "Critical"
}
Return only valid JSON, no markdown.`
          },
          {
            role: 'user',
            content: `Analyze these project updates:\n\n${updates}`
          }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);
    return res.status(200).json(parsed);
  } catch (error) {
    console.error('OpenAI error:', error);
    return res.status(500).json({ error: 'Failed to generate PM output' });
  }
}

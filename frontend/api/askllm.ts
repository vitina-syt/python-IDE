export async function askQuestion(question: string, context: string) {
  const response = await fetch('http://localhost:8000/api/qa', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ question, context })
  });
  if (!response.ok) throw new Error('API error');
  return await response.json();
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const api = {
  async createPoll(question: string, options: string[], duration?: number) {
    const response = await fetch(`${API_BASE_URL}/polls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, options, duration })
    });
    return response.json();
  },

  async getActivePoll() {
    const response = await fetch(`${API_BASE_URL}/polls/active`);
    return response.json();
  },

  async submitVote(pollId: string, userId: string, selectedOption: number) {
    const response = await fetch(`${API_BASE_URL}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId, userId, selectedOption })
    });
    return response.json();
  },

  async getPollResults(pollId: string) {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}/results`);
    return response.json();
  }
};
const BASE_URL = "http://127.0.0.1:8000/api";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(`API error ${response.status} on ${path}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  listResearch: () => request("/research/"),
  getResearch: (id) => request(`/research/${id}/`),
  createResearch: (data) =>
    request("/research/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  listPapers: (researchId) => request(`/papers/?research=${researchId}`),
  listConcepts: (researchId) => request(`/concepts/?research=${researchId}`),
  listPrerequisites: (researchId) => request(`/prerequisites/?research=${researchId}`),
  listCitations: (researchId) => request(`/citations/?research=${researchId}`),
  listPaperConcepts: (researchId) => request(`/paper-concepts/?research=${researchId}`),
  sendChatMessage: (researchId, message) =>
    request(`/research/${researchId}/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    }),
};
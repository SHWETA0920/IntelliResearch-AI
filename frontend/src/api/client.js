// const BASE_URL = "http://127.0.0.1:8000/api";

// async function request(path, options = {}) {
//   const response = await fetch(`${BASE_URL}${path}`, options);

//   if (!response.ok) {
//     throw new Error(`API error ${response.status} on ${path}`);
//   }

//   if (response.status === 204) return null;

//   return response.json();
// }

// export const api = {
//   listResearch: () => request("/research/"),

//   getResearch: (id) => request(`/research/${id}/`),

//   createResearch: (data) =>
//     request("/research/", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     }),

//   // Trigger AI analysis for a research session
//   analyzeResearch: (id) =>
//     request(`/research/${id}/analyze/`, {
//       method: "POST",
//     }),

//   listPapers: (researchId) =>
//     request(`/papers/?research=${researchId}`),

//   listConcepts: (researchId) =>
//     request(`/concepts/?research=${researchId}`),

//   listPrerequisites: (researchId) =>
//     request(`/prerequisites/?research=${researchId}`),

//   listCitations: (researchId) =>
//     request(`/citations/?research=${researchId}`),

//   listPaperConcepts: (researchId) =>
//     request(`/paper-concepts/?research=${researchId}`),

//   sendChatMessage: (researchId, message) =>
//     request(`/research/${researchId}/chat/`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ message }),
//     }),
// };

// const BASE_URL = "http://127.0.0.1:8000/api";

// async function request(path, options = {}) {
//   const response = await fetch(`${BASE_URL}${path}`, options);
//   if (!response.ok) {
//     throw new Error(`API error ${response.status} on ${path}`);
//   }
//   if (response.status === 204) return null;
//   return response.json();
// }

// export const api = {
//   listResearch: () => request("/research/"),
//   getResearch: (id) => request(`/research/${id}/`),
//   createResearch: (data) =>
//     request("/research/", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     }),
//   listPapers: (researchId) => request(`/papers/?research=${researchId}`),
//   listConcepts: (researchId) => request(`/concepts/?research=${researchId}`),
//   listPrerequisites: (researchId) => request(`/prerequisites/?research=${researchId}`),
//   listCitations: (researchId) => request(`/citations/?research=${researchId}`),
//   listPaperConcepts: (researchId) => request(`/paper-concepts/?research=${researchId}`),
//   sendChatMessage: (researchId, message) =>
//     request(`/research/${researchId}/chat/`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ message }),
//     }),
// };

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

  // Trigger AI analysis for a research session
  analyzeResearch: (id) =>
    request(`/research/${id}/analyze/`, {
      method: "POST",
    }),

  listPapers: (researchId) =>
    request(`/papers/?research=${researchId}`),

  listConcepts: (researchId) =>
    request(`/concepts/?research=${researchId}`),

  listPrerequisites: (researchId) =>
    request(`/prerequisites/?research=${researchId}`),

  listCitations: (researchId) =>
    request(`/citations/?research=${researchId}`),

  listPaperConcepts: (researchId) =>
    request(`/paper-concepts/?research=${researchId}`),

  // sendChatMessage: (researchId, message) =>
  //   request(`/research/${researchId}/chat/`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ message }),
  //   }),
  // --- In client.js, replace ONLY the sendChatMessage entry with this. ---
// Everything else in client.js (request(), all other api.* methods)
// stays exactly as it is.
//
// The 3rd argument is optional. Existing calls like
// api.sendChatMessage(id, question) keep working unchanged — llmSettings
// defaults to null, so nothing extra gets added to the request body and
// your backend sees the exact same payload as before.

sendChatMessage: (researchId, message, llmSettings = null) =>
  request(`/research/${researchId}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      // Only included when the user has filled in their own key on the
      // AI Assistant settings panel — otherwise this key is simply
      // absent from the JSON, so a backend that doesn't look for it
      // behaves exactly as before.
      ...(llmSettings ? { llm_settings: llmSettings } : {}),
    }),
  }),
};
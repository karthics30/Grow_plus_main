// API Configuration
// Update this URL to match your backend server
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const API_ENDPOINTS = {
  createTemplate: `${API_BASE_URL}/campaign/template`,
  listTemplates: `${API_BASE_URL}/campaign/templates`,
  listTemplatesByCampaign: `${API_BASE_URL}/campaign/templates`,
  updateTemplate: (id: string) => `${API_BASE_URL}/campaign/template/${id}`,
  deleteTemplate: (id: string) => `${API_BASE_URL}/campaign/template/${id}`,
  sendCampaign: `${API_BASE_URL}/campaign/send`,
  sendLogs: `${API_BASE_URL}/campaign/send-logs`,
  dashboardCounts: `${API_BASE_URL}/campaign/stats`,
  userDetails: `${API_BASE_URL}/campaign/user-emails`,
  fetchreplydata: `${API_BASE_URL}/campaign/getfetchreplies`,
  create: `${API_BASE_URL}/campaign/create-campaign`,
  getAll: `${API_BASE_URL}/campaign/get-campaigns`,
  update: (id: string) => `${API_BASE_URL}/campaign/update-campaign/${id}`,
  delete: (id: string) => `${API_BASE_URL}/campaign/delete-campaign/${id}`,
  bulkupload : `${API_BASE_URL}/user-emails/bulk-upload`,


  listContacts: `${API_BASE_URL}/user-emails/all`,
  createContact: `${API_BASE_URL}/user-emails/add`,
  updateContact: (id: string) => `${API_BASE_URL}/user-emails/update/${id}`,
  deleteContact: (id: string) => `${API_BASE_URL}/user-emails/delete/${id}`,
  getContact: (id) => `${API_BASE_URL}/user-emails/${id}`,
  getCampaignStats: (id: number) => `${API_BASE_URL}/campaign/send-logs/stats/${id}`,
};

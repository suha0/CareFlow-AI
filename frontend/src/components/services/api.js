
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token when available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('careflowToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Register a new user
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);

  if (response.data.token) {
    localStorage.setItem('careflowToken', response.data.token);
    localStorage.setItem('careflowUser', JSON.stringify({
      name: response.data.name,
      email: response.data.email,
    }));
  }

  return response.data;
};

// Login an existing user
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);

  if (response.data.token) {
    localStorage.setItem('careflowToken', response.data.token);
    localStorage.setItem('careflowUser', JSON.stringify({
      name: response.data.name,
      email: response.data.email,
    }));
  }

  return response.data;
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem('careflowToken');
  localStorage.removeItem('careflowUser');
};

// Get all enquiries
export const getEnquiries = async () => {
  const response = await api.get('/enquiries');
  return response.data;
};

// Create a new enquiry
export const createEnquiry = async (enquiryData) => {
  const response = await api.post('/enquiries', enquiryData);
  return response.data;
};

// Get one enquiry by ID
export const getEnquiryById = async (id) => {
  const response = await api.get(`/enquiries/${id}`);
  return response.data;
};

export const analyzeEnquiry = async (message, enquiryId) => {
  const response = await api.post('/ai/analyze', {
    message,
    enquiryId: String(enquiryId),
  });

  return response.data;
};

export const approveEnquiry = async (id, draftResponse) => {
  const response = await api.post(`/enquiries/${id}/approve`, {
    draftResponse,
  });

  return response.data;
};

export const updateEnquiryStatus = async (id, status) => {
  const response = await api.patch(`/enquiries/${id}/status`, {
    status,
  });

  return response.data;
};

export const updateEnquiry = async (id, enquiryData) => {
  const response = await api.patch(`/enquiries/${id}`, enquiryData);
  return response.data;
};

export const deleteEnquiry = async (id) => {
  const response = await api.delete(`/enquiries/${id}`);
  return response.data;
};

export const sendChatbotMessage = async (message) => {
  const response = await api.post('/chatbot/message', {
    message,
  });

  return response.data;
};

export default api;

import api from './api';

export const getApiKeys = async () => {
  const res = await api.get('/api-keys');
  return res.data;
};

export const createApiKey = async (name: string) => {
  const res = await api.post('/api-keys', { name });
  return res.data;
};

export const revokeApiKey = async (id: string) => {
  const res = await api.delete(`/api-keys/${id}`);
  return res.data;
};

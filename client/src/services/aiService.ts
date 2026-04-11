import api from './api';

export const explainEndpoint = async (endpointId: string) => {
  const response = await api.get(`/endpoints/${endpointId}/explain`);
  return response.data;
};

export const auditEndpoint = async (endpointId: string) => {
  const response = await api.get(`/endpoints/${endpointId}/audit`);
  return response.data;
};

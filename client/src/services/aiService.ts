import api from './api';

export const explainEndpoint = async (endpointId: string) => {
  const response = await api.get(`/endpoints/${endpointId}/explain`);
  return response.data;
};

export const auditEndpoint = async (endpointId: string) => {
  const response = await api.get(`/endpoints/${endpointId}/audit`);
  return response.data;
};

export const refactorEndpoint = async (endpointId: string) => {
  const response = await api.get(`/endpoints/${endpointId}/refactor`);
  return response.data;
};

export const generateTestCases = async (endpointId: string) => {
  const response = await api.get(`/endpoints/${endpointId}/test-cases`);
  return response.data;
};

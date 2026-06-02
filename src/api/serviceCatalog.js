import api from './axios'

export const getServiceCatalogs = () => api.get('/service-catalogs')
export const getServiceCatalogById = (id) => api.get(`/service-catalogs/${id}`)
export const getServiceCatalogByClientId = (clientId) => api.get(`/service-catalogs/client/${clientId}`)
export const createServiceCatalog = (data) => api.post('/service-catalogs', data)
export const updateServiceCatalog = (id, data) => api.put(`/service-catalogs/${id}`, data)
export const deleteServiceCatalog = (id) => api.delete(`/service-catalogs/${id}`)

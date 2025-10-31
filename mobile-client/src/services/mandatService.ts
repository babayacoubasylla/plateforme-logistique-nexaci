import { api } from './api';

export const getDocumentTypes = () => api.get('/api/mandats/document-types');
export const getAdministrations = (type?: string) => api.get('/api/mandats/administrations', { params: { type } });
export const createMandat = (payload: any) => api.post('/api/mandats', payload);
export const getMyMandats = () => api.get('/api/mandats/my-mandats');
export const trackMandat = (reference: string) => api.get(`/api/mandats/track/${encodeURIComponent(reference)}`);
export const getMandatById = (id: string) => api.get(`/api/mandats/${id}`);

export type UploadDoc = { field: 'cni' | 'procuration' | 'photo' | 'extrait_naissance' | 'autre'; uri: string; name: string; type: string };
export const uploadMandatDocuments = (id: string, files: UploadDoc[]) => {
	const form = new FormData();
	files.forEach(f => {
		form.append(f.field, {
			// RN FormData file
			uri: f.uri,
			name: f.name,
			type: f.type
		} as any);
	});
	return api.patch(`/api/mandats/${id}/documents`, form, {
		headers: { 'Content-Type': 'multipart/form-data' }
	});
};

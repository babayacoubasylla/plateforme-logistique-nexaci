import Constants from 'expo-constants';

function resolveApiUrl(): string {
	const extra = (Constants as any)?.expoConfig?.extra || {};
	if (extra.API_URL) return extra.API_URL as string;

	const hostUri = (Constants as any)?.expoConfig?.hostUri || (Constants as any)?.debuggerHost;
	if (hostUri && typeof hostUri === 'string') {
		const host = hostUri.split(':')[0];
		const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
		if (ipRegex.test(host)) {
			return `http://${host}:5000`;
		}
	}
	return 'http://localhost:5000';
}

export const API_URL = resolveApiUrl();

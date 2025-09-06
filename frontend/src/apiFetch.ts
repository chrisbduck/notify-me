export const isLocalHost: boolean = window.location.href.includes('localhost');
const localHostURL = "http://localhost:7071";

export function apiFetch(relativeURL: string): Promise<Response> {
    const url = isLocalHost ? `${localHostURL}/api/${relativeURL}` : `/api/${relativeURL}`;
    return fetch(url);
}

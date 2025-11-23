// src/services/proxyHelper.js

/**
 * A centralized function to handle fetch requests to the backend proxy.
 * This avoids code duplication in every service that needs to call the API.
 * @param {string} service - The name of the service to be called on the backend.
 * @param {object} payload - The data to be sent to the backend service.
 * @returns {Promise<object>} - The JSON response from the proxy.
 */
export async function callProxy(service, payload) {
    const response = await fetch('/api/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, payload }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        // Provide a more detailed and user-friendly error message.
        const errorMessage = `API Proxy Error (${response.status} ${response.statusText}): ${errorText || 'Der Server lieferte keine Fehlerdetails.'}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    return response.json();
}

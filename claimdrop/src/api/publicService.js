import { supabase } from '@/lib/supabase.js';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

const publicFetch = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown API error occurred.' }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    return response.json();
};

const fetchWithAuth = async (endpoint, options = {}, token = null) => {
    let accessToken = token;
    if (!accessToken) {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
            throw new Error('User is not authenticated.');
        }
        accessToken = session.access_token;
    }

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown API error occurred.' }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    return response.json();
};

// --- RECEIVER ENDPOINTS ---

// Fetch all available food drops for the map/list
export const getAvailableDrops = () => {
    return publicFetch('/api/receivers/available');
};

// Claim a specific drop (Requires Auth to know who is claiming)
export const claimDrop = (dropId) => {
    return fetchWithAuth('/api/receivers/claim', {
        method: 'POST',
        body: JSON.stringify({ drop_id: dropId })
    });
};

// Verify the OTP handshake at the store
export const verifyPickup = (dropId, otp) => {
    return fetchWithAuth('/api/receivers/verify', {
        method: 'POST',
        body: JSON.stringify({ drop_id: dropId, otp })
    });
};

export const getImpactStats = () => {
    return fetchWithAuth('/api/receivers/impact-stats');
};

export const getMyDrops = () => {
    return fetchWithAuth('/api/donors/my-drops');
};

// Create a new drop (This triggers the backend OTP generation)
export const createDrop = (dropData) => {
    return fetchWithAuth('/api/donors/drop', {
        method: 'POST',
        body: JSON.stringify(dropData)
    });
};
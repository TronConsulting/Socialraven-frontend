import axios from 'axios';

// If VITE_API_URL is set, use it. Otherwise:
// - Default to the production API domain.
// - If running in production (served by backend), default to relative path '' (same origin)
const API_URL = import.meta.env.VITE_API_URL || 'https://api.socialraven.online';

export const api = axios.create({
    baseURL: API_URL,
});

const normalizeAccount = (acc = {}) => ({
    ...acc,
    accountId: acc.accountId || acc.account_id,
    profileId: acc.profileId || acc.profile_id || null,
});

const normalizeScheduledPost = (post = {}) => {
    const accounts = (post.accounts || post.target_accounts || []).map(normalizeAccount);
    const scheduledFor = post.scheduledFor || post.scheduled_for || post.scheduled_time || post.time;
    return {
        ...post,
        id: post.id || post._id,
        accounts,
        target_accounts: accounts,
        scheduledFor,
        scheduled_for: scheduledFor,
    };
};

api.interceptors.request.use((config) => {
    const apiKey = localStorage.getItem('social_api_key');
    const token = localStorage.getItem('token');

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Legacy / API Key support (Backend checks Bearer first)
    if (apiKey) {
        config.headers['X-API-Key'] = apiKey;
    }
    return config;
});


export const getAccounts = async () => {
    const res = await api.get('/linked-accounts');
    return {
        ...res.data,
        accounts: (res.data?.accounts || []).map(normalizeAccount),
    };
};

export const getCurrentUser = async () => {
    const res = await api.get('/auth/me');
    return res.data;
};

export const getDashboardAnalytics = async () => {
    const res = await api.get('/analytics/dashboard/summary');
    return res.data;
};

// Smart Inbox API
export const getInboxThreads = async () => {
    const res = await api.get('/inbox/threads');
    return res.data;
};

export const getThreadMessages = async (threadId) => {
    const res = await api.get(`/inbox/threads/${threadId}/messages`);
    return res.data;
};

export const sendReply = async (threadId, text) => {
    const res = await api.post(`/inbox/threads/${threadId}/messages`, { text });
    return res.data;
};

export const disconnectAccount = async (platform, accountId) => {
    await api.delete(`/linked-accounts/disconnect/${platform}/${accountId}`);
};

export const postContent = async (accounts, content, media = []) => {
    // accounts is array of { platform, accountId }
    // Endpoint: /post/multi
    const res = await api.post('/post/multi', {
        accounts,
        content,
        media
    });
    return res.data;
};
// API Keys
export const getKeys = async () => {
    const res = await api.get('/keys');
    return res.data.keys;
};

export const getMediaLibrary = async () => {
    const res = await api.get('/post/media/library');
    return res.data.media;
};

export const createKey = async (name) => {
    const res = await api.post('/keys', { name });
    return res.data; // { key: {...}, rawApiKey: "..." }
};

export const deleteKey = async (keyId) => {
    const res = await api.delete(`/keys/${keyId}`);
    return res.data;
};

export const getDeveloperKeys = async () => {
    const res = await api.get('/keys/developer');
    return res.data.developer_keys;
};

export const updateDeveloperKeys = async (keys) => {
    const res = await api.post('/keys/developer', keys);
    return res.data.developer_keys;
};

export const regenerateKey = async () => {
    // Legacy support or remove?
    // Keeping for now if needed, but new system prefers createKey
    const res = await api.post('/key/regenerate-key');
    return res.data.apiKey;
};

// Analytics
export const getAnalytics = async (accountId, range = 30) => {
    const res = await api.get(`/analytics/${accountId}?range=${range}`);
    return res.data;
};

// Scheduling
export const schedulePost = async (accounts, content, scheduledFor, media = []) => {
    const res = await api.post('/schedule', { accounts, content, scheduledFor, media });
    return res.data;
};

export const getScheduledPosts = async () => {
    const res = await api.get('/schedule');
    return (res.data?.posts || []).map(normalizeScheduledPost);
};

export const processDueScheduledPosts = async () => {
    const res = await api.post('/schedule/process-due');
    return res.data;
};

export const cancelScheduledPost = async (id) => {
    await api.delete(`/schedule/${id}`);
};

// Brand Kit
export const getBrandKit = async () => {
    const res = await api.get('/brand');
    return res.data.brand;
};

export const updateBrandKit = async (data) => {
    const res = await api.post('/brand', data);
    return res.data.brand;
};

export const getBrandAssetFormats = async () => {
    const res = await api.get('/brand/assets/formats');
    return res.data;
};

export const generateBrandAssets = async (formData) => {
    const res = await api.post('/brand/assets/generate', formData, {
        responseType: 'blob'
    });
    return res;
};

// AI Ghostwriter
export const generateContent = async (topic, platform, tone) => {
    const res = await api.post('/ai/generate', { topic, platform, tone });
    return res.data;
};

export const triggerInstantPublish = async (data) => {
    // data: { email, postTopic, targetAudience, date, system, apiKey, ...handles }
    const res = await api.post('/ai/instant-publish', data);
    return res.data;
};

// ============ NEW: Media Upload ============
export const uploadAndPost = async (accounts, content, files = [], mediaUrls = []) => {
    const formData = new FormData();
    formData.append('accounts', JSON.stringify(accounts));
    formData.append('content', content);
    formData.append('media_urls', JSON.stringify(mediaUrls));

    files.forEach((file) => {
        formData.append('files', file);
    });

    const res = await api.post('/post/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};

export const uploadMedia = async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('files', file);
    });

    const res = await api.post('/post/media-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.urls;
};

export const deleteMedia = async (mediaId) => {
    const res = await api.delete(`/post/media/${mediaId}`);
    return res.data;
};

// ============ NEW: Calendar View ============
export const getScheduleCalendar = async () => {
    const res = await api.get('/schedule/calendar');
    return (res.data?.calendar || []).map(normalizeScheduledPost);
};

export const getActivityLog = async () => {
    const res = await api.get('/activity/recent');
    return res.data.activity;
};



// ============ NEW: User Profiles ============
export const getProfiles = async () => {
    const res = await api.get('/profiles');
    return (res.data?.profiles || []).map((p) => ({
        ...p,
        id: p.id || p._id,
        accounts: (p.accounts || []).map(normalizeAccount),
    }));
};

export const createProfile = async (name) => {
    const res = await api.post('/profiles', { name });
    return res.data;
};

export const deleteProfile = async (id) => {
    await api.delete(`/profiles/${id}`);
};

export const getAuthUrl = async (platform, redirectUrl, profileId = null, extraParams = {}) => {
    const params = {
        profile_id: profileId,
        ...extraParams
    };
    if (redirectUrl) {
        params.redirect_uri = redirectUrl;
    }

    const res = await api.get(`/auth/connect/${platform}`, {
        params
    });
    return res.data; // Return full object to handle { authUrl, action, fields }
};

export const connectBluesky = async (data) => {
    // data: { handle, app_password, profile_id }
    const res = await api.post('/auth/connect/bluesky', data);
    return res.data;
};

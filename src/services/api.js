import axios from 'axios';

// Single source of truth for the backend base URL.
// VITE_API_URL must be set in all environments (dev and production).
// No dev fallback to localhost - this prevents CORS issues and silent failures.
export const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    console.error(
        'VITE_API_URL is not set. Please set VITE_API_URL in your environment variables. API requests will fail.'
    );
    // In dev, we could throw, but for now just log and let requests fail visibly
}

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
    return {
        ...post,
        id: post.id || post._id,
        accounts,
        target_accounts: accounts,
        scheduledFor: post.scheduledFor || post.scheduled_for || post.scheduled_time,
        scheduled_for: post.scheduledFor || post.scheduled_for || post.scheduled_time,
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
    return res.data.calendar;
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
    const res = await api.get(`/auth/connect/${platform}`, {
        params: {
            redirect_uri: redirectUrl,
            profile_id: profileId,
            ...extraParams
        }
    });
    return res.data; // Return full object to handle { authUrl, action, fields }
};

export const connectBluesky = async (data) => {
    // data: { handle, app_password, profile_id }
    const res = await api.post('/auth/connect/bluesky', data);
    return res.data;
};

// ============ Organizations ============
export const getOrganizations = async () => {
    const res = await api.get('/organizations');
    return res.data.organizations || [];
};

export const createOrganization = async (name, slug = null) => {
    const res = await api.post('/organizations', { name, slug });
    return res.data.organization;
};

export const getOrganization = async (orgId) => {
    const res = await api.get(`/organizations/${orgId}`);
    return res.data.organization;
};

export const updateOrganization = async (orgId, data) => {
    const res = await api.put(`/organizations/${orgId}`, data);
    return res.data.organization;
};

export const deleteOrganization = async (orgId) => {
    await api.delete(`/organizations/${orgId}`);
};

export const getOrganizationMembers = async (orgId) => {
    const res = await api.get(`/organizations/${orgId}/members`);
    return res.data.members || [];
};

export const inviteOrganizationMember = async (orgId, email, role = 'user') => {
    const res = await api.post(`/organizations/${orgId}/members`, { email, role });
    return res.data;
};

export const removeOrganizationMember = async (orgId, memberId) => {
    await api.delete(`/organizations/${orgId}/members/${memberId}`);
};

export const updateMemberRole = async (orgId, memberId, role) => {
    await api.put(`/organizations/${orgId}/members/${memberId}`, { role });
};

// ============ Notifications ============
export const getNotifications = async (limit = 20, offset = 0, unreadOnly = false) => {
    const res = await api.get('/notifications', { params: { limit, offset, unread_only: unreadOnly } });
    return res.data;
};

export const getUnreadNotificationCount = async () => {
    const res = await api.get('/notifications/unread-count');
    return res.data.unread_count;
};

export const markNotificationRead = async (notificationId) => {
    await api.put(`/notifications/${notificationId}/read`);
};

export const markAllNotificationsRead = async () => {
    await api.put('/notifications/read-all');
};

export const deleteNotification = async (notificationId) => {
    await api.delete(`/notifications/${notificationId}`);
};

export const deleteAllNotifications = async () => {
    await api.delete('/notifications');
};

// ============ Webhooks ============
export const getWebhooks = async () => {
    const res = await api.get('/webhooks');
    return res.data.webhooks || [];
};

export const createWebhook = async (name, url, events) => {
    const res = await api.post('/webhooks', { name, url, events });
    return res.data; // { webhook, secret }
};

export const getWebhook = async (webhookId) => {
    const res = await api.get(`/webhooks/${webhookId}`);
    return res.data.webhook;
};

export const updateWebhook = async (webhookId, data) => {
    const res = await api.put(`/webhooks/${webhookId}`, data);
    return res.data.webhook;
};

export const deleteWebhook = async (webhookId) => {
    await api.delete(`/webhooks/${webhookId}`);
};

export const testWebhook = async (webhookId) => {
    const res = await api.post(`/webhooks/${webhookId}/test`);
    return res.data;
};

// ============ Autopost ============
export const getAutopostConfigs = async () => {
    const res = await api.get('/autopost');
    return res.data.configs || [];
};

export const createAutopostConfig = async (name, feedUrl, platforms, postTemplate) => {
    const res = await api.post('/autopost', {
        name,
        feed_url: feedUrl,
        platforms,
        post_template: postTemplate
    });
    return res.data.config;
};

export const getAutopostConfig = async (configId) => {
    const res = await api.get(`/autopost/${configId}`);
    return res.data.config;
};

export const updateAutopostConfig = async (configId, data) => {
    const res = await api.put(`/autopost/${configId}`, data);
    return res.data.config;
};

export const deleteAutopostConfig = async (configId) => {
    await api.delete(`/autopost/${configId}`);
};

export const fetchRssPreview = async (configId) => {
    const res = await api.post(`/autopost/${configId}/fetch`);
    return res.data;
};

export const triggerAutopost = async (configId) => {
    const res = await api.post(`/autopost/${configId}/trigger`);
    return res.data;
};

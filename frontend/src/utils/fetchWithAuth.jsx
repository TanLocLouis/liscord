const fetchWithAuth = async (context = null, url, options = {}) => {
    try {
        // console.log('Fetching with auth:', url);
        // console.log('Options:', options);
        // console.log('Access Token:', context ? context.accessToken : null);
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${context ? context.accessToken : null}`,
            },
        });
        if (response.status !== 403) {
            return response;
        }

        if (options.retry === false) {
            return response;
        }
        
        // Refresh access token
        // using refresh token
        // console.log('Access token expired, attempting to refresh token...');
        try {
            const refreshResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') }),
            });

            if (!refreshResponse.ok) {
                throw new Error('Failed to refresh token');
            }

            const refreshData = await refreshResponse.json();
            context.accessToken = refreshData.accessToken;

            // Retry original request with new token
            return fetchWithAuth(context, url, { ...options, retry: false });
        } catch (err) {
            console.error('Token refresh error:', err);
            throw err;
        }
    } catch (err) {
        console.error('Fetch error:', err);
        throw err;
    }
}

export { fetchWithAuth };
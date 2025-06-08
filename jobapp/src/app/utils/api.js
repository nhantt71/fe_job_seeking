export async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');

    const authOptions = {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };

    try {
        const res = await fetch(url, authOptions);
        
        // Check if the response is JSON
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await res.text();
            if (text.includes("Processing")) {
                // If server is processing, wait and retry
                await new Promise(resolve => setTimeout(resolve, 1000));
                return fetchWithAuth(url, options);
            }
            throw new Error(`Server returned ${contentType} instead of JSON. Response: ${text}`);
        }

        if (res.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/';
            throw new Error('Unauthorized');
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

export async function fetchWithoutAuth(url, options = {}) {
    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        // Check if the response is JSON
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await res.text();
            if (text.includes("Processing")) {
                // If server is processing, wait and retry
                await new Promise(resolve => setTimeout(resolve, 1000));
                return fetchWithoutAuth(url, options);
            }
            // Return empty array instead of throwing error for null responses
            if (text === "") {
                return [];
            }
            throw new Error(`Server returned ${contentType} instead of JSON. Response: ${text}`);
        }

        const data = await res.json();
        // Return empty array if data is null
        return data === null ? [] : data;
    } catch (error) {
        console.error('API Error:', error);
        // Return empty array on error instead of throwing
        return [];
    }
}

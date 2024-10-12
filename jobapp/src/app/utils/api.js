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

    const res = await fetch(url, authOptions);

    if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
    }

    return res;
}

async function register() {
    try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'password123',
                role: 'farmer',
                location: 'Test Farm'
            })
        });
        const data = await res.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

register();

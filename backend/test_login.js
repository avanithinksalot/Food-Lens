async function login() {
    try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'password123'
            })
        });
        const data = await res.json();
        console.log('Login Response:', data);
    } catch (error) {
        console.error('Login Error:', error);
    }
}

login();

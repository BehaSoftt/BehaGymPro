const axios = require('axios');
(async () => {
    try {
        const token = "put_token_here"; // I need admin token, maybe login as behasoftt
        const login = await axios.post('http://localhost:5000/api/auth/login', { username: 'behasoftt@gmail.com', password: '123' });
        const adminToken = login.data.token;

        await axios.put('http://localhost:5000/api/users/0d47b123-1ff5-4464-9573-ebb956ef8d53/settings', {
            username: 'T1'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log("Success");
    } catch (err) {
        console.error("Error status:", err.response?.status);
        console.error("Error data:", err.response?.data);
    }
})();

const axios = require('axios');
async function test() {
  try {
    const login = await axios.post('http://localhost:5000/api/auth/login', { email: 'u001@example.com', password: 'password123' });
    console.log("Login success");
    
    // Test users list
    let res = await axios.get('http://localhost:5000/api/analytics/users', { headers: { Authorization: `Bearer ${login.data.token}` } });
    console.log("Users:", res.data.length);

    // Test summary
    res = await axios.get('http://localhost:5000/api/analytics/summary', { headers: { Authorization: `Bearer ${login.data.token}` } });
    console.log("Summary:", res.data);

  } catch (err) {
    console.log("Error:", err.response ? err.response.data : err.message);
  }
}
test();

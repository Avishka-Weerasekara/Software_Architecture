const axios = require('axios');
async function test() {
  try {
    const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'user@example.com',
      password: 'password'
    });
    const token = loginRes.data.token;
    console.log('Got token');
    const res = await axios.get('http://localhost:8080/api/user/fines', {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log(res.data);
  } catch(e) {
    console.log(e.response ? e.response.data : e.message);
  }
}
test();

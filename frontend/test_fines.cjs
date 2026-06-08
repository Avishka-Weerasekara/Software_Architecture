const axios = require('axios');
async function test() {
  try {
    // register admin
    let adminToken;
    try {
      const reg = await axios.post('http://localhost:8080/api/auth/register', {
        fullName: 'Police', email: 'police200@test.com', password: 'password', role: 'ADMIN',
        age: 30, gender: 'Male', policeId: 'P123', jobPosition: 'Officer', workStation: 'HQ'
      });
      adminToken = reg.data.token;
    } catch(e) {
      const login = await axios.post('http://localhost:8080/api/auth/login', {
        email: 'police200@test.com', password: 'password'
      });
      adminToken = login.data.token;
    }

    // register citizen
    let citizenToken;
    try {
      const reg = await axios.post('http://localhost:8080/api/auth/register', {
        fullName: 'Test Citizen', email: 'citizen200@test.com', password: 'password', role: 'USER',
        age: 25, gender: 'Male', address: '123 Test St', province: 'West', district: 'Col', nic: '998877665V', telephone: '0712345678'
      });
      citizenToken = reg.data.token;
    } catch(e) {
      const login = await axios.post('http://localhost:8080/api/auth/login', {
        email: 'citizen200@test.com', password: 'password'
      });
      citizenToken = login.data.token;
    }

    // create fine
    try {
      await axios.post('http://localhost:8080/api/admin/fines', {
        citizenNic: '998877665V',
        location: 'Test Location',
        reasons: [{ reason: 'Speeding', amount: 5000 }]
      }, { headers: { Authorization: 'Bearer ' + adminToken } });
      console.log('Fine created');
    } catch(e) {
      console.log('Create fine failed', e.response ? e.response.data : e.message);
    }

    console.log('Fetching fines...');
    const res = await axios.get('http://localhost:8080/api/user/fines', {
      headers: { Authorization: 'Bearer ' + citizenToken }
    });
    console.log('SUCCESS:', res.data);
  } catch(e) {
    console.log('ERROR:', e.response ? e.response.data : e.message);
  }
}
test();

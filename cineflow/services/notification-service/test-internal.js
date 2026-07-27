import axios from 'axios';

const test = async () => {
  const userId = 'e5cf1b5f-dd31-4db7-8eb3-4890935ba165';
  const url = `http://user-service:3001/api/auth/internal/${userId}`;
  
  console.log(`Fetching from: ${url}`);
  
  try {
    const res = await axios.get(url);
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error fetching user:', err.message);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);
    }
  }
};

test();

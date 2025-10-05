const axios = require('axios');
const assert = require('assert').strict;

const HOST = 'http://localhost:5000';

async function run() {
  const timestamp = Date.now();
  const learnerEmail = `alice_${timestamp}@example.com`;
  const password = 'Alice@123';

  console.log('1) Register learner');
  await axios.post(`${HOST}/api/auth/register`, {
    name: 'Alice Learner',
    email: learnerEmail,
    password
  }).catch(() => {});

  console.log('2) Login learner');
  const login = await axios.post(`${HOST}/api/auth/login`, {
    email: learnerEmail,
    password
  });
  const learnerToken = login.data.token;

  console.log('3) Apply as creator');
  const appRes = await axios.post(`${HOST}/api/creator/apply`, {
    bio: 'test',
    portfolioUrl: 'http://portfolio.com/test'
  }, {
    headers: {
      Authorization: `Bearer ${learnerToken}`
    }
  });
  const appId = appRes.data.application._id;

  console.log('4) Admin login');
  const adminLogin = await axios.post(`${HOST}/api/auth/login`, {
    email: 'admin@microcourses.com',
    password: 'Admin@123'
  });
  const adminToken = adminLogin.data.token;

  console.log('5) Approve creator application');
  await axios.post(`${HOST}/api/admin/creator_applications/${appId}/review`, {
    action: 'approve'
  }, {
    headers: {
      Authorization: `Bearer ${adminToken}`
    }
  });

  console.log('6) Login as creator (same user)');
  const creatorLogin = await axios.post(`${HOST}/api/auth/login`, {
    email: learnerEmail,
    password
  });
  const creatorToken = creatorLogin.data.token;

  console.log('7) Create course');
  const courseRes = await axios.post(`${HOST}/api/creator/courses`, {
    title: 'IT Course',
    description: 'Learn about IT basics'
  }, {
    headers: {
      Authorization: `Bearer ${creatorToken}`
    }
  });
  const courseId = courseRes.data._id;

  console.log('8) Create 2 lessons');
  const l1 = await axios.post(`${HOST}/api/creator/${courseId}/lessons`, {
    title: 'Lesson 1',
    contentUrl: 'http://example.com/video1.mp4',
    orderNum: 1
  }, {
    headers: {
      Authorization: `Bearer ${creatorToken}`
    }
  });

  const l2 = await axios.post(`${HOST}/api/creator/${courseId}/lessons`, {
    title: 'Lesson 2',
    contentUrl: 'http://example.com/video2.mp4',
    orderNum: 2
  }, {
    headers: {
      Authorization: `Bearer ${creatorToken}`
    }
  });

  console.log('9) Submit for review and publish');
  await axios.post(`${HOST}/api/creator/courses/${courseId}/submit_for_review`, {}, {
    headers: {
      Authorization: `Bearer ${creatorToken}`
    }
  });

  await axios.post(`${HOST}/api/admin/courses/${courseId}/publish`, {}, {
    headers: {
      Authorization: `Bearer ${adminToken}`
    }
  });

  console.log('10) Enroll learner');
  await axios.post(`${HOST}/api/courses/${courseId}/enroll`, {}, {
    headers: {
      Authorization: `Bearer ${learnerToken}`
    }
  });

  console.log('11) Complete lessons');
  await axios.post(`${HOST}/api/lessons/${l1.data._id}/complete`, {}, {
    headers: {
      Authorization: `Bearer ${learnerToken}`
    }
  });

  await axios.post(`${HOST}/api/lessons/${l2.data._id}/complete`, {}, {
    headers: {
      Authorization: `Bearer ${learnerToken}`
    }
  });

  console.log('12) Check progress & certificate');
  const prog = await axios.get(`${HOST}/api/courses/${courseId}/progress`, {
    headers: {
      Authorization: `Bearer ${learnerToken}`
    }
  });

  assert.equal(prog.data.completedPercent, 100, 'Expected 100% progress');
  assert.ok(prog.data.certificate, 'Expected certificate to exist');

  console.log('✅ Integration test passed. Certificate issued:', prog.data.certificate);
}

run().catch(err => {
  console.error('❌ Integration test failed:', err.response ? err.response.data : err.message);
  process.exit(1);
});

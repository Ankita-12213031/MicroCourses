import React, { useEffect, useState } from 'react';
import api from '../lib/api';

export default function CreatorDashboard(){
  const [courses,setCourses] = useState([]);
  useEffect(()=> {
    api.get('/creator/courses').then(r=>setCourses(r.data)).catch(err => {
      console.error(err);
      setCourses([]);
    });
  },[]);
  return (
    <div>
      <h1>Creator Dashboard</h1>
      <div>
        <a href="/creator/new">+ New Course</a>
      </div>
      <ul>
        {courses.map(c => <li key={c._id}>{c.title} — {c.published ? 'Published' : 'Draft'}</li>)}
      </ul>
    </div>
  );
}

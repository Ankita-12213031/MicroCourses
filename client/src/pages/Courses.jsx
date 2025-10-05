import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Link } from 'react-router-dom';

export default function Courses() {
  const [courses, setCourses] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then(res => setCourses(res.data))
      .catch(err => {
        console.error('Failed to fetch courses:', err);
        setCourses([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading courses...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Available Courses</h1>
      {courses.length === 0 ? (
        <p>No published courses available.</p>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {courses.map(course => (
            <div key={course._id} style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <h2>{course.title}</h2>
              <p style={{ color: '#555' }}>{course.description}</p>
              <Link to={`/courses/${course._id}`} style={{ color: '#1d4ed8', fontWeight: 600 }}>View Course</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

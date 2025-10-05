import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    api.get(`/courses/${id}`)
      .then(res => {
        setCourse(res.data.course);
        setLessons(res.data.lessons || []);
      })
      .catch(err => {
        console.error('Failed to fetch course:', err);
        setCourse(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function enroll() {
    try {
      await api.post(`/courses/${id}/enroll`);
      alert('Enrolled successfully!');
      // Refresh course/lessons if needed
      api.get(`/courses/${id}`).then(res => {
        setCourse(res.data.course);
        setLessons(res.data.lessons || []);
      });
    } catch (err) {
      alert(err.response?.data?.msg || err.message);
    }
  }

  if (loading) return <div>Loading course...</div>;
  if (!course) return <div>Course not found.</div>;

  return (
    <div>
      <h1>{course.title}</h1>
      <p style={{ color: '#555', marginBottom: 12 }}>{course.description}</p>

      {!course.enrolled && user?.role === 'learner' && (
        <button
          onClick={enroll}
          style={{ padding: '8px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, marginBottom: 20 }}
        >
          Enroll in this course
        </button>
      )}

      <h3>Lessons</h3>
      {lessons.length === 0 ? (
        <p>No lessons available yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {lessons
            .sort((a, b) => a.orderNum - b.orderNum)
            .map(lesson => (
              <li key={lesson._id} style={{ padding: 10, background: '#fff', marginBottom: 8, borderRadius: 6 }}>
                <Link to={`/learn/${lesson._id}`} style={{ color: '#1d4ed8', fontWeight: 500 }}>
                  {lesson.orderNum}. {lesson.title}
                </Link>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useParams, useNavigate } from 'react-router-dom';

export default function Learn() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/lessons/${lessonId}`)
      .then(res => setLesson(res.data))
      .catch(err => {
        console.error('Failed to fetch lesson:', err);
        setLesson(null);
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  async function markComplete() {
    try {
      await api.post(`/lessons/${lessonId}/complete`);
      alert('Lesson marked complete!');
      navigate('/progress'); // Optional: navigate to progress page
    } catch (err) {
      alert(err.response?.data?.msg || err.message);
    }
  }

  if (loading) return <div>Loading lesson...</div>;
  if (!lesson) return <div>Lesson not found.</div>;

  return (
    <div>
      <h1>{lesson.title}</h1>

      {lesson.contentUrl && (
        <div style={{ margin: '12px 0' }}>
          <video
            src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000')}${lesson.contentUrl}`}
            controls
            style={{ maxWidth: '100%' }}
          />
        </div>
      )}

      <div style={{ background: '#fff', padding: 12, borderRadius: 6, marginTop: 20 }}>
        <h3>Transcript</h3>
        <p>{lesson.transcript || (lesson.transcriptStatus === 'processing' ? 'Processing...' : 'Transcript not available yet')}</p>
      </div>

      <button
        onClick={markComplete}
        style={{ marginTop: 16, padding: '8px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6 }}
      >
        Mark Lesson Complete
      </button>
    </div>
  );
}

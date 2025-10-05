import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Learn from './pages/Learn';
import CreatorApply from './pages/CreatorApply';
import CreatorDashboard from './pages/CreatorDashboard';
import AdminReview from './pages/AdminReview';
import ProgressPage from './pages/ProgressPage';
import Login from './pages/Login';
import { useAuth } from './contexts/AuthContext';

export default function App(){
  const { user, logout } = useAuth();
  return (
    <div>
      <header style={{padding:12, background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
        <div style={{maxWidth:1000, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <Link to="/" style={{fontWeight:700}}>MicroCourses</Link>
          <nav style={{display:'flex', gap:12, alignItems:'center'}}>
            <Link to="/courses">Courses</Link>
            {user?.role === 'creator' && <Link to="/creator/dashboard">Creator</Link>}
            {user?.role === 'admin' && <Link to="/admin/review/courses">Admin</Link>}
            <Link to="/progress">Progress</Link>
            {user ? (
              <button onClick={logout} style={{padding:'6px 10px'}}>Logout</button>
            ) : (
              <Link to="/login" style={{padding:'6px 10px'}}>Login</Link>
            )}
          </nav>
        </div>
      </header>

      <main style={{maxWidth:1000, margin:'24px auto', padding:'0 12px'}}>
        <Routes>
          <Route path="/" element={<Courses />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/learn/:lessonId" element={<Learn />} />
          <Route path="/creator/apply" element={<CreatorApply />} />
          <Route path="/creator/dashboard" element={<CreatorDashboard />} />
          <Route path="/admin/review/courses" element={<AdminReview />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}

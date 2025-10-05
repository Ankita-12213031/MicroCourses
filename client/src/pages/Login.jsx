import React, { useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const { loginWithToken } = useAuth();
  const nav = useNavigate();
  async function submit(e){ e.preventDefault();
    try {
      const res = await api.post('/auth/login',{ email, password });
      loginWithToken(res.data.token);
      nav('/courses');
    } catch(err) {
      alert(err.response?.data?.msg || err.message);
    }
  }
  return (
    <div style={{maxWidth:420, margin:'24px auto', background:'#fff', padding:18, borderRadius:8}}>
      <h2>Login</h2>
      <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:8}}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

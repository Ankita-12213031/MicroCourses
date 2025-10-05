import React, { useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function CreatorApply(){
  const [bio,setBio] = useState('');
  const [portfolio,setPortfolio] = useState('');
  const nav = useNavigate();
  async function submit(e){ e.preventDefault();
    try {
      await api.post('/creator/apply', { bio, portfolioUrl: portfolio });
      alert('Application submitted');
      nav('/');
    } catch(e) {
      alert(e.response?.data?.msg || e.message);
    }
  }
  return (
    <div style={{maxWidth:720, margin:'24px auto', background:'#fff', padding:18}}>
      <h2>Apply to be a Creator</h2>
      <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:8}}>
        <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Bio" />
        <input value={portfolio} onChange={e=>setPortfolio(e.target.value)} placeholder="Portfolio URL" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

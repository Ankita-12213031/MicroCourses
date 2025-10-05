import React, { useEffect, useState } from 'react';
import api from '../lib/api';

export default function AdminReview(){
  const [apps,setApps] = useState([]);
  useEffect(()=> {
    api.get('/admin/creator_applications').then(r=>setApps(r.data)).catch(err => {
      console.error(err);
      setApps([]);
    });
  },[]);

  async function review(id, action){
    try {
      await api.post(`/admin/creator_applications/${id}/review`, { action });
      setApps(apps.filter(a => a._id !== id));
    } catch(e) {
      alert(e.response?.data?.msg || e.message);
    }
  }

  return (
    <div>
      <h1>Creator Applications</h1>
      <ul>
        {apps.map(a => (
          <li key={a._id} style={{padding:12, background:'#fff', marginBottom:8}}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <div>
                <div style={{fontWeight:700}}>{a.user?.name} — {a.user?.email}</div>
                <div style={{fontSize:13}}>{a.bio}</div>
              </div>
              <div style={{display:'flex', gap:8}}>
                <button onClick={()=>review(a._id,'approve')}>Approve</button>
                <button onClick={()=>review(a._id,'reject')}>Reject</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

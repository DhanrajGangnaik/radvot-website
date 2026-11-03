import React, { lazy, Suspense, useState } from 'react';
import { initialState, restoreSession } from '../interactive-demo/engine';
const DemoApp=lazy(()=>import('../interactive-demo/DemoApp'));

// A narrow handoff. Never overwrite an existing environment, agent or assessment.
export default function StoryDemoEntry(){
  const [notice]=useState(()=>{
    const params=new URLSearchParams(location.search),mode=params.get('mode');
    if(params.get('from')!=='story'||!['cloud','onprem'].includes(mode))return '';
    try{
      const existing=restoreSession(sessionStorage);
      if(existing.environment||existing.agents.length)return 'Your existing demo session was preserved. You can change environment in the workspace with confirmation.';
      const next=initialState();next.environment={mode,profile:'linux',provider:'AWS',name:mode==='cloud'?'Atlas cloud VM':'Atlas Linux host'};
      sessionStorage.setItem('radvot-demo-v1',JSON.stringify(next));
      return '';
    }catch{return 'Session storage is unavailable. Choose your environment below to continue.';}
  });
  return <>{notice&&<p role="status" style={{padding:'14px 24px',margin:0,background:'#241739',color:'#eee'}}>{notice}</p>}<Suspense fallback={<p className="experience-loading" role="status">Opening RADVOT workspace…</p>}><DemoApp/></Suspense></>;
}

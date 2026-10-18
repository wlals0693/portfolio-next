"use client";
import { useEffect, useRef, useState } from "react";
export default function VisitMessage() {
  const [count,setCount]=useState<number|null>(null);
  const counted=useRef(false);
  useEffect(()=>{
    if(counted.current)return;
    counted.current=true;
    try {
      const saved=Number.parseInt(localStorage.getItem("portfolioVisitCount")||"0",10);
      const next=(Number.isSafeInteger(saved)&&saved>0?saved:0)+1;
      localStorage.setItem("portfolioVisitCount",String(next));setCount(next);
    }catch{setCount(1);}
  },[]);
  return <p className="visit-message" aria-live="polite">{count===null?"방문해주셔서 감사합니다.":count===1?"처음 방문해주셨네요. 반갑습니다.":`다시 방문해주셨네요. 이번이 ${count}번째 방문입니다.`}</p>;
}

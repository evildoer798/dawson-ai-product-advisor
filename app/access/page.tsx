"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";

export default function AccessPage() {
  const router = useRouter();
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();setLoading(true);setError("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/access",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:data.get("code")})});
    if(response.ok){router.push("/");router.refresh();} else {setError("Access code is not valid.");setLoading(false);}
  };
  return <main className="access-page"><form onSubmit={submit}><div className="brand-mark">D</div><span>DAWSEN PRODUCT INTELLIGENCE</span><h1>Protected demonstration</h1><p>Enter the access code provided by the DAWSEN team.</p><label><LockKeyhole size={17}/><input name="code" type="password" required autoFocus placeholder="Access code"/></label>{error&&<small className="inline-error">{error}</small>}<button className="button primary large" disabled={loading}>{loading?"Checking…":"Enter demo"}<ArrowRight size={17}/></button></form></main>;
}

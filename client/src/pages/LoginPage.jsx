import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../components/common/Button.jsx";
import { Input } from "../components/common/Input.jsx";
import { useLoginMutation } from "../api/authApi.js";
import { MessageCircle, Sparkles, Users } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const [login, { isLoading, error }] = useLoginMutation();
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    await login(form).unwrap();
    navigate("/");
  }

  return (
    <main className="auth-layout">
      <div className="auth-shell">
        <section className="auth-brand">
          <div className="brand-mark"><MessageCircle size={28} strokeWidth={2.6} /></div>
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-4 py-2 text-xs font-black uppercase tracking-widest"><Sparkles size={15} /> Your people, one place</p>
            <h1 className="auth-title">Tribe<br />Talk.</h1>
            <p className="auth-tagline mt-7">A brighter place to meet your community, swap ideas, and stay close to the people who matter.</p>
          </div>
          <div className="brand-card"><Users size={21} /><p className="mt-3 text-sm font-bold">Create your own space. Invite your people. Make every conversation feel like home.</p></div>
        </section>

        <section className="auth-form-panel">
          <form onSubmit={handleSubmit} className="auth-form">
            <p className="auth-kicker">Welcome back</p>
            <h1>Log in to your tribe</h1>
            <p className="mt-3 text-sm">Pick up exactly where your conversations left off.</p>

            <div className="mt-8 space-y-5">
              <Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
              <Input label="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
            </div>

            {error && <p className="mt-4 rounded-xl border-2 border-red-400 bg-red-50 p-3 text-sm text-red-700">{error.data?.message}</p>}

            <Button className="mt-7 w-full" disabled={isLoading}>{isLoading ? "Logging in..." : "Log In"}</Button>
            <p className="mt-6 text-center text-sm">New to TribeTalk? <Link className="font-black text-[#4057ed] hover:underline" to="/register">Create an account</Link></p>
          </form>
        </section>
      </div>
    </main>
  );
}

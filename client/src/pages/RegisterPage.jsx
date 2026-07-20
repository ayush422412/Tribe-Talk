import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../components/common/Button.jsx";
import { Input } from "../components/common/Input.jsx";
import { useRegisterMutation } from "../api/authApi.js";
import { MessageCircle, Rocket, Sparkles } from "lucide-react";

export function RegisterPage() {
  const navigate = useNavigate();
  const [register, { isLoading, error }] = useRegisterMutation();
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    await register(form).unwrap();
    navigate("/");
  }

  return (
    <main className="auth-layout">
      <div className="auth-shell">
        <section className="auth-brand">
          <div className="brand-mark"><MessageCircle size={28} strokeWidth={2.6} /></div>
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-4 py-2 text-xs font-black uppercase tracking-widest"><Sparkles size={15} /> Build your community</p>
            <h1 className="auth-title">Find your<br />people.</h1>
            <p className="auth-tagline mt-7">Start a cozy server for friends, classmates, collaborators, or the whole crew.</p>
          </div>
          <div className="brand-card"><Rocket size={21} /><p className="mt-3 text-sm font-bold">Your first channel is only a few clicks away. Let’s make it yours.</p></div>
        </section>

        <section className="auth-form-panel">
          <form onSubmit={handleSubmit} className="auth-form">
            <p className="auth-kicker">Join TribeTalk</p>
            <h1>Create your account</h1>
            <p className="mt-3 text-sm">A fresh space for every conversation that matters.</p>
            <div className="mt-8 space-y-5">
              <Input label="Username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required />
              <Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
              <Input label="Password" type="password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
            </div>
            {error && <p className="mt-4 rounded-xl border-2 border-red-400 bg-red-50 p-3 text-sm text-red-700">{error.data?.message}</p>}
            <Button className="mt-7 w-full" disabled={isLoading}>{isLoading ? "Creating account..." : "Create Account"}</Button>
            <p className="mt-6 text-center text-sm">Already have an account? <Link className="font-black text-[#4057ed] hover:underline" to="/login">Log in</Link></p>
          </form>
        </section>
      </div>
    </main>
  );
}

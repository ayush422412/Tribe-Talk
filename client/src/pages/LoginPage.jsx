import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../shared/ui/Button.jsx";
import { Input } from "../shared/ui/Input.jsx";
import { useLoginMutation } from "../features/auth/authApi.js";

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
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-panel p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-400">Log in to continue to TribeTalk.</p>

        <div className="mt-8 space-y-5">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </div>

        {error && <p className="mt-4 text-sm text-red-300">{error.data?.message}</p>}

        <Button className="mt-6 w-full" disabled={isLoading}>
          Log In
        </Button>

        <p className="mt-6 text-center text-sm text-gray-400">
          Need an account?{" "}
          <Link className="font-semibold text-white hover:underline" to="/register">
            Register
          </Link>
        </p>
      </form>
    </main>
  );
}

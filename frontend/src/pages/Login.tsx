import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(3, "Min 3 characters"),
});
type LoginForm = z.infer<typeof schema>;

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(schema) });
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    const res = await fetch(`/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      alert("Invalid credentials");
      return;
    }
    const { token, role, name, department } = await res.json();
    setAuth(token, role, name, department);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-80">
        <h1 className="text-2xl font-bold mb-1 text-gray-900">Enterprise OS</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to your account</p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <Input {...register("email")} placeholder="Email" type="email" />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Input {...register("password")} placeholder="Password" type="password" />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <div className="mt-4 text-xs text-gray-400 space-y-0.5">
          <p className="font-medium text-gray-500">Demo accounts:</p>
          <p>admin@eos.com / admin123</p>
          <p>hr@eos.com / hr123 &nbsp;|&nbsp; sales@eos.com / sales123</p>
          <p>finance@eos.com / finance123 &nbsp;|&nbsp; pm@eos.com / pm123</p>
        </div>
      </div>
    </div>
  );
}

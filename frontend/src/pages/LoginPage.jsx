import LoginForm from "@/components/auth/login-form";
import { LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          <span className="text-lg font-semibold text-foreground">TaskFlow</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <LoginForm />
      </main>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { BrandText } from "@/components/ui/BrandText";

const MOCK_MODE =
  import.meta.env.VITE_MOCK_MODE === "true" || !import.meta.env.VITE_API_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: unknown) {
      setError("Email ou senha inválidos");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-grain relative">
      <div className="absolute inset-0 bg-dark-950/40" />
      <Card className="w-full max-w-md relative z-10">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <img
              src="/Logo-minc.png"
              alt="MINC Logo"
              className="h-16 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-center">
            <BrandText size="lg" />
          </CardTitle>
          <p className="text-center text-sm text-dark-400 mt-2">
            Sistema de gestão dos times da MINC
          </p>
          {MOCK_MODE && (
            <div className="mt-3 p-2 rounded-lg bg-primary-500/10 border border-primary-500/20">
              <p className="text-center text-xs text-primary-400">
                Modo Desenvolvimento: Use qualquer email/senha para entrar
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { BrandText } from "@/components/ui/BrandText";

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
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      let errorMessage = "Email ou senha inválidos";
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 401) {
          errorMessage = "Credenciais inválidas";
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response?.status === 429) {
          errorMessage = "Muitas tentativas. Tente novamente mais tarde.";
        } else if (axiosError.response?.status === 500) {
          errorMessage = "Erro no servidor. Tente novamente mais tarde.";
        } else if (axiosError.response?.status === 0 || axiosError.response?.status === undefined) {
          errorMessage = "Não foi possível conectar ao servidor. Verifique sua conexão.";
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        const error = err as { message?: string };
        if (error.message) {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-grain relative">
      <div className="absolute inset-0 bg-dark-950/40" />
      <div className="flex-1 flex items-center justify-center w-full relative z-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <img
                src="/minc-teams-logo.png"
                alt="MINC Teams"
                className="h-20 w-auto object-contain"
                onError={(e) => {
                  // Fallback para a logo antiga se a nova não existir
                  const target = e.target as HTMLImageElement;
                  target.src = "/Logo-minc.png";
                  target.className = "h-16 w-auto object-contain";
                }}
              />
            </div>
            <CardTitle className="text-center">
              <BrandText size="lg" />
            </CardTitle>
            <p className="text-center text-sm text-dark-400 mt-2">
              Sistema de gestão dos times da MINC
            </p>
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
      <footer className="mb-6 text-center relative z-10 px-4 w-full">
        <p className="text-sm text-dark-400 dark:text-dark-500">
          Created by{" "}
          <a
            href="https://www.connexto.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 underline transition-colors font-medium"
          >
            Connexto Tecnologia
          </a>
        </p>
      </footer>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    await resetPassword(email);
    setSent(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <Link to="/" className="flex items-center gap-2 justify-center">
          <Activity className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg text-foreground">BetIQ</span>
        </Link>

        {sent ? (
          <div className="text-center space-y-3">
            <CheckCircle className="w-10 h-10 text-primary mx-auto" />
            <h1 className="text-xl font-bold text-foreground">Check your email</h1>
            <p className="text-sm text-muted-foreground">If an account exists for <strong className="text-foreground">{email}</strong>, we sent a reset link.</p>
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-4">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Reset password</h1>
              <p className="text-sm text-muted-foreground mt-1">Enter your email and we'll send a reset link.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Sending…" : "Send reset link"}
              </Button>
            </form>
            <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

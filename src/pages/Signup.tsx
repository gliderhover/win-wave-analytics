import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Activity, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!displayName.trim()) e.displayName = "Display name is required";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (password.length < 6) e.password = "At least 6 characters";
    if (password !== confirm) e.confirm = "Passwords don't match";
    if (!agreed) e.agreed = "You must agree to continue";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await signup(email, password, displayName.trim());
      toast({ title: `Welcome, ${displayName.trim()}! 🎉` });
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <Link to="/" className="flex items-center gap-2 justify-center">
          <Activity className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg text-foreground">BetIQ</span>
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start analyzing matches for free.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Display name</Label>
            <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="e.g. TacticsNerd42" />
            {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Confirm password</Label>
            <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" />
            {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
          </div>
          <div className="flex items-start gap-2">
            <Checkbox id="terms" checked={agreed} onCheckedChange={v => setAgreed(v === true)} className="mt-0.5" />
            <Label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer leading-snug">
              I agree to the <span className="text-primary">Terms of Service</span> and <span className="text-primary">Privacy Policy</span>
            </Label>
          </div>
          {errors.agreed && <p className="text-xs text-destructive">{errors.agreed}</p>}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

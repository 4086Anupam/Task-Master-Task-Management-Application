import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { AlertCircle } from 'lucide-react';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = location.state?.email || localStorage.getItem('pendingOtpEmail') || '';

  const [email] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      await AuthService.verifyOtp({
        email,
        otp: otp.trim(),
        newPassword: changePassword ? newPassword : '',
      });

      localStorage.removeItem('pendingOtpEmail');
      setMessage('Verification successful. You can now sign in.');
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      setError(err?.response?.data || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    try {
      await AuthService.requestOtp(email);
      setMessage('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err?.response?.data || 'Unable to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-emerald-500/5 -z-10" />
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight">Verify your email</CardTitle>
          <CardDescription>
            Enter the OTP sent to {email || 'your email'} to finish logging in.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3 bg-emerald-500/10 text-emerald-700 text-sm rounded-md">
                {message}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="otp">OTP</Label>
              <Input
                id="otp"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="changePassword"
                checked={changePassword}
                onCheckedChange={(checked) => setChangePassword(Boolean(checked))}
              />
              <Label htmlFor="changePassword" className="cursor-pointer">
                Change password while verifying
              </Label>
            </div>

            {changePassword && (
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 mt-2">
            <Button type="submit" className="w-full shadow-md" disabled={isLoading || !email}>
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={handleResend} disabled={!email || isLoading}>
              Resend OTP
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Back to{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

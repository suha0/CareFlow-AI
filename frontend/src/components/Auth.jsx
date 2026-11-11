
import { useEffect, useState } from 'react';
import {
  Activity,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import api from './services/api';

function Auth({ onAuthenticated }) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
const [resetToken, setResetToken] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
const [showNewPassword, setShowNewPassword] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (window.location.pathname === '/reset-password' && token) {
    setResetToken(token);
    setIsResetPassword(true);
    setIsSignUp(false);
  }
}, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSignUp ? '/auth/register' : '/auth/login';

      const payload = isSignUp
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };

      const response = await api.post(endpoint, payload);
      const result = response.data;

      if (!result.token) {
        throw new Error('Authentication token was not returned.');
      }

      localStorage.setItem('careflowToken', result.token);
      localStorage.setItem(
        'careflowUser',
        JSON.stringify({
          name: result.name,
          email: result.email,
        })
      );

      setSuccess(result.message || 'Authentication successful!');
      onAuthenticated(result);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', {
        email: email.trim(),
      });

      setSuccess(
        'If an account exists with this email, password reset instructions will be sent.'
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Unable to process your request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
  event.preventDefault();
  setError('');
  setSuccess('');

  if (newPassword !== confirmPassword) {
    setError('Passwords do not match.');
    return;
  }

  setLoading(true);

  try {
    await api.post('/auth/reset-password', {
      token: resetToken,
      newPassword,
    });

    setSuccess('Password reset successfully! You can now sign in.');

    setNewPassword('');
    setConfirmPassword('');
  } catch (err) {
    setError(
      err.response?.data?.message ||
      err.response?.data ||
      'Unable to reset password. Your link may have expired.'
    );
  } finally {
    setLoading(false);
  }
};

  const returnToSignIn = () => {
    setIsForgotPassword(false);
    setIsSignUp(false);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Activity size={25} />
          </div>
          <div>
            <h2>CareFlow<span>AI</span></h2>
            <p>Healthcare intelligence</p>
          </div>
        </div>

        <div className="auth-heading">
          <span>WELCOME TO CAREFLOW AI</span>
          <h1>
            {isResetPassword
  ? 'Reset your password'
  : isForgotPassword
    ? 'Forgot password?'
    : isSignUp
      ? 'Create your account'
      : 'Welcome back'}
          </h1>
          <p>
            {isResetPassword
  ? 'Choose a new password for your CareFlow AI account.'
  : isForgotPassword
    ? 'Enter your email address to receive password reset instructions.'
    : isSignUp
      ? 'Get started with smarter healthcare communication.'
      : 'Sign in to continue to your workspace.'}
          </p>
        </div>
        {!isForgotPassword && !isResetPassword ? (
          <>
            <div className="auth-tabs">
              <button
                type="button"
                className={isSignUp ? 'active' : ''}
                onClick={() => {
                  setIsSignUp(true);
                  setError('');
                  setSuccess('');
                }}
              >
                Sign Up
              </button>

              <button
                type="button"
                className={!isSignUp ? 'active' : ''}
                onClick={() => {
                  setIsSignUp(false);
                  setError('');
                  setSuccess('');
                }}
              >
                Sign In
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {isSignUp && (
                <label>
                  Full name
                  <div className="auth-input">
                    <User size={18} />
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </label>
              )}

              <label>
                Email address
                <div className="auth-input">
                  <Mail size={18} />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </label>

              <label>
                Password
                <div className="auth-input">
                  <Lock size={18} />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              {!isSignUp && (
                <div className="auth-forgot-password">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError('');
                      setSuccess('');
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {isSignUp && (
                <label>
                  Confirm password
                  <div className="auth-input">
                    <Lock size={18} />

                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={8}
                      required
                    />

                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label={
                        showConfirmPassword
                          ? 'Hide confirm password'
                          : 'Show confirm password'
                      }
                    >
                      {showConfirmPassword
                        ? <EyeOff size={18} />
                        : <Eye size={18} />}
                    </button>
                  </div>
                </label>
              )}
              {error && <p className="auth-error">{String(error)}</p>}
              {success && <p className="auth-success">{success}</p>}
              <button
                className="auth-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? 'Please wait...'
                  : isSignUp
                    ? 'Create Account'
                    : 'Sign In'}

                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          </>
) : isForgotPassword ? (
  <>
    <form className="auth-form" onSubmit={handleForgotPassword}>
      <label>
        Email address
        <div className="auth-input">
          <Mail size={18} />
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </label>
      {error && <p className="auth-error">{String(error)}</p>}
      {success && <p className="auth-success">{success}</p>}
      <button
        className="auth-submit"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Please wait...' : 'Send Reset Instructions'}
        {!loading && <ArrowRight size={18} />}
      </button>
    </form>
    <button
      type="button"
      className="auth-back-button"
      onClick={returnToSignIn}
    >
      <ArrowLeft size={16} />
      Back to Sign In
    </button>
  </>
) : (
  <>
    <form className="auth-form" onSubmit={handleResetPassword}>
      <label>
        New password
        <div className="auth-input">
          <Lock size={18} />
          <input
            type={showNewPassword ? 'text' : 'password'}
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
          />
          <button
            type="button"
            className="auth-password-toggle"
            onClick={() => setShowNewPassword(!showNewPassword)}
            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
          >
            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>

      <label>
        Confirm new password
        <div className="auth-input">
          <Lock size={18} />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
          />
          <button
            type="button"
            className="auth-password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>

      {error && <p className="auth-error">{String(error)}</p>}
      {success && <p className="auth-success">{success}</p>}

      <button
        className="auth-submit"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Please wait...' : 'Reset Password'}
        {!loading && <ArrowRight size={18} />}
      </button>
    </form>

    <button
      type="button"
      className="auth-back-button"
      onClick={() => {
        setIsResetPassword(false);
        returnToSignIn();
      }}
    >
      <ArrowLeft size={16} />
      Back to Sign In
    </button>
  </>
)}
        <p className="auth-footer">
          Secure healthcare workflow · CareFlow AI
        </p>
      </div>
    </div>
  );
}

export default Auth;
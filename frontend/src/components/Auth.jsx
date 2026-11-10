
import { useState } from 'react';
import { Activity, Mail, Lock, User, ArrowRight } from 'lucide-react';
import api from './services/api';

function Auth({ onAuthenticated }) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
          <h1>{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
          <p>
            {isSignUp
              ? 'Get started with smarter healthcare communication.'
              : 'Sign in to continue to your workspace.'}
          </p>
        </div>

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
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
          </label>

          {isSignUp && (
            <label>
              Confirm password
              <div className="auth-input">
                <Lock size={18} />
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                />
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

        <p className="auth-footer">
          Secure healthcare workflow · CareFlow AI
        </p>
      </div>
    </div>
  );
}

export default Auth;

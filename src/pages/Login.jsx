import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { api, API_URL } from '../services/api';

export default function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ email: '', password: '' });

    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        const apiKey = localStorage.getItem('social_api_key');
        if (token || apiKey) {
            navigate('/publishing');
        }
    }, [navigate]);

    const handleGoogleLogin = () => {
        // Redirect to backend endpoint for Google Auth
        const googleAuthUrl = `${API_URL}/auth/google`;
        // Note: Preserving redirect state across Google Auth requires backend support (state param).
        // For now, standard dashboard redirect is used for Google.
        window.location.href = googleAuthUrl;
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const res = await api.post(endpoint, formData);

            const { access_token, api_key } = res.data;

            // Store tokens
            if (access_token) {
                localStorage.setItem('token', access_token);
            }
            // If registering, we might get an API key too
            if (api_key) {
                localStorage.setItem('social_api_key', api_key);
            }

            // Redirect to requested page or dashboard
            const redirectPath = searchParams.get('redirect') || '/publishing';
            navigate(redirectPath);
        } catch (err) {
            console.error("Auth Error:", err);
            setError(err.response?.data?.detail || "Authentication failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-background">
                <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-primary/10 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-secondary/10 blur-[150px] rounded-full"></div>
            </div>

            <div className="glass-card w-full max-w-md p-8 rounded-2xl relative z-10 animate-fade-in bg-white dark:bg-surface/60 border border-slate-100 dark:border-white/5 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                        <span className="font-bold text-xl text-white">H</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                    <p className="text-slate-500 dark:text-gray-400 text-sm">
                        {isLogin ? 'Sign in to continue to Social Raven' : 'Get started with Social Raven today'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl mb-6">
                    <button
                        onClick={() => { setIsLogin(true); setError(''); }}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => { setIsLogin(false); setError(''); }}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        Sign Up
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Google Button */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full py-3 px-4 bg-white dark:bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-[#0a0a0a] px-2 text-slate-500 dark:text-gray-500">Or continue with email</span>
                        </div>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <input
                                type="email"
                                placeholder="Email address"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input-futuristic w-full px-4 py-3"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="input-futuristic w-full px-4 py-3"
                            />
                        </div>

                        {/* Forgot Password Link - Only show for login */}
                        {isLogin && (
                            <div className="flex justify-end">
                                <a
                                    href="/forgot-password"
                                    className="text-xs font-medium text-slate-500 hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors"
                                >
                                    Forgot Password?
                                </a>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-primary hover:bg-primaryHover text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center text-xs text-slate-500 dark:text-gray-500">
                    By clicking continue, you agree to our{' '}
                    <a href="/terms" className="text-slate-700 dark:text-gray-400 hover:text-primary dark:hover:text-white underline font-medium">Terms of Service</a> and{' '}
                    <a href="/privacy" className="text-slate-700 dark:text-gray-400 hover:text-primary dark:hover:text-white underline font-medium">Privacy Policy</a>.
                </div>
            </div>
        </div>
    );
}

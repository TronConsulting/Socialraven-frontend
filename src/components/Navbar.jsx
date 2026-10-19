import LanguageSwitcher from './common/LanguageSwitcher';
import { Link, useLocation } from 'react-router-dom';
import {
 LayoutDashboard, BarChart3, Calendar, Palette, Sparkles, LogOut, Menu, X, Image as ImageIcon, History,
 ChevronDown, Globe, Zap, MessageSquare, Briefcase, Building, Code, BookOpen, LifeBuoy, Key, PieChart, Users, Activity
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';

export default function Navbar() {
 const location = useLocation();
 const apiKey = localStorage.getItem('social_api_key');
 const [isMenuOpen, setIsMenuOpen] = useState(false);

 const handleLogout = () => {
 if (confirm('Are you sure you want to logout? This will clear your API Key.')) {
 localStorage.removeItem('social_api_key');
 window.location.href = '/';
 }
 };

 const privateLinks = [
 { name: 'Instances', path: '/connections', icon: LayoutDashboard },
 { name: 'Analytics', path: '/analytics', icon: BarChart3 },
 { name: 'Schedule', path: '/schedule', icon: Calendar },
 { name: 'Media', path: '/media', icon: ImageIcon },
 { name: 'Ghostwriter', path: '/ai', icon: Sparkles },
 { name: 'Brand Kit', path: '/brand', icon: Palette },
 { name: 'History', path: '/history', icon: History },
 { name: 'Instant', path: '/instant', icon: Zap },
 ];

 const publicNavItems = [
 {
 name: 'How It Works',
 path: '/how-it-works'
 },
 {
 name: 'Product',
 path: '/product'
 },
 {
 name: 'Solutions',
 children: [
 { name: 'Enterprise', icon: Building, desc: 'Scale your organization', path: '/solutions/enterprise' },
 { name: 'Agencies', icon: Briefcase, desc: 'Manage multiple clients', path: '/solutions/agencies' },
 { name: 'Small Business', icon: Zap, desc: 'Grow your brand', path: '/solutions/small-business' },
 ]
 },
 {
 name: 'Community',
 path: '/community'
 },
 ];

 return (
 <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 backdrop-blur-md bg-bgSurface/80 border-b border-borderColor text-textMain`}>
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between h-16">

 {/* Logo Area */}
 <div className="flex-shrink-0">
 <Link to="/" className="flex items-center gap-3 group">
 <div className="w-12 h-12 flex items-center justify-center">
 <img src="/images/image.png" alt="Social Raven Logo" className="w-full h-full object-contain" />
 </div>
 <span className="text-2xl font-black text-textMain italic uppercase tracking-tighter">Social Raven</span>
 </Link>
 </div>

 {/* Desktop Navigation */}
 <div className="hidden md:flex items-center gap-6">
 {apiKey ? (
 // Logged In: Dashboard Links
 privateLinks.map((link) => (
 <Link
 key={link.path}
 to={link.path}
 className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 group relative overflow-hidden ${location.pathname === link.path ? 'text-raven-400 bg-raven-500/10 border border-raven-500/20 shadow-sm font-bold' : 'text-textMuted hover:text-textMain hover:bg-bgSurfaceHighlight' }`}
 >
 <link.icon className={`w-4 h-4 ${location.pathname === link.path ? 'text-raven-400' : 'text-textMuted group-hover:text-raven-400 transition-colors'}`} />
 {link.name}
 </Link>
 ))
 ) : (
 // Logged Out: Mega Menu Drops
 <div className="flex items-center gap-2">
 {publicNavItems.map((item) => (
 <div key={item.name} className="group relative">
 {item.path ? (
 <Link to={item.path} className="px-4 py-2 text-sm font-medium text-textMuted hover:text-textMain transition-colors block">
 {item.name}
 </Link>
 ) : (
 <>
 <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-textMuted hover:text-textMain transition-colors">
 {item.name} <ChevronDown className="w-4 h-4 opacity-50 group-hover:rotate-180 transition-transform" />
 </button>
 {/* Mega Menu Dropdown */}
 <div className="absolute top-full left-0 mt-1 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
 <div className="bg-black/95 backdrop-blur-xl border border-borderColor rounded-2xl p-3 shadow-2xl">
 {item.children.map((child) => (
 <Link
 key={child.name}
 to={child.path}
 className="flex items-start gap-3 p-3 rounded-xl hover:bg-bgSurfaceHighlight transition-colors group/item"
 >
 <div className="mt-1 p-2 rounded-lg bg-bgSurfaceHighlight group-hover/item:bg-raven-500/20 group-hover/item:text-raven-400 transition-colors">
 <child.icon className="w-4 h-4" />
 </div>
 <div>
 <div className="text-sm font-bold text-textMain">{child.name}</div>
 <div className="text-[10px] text-textMuted">{child.desc}</div>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </>
 )}
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Right Side Actions */}
 <div className="hidden md:flex items-center gap-4">
 <LanguageSwitcher />
 {apiKey ? (
 <div className="flex items-center gap-3">
 <Link to="/api-keys" className="p-2 text-textMuted hover:text-textMain hover:bg-bgSurfaceHighlight rounded-lg transition-colors" title="API Management">
 <Key className="w-5 h-5" />
 </Link>
 <Link to="/settings" className="p-2 text-textMuted hover:text-textMain hover:bg-bgSurfaceHighlight rounded-lg transition-colors">
 <Palette className="w-5 h-5" />
 </Link>
 <button
 onClick={handleLogout}
 className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 text-sm font-bold rounded-xl transition-all hover:text-textMain border border-red-500/20"
 >
 <LogOut className="w-4 h-4" />
 <span>Logout</span>
 </button>
 </div>
 ) : (
 <div className="flex items-center gap-4">
 <Link to="/login" className="text-sm font-bold text-textMuted hover:text-textMain transition-colors">Log In</Link>
 <Link to="/login" className="px-6 py-2.5 bg-raven-600 hover:bg-raven-500 text-textMain text-sm font-bold rounded-xl shadow-lg shadow-raven-500/20 transition-all hover:scale-105">
 Start Free Trial
 </Link>
 </div>
 )}
 </div>

 {/* Mobile Actions & Menu Button */}
 <div className="md:hidden flex items-center gap-2">
 <LanguageSwitcher />
 <button
 onClick={() => setIsMenuOpen(!isMenuOpen)}
 className="p-2 text-textMuted hover:text-textMain transition-colors rounded-xl border border-borderColor bg-bgSurfaceHighlight"
 aria-label="Toggle Navigation Menu"
 >
 {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
 </button>
 </div>
 </div>
 </div>

 {/* Mobile Menu */}
 <AnimatePresence>
 {isMenuOpen && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="md:hidden bg-bgColor border-t border-borderColor"
 >
 <div className="px-4 py-6 space-y-4">
 {apiKey ? (
 privateLinks.map((link) => (
 <Link
 key={link.path}
 to={link.path}
 onClick={() => setIsMenuOpen(false)}
 className="flex items-center gap-3 p-3 rounded-xl text-textMuted hover:bg-bgSurfaceHighlight"
 >
 <link.icon className="w-5 h-5" />
 <span className="font-medium">{link.name}</span>
 </Link>
 ))
 ) : (
 publicNavItems.map((item) => (
 <div key={item.name}>
 {item.path ? (
 <Link
 to={item.path}
 onClick={() => setIsMenuOpen(false)}
 className="block p-3 text-textMuted font-medium"
 >
 {item.name}
 </Link>
 ) : (
 <div className="p-3">
 <div className="text-textMuted text-xs font-bold uppercase mb-2">{item.name}</div>
 <div className="space-y-1 pl-2">
 {item.children.map(child => (
 <Link
 key={child.name}
 to={child.path}
 onClick={() => setIsMenuOpen(false)}
 className="block py-2 text-textMuted text-sm"
 >
 {child.name}
 </Link>
 ))}
 </div>
 </div>
 )}
 </div>
 ))
 )}
 <div className="pt-4 border-t border-borderColor">
 {apiKey ? (
 <button
 onClick={handleLogout}
 className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 bg-red-500/10"
 >
 <LogOut className="w-5 h-5" />
 <span className="font-bold">Logout</span>
 </button>
 ) : (
 <div className="grid grid-cols-2 gap-3">
 <Link to="/login" className="p-3 text-center text-textMain font-bold border border-borderColor rounded-xl">Log In</Link>
 <Link to="/login" className="p-3 text-center bg-raven-600 text-textMain font-bold rounded-xl">Sign Up</Link>
 </div>
 )}
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </nav>
 );
}

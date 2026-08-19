import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Menu, X, ArrowUpRight, Cpu } from 'lucide-react';

interface NavbarProps {
  walletAddress?: string | null;
  onConnectWallet?: () => void;
  isConnecting?: boolean;
}

export default function Navbar({ walletAddress, onConnectWallet, isConnecting }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const isBlog = location.pathname.startsWith('/blog');

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#030508]/85 backdrop-blur-xl border-b border-[#0DF2C9]/15 shadow-[0_4px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(13,242,201,0.04)]' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          
          <Link to="/" className="flex items-center space-x-3 group relative">
            <img 
              src="/logo.png" 
              alt="Praman Network Logo" 
              width="144"
              height="48"
              fetchPriority="high"
              decoding="async"
              className="h-12 w-auto object-contain mix-blend-screen transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 filter drop-shadow-[0_0_8px_rgba(13,242,201,0.4)]"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link
              to="/"
              className={`text-[15px] font-medium transition-all duration-300 hover:text-[#00F0FF] hover:text-glow-cyan relative py-1 ${
                location.pathname === '/' ? 'text-[#00F0FF] text-glow-cyan' : 'text-slate-300'
              }`}
            >
              Protocol
              {location.pathname === '/' && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]"
                />
              )}
            </Link>
            
            <a
              href="/#features"
              className="text-[15px] font-medium text-slate-300 transition-all duration-300 hover:text-[#00F0FF] hover:text-glow-cyan"
            >
              Verify Stack
            </a>

            <Link
              to="/dashboard"
              className={`text-[15px] font-medium transition-all duration-300 hover:text-[#00F0FF] hover:text-glow-cyan flex items-center space-x-1 relative py-1 ${
                isDashboard ? 'text-[#00F0FF] text-glow-cyan' : 'text-slate-300'
              }`}
            >
              <span>Developer API</span>
              <Cpu className="h-3.5 w-3.5" />
              {isDashboard && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]"
                />
              )}
            </Link>

            <a
              href="https://docs.praman.network/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] font-medium text-slate-400 transition-all duration-300 hover:text-white flex items-center space-x-0.5"
            >
              <span>Docs</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>

            <Link
              to="/blog"
              className={`text-[15px] font-medium transition-all duration-300 hover:text-[#00F0FF] hover:text-glow-cyan relative py-1 ${
                isBlog ? 'text-[#00F0FF] text-glow-cyan' : 'text-slate-300'
              }`}
            >
              Blog
              {isBlog && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]"
                />
              )}
            </Link>

            <Link
              to="/contact"
              className={`text-[15px] font-medium transition-all duration-300 hover:text-[#00F0FF] hover:text-glow-cyan relative py-1 ${
                location.pathname === '/contact' ? 'text-[#00F0FF] text-glow-cyan' : 'text-slate-300'
              }`}
            >
              Contact
              {location.pathname === '/contact' && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]"
                />
              )}
            </Link>
          </nav>

          {/* Connect Wallet / Console CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            {onConnectWallet && (
              <motion.button
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
                }}
                whileTap={{ scale: 0.98 }}
                onClick={onConnectWallet}
                disabled={isConnecting}
                className={`flex items-center space-x-2.5 px-4 py-2 rounded-lg font-medium text-xs tracking-wider uppercase border transition-all duration-300 font-display ${
                  walletAddress
                    ? 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                    : 'bg-white/5 border-gray-800 text-slate-200 hover:border-[#00F0FF]/50 hover:text-[#00F0FF]'
                }`}
              >
                <Wallet className={`h-4 w-4 ${walletAddress ? 'animate-pulse' : ''}`} />
                <span>
                  {isConnecting
                    ? 'Connecting...'
                    : walletAddress
                    ? formatAddress(walletAddress)
                    : 'Connect Wallet'}
                </span>
              </motion.button>
            )}

            {!onConnectWallet && (
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#00F0FF] text-[#0B0E14] px-6 py-3 rounded-lg font-bold text-sm tracking-wider uppercase flex items-center space-x-2 font-display transition-all duration-300"
                >
                  <span>Console</span>
                  <ArrowUpRight className="h-4 w-4" />
                </motion.button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
              className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0DF2C9] rounded-lg"
            >
              {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-[#030508]/95 backdrop-blur-xl absolute left-0 w-full"
          >
            <div className="px-4 pt-4 pb-8 space-y-4">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-sm font-semibold tracking-wider text-slate-400 hover:text-[#0DF2C9] uppercase font-mono"
              >
                Protocol
              </Link>
              <a
                href="/#features"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-sm font-semibold tracking-wider text-slate-400 hover:text-[#0DF2C9] uppercase font-mono"
              >
                Verify Stack
              </a>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-sm font-semibold tracking-wider text-slate-400 hover:text-[#0DF2C9] uppercase font-mono"
              >
                Developer API
              </Link>
              <a
                href="https://docs.praman.network/"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 text-sm font-semibold tracking-wider text-slate-400 hover:text-white uppercase font-mono"
              >
                Docs
              </a>
              <Link
                to="/blog"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-sm font-semibold tracking-wider text-slate-300 hover:text-[#0DF2C9] uppercase font-mono"
              >
                Blog
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-sm font-semibold tracking-wider text-slate-300 hover:text-[#0DF2C9] uppercase font-mono"
              >
                Contact
              </Link>
              
              <div className="pt-4 border-t border-white/5">
                <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                  <button className="w-full bg-[#0DF2C9] text-black py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider font-mono shadow-[0_0_15px_rgba(13,242,201,0.2)]">
                    Access Console
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

import { Link } from 'react-router-dom';
import { Activity, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050509]/60 pt-20 pb-12 relative overflow-hidden w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-white/5">
          
          {/* Column 1: Brand details */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <img 
                src="/logo2.png" 
                alt="Praman Network Logo" 
                width="120"
                height="40"
                loading="lazy"
                decoding="async"
                className="h-10 w-auto object-contain mix-blend-screen transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 filter drop-shadow-[0_0_8px_rgba(13,242,201,0.4)]"
              />
            </Link>
            
            <p className="text-zinc-400 text-xs max-w-sm font-light leading-relaxed">
              Replacing Trust with Proof. Foundational Web3 infrastructure for biometric identity, Sybil resistance, and verifiable credentials.
            </p>

            <div className="flex items-center space-x-4 pt-2">
              <a 
                href="https://x.com/PramanNetwork" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-zinc-400 hover:text-[#00F0FF] hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all duration-300 hover:scale-110"
                title="Follow us on X"
              >
                <Twitter className="h-4.5 w-4.5" />
              </a>
              <a 
                href="https://www.linkedin.com/company/praman-network/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-zinc-400 hover:text-[#00F0FF] hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all duration-300 hover:scale-110"
                title="Connect on LinkedIn"
              >
                <Linkedin className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

          {/* Column 2: Developers */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-widest text-[#0DF2C9] font-mono font-bold">
              Developers
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400 font-light">
              <li>
                <a href="https://docs.praman.network/" target="_blank" rel="noreferrer" className="hover:text-[#0DF2C9] hover:text-glow-cyan transition-all duration-300">Documentation</a>
              </li>
              <li>
                <a href="https://github.com/Praman-Network" target="_blank" rel="noreferrer" className="hover:text-[#0DF2C9] hover:text-glow-cyan transition-all duration-300">GitHub Org</a>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#0DF2C9] hover:text-glow-cyan transition-all duration-300">Console API</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Ecosystem */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-widest text-[#0DF2C9] font-mono font-bold">
              Ecosystem
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400 font-light">
              <li>
                <a href="https://auth.praman.network/" target="_blank" rel="noreferrer" className="hover:text-[#0DF2C9] hover:text-glow-cyan transition-all duration-300">PramanAuth</a>
              </li>
              <li>
                <Link to="/talent-coming-soon" className="hover:text-[#0DF2C9] hover:text-glow-cyan transition-all duration-300">Praman Talent</Link>
              </li>
              <li>
                <a href="https://amoy.polygonscan.com/address/0xBc5C048B2B469682c7554D0B4566e5F8a3f4F32a" target="_blank" rel="noreferrer" className="hover:text-[#0DF2C9] hover:text-glow-cyan transition-all duration-300">Network Explorer</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-widest text-[#0DF2C9] font-mono font-bold">
              Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400 font-light font-sans">
              <li>
                <Link to="/privacy" className="hover:text-[#0DF2C9] hover:text-glow-cyan transition-all duration-300">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#0DF2C9] hover:text-glow-cyan transition-all duration-300">Terms of Use</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#0DF2C9] hover:text-glow-cyan transition-all duration-300">Contact Us</Link>
              </li>
              <li>
                <a href="https://github.com/Praman-Network/AuthPramanNetwork?tab=GPL-3.0-1-ov-file" target="_blank" rel="noreferrer" className="hover:text-[#0DF2C9] hover:text-glow-cyan transition-all duration-300">GPL-3.0 License</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright details */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 font-mono gap-4">
          <div>
            Praman Network &copy; {new Date().getFullYear()} All rights reserved.
          </div>
          <div className="flex items-center space-x-1.5">
            <Activity className="h-3.5 w-3.5 text-[#0DF2C9] animate-pulse" />
            <span>Ecosystem Status: Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO.tsx';
import { 
  Mail, 
  Linkedin, 
  Twitter, 
  Github, 
  MessageSquare, 
  Bug, 
  Sparkles, 
  Clock, 
  ArrowUpRight, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink
} from 'lucide-react';
import Navbar from '../components/Navbar.tsx';
import Footer from '../components/Footer.tsx';

type InquiryType = 'general' | 'bug' | 'feature';

interface FormState {
  name: string;
  email: string;
  inquiryType: InquiryType;
  subject: string;
  message: string;
}

export default function Contact() {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    inquiryType: 'general',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [usingMailtoFallback, setUsingMailtoFallback] = useState(false);

  const web3FormsKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '';

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectInquiryType = (type: InquiryType) => {
    setForm((prev) => ({
      ...prev,
      inquiryType: type,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setSubmitStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    setUsingMailtoFallback(false);

    const emailSubject = `[Praman Contact - ${form.inquiryType.toUpperCase()}] ${form.subject}`;
    const emailBody = `Name: ${form.name}\nEmail: ${form.email}\nInquiry Type: ${form.inquiryType}\n\nMessage:\n${form.message}`;

    // If Web3Forms Access Key is provided, submit via API
    if (web3FormsKey) {
      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            access_key: web3FormsKey,
            name: form.name,
            email: form.email,
            subject: emailSubject,
            message: emailBody,
            from_name: 'Praman Network Web',
          }),
        });

        const result = await response.json();
        if (result.success) {
          setSubmitStatus('success');
          setForm({
            name: '',
            email: '',
            inquiryType: 'general',
            subject: '',
            message: '',
          });
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (error: any) {
        console.error('Web3Forms Error:', error);
        setSubmitStatus('error');
        setErrorMessage(error.message || 'Failed to submit form.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Fallback: Mailto redirect
      setTimeout(() => {
        setIsSubmitting(false);
        setUsingMailtoFallback(true);
        setSubmitStatus('success');

        const mailtoUrl = `mailto:networkpraman@gmail.com?subject=${encodeURIComponent(
          emailSubject
        )}&body=${encodeURIComponent(emailBody)}`;
        
        window.open(mailtoUrl, '_self');
      }, 800);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <main id="main-content" className="relative min-h-screen bg-transparent text-white overflow-hidden">
      <SEO 
        title="Contact Us"
        description="Get in touch with the Praman Network team for partnerships, developer support, and integration requests."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact Praman Network",
          "url": "https://praman.network/contact",
          "description": "Contact form and developer relations endpoints for the Praman Network protocol."
        }}
      />
      {/* Background Web3 Matrix Grid */}
      <div className="absolute inset-0 bg-web3-grid pointer-events-none z-0 opacity-40" />
      <div className="absolute inset-0 bg-vignette pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col justify-between min-h-screen">
        <Navbar />

        {/* Hero Header */}
        <section className="pt-32 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-white/5 bg-[#0B0E14]/80 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-[#00F0FF] animate-pulse" />
              <span className="text-[10px] tracking-[0.15em] uppercase font-bold text-slate-400 font-mono">
                Support & Relations
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight">
              Contact <span className="text-[#00F0FF] text-glow-cyan">Praman Network</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 font-light leading-relaxed max-w-2xl mx-auto font-sans">
              Replacing trust with proof, even in support. Reach out for partnerships, integrate biometric validation, report issues, or propose updates.
            </p>
          </motion.div>
        </section>

        {/* Content Layout */}
        <section className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct channels and social info */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 space-y-6"
          >
            {/* Quick Contact Card */}
            <motion.div 
              variants={itemVariants}
              className="glass-panel rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all duration-300"
            >
              <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
                Direct Channels
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3.5 group">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 group-hover:border-[#00F0FF]/30 transition-all">
                    <Mail className="h-5 w-5 text-[#00F0FF]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold">Email Support</p>
                    <a 
                      href="mailto:networkpraman@gmail.com" 
                      className="text-sm font-medium text-slate-200 hover:text-[#00F0FF] transition-colors font-mono"
                    >
                      networkpraman@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 group">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 group-hover:border-[#00F0FF]/30 transition-all">
                    <Clock className="h-5 w-5 text-[#00F0FF]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold">Response Time</p>
                    <p className="text-sm font-medium text-slate-300 font-sans">
                      Under 24 hours (Monday - Friday)
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Social Network Card */}
            <motion.div 
              variants={itemVariants}
              className="glass-panel rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all duration-300"
            >
              <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Community & Socials
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a 
                  href="https://x.com/PramanNetwork" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/5 hover:border-[#00F0FF]/30 hover:bg-[#00F0FF]/5 hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Twitter className="h-5 w-5 text-sky-400" />
                    <span className="text-sm font-medium text-slate-200">Twitter / X</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-400" />
                </a>

                <a 
                  href="https://www.linkedin.com/company/praman-network/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/5 hover:border-[#00F0FF]/30 hover:bg-[#00F0FF]/5 hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium text-slate-200">LinkedIn</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-400" />
                </a>

                <a 
                  href="https://github.com/Praman-Network" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/5 hover:border-[#00F0FF]/30 hover:bg-[#00F0FF]/5 hover:scale-[1.02] transition-all duration-300 sm:col-span-2"
                >
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5 text-white" />
                    <span className="text-sm font-medium text-slate-200">GitHub Organization</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <span>Explore Org</span>
                    <ArrowUpRight className="h-4 w-4 text-zinc-400" />
                  </div>
                </a>
              </div>
            </motion.div>

            {/* Verification Note */}
            <motion.div 
              variants={itemVariants}
              className="rounded-2xl border border-[#0DF2C9]/15 bg-[#0DF2C9]/5 p-5 relative overflow-hidden font-sans"
            >
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-2 translate-y-2 pointer-events-none">
                <Sparkles className="h-28 w-28 text-[#0DF2C9]" />
              </div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-[#0DF2C9] mb-1 font-mono">Cryptographic Proof</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Praman Network operates under zero trust principles. Contact info is fully sandbox-secure. If you prefer to declare bugs or request updates publically, use our verified GitHub Repository tracker.
              </p>
            </motion.div>
          </motion.div>

          {/* Right Column: Interactive Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00F0FF] to-purple-600 rounded-2xl blur opacity-15" />
              <div className="relative glass-panel rounded-2xl border border-white/5 p-8 shadow-2xl overflow-hidden hover:border-white/10 transition-all duration-300">
                
                {submitStatus === 'success' ? (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-12 space-y-6"
                  >
                    <div className="inline-flex p-4 rounded-full bg-[#0DF2C9]/10 border border-[#0DF2C9]/30 text-[#0DF2C9] justify-center items-center shadow-[0_0_15px_rgba(13,242,201,0.2)]">
                      <CheckCircle className="h-10 w-10 animate-bounce" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-display font-extrabold text-white">
                        {usingMailtoFallback ? 'Opening Mail Client...' : 'Message Dispatched'}
                      </h3>
                      <p className="text-sm text-slate-400 font-light max-w-md mx-auto leading-relaxed">
                        {usingMailtoFallback 
                          ? "We are opening your email client to directly send the message to networkpraman@gmail.com. Please complete the draft there."
                          : "Thank you for reaching out! We've received your query and our team will get back to you shortly."
                        }
                      </p>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => setSubmitStatus('idle')}
                        className="px-6 py-2.5 rounded-lg border border-white/10 text-xs uppercase tracking-wider font-mono font-bold hover:bg-white/5 transition-all text-slate-400"
                      >
                        Send Another Message
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Inquiry Type Cards Selection */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold block">
                        Inquiry Category
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => selectInquiryType('general')}
                          className={`flex items-center gap-2 p-3.5 rounded-xl border text-xs font-mono transition-all text-left duration-300 ${
                            form.inquiryType === 'general'
                              ? 'bg-[#00F0FF]/10 border-[#00F0FF]/50 text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.15)] font-bold'
                              : 'bg-black/30 border-white/5 text-slate-400 hover:border-white/10 hover:text-white'
                          }`}
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>General Query</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => selectInquiryType('bug')}
                          className={`flex items-center gap-2 p-3.5 rounded-xl border text-xs font-mono transition-all text-left duration-300 ${
                            form.inquiryType === 'bug'
                              ? 'bg-rose-500/10 border-rose-500/50 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.15)] font-bold'
                              : 'bg-black/30 border-white/5 text-slate-400 hover:border-white/10 hover:text-white'
                          }`}
                        >
                          <Bug className="h-4 w-4" />
                          <span>Bug Report</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => selectInquiryType('feature')}
                          className={`flex items-center gap-2 p-3.5 rounded-xl border text-xs font-mono transition-all text-left duration-300 ${
                            form.inquiryType === 'feature'
                              ? 'bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.15)] font-bold'
                              : 'bg-black/30 border-white/5 text-slate-400 hover:border-white/10 hover:text-white'
                          }`}
                        >
                          <Sparkles className="h-4 w-4" />
                          <span>Feature Request</span>
                        </button>
                      </div>
                    </div>

                    {/* GitHub Redirect Helper Alert */}
                    <AnimatePresence mode="wait">
                      {form.inquiryType !== 'general' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, y: -10 }}
                          animate={{ height: 'auto', opacity: 1, y: 0 }}
                          exit={{ height: 0, opacity: 0, y: -10 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 rounded-xl border border-white/5 bg-[#0A0E1A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans text-xs">
                            <div className="flex gap-2.5 items-start">
                              <Github className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-200">Submit on GitHub for full visibility</p>
                                <p className="text-zinc-400 font-light">Would you prefer to file this issue directly on our public tracker?</p>
                              </div>
                            </div>
                            <a
                              href="https://github.com/Praman-Network/pramannetwork/issues/new"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-mono font-bold text-[10px] tracking-wider uppercase border border-white/10 hover:border-white/20 whitespace-nowrap transition-all"
                            >
                              <span>Create Issue</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold block">
                          Your Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Alice Proof"
                          className="w-full bg-black/45 border border-white/5 hover:border-white/10 focus:border-[#00F0FF]/40 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-650 focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/20 transition-all font-sans"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold block">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={form.email}
                          onChange={handleInputChange}
                          required
                          placeholder="alice@verification.io"
                          className="w-full bg-black/45 border border-white/5 hover:border-white/10 focus:border-[#00F0FF]/40 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-650 focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/20 transition-all font-sans"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold block">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={form.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="Let us know what this is about..."
                        className="w-full bg-black/45 border border-white/5 hover:border-white/10 focus:border-[#00F0FF]/40 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/20 transition-all font-sans"
                      />
                    </div>

                    {/* Message Box */}
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold block">
                        Detailed Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={form.message}
                        onChange={handleInputChange}
                        required
                        placeholder="Write your details here..."
                        className="w-full bg-black/45 border border-white/5 hover:border-white/10 focus:border-[#00F0FF]/40 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/20 transition-all font-sans resize-none font-sans"
                      />
                    </div>

                    {/* Error Message Box */}
                    {submitStatus === 'error' && (
                      <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 text-red-400 text-xs flex items-center gap-2 font-sans">
                        <AlertCircle className="h-4.5 w-4.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-2">
                      <motion.button
                        whileHover={{ 
                          scale: 1.02, 
                          boxShadow: '0 0 25px rgba(0, 240, 255, 0.4)'
                        }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full bg-[#00F0FF] text-[#0B0E14] py-3.5 sm:py-4 rounded-xl font-bold tracking-wider uppercase flex items-center justify-center space-x-2 text-[10px] sm:text-xs transition-all duration-300 font-mono shadow-[0_0_15px_rgba(0,240,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span>{web3FormsKey ? 'Submit Securely' : 'Submit Form'}</span>
                            <ArrowUpRight className="h-4 w-4" />
                          </>
                        )}
                      </motion.button>
                    </div>

                  </form>
                )}

              </div>
            </div>
          </motion.div>

        </section>

        <Footer />
      </div>
    </main>
  );
}

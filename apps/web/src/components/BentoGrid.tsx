import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Bot, Network, ShieldCheck, Terminal } from 'lucide-react';

interface BentoCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  glowColor?: string;
  tag?: string;
  children?: React.ReactNode;
}

function BentoCard({ title, description, icon: Icon, className = "", glowColor = "rgba(0, 240, 255, 0.12)", tag, children }: BentoCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative glass-panel rounded-3xl p-8 overflow-hidden group hover:border-[#00F0FF]/30 hover:shadow-[0_0_50px_rgba(0,240,255,0.06)] transition-all duration-500 flex flex-col justify-between h-full ${className}`}
    >
      {/* Spotlight highlight tracking user mouse cursor */}
      <div
        className="absolute pointer-events-none transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, ${glowColor}, transparent 80%)`,
          inset: 0,
        }}
      />

      <div className="space-y-6 relative z-10">
        <div className="flex justify-between items-center">
          {/* Futuristic icon frame */}
          <div className="p-3 w-fit rounded-2xl bg-black/40 border border-white/5 group-hover:border-[#00F0FF]/30 shadow-inner group-hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all duration-500">
            <Icon className="h-6 w-6 text-[#00F0FF] group-hover:scale-110 transition-transform duration-300" />
          </div>

          {tag && (
            <span className="text-[9px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-full border border-white/5 bg-white/[0.02] text-zinc-500 group-hover:border-[#00F0FF]/25 group-hover:text-[#00F0FF] transition-all">
              {tag}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-display font-extrabold text-white tracking-tight group-hover:text-[#00F0FF] transition-colors duration-300">
            {title}
          </h3>
          <p className="text-zinc-400 text-xs leading-relaxed font-light font-sans max-w-xl">
            {description}
          </p>
        </div>
      </div>

      {children && (
        <div className="relative z-10 w-full mt-6">
          {children}
        </div>
      )}
    </div>
  );
}

export default function BentoGrid() {
  // Mini interactive mock nodes for consensus card
  const mockNodes = [
    { name: "Node_London", ping: "42ms", status: "online" },
    { name: "Node_Tokyo", ping: "112ms", status: "online" },
    { name: "Node_NewYork", ping: "68ms", status: "online" }
  ];

  return (
    <section id="features" className="relative py-24 z-10 border-b border-gray-950 bg-[#06060c]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title / Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100 }}
          className="text-center max-w-none mx-auto space-y-4 mb-20"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-white/5 bg-black/40 text-[9px] tracking-widest uppercase font-semibold text-[#00F0FF] font-mono">
            Protocol Capabilities
          </div>
          <h2 className="text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
            The Trust Engine of <span className="text-[#00F0FF] text-glow-cyan">Decentralized Logic</span>
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto font-light leading-relaxed">
            Praman Network guarantees cryptographically verifiable execution, combining advanced zero-knowledge primitives with low-latency decentralized consensus.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[390px]">
          
          {/* Card 1: Proof Engines (Double Width) */}
          <div className="md:col-span-2">
            <BentoCard
              title="ZK-Proving Engines"
              description="High-performance zk-SNARK provers executing purely in-browser. Biometric vectors are verified client-side, avoiding database leaks and keeping user data completely anonymous."
              icon={Cpu}
              tag="CORE CRYPTO"
            >
              {/* Graphic element for Proof Pipeline */}
              <div className="w-full h-28 rounded-2xl bg-black/40 border border-white/5 overflow-hidden p-4 relative flex items-center justify-between font-mono text-[9px] text-zinc-500">
                <div className="flex flex-col justify-between h-full py-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-zinc-300">PROVER_NODE_01</span>
                  </div>
                  <div className="text-[#00F0FF] font-bold">GEN_GROTH16_PROOF</div>
                  <div>TIME: 362ms</div>
                </div>
                
                {/* Connecting pipeline beam */}
                <div className="flex items-center space-x-2 flex-grow mx-2 sm:mx-8 justify-center relative">
                  <div className="w-full h-[1px] bg-gradient-to-r from-[#00F0FF] via-purple-500 to-transparent relative">
                    <motion.div
                      animate={{ x: ['0%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute top-[-2px] w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#00F0FF]"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-between h-full py-1 text-right">
                  <div className="text-purple-400 font-bold">VERIFIER_CONTRACT</div>
                  <div className="text-emerald-400">STATUS: APPROVED</div>
                  <div className="text-zinc-600">GAS: 139,410</div>
                </div>
              </div>
            </BentoCard>
          </div>

          {/* Card 2: AI Guard Verification (Single Width) */}
          <div className="md:col-span-1">
            <BentoCard
              title="AI Guard Analysis"
              description="Automated telemetry and vulnerability scanning. Analyzes smart contract compiler outputs and AST trees before proofs are compiled."
              icon={Bot}
              tag="INTELLIGENCE"
              glowColor="rgba(168, 85, 247, 0.1)"
            >
              <div className="flex flex-col space-y-3 mt-2 bg-black/40 border border-white/5 rounded-2xl p-4">
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>AST SCANNER</span>
                  <span className="text-emerald-400 font-bold">SECURED</span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="bg-gradient-to-r from-purple-500 to-[#00F0FF] h-full"
                  />
                </div>
                <div className="flex justify-between text-[8px] text-zinc-500 font-mono">
                  <span>CRITICALS: 0</span>
                  <span>WARNINGS: 0</span>
                </div>
              </div>
            </BentoCard>
          </div>

          {/* Card 3: Decentralized Consensus (Single Width) */}
          <div className="md:col-span-1">
            <BentoCard
              title="Decentralized Consensus"
              description="A multi-node validation matrix ensuring biometric integrity without central storage systems."
              icon={Network}
              tag="CONSENSUS"
            >
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col space-y-2">
                {mockNodes.map((node, i) => (
                  <div key={i} className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-zinc-400">{node.name}</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[#00F0FF]">{node.ping}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          {/* Card 4: Zero-Knowledge Auditing (Double Width) */}
          <div className="md:col-span-2">
            <BentoCard
              title="Zero-Knowledge Auditing"
              description="Verify compliance mathematical assertions without exposing underlying database schemas, logic trees, or developer profiles. Keeps regulatory audits cryptographically private."
              icon={ShieldCheck}
              tag="AUDITING"
              glowColor="rgba(251, 191, 36, 0.08)"
            >
              <div className="w-full h-28 rounded-2xl bg-black/40 border border-white/5 overflow-hidden p-4 relative font-mono text-xs text-zinc-400 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center space-x-2 text-[9px] text-zinc-500">
                    <Terminal className="h-3.5 w-3.5 text-[#00F0FF]" />
                    <span>audit_engine.sh</span>
                  </div>
                  <span className="text-[8px] bg-purple-950/40 border border-purple-800/40 text-purple-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    COMPLIANT
                  </span>
                </div>
                <div className="space-y-1.5 py-1 text-[9px] text-zinc-500 leading-tight">
                  <div>$ praman-audit --input ./circuits/biometric.circom</div>
                  <div className="text-zinc-300">&gt; Computing constraint matrix... OK</div>
                  <div className="text-[#00F0FF]">&gt; Verification Key generated (vk.json) - Success</div>
                </div>
              </div>
            </BentoCard>
          </div>

        </div>
      </div>
    </section>
  );
}

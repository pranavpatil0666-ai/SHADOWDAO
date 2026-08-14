import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col">
      <header className="p-6 max-w-7xl mx-auto w-full flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          ShadowDAO
        </h1>
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link to="/proposals" className="text-gray-400 hover:text-white transition-colors">
            Proposals
          </Link>
          <Link to="/treasury" className="text-gray-400 hover:text-white transition-colors">
            Treasury
          </Link>
          <Link to="/governance" className="text-gray-400 hover:text-white transition-colors">
            Governance
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="text-center max-w-4xl">
          <div className="inline-block px-4 py-2 bg-primary/20 border border-primary/30 rounded-full text-sm font-medium mb-8 animate-pulse">
            Midnight Builder Challenge - Level 2
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold mb-8 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-secondary">
              Private Governance
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-blue-500">
              Public Results
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            ShadowDAO brings Zero-Knowledge voting to DAOs on Midnight Network. 
            Cast your vote privately with ZK-SNARKs while maintaining transparent, verifiable outcomes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <Link
              to="/connect"
              className="btn-primary text-lg px-10 py-4 w-full sm:w-auto"
            >
              Connect Lace Wallet
            </Link>
            <Link
              to="/proposals"
              className="btn-secondary text-lg px-10 py-4 w-full sm:w-auto"
            >
              View Proposals
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <FeatureCard
              icon="shield"
              title="Zero-Knowledge Voting"
              description="Your vote choice is never revealed on-chain. Only the final tally is public."
            />
            <FeatureCard
              icon="users"
              title="Membership Proof"
              description="Prove you're a member without revealing your identity using ZK commitments."
            />
            <FeatureCard
              icon="lock"
              title="Midnight Network"
              description="Built on Midnight's Compact smart contracts with private state and circuits."
            />
          </div>
        </div>
      </main>

      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>Built for the Midnight Builder Challenge | Powered by Compact & Midnight.js</p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: 'shield' | 'users' | 'lock';
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const icons = {
    shield: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    users: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    lock: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  };

  return (
    <div className="glass-panel p-6 text-left">
      <div className="text-primary mb-4">{icons[icon]}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
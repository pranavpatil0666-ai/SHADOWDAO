import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

export default function Treasury() {
  useWallet();

  const holdings = [
    { asset: 'NIGHT', amount: '1,000,000', usdValue: '$450,000', percentage: '80%', change: '+12.5%' },
    { asset: 'USDC', amount: '125,000', usdValue: '$125,000', percentage: '10%', change: '0.0%' },
    { asset: 'USDT', amount: '75,000', usdValue: '$75,000', percentage: '6%', change: '0.0%' },
    { asset: 'DAI', amount: '50,000', usdValue: '$50,000', percentage: '4%', change: '+0.1%' },
  ];

  const recentTransactions = [
    { type: 'in', asset: 'NIGHT', amount: '50,000', from: 'Protocol Rewards', date: '2024-01-20', hash: '0xabc123...def456' },
    { type: 'out', asset: 'NIGHT', amount: '1,000', to: 'Developer Grant #04', date: '2024-01-18', hash: '0xdef456...abc789' },
    { type: 'in', asset: 'USDC', amount: '25,000', from: 'Treasury Diversification', date: '2024-01-15', hash: '0x789abc...def012' },
    { type: 'out', asset: 'NIGHT', amount: '5,000', to: 'Bug Bounty Payout', date: '2024-01-10', hash: '0x012def...abc345' },
    { type: 'in', asset: 'NIGHT', amount: '100,000', from: 'Initial Funding', date: '2024-01-01', hash: '0x345abc...def678' },
  ];

  const totalValue = '$650,000';

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <header className="p-6 max-w-7xl mx-auto w-full flex justify-between items-center border-b border-white/5">
        <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          ShadowDAO
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
          <Link to="/proposals" className="text-gray-400 hover:text-white transition-colors">Proposals</Link>
          <Link to="/treasury" className="text-primary font-medium">Treasury</Link>
          <Link to="/governance" className="text-gray-400 hover:text-white transition-colors">Governance</Link>
          <Link to="/membership" className="text-gray-400 hover:text-white transition-colors">Membership</Link>
        </nav>
      </header>

      <main className="p-6 max-w-7xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-2">Treasury</h1>
          <p className="text-gray-400">DAO treasury holdings and transaction history</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="glass-panel p-6 border-t-4 border-t-primary">
            <h3 className="text-gray-400 text-sm font-medium">Total Value Locked</h3>
            <p className="text-3xl font-bold mt-2">{totalValue}</p>
            <p className="text-sm text-green-400 mt-1">+12.5% (30d)</p>
          </div>
          <div className="glass-panel p-6 border-t-4 border-t-secondary">
            <h3 className="text-gray-400 text-sm font-medium">NIGHT Holdings</h3>
            <p className="text-3xl font-bold mt-2">1,000,000</p>
            <p className="text-sm text-gray-400 mt-1">~$450,000</p>
          </div>
          <div className="glass-panel p-6 border-t-4 border-t-green-500">
            <h3 className="text-gray-400 text-sm font-medium">Stablecoins</h3>
            <p className="text-3xl font-bold mt-2">$250,000</p>
            <p className="text-sm text-gray-400 mt-1">USDC, USDT, DAI</p>
          </div>
          <div className="glass-panel p-6 border-t-4 border-t-yellow-500">
            <h3 className="text-gray-400 text-sm font-medium">Pending Allocations</h3>
            <p className="text-3xl font-bold mt-2">1,000 NIGHT</p>
            <p className="text-sm text-gray-400 mt-1">Active proposals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Holdings Breakdown</h2>
            </div>
            <div className="space-y-4">
              {holdings.map((holding) => (
                <div key={holding.asset} className="flex items-center justify-between p-4 bg-[#0B0F19]/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {holding.asset.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">{holding.asset}</p>
                      <p className="text-sm text-gray-400">{holding.amount}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{holding.usdValue}</p>
                    <p className="text-sm text-gray-400">{holding.percentage} of portfolio</p>
                    <p className={`text-xs font-medium ${holding.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {holding.change} (24h)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Recent Transactions</h2>
              <Link to="/treasury/transactions" className="text-primary text-sm font-medium hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-[#0B0F19]/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'in' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {tx.type === 'in' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        )}
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">{tx.asset} {tx.type === 'in' ? '+' : '-'}{tx.amount}</p>
                      <p className="text-sm text-gray-400">{tx.from || `To: ${tx.to}`}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">{tx.date}</p>
                    <p className="text-xs font-mono text-gray-500">{tx.hash}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 glass-panel p-6">
          <h2 className="text-xl font-bold mb-4">Treasury Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/create-proposal" className="btn-secondary p-6 text-center hover:bg-primary/20 transition-all">
              <svg className="w-8 h-8 mx-auto mb-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <h3 className="font-bold mb-1">Create Spending Proposal</h3>
              <p className="text-sm text-gray-400">Propose a new treasury allocation</p>
            </Link>
            <Link to="/treasury/diversify" className="btn-secondary p-6 text-center hover:bg-primary/20 transition-all">
              <svg className="w-8 h-8 mx-auto mb-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <h3 className="font-bold mb-1">Diversify Holdings</h3>
              <p className="text-sm text-gray-400">Rebalance treasury allocation</p>
            </Link>
            <Link to="/treasury/rewards" className="btn-secondary p-6 text-center hover:bg-primary/20 transition-all">
              <svg className="w-8 h-8 mx-auto mb-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <h3 className="font-bold mb-1">Claim Rewards</h3>
              <p className="text-sm text-gray-400">Claim protocol rewards</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
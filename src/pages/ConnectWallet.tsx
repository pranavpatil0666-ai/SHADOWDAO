import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

export default function ConnectWallet() {
  const { api, address, error, isConnecting, connect, disconnect, clearError } = useWallet();
  const navigate = useNavigate();

  const handleConnect = async () => {
    await connect();
    if (api && address) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center py-20 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <Link to="/" className="inline-block mb-8">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              ShadowDAO
            </h1>
          </Link>
          <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400">
            Connect your Lace wallet to participate in private governance on Midnight Network.
          </p>
        </div>

        <div className="glass-panel p-8">
          {error && (
            <div className="p-4 mb-6 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm">
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <button onClick={clearError} className="text-red-400 hover:text-red-300">×</button>
              </div>
            </div>
          )}

          {address ? (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-sm text-green-400 font-medium flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                Connected
              </p>
              <p className="text-xs text-gray-400 mt-1 break-all font-mono bg-[#0B0F19] px-3 py-2 rounded-xl border border-white/10">
                {address}
              </p>
              <div className="mt-6 flex gap-4">
                <button
                  onClick={disconnect}
                  className="btn-secondary flex-1"
                >
                  Disconnect
                </button>
                <Link to="/dashboard" className="btn-primary flex-1 text-center">
                  Enter Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <p className="text-gray-400 mb-8">Lace Wallet not connected</p>
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Connecting...
                  </span>
                ) : (
                  'Connect Lace Wallet'
                )}
              </button>
              <p className="text-xs text-gray-500 mt-4 text-center">
                Requires the <a href="https://lace.io/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Lace browser extension</a> with Midnight Network support.
              </p>
            </div>
          )}

          <div className="mt-8 p-4 bg-[#0B0F19]/50 rounded-xl border border-white/5">
            <h4 className="text-sm font-medium text-gray-300 mb-3">How it works:</h4>
            <ol className="space-y-2 text-sm text-gray-400 text-left">
              <li className="flex items-start gap-2"><span className="text-primary font-bold">1.</span> Install Lace wallet extension</li>
              <li className="flex items-start gap-2"><span className="text-primary font-bold">2.</span> Switch to Midnight Preview network</li>
              <li className="flex items-start gap-2"><span className="text-primary font-bold">3.</span> Get tNIGHT from <a href="https://midnight-tmnight-preview.nethermind.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">faucet</a></li>
              <li className="flex items-start gap-2"><span className="text-primary font-bold">4.</span> Click "Connect Lace Wallet" above</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
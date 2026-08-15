interface WalletConnectProps {
  address: string | null;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function WalletConnect({ address, error, onConnect, onDisconnect }: WalletConnectProps) {
  return (
    <div className="p-6 bg-surface/80 backdrop-blur-md rounded-2xl border border-white/10 mb-8 max-w-xl w-full">
      <h2 className="text-xl font-bold mb-4">Midnight Wallet Connection</h2>
      
      {error && (
        <div className="p-3 mb-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          {address ? (
            <div>
              <p className="text-sm text-green-400 font-medium flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                Connected
              </p>
              <p className="text-xs text-gray-400 mt-1 break-all font-mono">{address}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 font-medium">Not Connected</p>
          )}
        </div>

        <div>
          {address ? (
            <button 
              onClick={onDisconnect}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button 
              onClick={onConnect}
              className="bg-primary hover:bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
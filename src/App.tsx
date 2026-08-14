import { useMidnight, TARGET_NETWORK } from './hooks/useMidnight';
import WalletConnect from './components/WalletConnect';
import CircuitCall from './components/CircuitCall';
import './index.css';

const contractAddress = (import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined)?.trim() || '';

function App() {
  const { session, address, walletName, error, isConnecting, connect, disconnect } = useMidnight();

  return (
    <div className="min-h-screen bg-background text-white font-sans flex flex-col items-center py-20 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4">
          ShadowDAO Preview
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Midnight Builder Challenge Level 2 Demo. Vote privately with a locally generated Zero-Knowledge proof.
        </p>
      </div>

      <WalletConnect
        address={address}
        walletName={walletName}
        error={error}
        isConnecting={isConnecting}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      <CircuitCall session={session} contractAddress={contractAddress} />

      <div className="mt-12 text-sm text-gray-500">
        <p className="font-mono break-all">Contract Address: {contractAddress || 'Not set — add VITE_CONTRACT_ADDRESS'}</p>
        <p>Network: Midnight {TARGET_NETWORK}</p>
      </div>
    </div>
  );
}

export default App;
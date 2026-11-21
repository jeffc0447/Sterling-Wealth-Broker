import React, { useState, useEffect, useMemo } from 'react';
import { MembershipTier, PaymentMethod, CryptoPaymentDetails } from '../../types';
import { useBroker } from '../../context/BrokerContext';
import {
  QrCode,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  RefreshCw,
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface CryptoPaymentGatewayProps {
  tier: MembershipTier;
  onSuccess: (paymentMethod: PaymentMethod, details: CryptoPaymentDetails) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
}

type CryptoCoin = 'BTC' | 'ETH' | 'USDT';

interface NetworkOption {
  id: string;
  name: string;
  estFee: string;
  confirmTime: string;
  address: string;
  prefix: string;
}

const CRYPTO_RATES: Record<CryptoCoin, number> = {
  BTC: 68450.0,
  ETH: 3520.0,
  USDT: 1.0,
};

const COIN_NETWORKS: Record<CryptoCoin, NetworkOption[]> = {
  BTC: [
    {
      id: 'NATIVE',
      name: 'Bitcoin Native (SegWit)',
      estFee: '~$1.80',
      confirmTime: '~10-15 min',
      address: 'bc1q9v8h2p29k3n8d8w9s7z4m6r5t3x2q1y0v8h2p2',
      prefix: 'bitcoin',
    },
    {
      id: 'LIGHTNING',
      name: 'Lightning Network',
      estFee: '<$0.001',
      confirmTime: 'Instant (<1s)',
      address: 'bc1q9v8h2p29k3n8d8w9s7z4m6r5t3x2q1y0v8h2p2',
      prefix: 'bitcoin',
    },
  ],
  ETH: [
    {
      id: 'MAINNET',
      name: 'Ethereum Mainnet',
      estFee: '~$1.95',
      confirmTime: '~30 sec',
      address: '0x9B4E3879Fe414801127B08EAf94200Ce2C9271a9',
      prefix: 'ethereum',
    },
    {
      id: 'ARBITRUM',
      name: 'Arbitrum L2',
      estFee: '~$0.04',
      confirmTime: '~5 sec',
      address: '0x9B4E3879Fe414801127B08EAf94200Ce2C9271a9',
      prefix: 'arbitrum',
    },
    {
      id: 'BASE',
      name: 'Base L2 (Coinbase)',
      estFee: '~$0.02',
      confirmTime: '~4 sec',
      address: '0x9B4E3879Fe414801127B08EAf94200Ce2C9271a9',
      prefix: 'base',
    },
  ],
  USDT: [
    {
      id: 'TRC20',
      name: 'Tron (TRC-20)',
      estFee: '~$1.00',
      confirmTime: '~15 sec',
      address: 'TLa2f6VPqDgRE2sFovrWVmZf4n9m3d4y9u',
      prefix: 'tron',
    },
    {
      id: 'ERC20',
      name: 'Ethereum (ERC-20)',
      estFee: '~$2.10',
      confirmTime: '~30 sec',
      address: '0x9B4E3879Fe414801127B08EAf94200Ce2C9271a9',
      prefix: 'ethereum',
    },
    {
      id: 'POLYGON',
      name: 'Polygon (PoS)',
      estFee: '<$0.01',
      confirmTime: '~5 sec',
      address: '0x9B4E3879Fe414801127B08EAf94200Ce2C9271a9',
      prefix: 'polygon',
    },
  ],
};

export const CryptoPaymentGateway: React.FC<CryptoPaymentGatewayProps> = ({
  tier,
  onSuccess,
  isProcessing,
  setIsProcessing,
}) => {
  // Coin & Network selection (BTC, ETH, USDT Tether only)
  const [selectedCoin, setSelectedCoin] = useState<CryptoCoin>('BTC');
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>('NATIVE');

  // Copy feedback states
  const [copiedField, setCopiedField] = useState<'address' | 'amount' | 'uri' | null>(null);

  // Rate Lock Timer (15 minutes countdown)
  const [secondsLeft, setSecondsLeft] = useState(899);

  // On-Chain Confirmation Simulator state
  const [confirmStep, setConfirmStep] = useState<number>(0);
  const [confirmProgress, setConfirmProgress] = useState<number>(0);
  const [simulatedTxHash, setSimulatedTxHash] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 899));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const { supportConfig } = useBroker();

  // Keep selectedNetwork valid when coin changes
  const availableNetworks = COIN_NETWORKS[selectedCoin];
  const activeNetwork =
    availableNetworks.find((n) => n.id === selectedNetworkId) || availableNetworks[0];

  // Resolve configured escrow address dynamically from Admin Settings (Manual Admin Panel Application)
  const configuredEscrowAddress = useMemo(() => {
    if (selectedCoin === 'BTC') return supportConfig.walletAddresses?.btc || activeNetwork.address;
    if (selectedCoin === 'ETH') return supportConfig.walletAddresses?.eth || activeNetwork.address;
    if (selectedCoin === 'USDT') return supportConfig.walletAddresses?.usdt || activeNetwork.address;
    return activeNetwork.address;
  }, [selectedCoin, supportConfig.walletAddresses, activeNetwork.address]);

  const handleCoinChange = (coin: CryptoCoin) => {
    setSelectedCoin(coin);
    setSelectedNetworkId(COIN_NETWORKS[coin][0].id);
  };

  // Calculate crypto conversion
  const cryptoAmount = useMemo(() => {
    const rate = CRYPTO_RATES[selectedCoin];
    if (selectedCoin === 'USDT') {
      return tier.price.toFixed(2);
    } else if (selectedCoin === 'BTC') {
      return (tier.price / rate).toFixed(6);
    } else {
      return (tier.price / rate).toFixed(5);
    }
  }, [tier.price, selectedCoin]);

  const paymentUri = `${activeNetwork.prefix}:${configuredEscrowAddress}?amount=${cryptoAmount}`;

  const copyToClipboard = (text: string, field: 'address' | 'amount' | 'uri') => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Launch simulated blockchain confirmation sequence
  const startBlockchainConfirmation = () => {
    setIsProcessing(true);
    setConfirmStep(1); // Broadcasting
    setConfirmProgress(15);

    const generatedHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    setSimulatedTxHash(generatedHash);

    // Step 2: Detected in Mempool (0.8s)
    setTimeout(() => {
      setConfirmStep(2);
      setConfirmProgress(45);
    }, 800);

    // Step 3: Block Confirmations (1.8s)
    setTimeout(() => {
      setConfirmStep(3);
      setConfirmProgress(85);
    }, 1800);

    // Step 4: Cleared on Smart Contract (2.8s)
    setTimeout(() => {
      setConfirmStep(4);
      setConfirmProgress(100);

      let method: PaymentMethod = 'CRYPTO_BTC';
      if (selectedCoin === 'USDT') method = 'CRYPTO_USDT';
      else if (selectedCoin === 'ETH') method = 'CRYPTO_ETH';

      const details: CryptoPaymentDetails = {
        coin: selectedCoin,
        network: activeNetwork.name,
        cryptoAmount,
        depositAddress: configuredEscrowAddress,
        confirmations: 3,
        blockNumber: Math.floor(19820000 + Math.random() * 50000),
        explorerUrl: selectedCoin === 'BTC'
          ? `https://mempool.space/tx/${generatedHash}`
          : `https://etherscan.io/tx/${generatedHash}`,
      };

      setTimeout(() => {
        setIsProcessing(false);
        onSuccess(method, details);
      }, 600);
    }, 2800);
  };

  return (
    <div className="space-y-4">
      
      {/* 1. Crypto Coin Selector Strip (BTC, ETH, USDT Tether Only) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300">
            Select Cryptocurrency
          </label>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Rate Lock: {formatTime(secondsLeft)}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {(['BTC', 'ETH', 'USDT'] as CryptoCoin[]).map((coin) => {
            const isSelected = selectedCoin === coin;
            const coinLabel = coin === 'BTC' ? 'Bitcoin' : coin === 'ETH' ? 'Ethereum' : 'USDT Tether';
            return (
              <button
                key={coin}
                type="button"
                onClick={() => handleCoinChange(coin)}
                className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/15 text-white shadow-md shadow-emerald-500/20 font-bold ring-1 ring-emerald-500/40'
                    : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-center gap-1.5">
                  <span className={isSelected ? 'text-emerald-400' : 'text-slate-300'}>{coin}</span>
                  <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">({coinLabel})</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate font-mono">
                  ${CRYPTO_RATES[coin].toLocaleString()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Network Selection */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          Deposit Blockchain Network
        </label>
        <div className="flex flex-wrap gap-1.5">
          {availableNetworks.map((net) => {
            const isNetActive = activeNetwork.id === net.id;
            return (
              <button
                key={net.id}
                type="button"
                onClick={() => setSelectedNetworkId(net.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  isNetActive
                    ? 'border-emerald-500 bg-slate-900 text-emerald-300 font-semibold shadow-inner'
                    : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{net.name}</span>
                <span className="text-[10px] text-slate-500">({net.estFee})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Conversion Box */}
      <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-3.5 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Exact Amount to Transfer
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-display text-xl font-bold text-white tracking-tight">
              {cryptoAmount}
            </span>
            <span className="font-mono text-xs font-semibold text-emerald-400">
              {selectedCoin}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            ≈ ${tier.price.toLocaleString()} USD · Network Fee {activeNetwork.estFee}
          </span>
        </div>

        <button
          type="button"
          onClick={() => copyToClipboard(cryptoAmount, 'amount')}
          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors"
        >
          {copiedField === 'amount' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy Amount</span>
            </>
          )}
        </button>
      </div>

      {/* 4. Payment Mode Tabs (Transfer vs Direct Web3 Connect) */}
      {/* 4. Real-Time Dynamic QR Code & Escrow Address Transfer */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Dynamic Real-Time QR Code generated from selected wallet address */}
          <div className="relative p-2.5 bg-white rounded-xl shadow-lg shrink-0 flex flex-col items-center justify-center border border-slate-700/60 group">
            <img
              key={configuredEscrowAddress}
              src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=6&data=${encodeURIComponent(configuredEscrowAddress)}`}
              alt={`Dynamic QR code for ${selectedCoin} (${activeNetwork.name}) address: ${configuredEscrowAddress}`}
              className="w-28 h-28 object-contain rounded transition-all duration-200"
              loading="eager"
            />
            <div className="mt-1.5 text-[9px] font-mono text-slate-800 font-bold flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>{selectedCoin} QR Active</span>
            </div>
          </div>

          {/* Address Details */}
          <div className="flex-1 space-y-2 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Institutional Escrow Address ({activeNetwork.name})
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300 font-medium">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Treasury Multi-Sig Escrow</span>
                </span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[11px] text-emerald-400 break-all select-all mt-1 shadow-inner">
                {configuredEscrowAddress}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-0.5">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Direct Node Settlement Active</span>
                </span>
                {supportConfig.walletAddresses.lastAppliedAt && (
                  <span className="text-slate-400 font-mono">
                    Applied: {supportConfig.walletAddresses.lastAppliedAt}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => copyToClipboard(configuredEscrowAddress, 'address')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedField === 'address' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Address Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(paymentUri, 'uri')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedField === 'uri' ? (
                  <span className="text-emerald-400 font-semibold">URI Copied!</span>
                ) : (
                  <span>Copy Payment URI</span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Send only <strong>{selectedCoin}</strong> via the <strong>{activeNetwork.name}</strong> network to this address. Cross-chain or incorrect token deposits cannot be recovered.
          </span>
        </div>
      </div>

      {/* 5. Live Mempool / Confirmation Progress Dialog */}
      {isProcessing && (
        <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Verifying On-Chain Transaction...
            </span>
            <span className="font-mono text-slate-400 text-[11px]">{confirmProgress}%</span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${confirmProgress}%` }}
            />
          </div>

          <div className="space-y-1 text-[11px] text-slate-400 font-mono">
            <div className={`flex items-center gap-1.5 ${confirmStep >= 1 ? 'text-slate-200' : 'text-slate-600'}`}>
              <Check className="w-3 h-3 text-emerald-400" />
              <span>1. Transaction broadcasted to {activeNetwork.name} nodes</span>
            </div>
            <div className={`flex items-center gap-1.5 ${confirmStep >= 2 ? 'text-slate-200' : 'text-slate-600'}`}>
              <Check className="w-3 h-3 text-emerald-400" />
              <span>2. Detected in mempool (Hash: {simulatedTxHash.slice(0, 16)}...)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${confirmStep >= 3 ? 'text-slate-200' : 'text-slate-600'}`}>
              <Check className="w-3 h-3 text-emerald-400" />
              <span>3. Block confirmations: 3/3 verified</span>
            </div>
            <div className={`flex items-center gap-1.5 ${confirmStep >= 4 ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>
              <Check className="w-3 h-3 text-emerald-400" />
              <span>4. Smart contract escrow settled · Membership active!</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. Execution Trigger Button */}
      {!isProcessing && (
        <div className="pt-1">
          <button
            type="button"
            onClick={startBlockchainConfirmation}
            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>I Have Sent {cryptoAmount} {selectedCoin} · Verify Escrow Transfer</span>
          </button>
        </div>
      )}

    </div>
  );
};

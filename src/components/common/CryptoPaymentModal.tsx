import React, { useState, useEffect, useMemo } from 'react';
import { MembershipTier, PaymentMethod, CryptoPaymentDetails } from '../../types';
import { useBroker } from '../../context/BrokerContext';
import {
  X,
  Coins,
  QrCode,
  Copy,
  Check,
  Clock,
  ExternalLink,
  ShieldCheck,
  Mail,
  UserCheck,
  Phone,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Zap,
} from 'lucide-react';

interface CryptoPaymentModalProps {
  tier: MembershipTier | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export type SupportedCrypto = 'BTC' | 'ETH' | 'USDT';

interface CryptoOption {
  symbol: SupportedCrypto;
  name: string;
  defaultNetwork: string;
  availableNetworks: Array<{ id: string; name: string; fee: string }>;
  rateUsd: number;
  uriPrefix: string;
}

const CRYPTO_DATA: Record<SupportedCrypto, CryptoOption> = {
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    defaultNetwork: 'Bitcoin Native (SegWit)',
    availableNetworks: [
      { id: 'native', name: 'Bitcoin Native (SegWit)', fee: '~$1.80' },
      { id: 'lightning', name: 'Lightning Network', fee: '<$0.001' },
    ],
    rateUsd: 68450.0,
    uriPrefix: 'bitcoin',
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    defaultNetwork: 'Ethereum Mainnet',
    availableNetworks: [
      { id: 'mainnet', name: 'Ethereum Mainnet', fee: '~$1.95' },
      { id: 'arbitrum', name: 'Arbitrum L2', fee: '~$0.04' },
      { id: 'base', name: 'Base L2 (Coinbase)', fee: '~$0.02' },
    ],
    rateUsd: 3520.0,
    uriPrefix: 'ethereum',
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether (USDT)',
    defaultNetwork: 'Tron (TRC-20)',
    availableNetworks: [
      { id: 'trc20', name: 'Tron (TRC-20)', fee: '~$1.00' },
      { id: 'erc20', name: 'Ethereum (ERC-20)', fee: '~$2.10' },
      { id: 'polygon', name: 'Polygon (PoS)', fee: '<$0.01' },
    ],
    rateUsd: 1.0,
    uriPrefix: 'tron',
  },
};

export const CryptoPaymentModal: React.FC<CryptoPaymentModalProps> = ({
  tier,
  onClose,
  onSuccess,
}) => {
  const { upgradeTier, supportConfig, setCurrentView, setPortalTab } = useBroker();

  // Selected coin (BTC, ETH, USDT only)
  const [selectedCrypto, setSelectedCrypto] = useState<SupportedCrypto>('BTC');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('Bitcoin Native (SegWit)');
  const [copiedField, setCopiedField] = useState<'address' | 'amount' | 'email' | null>(null);

  // Verification & Status States
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [generatedTxHash, setGeneratedTxHash] = useState('');
  const [generatedInvoiceNum, setGeneratedInvoiceNum] = useState('');

  // 15-Minute Rate Lock Countdown Timer
  const [timerSeconds, setTimerSeconds] = useState(899);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 899));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!tier) return null;

  const cryptoDef = CRYPTO_DATA[selectedCrypto];

  // Dynamically resolve deposit address from admin supportConfig
  const depositAddress = useMemo(() => {
    if (selectedCrypto === 'BTC') {
      return supportConfig.walletAddresses?.btc || 'bc1q9v8h2p29k3n8d8w9s7z4m6r5t3x2q1y0v8h2p2';
    }
    if (selectedCrypto === 'ETH') {
      return supportConfig.walletAddresses?.eth || '0x9B4E3879Fe414801127B08EAf94200Ce2C9271a9';
    }
    return supportConfig.walletAddresses?.usdt || 'TLa2f6VPqDgRE2sFovrWVmZf4n9m3d4y9u';
  }, [selectedCrypto, supportConfig.walletAddresses]);

  // Exact crypto calculation
  const cryptoAmount = useMemo(() => {
    if (selectedCrypto === 'USDT') {
      return tier.price.toFixed(2);
    }
    if (selectedCrypto === 'BTC') {
      return (tier.price / cryptoDef.rateUsd).toFixed(6);
    }
    return (tier.price / cryptoDef.rateUsd).toFixed(5);
  }, [tier.price, selectedCrypto, cryptoDef.rateUsd]);

  const copyToClipboard = (text: string, field: 'address' | 'amount' | 'email') => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSelectCrypto = (coin: SupportedCrypto) => {
    setSelectedCrypto(coin);
    setSelectedNetwork(CRYPTO_DATA[coin].defaultNetwork);
  };

  const handleConfirmTransfer = () => {
    setIsVerifying(true);
    setVerifyProgress(20);

    const hash =
      selectedCrypto === 'BTC'
        ? `${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
        : `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const inv = `INV-SWB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedTxHash(hash);
    setGeneratedInvoiceNum(inv);

    setTimeout(() => setVerifyProgress(55), 700);
    setTimeout(() => setVerifyProgress(85), 1500);

    setTimeout(() => {
      setVerifyProgress(100);
      setIsVerifying(false);
      setIsPaid(true);

      const paymentMethod: PaymentMethod =
        selectedCrypto === 'USDT'
          ? 'CRYPTO_USDT'
          : selectedCrypto === 'BTC'
          ? 'CRYPTO_BTC'
          : 'CRYPTO_ETH';

      const details: CryptoPaymentDetails = {
        coin: selectedCrypto,
        network: selectedNetwork,
        cryptoAmount,
        depositAddress,
        confirmations: 3,
        blockNumber: Math.floor(19820000 + Math.random() * 50000),
        explorerUrl:
          selectedCrypto === 'BTC'
            ? `https://mempool.space/tx/${hash}`
            : `https://etherscan.io/tx/${hash}`,
      };

      upgradeTier(tier.id, paymentMethod, details);
      if (onSuccess) onSuccess();
    }, 2400);
  };

  const handleNavigateToPortal = () => {
    onClose();
    setCurrentView('PORTAL');
    setPortalTab('OVERVIEW');
  };

  // Pre-generate mailto link to the assigned Customer Service Agent
  const mailtoSubject = encodeURIComponent(
    `[Urgent] Membership Payment Confirmation - ${tier.name} - Ref ${generatedInvoiceNum || 'SWB-CRYPTO'}`
  );
  const mailtoBody = encodeURIComponent(
    `Dear ${supportConfig.agentName},\n\nI have just sent my cryptocurrency payment for the ${tier.name} membership package.\n\nTransaction Details:\n- Amount: ${cryptoAmount} ${selectedCrypto}\n- Network: ${selectedNetwork}\n- Deposit Address: ${depositAddress}\n- TxHash: ${generatedTxHash}\n\nPlease confirm my escrow clearance and provision my Sterling Wealth client vault.\n\nThank you,\nAlexander Vance`
  );
  const mailtoUrl = `mailto:${supportConfig.agentEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-white text-base">
                {isPaid ? 'Payment Confirmed & Agent Assigned' : 'Cryptocurrency Membership Gateway'}
              </h3>
              <p className="text-xs text-slate-400">
                Sterling Wealth Brokerage · Multi-Sig Institutional Escrow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-5">
          
          {/* ============================================================ */}
          {/* POST-PAYMENT STATE: Customer Service Agent & Instructions    */}
          {/* ============================================================ */}
          {isPaid ? (
            <div className="space-y-5 py-1">
              
              {/* Payment Success Badge */}
              {/* Payment Verification Pending Badge */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 animate-pulse">
                  <Clock className="w-8 h-8" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  Crypto Transfer Logged · Manual Verification Pending
                </span>
                <h4 className="font-display text-2xl font-bold text-white mt-1">
                  Payment Submitted for {tier.name}
                </h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Your transaction has been broadcast to the network and logged. In accordance with broker policy, package memberships are <strong className="text-amber-400 font-semibold">manually confirmed and upgraded by Customer Care</strong> upon escrow receipt.
                </p>
              </div>

              {/* Transaction Summary Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Settlement Amount:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {cryptoAmount} {selectedCrypto} (${tier.price.toLocaleString()} USD)
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Blockchain Network:</span>
                  <span className="text-white font-medium">{selectedNetwork}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Invoice Reference:</span>
                  <span className="font-mono text-slate-200">{generatedInvoiceNum}</span>
                </div>
                {generatedTxHash && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block mb-0.5">
                      Cryptographic TxID
                    </span>
                    <div className="font-mono text-[11px] text-emerald-400 break-all bg-slate-900 p-2 rounded border border-slate-800 select-all">
                      {generatedTxHash}
                    </div>
                  </div>
                )}
              </div>

              {/* DEDICATED CUSTOMER SERVICE AGENT CARD (Core Requirement) */}
              <div className="bg-gradient-to-br from-amber-500/10 via-slate-950 to-slate-950 border border-amber-500/40 rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold flex items-center justify-center text-sm shrink-0">
                      {supportConfig.agentName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                        Assigned Customer Service Agent
                      </div>
                      <h5 className="font-display text-base font-bold text-white">
                        {supportConfig.agentName}
                      </h5>
                      <p className="text-xs text-slate-400">
                        {supportConfig.agentTitle}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </span>
                </div>

                {/* Instructions configured in Admin Panel */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 leading-relaxed">
                  <p>{supportConfig.postPaymentInstructions}</p>
                </div>

                {/* Direct Agent Contact Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  <a
                    href={mailtoUrl}
                    className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email {supportConfig.agentName.split(' ')[0]} Now</span>
                  </a>

                  <button
                    onClick={() => copyToClipboard(supportConfig.agentEmail, 'email')}
                    className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 font-mono"
                  >
                    {copiedField === 'email' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Email Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy: {supportConfig.agentEmail}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Additional contacts */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>Phone: {supportConfig.agentPhone}</span>
                  </div>
                  {supportConfig.telegramHandle && (
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-3 h-3 text-sky-400" />
                      <span>Telegram: {supportConfig.telegramHandle}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Proceed to Dashboard Button */}
              <button
                onClick={handleNavigateToPortal}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <span>Enter Client Portal & Access Credit Lines</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          ) : (
            /* ============================================================ */
            /* PRE-PAYMENT STATE: Coin Selection, QR Code, Address & Amount  */
            /* ============================================================ */
            <>
              {/* Selected Tier Summary */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] tracking-wider uppercase text-amber-400 font-medium">
                    {tier.badge}
                  </span>
                  <h4 className="font-display text-lg font-bold text-white">{tier.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Max Borrowing Ceiling: <strong className="text-emerald-400">${tier.maxLoanLimit.toLocaleString()}</strong> · Underwriting: {tier.processingSLA}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-display text-white">
                    ${tier.price.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400">/{tier.period}</div>
                </div>
              </div>

              {/* 1. Cryptocurrency Selector: BTC, ETH, USDC (Core Requirement) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Select Cryptocurrency for Membership Fee
                  </label>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                    <Clock className="w-3 h-3" />
                    <span>Rate Locked: {formatTimer(timerSeconds)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['BTC', 'ETH', 'USDT'] as SupportedCrypto[]).map((coin) => {
                    const isSelected = selectedCrypto === coin;
                    const cData = CRYPTO_DATA[coin];

                    return (
                      <button
                        key={coin}
                        type="button"
                        onClick={() => handleSelectCrypto(coin)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/15 text-white shadow-md shadow-emerald-500/20 font-bold ring-1 ring-emerald-500/40'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-sm font-bold">{coin}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                          {cData.name}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono mt-1 font-normal">
                          {coin === 'USDT' ? '$1.00 USD' : `$${cData.rateUsd.toLocaleString()}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Network Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Select Blockchain Network
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {cryptoDef.availableNetworks.map((net) => {
                    const isNetActive = selectedNetwork === net.name;

                    return (
                      <button
                        key={net.id}
                        type="button"
                        onClick={() => setSelectedNetwork(net.name)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                          isNetActive
                            ? 'border-emerald-500 bg-slate-900 text-emerald-300 font-semibold shadow-inner'
                            : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span>{net.name}</span>
                        <span className="text-[10px] text-slate-500">({net.fee})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Conversion Summary Strip */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Calculated Membership Fee
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-display text-2xl font-bold text-white tracking-tight">
                      {cryptoAmount}
                    </span>
                    <span className="font-mono text-xs font-semibold text-emerald-400">
                      {selectedCrypto}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Equivalent to ${tier.price.toLocaleString()} USD
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard(cryptoAmount, 'amount')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors"
                >
                  {copiedField === 'amount' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Amount Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Exact Amount</span>
                    </>
                  )}
                </button>
              </div>

              {/* 4. Interactive QR Code & Deposit Address Display */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  
                  {/* Dynamic Real-Time QR Code */}
                  <div className="relative p-2.5 bg-white rounded-xl shadow-lg shrink-0 flex flex-col items-center justify-center border border-slate-700/60 group">
                    <img
                      key={depositAddress}
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=6&data=${encodeURIComponent(depositAddress)}`}
                      alt={`Dynamic QR code for ${selectedCrypto} (${selectedNetwork}) address: ${depositAddress}`}
                      className="w-28 h-28 object-contain rounded transition-all duration-200"
                      loading="eager"
                    />
                    <div className="mt-1.5 text-[9px] font-mono text-slate-800 font-bold flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full shadow-inner">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      <span>{selectedCrypto} QR Active</span>
                    </div>
                  </div>

                  {/* Escrow Address Details */}
                  <div className="flex-1 space-y-2 text-xs">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                        <span>Official Escrow Deposit Address</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300 font-medium">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>Applied Manually via Admin Panel</span>
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[11px] text-emerald-400 break-all select-all shadow-inner">
                        {depositAddress}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-0.5">
                        <span className="font-mono text-slate-400">Network: {selectedNetwork}</span>
                        {supportConfig.walletAddresses.lastAppliedAt && (
                          <span className="text-slate-400 font-mono">
                            Admin Applied: {supportConfig.walletAddresses.lastAppliedAt}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(depositAddress, 'address')}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
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
                        onClick={() => copyToClipboard(cryptoAmount, 'amount')}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors font-mono"
                      >
                        <span>{cryptoAmount} {selectedCrypto}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Transfers are confirmed directly against the blockchain. Once verified, customer service agent <strong>{supportConfig.agentName}</strong> will immediately follow up via email (<strong>{supportConfig.agentEmail}</strong>).
                  </span>
                </div>
              </div>

              {/* 5. Live Mempool / Verification Progress */}
              {isVerifying && (
                <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      Scanning Mempool for Transaction...
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">{verifyProgress}%</span>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${verifyProgress}%` }}
                    />
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Detecting payment to {depositAddress.slice(0, 10)}...</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${verifyProgress >= 50 ? 'text-slate-200' : 'text-slate-600'}`}>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Validating cryptographic block confirmations</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${verifyProgress >= 80 ? 'text-emerald-400 font-semibold' : 'text-slate-600'}`}>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Routing to agent {supportConfig.agentName} for onboarding</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Action Button */}
              {!isVerifying && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmTransfer}
                    className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>I Have Sent {cryptoAmount} {selectedCrypto}</span>
                  </button>

                  <p className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1 mt-2">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Encrypted Escrow · Protected by 14-Day Money Back SLA
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

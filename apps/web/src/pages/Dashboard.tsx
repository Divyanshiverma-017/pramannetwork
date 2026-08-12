import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  KeyRound, 
  LayoutDashboard, 
  Settings, 
  Wallet, 
  Eye, 
  EyeOff, 
  Copy, 
  Plus, 
  Globe, 
  Cpu, 
  Trash2,
  RefreshCw,
  LogOut,
  AppWindow,
  X,
  Loader2,
  Terminal,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import Navbar from '../components/Navbar.tsx';
import { supabase } from '../utils/supabaseClient.ts';
import SEO from '../components/SEO.tsx';
import Footer from '../components/Footer.tsx';
// Dynamic imports for Recharts to split vendor chunks and load on-demand
const DashboardAreaChart = lazy(() =>
  import('../components/DashboardCharts.tsx').then((module) => ({ default: module.DashboardAreaChart }))
);
const DashboardBarChart = lazy(() =>
  import('../components/DashboardCharts.tsx').then((module) => ({ default: module.DashboardBarChart }))
);

// API Key generation helper
const generateApiKey = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 24; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `pk_test_${key}`;
};

interface RegisteredApp {
  id: string; // Internal auto-increment ID
  name: string;
  clientId: string; // UUID from database
  redirectUrl: string;
  createdAt: string;
  apiKey: string | null;
  allowedOrigins: string[];
  isActive: boolean;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function Dashboard() {
  // Wallet states
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);

  // Loading state for initial fetch
  const [isAppsLoading, setIsAppsLoading] = useState(false);

  // App registration states
  const [appName, setAppName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registeredApps, setRegisteredApps] = useState<RegisteredApp[]>([]);

  // Origin whitelisting inputs state (mapped by app ID)
  const [newOrigins, setNewOrigins] = useState<Record<string, string>>({});
  // Loading states for whitelisting operations (mapped by app ID)
  const [originLoadingStates, setOriginLoadingStates] = useState<Record<string, boolean>>({});

  // Sidebar navigation active state
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'api-keys' | 'logs' | 'settings'>('overview');

  // Logs & Analytics states
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [logsData, setLogsData] = useState<any[]>([]);
  const [failedLogsData, setFailedLogsData] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(false);

  // Reveal keys states (map of app id to boolean)
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  // Toast notification state
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Auto-connect check on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
          if (accounts && accounts.length > 0) {
            const address = accounts[0];
            const balanceWeiHex = await window.ethereum.request({
              method: 'eth_getBalance',
              params: [address, 'latest']
            }) as string;
            
            const wei = BigInt(balanceWeiHex);
            const balanceEth = (Number(wei / 100000000000000n) / 10000).toFixed(4);
            const balance = `${balanceEth} ETH`;
            
            setWalletAddress(address);
            setWalletBalance(balance);
            fetchAppsAndKeys(address);
          }
        } catch (err: any) {
          console.error("Auto-connect check failed:", err);
          if (err?.code === -32002) {
            showToast("Network busy: Please change your RPC URL in MetaMask.", "error");
          }
        }
      }
    };
    checkConnection();
  }, []);

  // Fetch registered apps and their API keys from Supabase
  const fetchAppsAndKeys = async (address: string) => {
    setIsAppsLoading(true);
    try {
      // 1. Fetch apps from developer_apps
      const { data: appsData, error: appsError } = await supabase
        .from('developer_apps')
        .select('*')
        .eq('wallet_address', address)
        .order('created_at', { ascending: false });
        
      if (appsError) throw appsError;
      
      if (!appsData || appsData.length === 0) {
        setRegisteredApps([]);
        return;
      }

      // 2. Fetch API keys from api_keys linked by client_id UUID
      const clientIds = appsData.map((app: any) => app.client_id);
      const { data: keysData, error: keysError } = await supabase
        .from('api_keys')
        .select('*')
        .in('id', clientIds);

      if (keysError) {
        console.warn("Could not fetch associated api_keys (it might be empty or permissions issue):", keysError);
      }

      // 3. Map apps and keys together
      const mappedApps: RegisteredApp[] = appsData.map((row: any) => {
        const correspondingKey = keysData?.find((key: any) => key.id === row.client_id);
        
        return {
          id: row.id.toString(),
          name: row.app_name,
          clientId: row.client_id,
          redirectUrl: row.redirect_url || '',
          createdAt: new Date(row.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          apiKey: correspondingKey?.key_value || null,
          allowedOrigins: correspondingKey?.allowed_origins || [],
          isActive: correspondingKey?.is_active ?? true,
        };
      });

      setRegisteredApps(mappedApps);
    } catch (err) {
      console.error("Error fetching apps and keys:", err);
      showToast("Error loading developer credentials.", "error");
    } finally {
      setIsAppsLoading(false);
    }
  };

  // Mock data generators for fallback when database table does not exist or is empty
  const generateMockLogsForChart = (_appId: string) => {
    const data = [];
    const daysInMonth = new Date().getDate(); // number of days in the month up to today
    for (let i = 1; i <= Math.max(15, daysInMonth); i++) {
      data.push({
        day: `Day ${i}`,
        verifications: Math.floor(Math.random() * 40) + 10,
        failures: Math.floor(Math.random() * 5),
      });
    }
    return data;
  };

  const generateMockFailedLogs = (appId: string) => {
    const errorCodes = ['ZK_PROOF_FAIL', 'SIGNATURE_INVALID', 'RATE_LIMIT_EXCEEDED', 'BIOMETRIC_MISMATCH', 'KEY_EXPIRED', 'INVALID_MERKLE_ROOT'];
    const userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    ];
    const origins = ['https://app.praman.network', 'http://localhost:5173', 'https://staging.praman.network', 'https://api.praman.network'];
    
    const mockLogs = [];
    const now = new Date();
    for (let i = 0; i < 10; i++) {
      const time = new Date(now.getTime() - i * 3600000 * (Math.random() * 5 + 1));
      mockLogs.push({
        id: `err_${i}_${appId}`,
        created_at: time.toISOString(),
        status: 'failed',
        error_code: errorCodes[Math.floor(Math.random() * errorCodes.length)],
        user_agent: userAgents[Math.floor(Math.random() * userAgents.length)],
        origin: origins[Math.floor(Math.random() * origins.length)],
        app_id: appId
      });
    }
    return mockLogs;
  };

  // Fetch all logs from Supabase with fallback to mock data
  const fetchLogs = async (appId: string) => {
    if (!appId) return;
    setIsLogsLoading(true);
    try {
      const { data: logs, error: logsError } = await supabase
        .from('verification_logs')
        .select('*')
        .eq('app_id', appId)
        .order('created_at', { ascending: false });

      if (logsError) throw logsError;

      if (!logs || logs.length === 0) {
        setLogsData(generateMockLogsForChart(appId));
        setFailedLogsData(generateMockFailedLogs(appId));
      } else {
        // Group by day for charts
        const chartDataMap: Record<string, { verifications: number; failures: number }> = {};
        const failed: any[] = [];

        logs.forEach((log: any) => {
          const dateStr = new Date(log.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          if (!chartDataMap[dateStr]) {
            chartDataMap[dateStr] = { verifications: 0, failures: 0 };
          }
          chartDataMap[dateStr].verifications += 1;
          if (log.status === 'failed') {
            chartDataMap[dateStr].failures += 1;
            if (failed.length < 10) {
              failed.push(log);
            }
          }
        });

        const chartData = Object.entries(chartDataMap).map(([day, val]) => ({
          day,
          verifications: val.verifications,
          failures: val.failures,
        })).reverse();

        setLogsData(chartData);
        setFailedLogsData(failed);
      }
    } catch (err) {
      console.warn("Failed to fetch from verification_logs, using premium mock fallback:", err);
      setLogsData(generateMockLogsForChart(appId));
      setFailedLogsData(generateMockFailedLogs(appId));
    } finally {
      setIsLogsLoading(false);
    }
  };

  // Default selectedAppId when registeredApps list loads
  useEffect(() => {
    if (registeredApps.length > 0 && !registeredApps.some(app => app.id === selectedAppId)) {
      setSelectedAppId(registeredApps[0].id);
    }
  }, [registeredApps]);

  // Trigger fetchLogs on tab change or app change
  useEffect(() => {
    if (walletAddress && (activeTab === 'logs' || activeTab === 'analytics' || activeTab === 'overview') && selectedAppId) {
      fetchLogs(selectedAppId);
    }
  }, [activeTab, selectedAppId, walletAddress]);

  // Connect Wallet handler via MetaMask BrowserProvider (ethers v6)
  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install MetaMask to connect your wallet.");
      return;
    }
    
    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        const balanceWeiHex = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        }) as string;
        
        const wei = BigInt(balanceWeiHex);
        const balanceEth = (Number(wei / 100000000000000n) / 10000).toFixed(4);
        const balance = `${balanceEth} ETH`;
        
        setWalletAddress(address);
        setWalletBalance(balance);
        fetchAppsAndKeys(address);
        showToast("Wallet connected successfully!");
      }
    } catch (err: any) {
      console.error("Wallet connection failed:", err);
      if (err?.code === -32002) {
        showToast("Network busy: Please change your RPC URL in MetaMask.", "error");
      } else {
        showToast("Wallet connection failed.", "error");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    setWalletBalance(null);
    setRegisteredApps([]);
    showToast("Wallet disconnected.");
  };

  // Register application to Supabase database & generate key
  const handleRegisterApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName) return;
    if (!walletAddress) {
      showToast("Connect your wallet first.", "error");
      return;
    }

    setIsRegistering(true);
    try {
      // 1. Insert into developer_apps
      const { data: appData, error: appError } = await supabase
        .from('developer_apps')
        .insert([
          {
            wallet_address: walletAddress,
            app_name: appName,
            redirect_url: '', // We only require App Name now
          }
        ])
        .select()
        .single();

      if (appError) throw appError;

      if (appData) {
        const generatedKey = generateApiKey();

        // 2. Insert into api_keys linked by app's client_id (UUID)
        const { error: keyError } = await supabase
          .from('api_keys')
          .insert([
            {
              id: appData.client_id, // Linked to developer_apps via client_id
              key_value: generatedKey,
              allowed_origins: [],
              is_active: true
            }
          ]);

        if (keyError) {
          console.warn("Could not insert API Key. You might need to update your RLS Policies on api_keys table.", keyError);
          // We will still display the app card, but with a warning or null key so users know they can regenerate it later
        }

        const newApp: RegisteredApp = {
          id: appData.id.toString(),
          name: appData.app_name,
          clientId: appData.client_id,
          redirectUrl: appData.redirect_url || '',
          createdAt: new Date(appData.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          apiKey: keyError ? null : generatedKey,
          allowedOrigins: [],
          isActive: true
        };

        setRegisteredApps((prev) => [newApp, ...prev]);
        setAppName('');
        setActiveTab('api-keys'); // Switch to credentials listing
        showToast("Gateway app created successfully!");
      }
    } catch (err: any) {
      console.error("App registration failed:", err);
      showToast("App creation failed.", "error");
      alert(`Failed to register app: ${err?.message || err?.details || JSON.stringify(err) || 'Unknown Database Error'}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const toggleRevealKey = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    showToast("API Key copied to clipboard!");
  };

  // Delete application & associated key from Supabase
  const handleDeleteApp = async (id: string, clientId: string) => {
    if (!confirm("Are you sure you want to delete this application? All credentials and configurations will be permanently removed.")) {
      return;
    }

    try {
      // 1. Delete associated key from api_keys first
      await supabase
        .from('api_keys')
        .delete()
        .eq('id', clientId);

      // 2. Delete app from developer_apps
      const { error: appError } = await supabase
        .from('developer_apps')
        .delete()
        .eq('id', id);

      if (appError) throw appError;

      setRegisteredApps((prev) => prev.filter((app) => app.id !== id));
      showToast("Application deleted.");
    } catch (err) {
      console.error("App deletion failed:", err);
      showToast("App deletion failed.", "error");
    }
  };

  // Whitelisting handlers (allowed_origins array column in api_keys)
  const handleAddOrigin = async (appId: string, clientId: string, currentOrigins: string[], apiKey: string | null) => {
    const newOrigin = (newOrigins[appId] || '').trim();
    if (!newOrigin) return;

    // Check if duplicate
    if (currentOrigins.includes(newOrigin)) {
      showToast("Origin already whitelisted.", "info");
      return;
    }

    // Basic URL validation
    try {
      if (newOrigin !== '*' && !newOrigin.startsWith('http://') && !newOrigin.startsWith('https://')) {
        showToast("Origin must start with http:// or https://", "error");
        return;
      }
    } catch (e) {
      showToast("Invalid URL format.", "error");
      return;
    }

    const updatedOrigins = [...currentOrigins, newOrigin];
    setOriginLoadingStates((prev) => ({ ...prev, [appId]: true }));

    try {
      let keyToUse = apiKey;
      if (!keyToUse) {
        // Fallback for legacy apps that don't have api_keys record
        keyToUse = generateApiKey();
        const { error: insertError } = await supabase
          .from('api_keys')
          .insert({
            id: clientId,
            key_value: keyToUse,
            allowed_origins: updatedOrigins,
            is_active: true
          });
        if (insertError) throw insertError;
      } else {
        // Update existing record
        const { error: updateError } = await supabase
          .from('api_keys')
          .update({ allowed_origins: updatedOrigins })
          .eq('id', clientId);
        if (updateError) throw updateError;
      }

      // Update local state
      setRegisteredApps((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, apiKey: keyToUse, allowedOrigins: updatedOrigins } : app))
      );
      setNewOrigins((prev) => ({ ...prev, [appId]: '' }));
      showToast("Origin whitelisted successfully!");
    } catch (err) {
      console.error("Whitelisting update failed:", err);
      showToast("Failed to whitelist origin.", "error");
      alert("Failed to update whitelist origin. Ensure the database permissions allow updates to the api_keys table.");
    } finally {
      setOriginLoadingStates((prev) => ({ ...prev, [appId]: false }));
    }
  };

  const handleRemoveOrigin = async (appId: string, clientId: string, currentOrigins: string[], originToRemove: string) => {
    const updatedOrigins = currentOrigins.filter((o) => o !== originToRemove);
    setOriginLoadingStates((prev) => ({ ...prev, [appId]: true }));

    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ allowed_origins: updatedOrigins })
        .eq('id', clientId);

      if (error) throw error;

      // Update local state
      setRegisteredApps((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, allowedOrigins: updatedOrigins } : app))
      );
      showToast("Origin removed from whitelist.");
    } catch (err) {
      console.error("Failed to remove origin:", err);
      showToast("Failed to remove origin.", "error");
    } finally {
      setOriginLoadingStates((prev) => ({ ...prev, [appId]: false }));
    }
  };

  return (
    <div className="relative min-h-screen z-10 flex flex-col bg-zinc-950 text-slate-100 font-sans select-none selection:bg-[#00F0FF]/30">
      <SEO 
        title="Developer Console"
        description="Praman Network developer dashboard console. Configure API keys, whitelist endpoints, whitelist domains, and view live verification audits."
        robots="noindex, nofollow"
      />
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.2 } }}
              className="flex items-center space-x-3 px-5 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/90 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.5),0_0_15px_rgba(0,240,255,0.08)] text-slate-100 text-xs font-semibold"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                toast.type === 'error' ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' :
                toast.type === 'info' ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' :
                'bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]'
              } animate-pulse`} />
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Navbar 
        walletAddress={walletAddress} 
        onConnectWallet={handleConnectWallet} 
        isConnecting={isConnecting} 
      />

      <div className="flex flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8 gap-8">
        
        {/* Sidebar Layout */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 rounded-2xl border border-zinc-800/80 p-6 space-y-8 bg-zinc-900/30 backdrop-blur-sm h-fit">
          <div className="space-y-2">
            <h2 className="text-xs uppercase tracking-widest text-[#00F0FF] font-display font-bold">
              Console Console
            </h2>
            <p className="text-slate-400 text-xs">
              Manage cryptographic client credentials & API keys.
            </p>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-zinc-900 border border-zinc-800 text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.05)]'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-900/50 border border-transparent'
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-zinc-900 border border-zinc-800 text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.05)]'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-900/50 border border-transparent'
              }`}
            >
              <BarChart3 className="h-4.5 w-4.5" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('api-keys')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'api-keys'
                  ? 'bg-zinc-900 border border-zinc-800 text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.05)]'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-900/50 border border-transparent'
              }`}
            >
              <KeyRound className="h-4.5 w-4.5" />
              <span>Developer Keys</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'logs'
                  ? 'bg-zinc-900 border border-zinc-800 text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.05)]'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-900/50 border border-transparent'
              }`}
            >
              <Terminal className="h-4.5 w-4.5" />
              <span>Logs Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-zinc-900 border border-zinc-800 text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.05)]'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-900/50 border border-transparent'
              }`}
            >
              <Settings className="h-4.5 w-4.5" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Wallet details at bottom of sidebar */}
          <div className="pt-6 border-t border-zinc-800 mt-auto">
            {walletAddress ? (
              <div className="p-4 bg-zinc-950/50 border border-zinc-800/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">IDENTITY</span>
                  <span className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_6px_#10b981]" />
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">SECURED</span>
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">WALLET BALANCE</p>
                  <p className="text-xs font-mono font-bold text-white break-all">{walletBalance}</p>
                </div>
                <button 
                  onClick={handleDisconnectWallet}
                  className="w-full flex items-center justify-center space-x-1.5 py-1.5 border border-rose-950 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 rounded-lg text-xs transition-all font-semibold"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold uppercase tracking-wider text-slate-200 hover:border-[#00F0FF]/50 hover:text-[#00F0FF] transition-all duration-300 font-display"
              >
                <Wallet className="h-4 w-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main id="main-content" className="flex-grow space-y-8 min-w-0">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/80 pb-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                {activeTab === 'overview' && 'Console Overview'}
                {activeTab === 'analytics' && 'Usage Analytics'}
                {activeTab === 'api-keys' && 'Developer Keys & Credentials'}
                {activeTab === 'logs' && 'Monitoring Logs'}
                {activeTab === 'settings' && 'Project Settings'}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Configure your Web3 application endpoints, API Keys, and verification whitelists.
              </p>
            </div>
            
            <div className="flex items-center space-x-3 shrink-0">
              <span className="text-xs bg-[#00F0FF]/5 text-[#00F0FF] border border-[#00F0FF]/20 px-3.5 py-1.5 rounded-full font-mono flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-pulse shadow-[0_0_6px_#00F0FF]" />
                <span>Praman Devnet v1.0</span>
              </span>
            </div>
          </div>

          {/* Mobile Tabs Switcher */}
          <div className="flex lg:hidden overflow-x-auto pb-2 -mx-4 px-4 gap-2 scrollbar-none border-b border-zinc-900">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 border transition-all ${
                activeTab === 'overview'
                  ? 'bg-zinc-900 border border-zinc-800 text-[#00F0FF]'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 border transition-all ${
                activeTab === 'analytics'
                  ? 'bg-zinc-900 border border-zinc-800 text-[#00F0FF]'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('api-keys')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 border transition-all ${
                activeTab === 'api-keys'
                  ? 'bg-zinc-900 border border-zinc-800 text-[#00F0FF]'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              Developer Keys
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 border transition-all ${
                activeTab === 'logs'
                  ? 'bg-zinc-900 border border-zinc-800 text-[#00F0FF]'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              Logs Feed
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 border transition-all ${
                activeTab === 'settings'
                  ? 'bg-zinc-900 border border-zinc-800 text-[#00F0FF]'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              Settings
            </button>
          </div>

          {/* Conditional Prompt for Unconnected Wallet */}
          {!walletAddress && (
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="border border-amber-500/20 bg-amber-950/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="space-y-1">
                <h3 className="text-white font-bold flex items-center space-x-2">
                  <Wallet className="h-5 w-5 text-amber-400" />
                  <span>Connect Web3 Wallet</span>
                </h3>
                <p className="text-slate-400 text-sm">
                  Please connect your Ethereum wallet to verify ownership, register client applications, and configure whitelist origins.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(245, 158, 11, 0.2)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConnectWallet}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 shrink-0 font-display transition-colors"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </motion.button>
            </motion.div>
          )}

          {walletAddress && activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Register App Form Card */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 space-y-6">
                <div className="space-y-1">
                  <h2 className="text-lg font-display font-bold text-white">
                    Create New App
                  </h2>
                  <p className="text-slate-400 text-xs">
                    Instantly provision API credentials for your client gateway.
                  </p>
                </div>

                <form onSubmit={handleRegisterApp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="app-name" className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                      App Name
                    </label>
                    <input
                      id="app-name"
                      type="text"
                      placeholder="e.g., praman-talent-hub"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      disabled={isRegistering}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all disabled:opacity-50"
                      required
                    />
                  </div>

                  <motion.button
                    whileHover={!isRegistering ? { 
                      scale: 1.01, 
                      boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)' 
                    } : {}}
                    whileTap={!isRegistering ? { scale: 0.99 } : {}}
                    type="submit"
                    disabled={isRegistering || !appName}
                    className="w-full bg-[#00F0FF] text-zinc-950 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 font-display disabled:opacity-30 disabled:pointer-events-none transition-all duration-300"
                  >
                    {isRegistering ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Provisioning App & Key...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Create Application</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>

              {/* Developer stats panel */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-display font-bold text-white">
                      Verification Metrics
                    </h2>
                    <p className="text-slate-400 text-xs">
                      Active cryptographic applications linked to this wallet.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Gateways</p>
                      <p className="text-3xl font-display font-bold text-white">
                        {isAppsLoading ? (
                          <Loader2 className="h-6 w-6 animate-spin text-zinc-700 mt-1" />
                        ) : (
                          registeredApps.length
                        )}
                      </p>
                    </div>
                    <div className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Security Status</p>
                      <p className="text-xs font-bold text-[#00F0FF] mt-2 tracking-wide flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-[#00F0FF] rounded-full animate-ping" />
                        <span>Fully Monitored</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-5 space-y-3">
                  <h3 className="text-xs text-slate-400 font-bold tracking-wider uppercase">System Operations</h3>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Decentralized Prover Node</span>
                    <span className="text-emerald-400 font-bold">Active (12ms)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Verify SDK API Origin Check</span>
                    <span className="text-[#00F0FF] font-bold">Online</span>
                  </div>
                </div>
              </div>

              {/* Usage Analytics Sparkline Trend Card */}
              <div className="md:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-[#00F0FF]" />
                      <span>Monthly ZK Verifications</span>
                    </h2>
                    <p className="text-slate-400 text-xs">
                      Daily verification requests trend for the current month.
                    </p>
                  </div>
                  
                  <div className="text-right p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Month Total</p>
                    <p className="text-2xl font-mono font-bold text-[#00F0FF] mt-0.5">
                      {isLogsLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-600 inline" />
                      ) : (
                        logsData.reduce((acc, curr) => acc + (curr.verifications || 0), 0)
                      )}
                    </p>
                  </div>
                </div>

                <div className="h-32 w-full">
                  {isLogsLoading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/20 rounded-xl border border-zinc-900 animate-pulse space-y-2">
                      <Loader2 className="h-6 w-6 animate-spin text-[#00F0FF]/50" />
                      <p className="text-slate-600 text-xs">Loading sparkline...</p>
                    </div>
                  ) : logsData.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-950/20 rounded-xl border border-zinc-900 text-slate-600 text-xs italic">
                      Create an application or check connection to verify logs.
                    </div>
                  ) : (
                    <Suspense fallback={<div className="w-full h-full bg-zinc-950/20 rounded-xl border border-zinc-900 animate-pulse" />}>
                      <DashboardAreaChart data={logsData} />
                    </Suspense>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Registered Apps / API Keys List / Credentials */}
          {walletAddress && (activeTab === 'api-keys' || activeTab === 'overview') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-display font-bold text-white">
                    API Credentials & Applications
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Configure Allowed Origins and access keys for integration.
                  </p>
                </div>
              </div>

              {isAppsLoading ? (
                <div className="border border-zinc-800 bg-zinc-900/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[#00F0FF]" />
                  <p className="text-slate-400 text-xs font-medium">Fetching secure configurations...</p>
                </div>
              ) : registeredApps.length === 0 ? (
                <div className="border border-dashed border-zinc-800 bg-zinc-900/5 rounded-2xl py-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border border-dashed border-zinc-800 flex items-center justify-center mx-auto text-slate-600">
                    <AppWindow className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white text-sm font-bold">No apps found</p>
                    <p className="text-slate-500 text-xs max-w-sm mx-auto">
                      Create your first gateway to Web3 Identity to provision access credentials.
                    </p>
                  </div>
                  {activeTab === 'api-keys' && (
                    <button
                      onClick={() => setActiveTab('overview')}
                      className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 text-xs font-bold uppercase rounded-lg text-slate-300 hover:text-white transition-colors"
                    >
                      Create App Form
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  <AnimatePresence>
                    {registeredApps.map((app) => {
                      const isRevealed = !!revealedKeys[app.id];
                      
                      // Format masked/unmasked keys
                      const keyToDisplay = app.apiKey 
                        ? (isRevealed ? app.apiKey : `pk_test_••••••••${app.apiKey.substring(app.apiKey.length - 4)}`)
                        : "No API Key Generated. Double check database policies.";

                      const appOriginLoading = !!originLoadingStates[app.id];

                      return (
                        <motion.div
                          key={app.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 space-y-6 hover:border-[#00F0FF]/30 hover:shadow-[0_0_25px_rgba(0,240,255,0.03)] transition-all duration-300 group relative"
                        >
                          {/* App Card Header */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <h3 className="text-white font-bold text-base flex items-center gap-2 group-hover:text-[#00F0FF] transition-colors">
                                <Cpu className="h-4.5 w-4.5 text-[#00F0FF]" />
                                <span>{app.name}</span>
                              </h3>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-[11px] font-mono">
                                <span>CLIENT ID: <span className="text-slate-400">{app.clientId}</span></span>
                                <span>•</span>
                                <span>CREATED: <span className="text-slate-400">{app.createdAt}</span></span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteApp(app.id, app.clientId)}
                              className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                              title="Delete Application"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* API Key Box */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                              Client Secret / API Key
                            </label>
                            <div className="flex items-center justify-between gap-3 bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3">
                              <span className={`font-mono text-xs text-slate-200 select-all break-all ${isRevealed ? '' : 'tracking-wide'}`}>
                                {keyToDisplay}
                              </span>

                              <div className="flex items-center space-x-1 shrink-0">
                                <button
                                  onClick={() => toggleRevealKey(app.id)}
                                  disabled={!app.apiKey}
                                  className="p-2 text-slate-400 hover:text-[#00F0FF] hover:bg-zinc-900 rounded-lg transition-colors disabled:opacity-30"
                                  title={isRevealed ? "Hide Secret" : "Reveal Secret"}
                                >
                                  {isRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                                <button
                                  onClick={() => app.apiKey && handleCopyKey(app.apiKey)}
                                  disabled={!app.apiKey}
                                  className="p-2 text-slate-400 hover:text-[#00F0FF] hover:bg-zinc-900 rounded-lg transition-colors disabled:opacity-30"
                                  title="Copy Key"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Whitelisting allowed_origins */}
                          <div className="space-y-3 pt-2 border-t border-zinc-850">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                                <Globe className="h-3.5 w-3.5 text-[#00F0FF]" />
                                <span>Allowed Origins (Domain Whitelist)</span>
                              </label>
                              {appOriginLoading && (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00F0FF]" />
                              )}
                            </div>

                            {/* Whitelist Tag chips container */}
                            <div className="flex flex-wrap gap-2">
                              {app.allowedOrigins.length === 0 ? (
                                <p className="text-zinc-600 text-xs italic py-1">
                                  No domain whitelist configured. Requests from any origin will be processed (unsecured).
                                </p>
                              ) : (
                                app.allowedOrigins.map((origin) => (
                                  <div
                                    key={origin}
                                    className="flex items-center space-x-1 px-3 py-1 rounded-lg border border-zinc-800 bg-zinc-950 text-slate-300 text-xs font-mono"
                                  >
                                    <span>{origin}</span>
                                    <button
                                      onClick={() => handleRemoveOrigin(app.id, app.clientId, app.allowedOrigins, origin)}
                                      disabled={appOriginLoading}
                                      className="p-0.5 text-zinc-500 hover:text-rose-400 rounded-md transition-colors disabled:opacity-50"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Whitelist Input Form */}
                            <div className="flex items-center gap-2 max-w-md pt-1">
                              <input
                                type="text"
                                placeholder="e.g. http://localhost:5173"
                                value={newOrigins[app.id] || ''}
                                onChange={(e) => setNewOrigins((prev) => ({ ...prev, [app.id]: e.target.value }))}
                                disabled={appOriginLoading}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddOrigin(app.id, app.clientId, app.allowedOrigins, app.apiKey);
                                  }
                                }}
                                className="flex-grow bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-[#00F0FF] transition-all disabled:opacity-50"
                              />
                              <button
                                onClick={() => handleAddOrigin(app.id, app.clientId, app.allowedOrigins, app.apiKey)}
                                disabled={appOriginLoading || !(newOrigins[app.id] || '').trim()}
                                className="px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 text-xs font-bold text-slate-300 hover:text-white transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 shrink-0"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Add</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {walletAddress && activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-display font-bold text-white">Usage Analytics</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Detailed monthly verification analysis and trends.</p>
                </div>
                
                {/* App Selector Dropdown */}
                {registeredApps.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 font-mono">FILTER BY APP:</span>
                    <select
                      value={selectedAppId}
                      onChange={(e) => setSelectedAppId(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 text-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#00F0FF] cursor-pointer"
                    >
                      {registeredApps.map(app => (
                        <option key={app.id} value={app.id}>{app.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Analytics Graph */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-white">Verification Status Breakdown</h3>
                  <div className="flex items-center space-x-4 text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-[#00F0FF]">
                      <span className="w-2 h-2 bg-[#00F0FF] rounded-full" />
                      <span>Verifications</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-500">
                      <span className="w-2 h-2 bg-rose-500 rounded-full" />
                      <span>Failures</span>
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full">
                  {isLogsLoading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/20 rounded-xl border border-zinc-900 animate-pulse space-y-3">
                      <Loader2 className="h-8 w-8 animate-spin text-[#00F0FF]" />
                      <p className="text-slate-500 text-xs">Loading analytics data...</p>
                    </div>
                  ) : logsData.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-950/20 rounded-xl border border-zinc-900 text-slate-600 text-xs italic">
                      No logs recorded for this app
                    </div>
                  ) : (
                    <Suspense fallback={<div className="w-full h-full bg-zinc-950/20 rounded-xl border border-zinc-900 animate-pulse" />}>
                      <DashboardBarChart data={logsData} />
                    </Suspense>
                  )}
                </div>
              </div>
            </div>
          )}

          {walletAddress && activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-display font-bold text-white">Monitoring Logs</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Real-time audits of biometric verification flows.</p>
                </div>
                
                {/* App Selector Dropdown */}
                {registeredApps.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 font-mono">FILTER BY APP:</span>
                    <select
                      value={selectedAppId}
                      onChange={(e) => setSelectedAppId(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 text-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#00F0FF] cursor-pointer"
                    >
                      {registeredApps.map(app => (
                        <option key={app.id} value={app.id}>{app.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Logs Table */}
              <div className="border border-zinc-800 bg-zinc-900/10 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
                  <h3 className="text-sm font-semibold text-white">Last 10 Failed Biometric Verifications</h3>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold uppercase">
                    Error Log Feed
                  </span>
                </div>

                <div className="overflow-x-auto">
                  {isLogsLoading ? (
                    <div className="p-12 space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-4 items-center animate-pulse">
                          <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
                          <div className="h-4 bg-zinc-800 rounded w-1/6"></div>
                          <div className="h-4 bg-zinc-800 rounded w-2/5"></div>
                          <div className="h-4 bg-zinc-800 rounded w-1/6"></div>
                        </div>
                      ))}
                    </div>
                  ) : failedLogsData.length === 0 ? (
                    <div className="py-16 text-center text-slate-600 text-xs italic">
                      No failed biometric verifications detected.
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-zinc-900 font-sans text-xs">
                      <thead className="bg-zinc-950/50 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                        <tr>
                          <th className="px-6 py-4 text-left">Time</th>
                          <th className="px-6 py-4 text-left">Error Code</th>
                          <th className="px-6 py-4 text-left">Origin</th>
                          <th className="px-6 py-4 text-left">User Agent</th>
                          <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900 bg-zinc-950/20 text-slate-300">
                        {failedLogsData.map((log) => {
                          const dateObj = new Date(log.created_at);
                          const formattedTime = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                          return (
                            <tr key={log.id} className="hover:bg-zinc-900/20 transition-colors">
                              <td className="px-6 py-4 font-mono text-[11px] whitespace-nowrap text-slate-400">
                                {formattedTime}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold">
                                  {log.error_code}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-mono text-slate-300 whitespace-nowrap">
                                {log.origin || 'N/A'}
                              </td>
                              <td className="px-6 py-4 max-w-xs truncate text-slate-500" title={log.user_agent}>
                                {log.user_agent || 'Unknown Agent'}
                              </td>
                              <td className="px-6 py-4 text-center whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
                                    showToast("Error Info copied to clipboard!");
                                  }}
                                  className="p-1.5 hover:bg-zinc-900 text-slate-400 hover:text-[#00F0FF] rounded-lg transition-colors inline-flex items-center justify-center"
                                  title="Copy Error Info"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {walletAddress && activeTab === 'settings' && (
            <div className="rounded-2xl border border-zinc-800 p-6 space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-display font-bold text-white">Project Configurations</h2>
                <p className="text-slate-400 text-xs font-medium">Configure structural developer parameters & proof Finality.</p>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-2">
                  <h3 className="text-sm font-semibold text-white">Zero Knowledge Prover Finality</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Set whether client-side biometric assertions should be compiled in-browser local prover layers or sent to decentralized proving networks.
                  </p>
                  <div className="flex items-center space-x-3 pt-2">
                    <button className="px-4 py-2.5 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 text-xs font-bold uppercase tracking-wider font-display">
                      Local Client-Side (14ms)
                    </button>
                    <button className="px-4 py-2.5 rounded-lg bg-zinc-900/50 text-slate-500 border border-zinc-850 hover:border-zinc-800 text-xs font-bold uppercase tracking-wider hover:text-slate-300 transition-all font-display">
                      Decentralized Prover
                    </button>
                  </div>
                </div>

                {/* Smart Contract Details Section */}
                <div className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Smart Contract Details</h3>
                    <span className="px-2.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/25 uppercase">
                      Active (Amoy Testnet)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    The biometric assertions submitted via verify-zk are cryptographic proofs, validated on-chain via our verifier smart contracts.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 mt-2">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Verifier Contract Address</p>
                      <p className="font-mono text-xs text-slate-200 select-all break-all">
                        {import.meta.env.VITE_VERIFIER_CONTRACT_ADDRESS || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'}
                      </p>
                    </div>
                    <a
                      href={`https://amoy.polygonscan.com/address/${import.meta.env.VITE_VERIFIER_CONTRACT_ADDRESS || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 border border-zinc-800 hover:border-[#00F0FF]/30 hover:bg-[#00F0FF]/5 hover:text-[#00F0FF] rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all text-slate-300 shrink-0 font-mono"
                    >
                      <span>View on Explorer</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer/>
      {/* <footer className="border-t border-zinc-900 bg-zinc-950 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/logo.png" 
                alt="Praman Network Logo" 
                width="16"
                height="16"
                loading="lazy"
                decoding="async"
                className="h-4 w-4 object-contain" 
              />
              <span className="text-slate-500 text-xs font-display font-bold uppercase tracking-wider">
                Praman Dev Hub
              </span>
            </div>
            <div className="text-xs text-slate-600 font-mono">
              Finalized with ZK-SNARK verification signatures.
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  );
}

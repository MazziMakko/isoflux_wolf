'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FolderKanban,
  Cpu,
  Settings,
  Users,
  CreditCard,
  LogOut,
  Key,
  Plus,
  Copy,
  Check,
  Shield,
} from 'lucide-react';

interface ApiKeyRow {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  revoked: boolean;
}

export default function ApiKeysPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiresDays, setNewKeyExpiresDays] = useState<number | ''>(90);
  const [createdRawKey, setCreatedRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('wolf_shield_token');
    if (!token) {
      router.push('/login');
      return;
    }
    const userData = localStorage.getItem('wolf_shield_user');
    const orgData = localStorage.getItem('wolf_shield_org');
    if (userData) setUser(JSON.parse(userData));
    if (orgData) setOrganization(JSON.parse(orgData));
    fetchKeys(token);
  }, [router]);

  const fetchKeys = async (token: string) => {
    try {
      const res = await fetch('/api/organization/api-keys', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('wolf_shield_token');
    if (!token || !newKeyName.trim()) return;
    setCreating(true);
    setCreatedRawKey(null);
    try {
      const res = await fetch('/api/organization/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newKeyName.trim(),
          expiresInDays: newKeyExpiresDays === '' ? undefined : Number(newKeyExpiresDays),
        }),
      });
      const data = await res.json();
      if (res.ok && data.rawKey) {
        setCreatedRawKey(data.rawKey);
        setNewKeyName('');
        setNewKeyExpiresDays(90);
        fetchKeys(token);
      } else {
        alert(data.error || 'Failed to create API key');
      }
    } catch (e) {
      alert('Request failed');
    } finally {
      setCreating(false);
    }
  };

  const copyRawKey = () => {
    if (createdRawKey) {
      navigator.clipboard.writeText(createdRawKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('wolf_shield_token');
    localStorage.removeItem('wolf_shield_user');
    localStorage.removeItem('wolf_shield_org');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold gradient-text">IsoFlux</span>
          </Link>
        </div>
        <nav className="px-4 space-y-1">
          <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/dashboard/projects" className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <FolderKanban className="h-5 w-5" />
            <span>Projects</span>
          </Link>
          <Link href="/dashboard/ai-agents" className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Cpu className="h-5 w-5" />
            <span>AI Agents</span>
          </Link>
          <Link href="/dashboard/team" className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Users className="h-5 w-5" />
            <span>Team</span>
          </Link>
          <Link href="/dashboard/billing" className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <CreditCard className="h-5 w-5" />
            <span>Billing</span>
          </Link>
          <Link href="/dashboard/api-keys" className="flex items-center space-x-3 px-4 py-3 text-gray-900 dark:text-white bg-primary-50 dark:bg-primary-900/20 rounded-lg font-medium">
            <Key className="h-5 w-5" />
            <span>Reactor API Keys</span>
          </Link>
          <Link href="/dashboard/settings" className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg w-full">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Reactor API Keys</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage API keys for the IsoFlux Compliance & Translation API. Use <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">X-API-Key</code> in requests.
          </p>
        </div>

        {createdRawKey && (
          <div className="glass-card p-6 mb-6 border-2 border-green-500">
            <p className="font-semibold text-green-700 dark:text-green-400 mb-2">API key created. Copy it now — it won’t be shown again.</p>
            <div className="flex items-center gap-2 flex-wrap">
              <code className="flex-1 min-w-0 break-all bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
                {createdRawKey}
              </code>
              <button type="button" onClick={copyRawKey} className="btn-primary inline-flex items-center gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Create API key</h2>
          <form onSubmit={handleCreateKey} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Production Reactor"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expires in (days, 0 = never)</label>
              <input
                type="number"
                min={0}
                value={newKeyExpiresDays}
                onChange={(e) => setNewKeyExpiresDays(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <button type="submit" disabled={creating} className="btn-primary inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {creating ? 'Creating…' : 'Create API key'}
            </button>
          </form>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Your API keys</h2>
          {keys.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No API keys yet. Create one above to use the Reactor API.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-2 font-semibold">Name</th>
                    <th className="pb-2 font-semibold">Prefix</th>
                    <th className="pb-2 font-semibold">Last used</th>
                    <th className="pb-2 font-semibold">Expires</th>
                    <th className="pb-2 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3">{k.name}</td>
                      <td className="py-3 font-mono text-sm">{k.keyPrefix}…</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : '—'}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : 'Never'}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{new Date(k.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

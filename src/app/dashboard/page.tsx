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
  FileText,
  LogOut,
  Plus,
  TrendingUp,
  Activity,
  DollarSign,
  Zap,
  Key,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('wolf_shield_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userData = localStorage.getItem('fluxforge_user');
    const orgData = localStorage.getItem('fluxforge_org');

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }
    }
    if (orgData) {
      try {
        setOrganization(JSON.parse(orgData));
      } catch {
        setOrganization(null);
      }
    }

    fetchProjects();
  }, [router]);

  const fetchProjects = async () => {
    const token = localStorage.getItem('wolf_shield_token');
    if (!token) {
      setLoading(false);
      router.push('/login');
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch('/api/projects', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        localStorage.removeItem('wolf_shield_token');
        localStorage.removeItem('wolf_shield_user');
        localStorage.removeItem('wolf_shield_org');
        router.push('/login');
        return;
      }

      if (response.status === 403 && (await response.json().catch(() => ({}))).code === 'NO_ORGANIZATION') {
        setProjects([]);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.error('Projects request timed out');
      } else {
        console.error('Failed to fetch projects:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fluxforge_token');
    localStorage.removeItem('fluxforge_user');
    localStorage.removeItem('fluxforge_org');
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
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold gradient-text">IsoFlux</span>
          </Link>
        </div>

        <nav className="px-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 px-4 py-3 text-gray-900 dark:text-white bg-primary-50 dark:bg-primary-900/20 rounded-lg font-medium"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/dashboard/projects"
            className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <FolderKanban className="h-5 w-5" />
            <span>Projects</span>
          </Link>

          <Link
            href="/dashboard/ai-agents"
            className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Cpu className="h-5 w-5" />
            <span>AI Agents</span>
          </Link>

          <Link
            href="/dashboard/team"
            className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Users className="h-5 w-5" />
            <span>Team</span>
          </Link>

          <Link
            href="/dashboard/billing"
            className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <CreditCard className="h-5 w-5" />
            <span>Billing</span>
          </Link>

          <Link
            href="/dashboard/api-keys"
            className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Key className="h-5 w-5" />
            <span>Reactor API Keys</span>
          </Link>

          <Link
            href="/dashboard/settings"
            className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg w-full"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.fullName?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600">
            {organization?.name} • Free Plan
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: FolderKanban,
              label: 'Active Projects',
              value: projects.length,
              change: '+12%',
              color: 'blue',
            },
            {
              icon: Activity,
              label: 'AI Requests',
              value: '2.4K',
              change: '+24%',
              color: 'green',
            },
            {
              icon: Users,
              label: 'Team Members',
              value: '1',
              change: '',
              color: 'purple',
            },
            {
              icon: DollarSign,
              label: 'Revenue',
              value: '$0',
              change: '',
              color: 'yellow',
            },
          ].map((stat, index) => (
            <div key={index} className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
                {stat.change && (
                  <span className="text-green-600 text-sm font-semibold">
                    {stat.change}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Projects Section */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Projects</h2>
            <Link
              href="/dashboard/projects/new"
              className="flex items-center space-x-2 btn-primary"
            >
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderKanban className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first project to start building
              </p>
              <Link href="/dashboard/projects/new" className="btn-primary inline-flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Project</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                      <p className="text-sm text-gray-600">{project.description || 'No description'}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        project.status === 'active' ? 'bg-green-100 text-green-700' :
                        project.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {project.status}
                      </span>
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="text-primary-600 hover:underline font-medium"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

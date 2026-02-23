/**
 * =====================================================
 * PORTFOLIO MANAGEMENT
 * Properties listing with CRUD operations
 * =====================================================
 */

'use client';

import { useEffect, useState } from 'react';
import { useSystemState } from '@/hooks/useSystemState';
import { Card } from '@/components/ui/AnimatedCard';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  total_units: number;
  occupancy_rate: number;
  hud_property_id: string;
}

export default function PortfolioPage() {
  const { organization, loading } = useSystemState();
  const [properties, setProperties] = useState<Property[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProperty, setNewProperty] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    hud_property_id: '',
  });

  useEffect(() => {
    if (organization?.id) {
      fetchProperties();
    }
  }, [organization]);

  async function fetchProperties() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('organization_id', organization!.id)
      .order('name');

    if (!error && data) {
      setProperties(data);
    }
  }

  async function handleAddProperty(e: React.FormEvent) {
    e.preventDefault();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.from('properties').insert({
      organization_id: organization!.id,
      ...newProperty,
      total_units: 0,
      occupancy_rate: 0,
    });

    if (!error) {
      setShowAddModal(false);
      setNewProperty({ name: '', address: '', city: '', state: '', zip_code: '', hud_property_id: '' });
      fetchProperties();
      alert('✓ Property added successfully');
    } else {
      alert('Error adding property: ' + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-xl text-emerald-400">Loading Portfolio...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-emerald-400">📁 Portfolio Management</h1>
            <p className="mt-2 text-slate-300">
              {properties.length} {properties.length === 1 ? 'Property' : 'Properties'}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-lg bg-emerald-500 px-6 py-3 font-bold text-white transition hover:bg-emerald-600"
          >
            + Add Property
          </button>
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <Card className="border-slate-700 bg-slate-800/50 p-12 text-center backdrop-blur">
            <div className="mb-4 text-6xl">🏢</div>
            <h3 className="mb-2 text-xl font-bold text-white">No Properties Yet</h3>
            <p className="mb-6 text-slate-400">Add your first property to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-block rounded-lg bg-emerald-500 px-8 py-3 font-bold text-white transition hover:bg-emerald-600"
            >
              + Add Your First Property
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <Link key={property.id} href={`/dashboard/property-manager/portfolio/${property.id}`}>
                <Card className="border-emerald-500/20 bg-slate-800/50 p-6 backdrop-blur transition hover:border-emerald-500/50 hover:bg-slate-800/70">
                  <h3 className="mb-2 text-xl font-bold text-white">{property.name}</h3>
                  <p className="mb-4 text-sm text-slate-400">
                    {property.address}
                    <br />
                    {property.city}, {property.state} {property.zip_code}
                  </p>

                  <div className="mb-4 grid grid-cols-2 gap-4 border-t border-slate-700 pt-4">
                    <div>
                      <div className="text-xs text-slate-400">Total Units</div>
                      <div className="text-xl font-bold text-emerald-400">{property.total_units}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Occupancy</div>
                      <div className="text-xl font-bold text-emerald-400">
                        {Math.round(property.occupancy_rate)}%
                      </div>
                    </div>
                  </div>

                  {property.hud_property_id && (
                    <div className="rounded bg-emerald-500/10 px-3 py-2 text-xs">
                      <span className="text-slate-400">HUD ID:</span>{' '}
                      <span className="font-mono text-emerald-400">{property.hud_property_id}</span>
                    </div>
                  )}

                  <div className="mt-4 text-sm text-emerald-400 hover:underline">
                    View Details →
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Add Property Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <Card className="w-full max-w-2xl border-emerald-500/20 bg-slate-800 p-8">
              <h2 className="mb-6 text-2xl font-bold text-emerald-400">Add New Property</h2>

              <form onSubmit={handleAddProperty} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-300">Property Name *</label>
                  <input
                    type="text"
                    required
                    value={newProperty.name}
                    onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                    className="w-full rounded border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="Sunset Apartments"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-300">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={newProperty.address}
                    onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                    className="w-full rounded border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-300">City *</label>
                    <input
                      type="text"
                      required
                      value={newProperty.city}
                      onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })}
                      className="w-full rounded border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                      placeholder="Newark"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-300">State *</label>
                    <input
                      type="text"
                      required
                      maxLength={2}
                      value={newProperty.state}
                      onChange={(e) => setNewProperty({ ...newProperty, state: e.target.value.toUpperCase() })}
                      className="w-full rounded border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                      placeholder="NJ"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-300">ZIP Code *</label>
                    <input
                      type="text"
                      required
                      value={newProperty.zip_code}
                      onChange={(e) => setNewProperty({ ...newProperty, zip_code: e.target.value })}
                      className="w-full rounded border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                      placeholder="07102"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-300">HUD Property ID (Optional)</label>
                  <input
                    type="text"
                    value={newProperty.hud_property_id}
                    onChange={(e) => setNewProperty({ ...newProperty, hud_property_id: e.target.value })}
                    className="w-full rounded border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="HUD-12345"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-emerald-500 px-6 py-3 font-bold text-white transition hover:bg-emerald-600"
                  >
                    Add Property
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 rounded-lg border-2 border-slate-600 px-6 py-3 font-bold text-slate-300 transition hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

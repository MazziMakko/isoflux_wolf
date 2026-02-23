/**
 * =====================================================
 * PROPERTY DETAIL VIEW
 * Units listing with add unit functionality
 * =====================================================
 */

'use client';

import { useEffect, useState } from 'react';
import { useSystemState } from '@/hooks/useSystemState';
import { Card } from '@/components/ui/AnimatedCard';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { use } from 'react';

interface Unit {
  id: string;
  unit_number: string;
  bedrooms: number;
  bathrooms: number;
  rent_amount: number;
  status: string;
  current_tenant_id: string | null;
}

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  total_units: number;
}

export default function PropertyDetailPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const resolvedParams = use(params);
  const { organization } = useSystemState();
  const [property, setProperty] = useState<Property | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({
    unit_number: '',
    bedrooms: 1,
    bathrooms: 1.0,
    rent_amount: 0,
  });

  useEffect(() => {
    if (organization?.id) {
      fetchPropertyAndUnits();
    }
  }, [organization, resolvedParams.propertyId]);

  async function fetchPropertyAndUnits() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch property
    const { data: propData } = await supabase
      .from('properties')
      .select('*')
      .eq('id', resolvedParams.propertyId)
      .single();

    if (propData) setProperty(propData);

    // Fetch units
    const { data: unitsData } = await supabase
      .from('units')
      .select('*')
      .eq('property_id', resolvedParams.propertyId)
      .order('unit_number');

    if (unitsData) setUnits(unitsData);
  }

  async function handleAddUnit(e: React.FormEvent) {
    e.preventDefault();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.from('units').insert({
      property_id: resolvedParams.propertyId,
      ...newUnit,
      status: 'VACANT',
    });

    if (!error) {
      setShowAddUnit(false);
      setNewUnit({ unit_number: '', bedrooms: 1, bathrooms: 1.0, rent_amount: 0 });
      fetchPropertyAndUnits();
      alert('✓ Unit added successfully');
    } else {
      alert('Error: ' + error.message);
    }
  }

  const getStatusColor = (status: string) => {
    if (status === 'OCCUPIED') return 'bg-emerald-500/20 text-emerald-400';
    if (status === 'VACANT') return 'bg-yellow-500/20 text-yellow-400';
    if (status === 'MAINTENANCE') return 'bg-red-500/20 text-red-400';
    return 'bg-slate-500/20 text-slate-400';
  };

  if (!property) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-xl text-emerald-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-slate-400">
          <Link href="/dashboard/property-manager/portfolio" className="hover:text-emerald-400">
            Portfolio
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white">{property.name}</span>
        </div>

        {/* Property Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-emerald-400">{property.name}</h1>
            <p className="mt-2 text-slate-300">
              {property.address}, {property.city}, {property.state} {property.zip_code}
            </p>
            <p className="mt-1 text-sm text-slate-400">{units.length} Units</p>
          </div>
          <button
            onClick={() => setShowAddUnit(true)}
            className="rounded-lg bg-emerald-500 px-6 py-3 font-bold text-white transition hover:bg-emerald-600"
          >
            + Add Unit
          </button>
        </div>

        {/* Units Grid */}
        {units.length === 0 ? (
          <Card className="border-slate-700 bg-slate-800/50 p-12 text-center backdrop-blur">
            <div className="mb-4 text-6xl">🏠</div>
            <h3 className="mb-2 text-xl font-bold text-white">No Units Yet</h3>
            <p className="mb-6 text-slate-400">Add units to this property</p>
            <button
              onClick={() => setShowAddUnit(true)}
              className="inline-block rounded-lg bg-emerald-500 px-8 py-3 font-bold text-white transition hover:bg-emerald-600"
            >
              + Add First Unit
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => (
              <Card key={unit.id} className="border-emerald-500/20 bg-slate-800/50 p-6 backdrop-blur">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-2xl font-bold text-white">Unit {unit.unit_number}</h3>
                  <span className={`rounded px-2 py-1 text-xs font-bold ${getStatusColor(unit.status)}`}>
                    {unit.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bedrooms:</span>
                    <span className="font-bold">{unit.bedrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bathrooms:</span>
                    <span className="font-bold">{unit.bathrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rent:</span>
                    <span className="font-bold text-emerald-400">${unit.rent_amount.toLocaleString()}/mo</span>
                  </div>
                </div>

                {unit.current_tenant_id && (
                  <div className="mt-4 rounded bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
                    Tenant Assigned
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Add Unit Modal */}
        {showAddUnit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <Card className="w-full max-w-lg border-emerald-500/20 bg-slate-800 p-8">
              <h2 className="mb-6 text-2xl font-bold text-emerald-400">Add New Unit</h2>

              <form onSubmit={handleAddUnit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-300">Unit Number *</label>
                  <input
                    type="text"
                    required
                    value={newUnit.unit_number}
                    onChange={(e) => setNewUnit({ ...newUnit, unit_number: e.target.value })}
                    className="w-full rounded border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="101"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-300">Bedrooms *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newUnit.bedrooms}
                      onChange={(e) => setNewUnit({ ...newUnit, bedrooms: parseInt(e.target.value) })}
                      className="w-full rounded border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-300">Bathrooms *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.5"
                      value={newUnit.bathrooms}
                      onChange={(e) => setNewUnit({ ...newUnit, bathrooms: parseFloat(e.target.value) })}
                      className="w-full rounded border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-300">Monthly Rent *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newUnit.rent_amount}
                    onChange={(e) => setNewUnit({ ...newUnit, rent_amount: parseFloat(e.target.value) })}
                    className="w-full rounded border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="1200.00"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-emerald-500 px-6 py-3 font-bold text-white transition hover:bg-emerald-600"
                  >
                    Add Unit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddUnit(false)}
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

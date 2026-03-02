'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Shield } from 'lucide-react';
import Link from 'next/link';

interface Deficiency {
  id: string;
  label: string;
  tier: 'LT' | 'SV' | 'MO';
  weight: number;
}

const DEFICIENCIES: Deficiency[] = [
  // Life-Threatening
  { id: 'blocked_egress', label: 'Blocked Emergency Exit', tier: 'LT', weight: 30 },
  { id: 'no_smoke_detector', label: 'Missing Smoke Detector', tier: 'LT', weight: 30 },
  { id: 'exposed_wiring', label: 'Exposed Electrical Wiring', tier: 'LT', weight: 28 },
  { id: 'gas_leak', label: 'Gas Leak or CO Risk', tier: 'LT', weight: 35 },
  
  // Severe
  { id: 'hvac_failure', label: 'HVAC System Failure', tier: 'SV', weight: 15 },
  { id: 'water_leak', label: 'Water Leak / Mold Risk', tier: 'SV', weight: 12 },
  { id: 'trip_hazard', label: 'Trip Hazard (Stairs/Flooring)', tier: 'SV', weight: 10 },
  { id: 'pest_infestation', label: 'Pest Infestation', tier: 'SV', weight: 8 },
  
  // Moderate
  { id: 'cosmetic_damage', label: 'Cosmetic Damage (Paint/Cracks)', tier: 'MO', weight: 3 },
  { id: 'loose_fixtures', label: 'Loose Fixtures/Handles', tier: 'MO', weight: 2 },
  { id: 'slow_drain', label: 'Slow Drain (Not Clogged)', tier: 'MO', weight: 2 },
  { id: 'missing_outlet_cover', label: 'Missing Outlet Cover', tier: 'MO', weight: 3 },
];

export default function NspireDeficiencyCalculator() {
  const [selectedDeficiencies, setSelectedDeficiencies] = useState<string[]>([]);

  const toggleDeficiency = (id: string) => {
    setSelectedDeficiencies(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const calculateScore = () => {
    const totalDeducted = selectedDeficiencies.reduce((sum, id) => {
      const deficiency = DEFICIENCIES.find(d => d.id === id);
      return sum + (deficiency?.weight || 0);
    }, 0);
    return Math.max(0, 100 - totalDeducted);
  };

  const score = calculateScore();
  const hasLifeThreatening = selectedDeficiencies.some(id => 
    DEFICIENCIES.find(d => d.id === id)?.tier === 'LT'
  );
  const isPassing = score >= 60;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'LT': return 'text-red-400 bg-red-900/20 border-red-500/30';
      case 'SV': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'MO': return 'text-gray-400 bg-gray-800/40 border-gray-500/30';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#50C878]/30 rounded-lg p-6 shadow-xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-[#50C878]" />
          <h3 className="text-xl font-bold text-white">NSPIRE Risk Calculator</h3>
        </div>
        <p className="text-sm text-gray-400">
          Select deficiencies to see your estimated NSPIRE score impact
        </p>
      </div>

      {/* Current Score Display */}
      <div className="mb-6 p-6 rounded-lg bg-gradient-to-r from-[#050505] to-[#0A0A0A] border border-[#50C878]/20">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-2">Estimated NSPIRE Score</div>
          <div className={`text-6xl font-bold mb-2 ${isPassing ? 'text-[#50C878]' : 'text-red-400'}`}>
            {score}
          </div>
          <div className="flex items-center justify-center gap-2">
            {isPassing ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-[#50C878]" />
                <span className="text-[#50C878] font-bold">Passing</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-400 font-bold">Failing</span>
              </>
            )}
          </div>
          {hasLifeThreatening && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-300 text-left">
                <strong>24-Hour Fix Required!</strong> Life-Threatening defects must be corrected immediately.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deficiency Checklist */}
      <div className="space-y-3 mb-6">
        <div className="text-sm font-bold text-gray-400 mb-2">Select Deficiencies:</div>
        {DEFICIENCIES.map((deficiency) => (
          <label
            key={deficiency.id}
            className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-all hover:scale-[1.02] ${
              selectedDeficiencies.includes(deficiency.id)
                ? getTierColor(deficiency.tier) + ' border-opacity-100'
                : 'bg-[#050505] border-gray-800'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedDeficiencies.includes(deficiency.id)}
              onChange={() => toggleDeficiency(deficiency.id)}
              className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-800 text-[#50C878] focus:ring-[#50C878] focus:ring-offset-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white mb-1">
                {deficiency.label}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`font-bold ${
                  deficiency.tier === 'LT' ? 'text-red-400' :
                  deficiency.tier === 'SV' ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {deficiency.tier}
                </span>
                <span className="text-gray-500">-{deficiency.weight} points</span>
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link
          href="/pricing"
          className="block w-full text-center bg-[#50C878] hover:bg-[#45B368] text-black font-bold py-3 px-4 rounded-lg transition-all"
        >
          Track Repairs with Wolf Shield
        </Link>
        <button
          onClick={() => setSelectedDeficiencies([])}
          className="block w-full text-center bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-lg border border-white/20 transition-all"
        >
          Reset Calculator
        </button>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-[#050505] rounded text-xs text-gray-500">
        <strong>Disclaimer:</strong> This calculator provides estimated scores for educational purposes. Actual NSPIRE scores depend on inspector assessment and property-specific factors. Consult HUD documentation for official scoring methodology.
      </div>
    </div>
  );
}

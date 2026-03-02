'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, FileCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ChecklistItem {
  id: string;
  category: string;
  task: string;
  priority: 'critical' | 'high' | 'medium';
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Critical Priority
  { id: 'tsp_review', category: 'Tenant Selection', task: 'Review and update Tenant Selection Plan (TSP)', priority: 'critical' },
  { id: 'tsp_submit', category: 'Tenant Selection', task: 'Submit TSP to HUD for approval', priority: 'critical' },
  { id: 'asset_threshold', category: 'Income Verification', task: 'Implement $50K asset self-certification process', priority: 'critical' },
  { id: 'staff_training', category: 'Training', task: 'Complete HOTMA staff training for all personnel', priority: 'critical' },
  
  // High Priority
  { id: 'over_income', category: 'Income Verification', task: 'Establish over-income tenant (120% AMI) tracking', priority: 'high' },
  { id: 'recert_calendar', category: 'Recertification', task: 'Update recertification calendar for annual/triennial cycles', priority: 'high' },
  { id: 'affidavit_forms', category: 'Documentation', task: 'Create asset self-certification affidavit templates', priority: 'high' },
  { id: 'utility_review', category: 'Operations', task: 'Conduct annual utility allowance review', priority: 'high' },
  
  // Medium Priority
  { id: 'fair_housing', category: 'Compliance', task: 'Complete Fair Housing certification for staff', priority: 'medium' },
  { id: 'eiv_procedures', category: 'Income Verification', task: 'Update EIV (Enterprise Income Verification) procedures', priority: 'medium' },
  { id: 'lease_templates', category: 'Documentation', task: 'Update lease templates with HOTMA language', priority: 'medium' },
  { id: 'tenant_notices', category: 'Communication', task: 'Prepare tenant HOTMA change notification letters', priority: 'medium' },
];

export default function HotmaReadinessChecklist() {
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setCompletedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getProgress = () => {
    return Math.round((completedItems.length / CHECKLIST_ITEMS.length) * 100);
  };

  const getCriticalCount = () => {
    const critical = CHECKLIST_ITEMS.filter(item => item.priority === 'critical');
    const criticalCompleted = critical.filter(item => completedItems.includes(item.id));
    return { total: critical.length, completed: criticalCompleted.length };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-yellow-400';
      case 'medium': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-900/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30';
      case 'medium': return 'bg-gray-800/40 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-800/40 text-gray-400';
    }
  };

  const progress = getProgress();
  const critical = getCriticalCount();
  const isReady = progress === 100;

  return (
    <div className="bg-[#0A0A0A] border border-[#50C878]/30 rounded-lg p-6 shadow-xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <FileCheck className="h-6 w-6 text-[#50C878]" />
          <h3 className="text-xl font-bold text-white">HOTMA Readiness Checklist</h3>
        </div>
        <p className="text-sm text-gray-400">
          Track your compliance progress for 2026 implementation
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-400">Overall Progress</div>
          <div className={`text-2xl font-bold ${isReady ? 'text-[#50C878]' : 'text-white'}`}>
            {progress}%
          </div>
        </div>
        <div className="h-3 bg-[#050505] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isReady ? 'bg-[#50C878]' : 'bg-gradient-to-r from-[#50C878]/60 to-[#50C878]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 text-sm text-gray-400">
          {completedItems.length} of {CHECKLIST_ITEMS.length} tasks completed
        </div>
      </div>

      {/* Critical Tasks Alert */}
      {critical.completed < critical.total && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div className="text-sm font-bold text-red-400 mb-1">
            {critical.total - critical.completed} Critical Task{critical.total - critical.completed !== 1 ? 's' : ''} Remaining
          </div>
          <div className="text-xs text-red-300">
            Complete all critical tasks before HUD deadline
          </div>
        </div>
      )}

      {/* Checklist Items */}
      <div className="space-y-3 mb-6 max-h-[600px] overflow-y-auto pr-2">
        {CHECKLIST_ITEMS.map((item) => (
          <label
            key={item.id}
            className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-all hover:scale-[1.02] ${
              completedItems.includes(item.id)
                ? 'bg-[#50C878]/10 border-[#50C878]/30'
                : 'bg-[#050505] border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center h-5">
              {completedItems.includes(item.id) ? (
                <CheckCircle2 className="h-5 w-5 text-[#50C878] flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-gray-600 flex-shrink-0" />
              )}
            </div>
            <input
              type="checkbox"
              checked={completedItems.includes(item.id)}
              onChange={() => toggleItem(item.id)}
              className="sr-only"
            />
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium mb-1 ${
                completedItems.includes(item.id) ? 'text-gray-400 line-through' : 'text-white'
              }`}>
                {item.task}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">{item.category}</span>
                <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityBadge(item.priority)}`}>
                  {item.priority.toUpperCase()}
                </span>
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {isReady ? (
          <div className="p-4 bg-[#50C878]/10 border border-[#50C878]/30 rounded-lg text-center">
            <CheckCircle2 className="h-8 w-8 text-[#50C878] mx-auto mb-2" />
            <div className="font-bold text-[#50C878] mb-1">HOTMA Ready!</div>
            <div className="text-sm text-gray-300">Your property is prepared for 2026 compliance</div>
          </div>
        ) : (
          <>
            <Link
              href="/pricing"
              className="block w-full text-center bg-[#50C878] hover:bg-[#45B368] text-black font-bold py-3 px-4 rounded-lg transition-all"
            >
              Automate with Wolf Shield
              <ArrowRight className="inline-block ml-2 h-4 w-4" />
            </Link>
            <button
              onClick={() => setCompletedItems([])}
              className="block w-full text-center bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-lg border border-white/20 transition-all"
            >
              Reset Checklist
            </button>
          </>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-[#050505] rounded text-xs text-gray-500">
        <strong>Disclaimer:</strong> This checklist provides general guidance. Consult your HUD Field Office and legal counsel for property-specific HOTMA implementation requirements.
      </div>
    </div>
  );
}

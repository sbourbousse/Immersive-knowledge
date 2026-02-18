'use client';

import React from 'react';
import { LaneBuilder, MultiTimelineView, AdvancedTagFilter } from '@/components';
import { useMultiTimelineStore } from '@/store/multiTimelineStore';

/**
 * Page de démonstration du système de lanes multi-timeline
 * 
 * Cette page démontre :
 * - La configuration de plusieurs lanes avec filtres par tags
 * - L'affichage côte-à-côte des timelines
 * - La synchronisation du scroll
 * - Les filtres avancés par tags
 */

export default function MultiLaneDemoPage() {
  const isScrollSynced = useMultiTimelineStore((s) => s.isScrollSynced);
  const showCorrelations = useMultiTimelineStore((s) => s.showCorrelations);
  const toggleScrollSync = useMultiTimelineStore((s) => s.toggleScrollSync);
  const toggleCorrelations = useMultiTimelineStore((s) => s.toggleCorrelations);
  const lanes = useMultiTimelineStore((s) => s.lanes);

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Multi-Timeline Viewer
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Comparez et analysez plusieurs perspectives simultanément
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isScrollSynced}
                  onChange={toggleScrollSync}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-300">Scroll synchronisé</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCorrelations}
                  onChange={toggleCorrelations}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-300">Afficher les corrélations</span>
              </label>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Lane Builder */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <LaneBuilder />
            
            {/* Configuration info */}
            <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
              <h3 className="font-semibold text-white mb-3">Configuration active</h3>
              <div className="space-y-2 text-sm">
                {lanes.map((lane) => (
                  <div 
                    key={lane.id}
                    className="flex items-center gap-2"
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: lane.color }}
                    />
                    <span className="text-gray-300">{lane.name}</span>
                    <span className="text-gray-500 text-xs ml-auto">
                      {lane.includedTags.length > 0 && `+${lane.includedTags.length}`}
                      {lane.excludedTags.length > 0 && ` -${lane.excludedTags.length}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main view - Multi Timeline */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {/* Tag Filter */}
            <AdvancedTagFilter />
            
            {/* Timeline View */}
            <div className="h-[calc(100vh-400px)] min-h-[500px]">
              <MultiTimelineView 
                className="h-full"
                onFactClick={(fact) => console.log('Clicked fact:', fact)}
              />
            </div>
            
            {/* Usage guide */}
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
              <h3 className="font-semibold text-indigo-300 mb-2">Guide d&apos;utilisation</h3>
              <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                <li>Cliquez sur &quot;Ajouter une lane&quot; pour créer jusqu&apos;à 4 lanes</li>
                <li>Configurez chaque lane avec des filtres de tags (inclusion/exclusion)</li>
                <li>Utilisez l&apos;onglet &quot;Comparer&quot; pour des configurations rapides</li>
                <li>Le scroll est synchronisé entre toutes les lanes visibles</li>
                <li>Exportez/importez vos configurations au format JSON</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

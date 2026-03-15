// app/card-lookup/page.tsx
'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import Sidebar from '../components/sidebar';
import Header from '../components/header';
import BinLookup from '../components/card-lookups/BinLookup';
import DNSChecker from '../components/card-lookups/DNSChecker';
import FastBackground from '../components/card-lookups/FastBackground';
import TruePeople from '../components/card-lookups/TruePeople';

const TabContent = ({ tabIndex }) => {
  switch (tabIndex) {
    case 0:
      return <BinLookup />;
    case 1:
      return <DNSChecker />;
    case 2:
      return <FastBackground />;
    case 3:
      return <TruePeople />;
    default:
      return <BinLookup />;
  }
};

export default function CardLookup() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    'BIN Lookup',
    'DNS Checker',
    'Fast Background Check',
    'True People Search',
  ];

  return (
    <div className="min-h-screen bg-black flex z-10 overflow-hidden relative">
      <Sidebar activeTab="Card Lookup" />

      <div className="flex-1 flex flex-col">
        <Header title="Card Lookup" icon={CreditCard} />

        <div className="">
          <div className="flex px-12">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === index
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <TabContent tabIndex={activeTab} />
      </div>

      <div
        className="absolute top-[50%] left-[-70%] translate-y-[-50%] w-[1600px] h-[1200px] rounded-full opacity-60 z-[-1]"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 50%, #C45647 0%, rgba(210, 90, 99, 0.00) 100%)',
        }}
      ></div>
    </div>
  );
}

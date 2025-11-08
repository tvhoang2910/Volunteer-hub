export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex space-x-6 border-b border-gray-300">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`pb-3 px-1 font-medium transition-all ${
            activeTab === tab.key
              ? "text-yellow-500 border-b-4 border-yellow-400"
              : "text-gray-600 hover:text-yellow-500"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

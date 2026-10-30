import { useState } from "react";

// Tab Component
export default function Tabs({ tabs }) {
    const [activeTab, setActiveTab] = useState(tabs[0]?.id);

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-300">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`flex-1 text-center py-2 transition-colors duration-300 ${activeTab === tab.id
                            ? "border-b-2 border-blue-500 text-blue-500 font-semibold"
                            : "text-gray-500 hover:text-blue-500"
                            }`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.title}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-4">
                {tabs.map(
                    (tab) =>
                        activeTab === tab.id && (
                            <div key={tab.id}>{tab.content}</div>
                        )
                )}
            </div>
        </div>
    );
}

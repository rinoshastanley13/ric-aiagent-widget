import { WidgetHeader } from './WidgetHeader';

interface WidgetWelcomeProps {
    onOptionSelect: (option: string) => void;
}

export const WidgetWelcome: React.FC<WidgetWelcomeProps> = ({ onOptionSelect }) => {
    return (
        <div className="flex flex-col h-full bg-white font-sans">
            <WidgetHeader showNewChat={true} onNewChat={() => { }} />

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">

                {/* Welcome Bubble */}
                <div className="bg-[#F3F4F6] rounded-2xl rounded-tl-sm p-4 mb-6 shadow-sm border border-gray-100 text-gray-800 text-sm leading-relaxed">
                    <p className="mb-3">Hi! 👋<br />Welcome to RICAGO!</p>
                    <p className="mb-3">I am your <strong>Compliance AI Assistant</strong> 🤖, here to support you with regulatory and compliance-related queries.</p>
                    <p>To get started, choose one of the options below: 🚀</p>
                </div>

                {/* Options List */}
                <div className="space-y-3">
                    <OptionButton
                        icon="🔍"
                        text={<span>Find <strong>compliances relevant</strong> to your organization</span>}
                        onClick={() => onOptionSelect("Find compliances relevant to your organization")}
                    />
                    <OptionButton
                        icon="📣"
                        text={<span>What are the latest <strong>Regulatory Amendments</strong></span>}
                        onClick={() => onOptionSelect("What are the latest Regulatory Amendments")}
                    />
                    <OptionButton
                        icon="🧩"
                        text={<span>Do you want to explore our <strong>Product Offerings</strong></span>}
                        onClick={() => onOptionSelect("Do you want to explore our Product Offerings")}
                    />
                    <OptionButton
                        icon="🤖"
                        text={<span>Ask <strong>AI Assistant</strong> about compliance</span>}
                        onClick={() => onOptionSelect("Ask AI Assistant about compliance")}
                    />
                </div>

            </div>
        </div>
    );
};

const OptionButton = ({ icon, text, onClick }: { icon: string, text: React.ReactNode, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-left group"
    >
        <span className="text-xl shrink-0 group-hover:scale-110 transition-transform duration-200">{icon}</span>
        <span className="text-sm text-gray-700 group-hover:text-[#2E3B8B] transition-colors">{text}</span>
    </button>
);

import { AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

export default function SmartAvailability({ status, wlPos, probability, seats }) {
    if (status === 'AVAILABLE') {
        return (
            <div className="flex items-center space-x-2 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">AVL {seats}</span>
            </div>
        );
    }

    const getProbColor = (prob) => {
        switch (prob) {
            case 'High': return 'text-green-500 bg-green-50 border-green-200';
            case 'Medium': return 'text-orange-500 bg-orange-50 border-orange-200';
            case 'Low': return 'text-red-500 bg-red-50 border-red-200';
            default: return 'text-gray-500 bg-gray-50 border-gray-200';
        }
    };

    const getProbIcon = (prob) => {
        switch (prob) {
            case 'High': return <CheckCircle className="w-3 h-3 mr-1" />;
            case 'Medium': return <HelpCircle className="w-3 h-3 mr-1" />;
            case 'Low': return <AlertCircle className="w-3 h-3 mr-1" />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col items-end group relative cursor-help">
            <div className="flex items-center space-x-2 text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-full border border-orange-200 shadow-sm">
                <span className="text-sm">WL {wlPos}</span>
            </div>

            {/* Tooltip implementation for Smart Probability */}
            <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-xl rounded-xl p-3 border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none transform scale-95 group-hover:scale-100">
                <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">AI Prediction</p>
                <div className={`flex items-center px-2 py-1 rounded-md border text-xs font-bold ${getProbColor(probability)}`}>
                    {getProbIcon(probability)} {probability} Probability
                </div>
                <p className="text-xs text-gray-400 mt-2 leading-tight">Based on historical cancellation trends for this route.</p>
            </div>
        </div>
    );
}

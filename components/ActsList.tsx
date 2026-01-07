import React from 'react';
import { ActsData } from '@/types';
import { Book, MapPin, Building, Users } from 'lucide-react';

interface ActsListProps {
    data: ActsData;
}

export const ActsList: React.FC<ActsListProps> = ({ data }) => {
    console.log('🚀 [ActsList] Component received data:', data?.total);
    if (!data || !data.acts || data.acts.length === 0) {
        console.log('🚀 [ActsList] Returning NULL because no acts');
        return null;
    }
    console.log('🚀 [ActsList] Rendering UI for', data.acts.length, 'acts');

    return (
        <div className="mt-4 border border-blue-100 rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-blue-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                            <Book className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm">
                            Applicable Acts
                            <span className="ml-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                                {data.total}
                            </span>
                        </h3>
                    </div>
                </div>

                {/* Chips for filters */}
                <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
                    <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded border border-blue-100 text-gray-600">
                        <MapPin className="w-3 h-3 text-blue-400" />
                        <span>{data.filters.state}</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded border border-blue-100 text-gray-600">
                        <Building className="w-3 h-3 text-blue-400" />
                        <span>{data.filters.industry}</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded border border-blue-100 text-gray-600">
                        <Users className="w-3 h-3 text-blue-400" />
                        <span>{data.filters.employee_size}</span>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto bg-white/50">
                {data.acts.map((act) => (
                    <div key={act.id} className="p-4 hover:bg-blue-50/50 transition-colors group">
                        <div className="flex justify-between items-start mb-1.5">
                            <span className="text-[10px] font-bold tracking-wider text-indigo-500 uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                {act.legislative_area}
                            </span>
                        </div>

                        <div className="space-y-1">
                            {act.central_acts && act.central_acts !== 'Not Applicable' && (
                                <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                                    {act.central_acts}
                                </div>
                            )}

                            {act.state_acts && act.state_acts !== 'Not Applicable' && (
                                <div className="fit-content">
                                    {act.central_acts && act.central_acts !== 'Not Applicable' ? (
                                        <div className="text-xs text-gray-500 mt-1 flex items-start">
                                            <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded mr-2 mt-0.5">State Act</span>
                                            <span>{act.state_acts}</span>
                                        </div>
                                    ) : (
                                        <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                                            {act.state_acts}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gray-50 px-4 py-2 text-[10px] text-gray-400 text-center border-t border-gray-100">
                Scroll to see more
            </div>
        </div>
    );
};

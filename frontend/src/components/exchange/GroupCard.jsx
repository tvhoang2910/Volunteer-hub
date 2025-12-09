import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const GroupCard = ({ group }) => {
    return (
        <Link href={`/user/exchangeChannel/groups/${group.id}`} className="block h-full">
            <Card className="h-full transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer overflow-hidden border-none">
                <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-400 p-4 relative">
                    <h3 className="text-white text-xl font-bold truncate">{group.name}</h3>
                    <p className="text-blue-100 text-sm truncate">{group.description}</p>
                    <div className="absolute top-2 right-2 bg-white/20 px-2 py-1 rounded text-xs text-white font-mono">
                        {group.id}
                    </div>
                </div>
                <CardContent className="p-4 pt-4">
                    <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                            {group.name.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-600 font-medium">Instructor Name</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-4 border-t pt-2">
                        Click to enter class
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
};

export default GroupCard;

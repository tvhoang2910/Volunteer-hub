import EventCard from '@/components/ui/card-detail.jsx';
import SearchBar from '@/components/ui/search-bar.jsx';
import { useEffect } from 'react';
const HistoryPage = () => {
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, []);

    return (
        <div className="container mx-auto pt-10 pl-64 space-y-6">
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Lịch sử hoạt động</h1>
                <EventCard />
            </div>
        </div>
    )
}
export default HistoryPage;
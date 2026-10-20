import NewsEventsManage from '@/components/Admin/NewsEventsManage';

export const metadata = {
    title: 'News & Events | Mingle Admin',
    description: 'Manage News & Events for Mingle In Style',
};

export default function NewsEventsManagePage() {
    return (
        <div className="min-h-[calc(119vh-230px)] px-2">
            <NewsEventsManage />
        </div>
    );
}

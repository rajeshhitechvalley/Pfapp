import { useContext } from 'react';
import { Sidebar } from '@/components/ui/sidebar';

export function useSidebarContext() {
    const context = useContext(Sidebar);
    
    if (!context) {
        throw new Error('useSidebarContext must be used within a SidebarProvider');
    }
    
    return context;
}

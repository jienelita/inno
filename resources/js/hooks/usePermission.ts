// hooks/usePermission.ts
import { usePage } from '@inertiajs/react';

type UserRole = {
    feature_id: string;
    capability: string;
};

export function usePermission() {
    const user_role = usePage().props.user_role ?? [];
    const is_admin = usePage().props.is_admin;

    function hasPermission(feature: string, cap: string): boolean {
        if (is_admin === 3){
            return true;
        }
        
        return user_role.some(
            (perm) =>
                perm.capability?.toLowerCase() === cap.toLowerCase() &&
                perm.feature_id?.toLowerCase() === feature.toLowerCase()
        );
    }

    return { hasPermission };

}

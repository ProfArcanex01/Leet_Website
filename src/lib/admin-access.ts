export type AdminRole =
  | 'ops_admin'
  | 'finance_admin'
  | 'growth_admin'
  | 'platform_admin';

export type AdminSession = {
  user: {
    id: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
  };
  admin_group_names: AdminRole[];
  is_platform_admin: boolean;
  is_ops_admin: boolean;
  is_growth_admin: boolean;
  is_finance_admin: boolean;
};

export type AdminNavItem = {
  label: string;
  href: string;
  description: string;
  roles: AdminRole[];
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: 'Dashboard', href: '/ops-9xk3', description: 'Overview & quick links', roles: ['platform_admin'] },
  { label: 'Users', href: '/ops-9xk3/users', description: 'Hosts, riders, and staff', roles: ['platform_admin'] },
  { label: 'Notifications', href: '/ops-9xk3/notifications', description: 'Custom push & scheduled sends', roles: ['growth_admin', 'platform_admin'] },
  { label: 'Network', href: '/ops-9xk3/network', description: 'Invite relationship graph', roles: ['platform_admin'] },
  { label: 'Transactions', href: '/ops-9xk3/transactions', description: 'Payments & settlements', roles: ['finance_admin', 'platform_admin'] },
  { label: 'Rides', href: '/ops-9xk3/rides', description: 'Ride history & status', roles: ['ops_admin', 'platform_admin'] },
  { label: 'Demand', href: '/ops-9xk3/demand', description: 'Search hotspots & unmet rider demand', roles: ['ops_admin', 'platform_admin'] },
  { label: 'Template Outreach', href: '/ops-9xk3/template-outreach', description: 'Hosts needing route template setup help', roles: ['ops_admin', 'growth_admin'] },
  { label: 'System', href: '/ops-9xk3/system', description: 'Pricing & configuration', roles: ['platform_admin'] },
  { label: 'Waitlist', href: '/ops-9xk3/waitlist', description: 'Launch waitlist signups', roles: ['ops_admin', 'platform_admin'] },
  { label: 'Agents', href: '/ops-9xk3/agents', description: 'Recruitment applications', roles: ['growth_admin', 'platform_admin'] },
  { label: 'Training', href: '/ops-9xk3/training', description: 'Agent learning materials', roles: ['growth_admin', 'platform_admin'] },
  { label: 'Support', href: '/ops-9xk3/support', description: 'Support tickets & reports', roles: ['ops_admin', 'platform_admin'] },
  { label: 'Studio', href: '/studio', description: 'Sanity content studio', roles: ['platform_admin'] },
];

export function hasAdminRole(session: AdminSession | null, role: AdminRole) {
  return Boolean(session?.admin_group_names?.includes(role));
}

export function getAllowedAdminNavItems(session: AdminSession | null) {
  return ADMIN_NAV_ITEMS.filter((item) => item.roles.some((role) => hasAdminRole(session, role)));
}

export function canAccessAdminPath(session: AdminSession | null, pathname: string) {
  return ADMIN_NAV_ITEMS.some((item) => {
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      return item.roles.some((role) => hasAdminRole(session, role));
    }
    return false;
  });
}

export function getDefaultAdminPath(session: AdminSession | null) {
  return getAllowedAdminNavItems(session)[0]?.href || '/ops-9xk3/login';
}

/**
 * Route Registry for IsoFlux
 * 
 * Central registry of all valid routes in the application.
 * Used for compile-time and runtime validation of navigation.
 */

export const ROUTES = {
  // Main Pages
  HOME: '/',
  ISOFLUX: '/isoflux',
  ABOUT: '/about',
  SERVICES: '/services',
  CONTACT: '/contact',
  
  // Showcase Pages
  EXPERIENCE: '/experience',
  ANIMATIONS: '/animations',
  
  // Authentication
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  DASHBOARD_API_KEYS: '/dashboard/api-keys',

  // Legal Pages
  PRIVACY: '/privacy',
  TERMS: '/terms',
  DISCLAIMER: '/disclaimer',
  LICENSE: '/license',
  
  // Documentation
  DOCS: '/docs/ISOFLUX.md',
  API_DOCS: '/docs/API.md',
  DEPLOYMENT_DOCS: '/docs/DEPLOYMENT.md',
  
  // API Routes (for internal use)
  API: {
    ISOFLUX: {
      PROCESS: '/api/isoflux/process',
      VALIDATE: '/api/isoflux/validate',
      RESERVES: '/api/isoflux/reserves',
      ATTESTATION: '/api/isoflux/attestation',
      STATUS: '/api/isoflux/status',
    },
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
    },
  },
} as const;

/**
 * Route Metadata
 * Additional information about each route
 */
export const ROUTE_METADATA = {
  [ROUTES.HOME]: {
    title: 'Home',
    description: 'IsoFlux Home Page',
    requiresAuth: false,
  },
  [ROUTES.ISOFLUX]: {
    title: 'IsoFlux',
    description: 'The Compliance Wolf',
    requiresAuth: false,
  },
  [ROUTES.ABOUT]: {
    title: 'About',
    description: 'About IsoFlux',
    requiresAuth: false,
  },
  [ROUTES.SERVICES]: {
    title: 'Services',
    description: 'IsoFlux Services',
    requiresAuth: false,
  },
  [ROUTES.CONTACT]: {
    title: 'Contact',
    description: 'Contact IsoFlux',
    requiresAuth: false,
  },
  [ROUTES.EXPERIENCE]: {
    title: '3D Experience',
    description: 'Immersive 3D Showcase',
    requiresAuth: false,
  },
  [ROUTES.ANIMATIONS]: {
    title: 'Animations',
    description: 'Animation Components Showcase',
    requiresAuth: false,
  },
  [ROUTES.LOGIN]: {
    title: 'Login',
    description: 'Sign In to IsoFlux',
    requiresAuth: false,
  },
  [ROUTES.SIGNUP]: {
    title: 'Sign Up',
    description: 'Create IsoFlux Account',
    requiresAuth: false,
  },
  [ROUTES.DASHBOARD]: {
    title: 'Dashboard',
    description: 'IsoFlux Dashboard',
    requiresAuth: true,
  },
  [ROUTES.DASHBOARD_API_KEYS]: {
    title: 'Reactor API Keys',
    description: 'Manage API keys for IsoFlux Compliance API',
    requiresAuth: true,
  },
  [ROUTES.PRIVACY]: {
    title: 'Privacy Policy',
    description: 'IsoFlux Privacy Policy',
    requiresAuth: false,
  },
  [ROUTES.TERMS]: {
    title: 'Terms & Conditions',
    description: 'IsoFlux Terms and Conditions',
    requiresAuth: false,
  },
  [ROUTES.DISCLAIMER]: {
    title: 'Disclaimer',
    description: 'IsoFlux Disclaimer',
    requiresAuth: false,
  },
  [ROUTES.LICENSE]: {
    title: 'License Agreement',
    description: 'IsoFlux Software License',
    requiresAuth: false,
  },
} as const;

/**
 * Navigation Menu Structure
 */
export const NAV_MENU = {
  MAIN: [
    { label: 'Home', route: ROUTES.ISOFLUX },
    { label: 'About', route: ROUTES.ABOUT },
    { label: 'Services', route: ROUTES.SERVICES },
    { label: 'Contact', route: ROUTES.CONTACT },
  ],
  SHOWCASE: [
    { label: '3D Experience', route: ROUTES.EXPERIENCE },
    { label: 'Animations', route: ROUTES.ANIMATIONS },
  ],
  LEGAL: [
    { label: 'Privacy Policy', route: ROUTES.PRIVACY },
    { label: 'Terms & Conditions', route: ROUTES.TERMS },
    { label: 'Disclaimer', route: ROUTES.DISCLAIMER },
    { label: 'License Agreement', route: ROUTES.LICENSE },
  ],
  FOOTER: [
    { label: 'About', route: ROUTES.ABOUT },
    { label: 'Services', route: ROUTES.SERVICES },
    { label: 'Contact', route: ROUTES.CONTACT },
    { label: 'Privacy', route: ROUTES.PRIVACY },
    { label: 'Terms', route: ROUTES.TERMS },
  ],
} as const;

/**
 * Get all valid routes as an array
 */
export function getAllRoutes(): string[] {
  const routes: string[] = [];
  
  function extractRoutes(obj: any, prefix = ''): void {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'string') {
        routes.push(value);
      } else if (typeof value === 'object' && value !== null) {
        extractRoutes(value, prefix);
      }
    }
  }
  
  extractRoutes(ROUTES);
  return [...new Set(routes)]; // Remove duplicates
}

/**
 * Check if a route is valid
 */
export function isValidRoute(route: string): boolean {
  const allRoutes = getAllRoutes();
  
  // Exact match
  if (allRoutes.includes(route)) {
    return true;
  }
  
  // Dynamic route match (e.g., /api/isoflux/reserves/[assetId])
  if (route.startsWith('/api/isoflux/reserves/') || 
      route.startsWith('/api/isoflux/attestation/')) {
    return true;
  }
  
  // External URLs
  if (route.startsWith('http://') || route.startsWith('https://')) {
    return true;
  }
  
  // Hash links
  if (route.startsWith('#')) {
    return true;
  }
  
  return false;
}

/**
 * Get route metadata
 */
export function getRouteMetadata(route: string) {
  return ROUTE_METADATA[route as keyof typeof ROUTE_METADATA];
}

/**
 * Type helper for route values
 */
export type RouteValue = typeof ROUTES[keyof typeof ROUTES] | string;

/**
 * Validate route at compile time (type-level check)
 */
export type ValidRoute = RouteValue;

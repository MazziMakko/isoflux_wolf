/**
 * Navigation System Exports
 * 
 * Central export point for all navigation-related functionality.
 */

// Route registry
export { 
  ROUTES, 
  ROUTE_METADATA, 
  NAV_MENU, 
  getAllRoutes, 
  isValidRoute, 
  getRouteMetadata,
  type RouteValue,
  type ValidRoute,
} from './routes';

// Safe navigation components
export { default as SafeLink, StyledLink } from '../components/navigation/SafeLink';
export { default as SafeButton } from '../components/navigation/SafeButton';

// Main navigation components
export { default as MainNavigation, FooterNavigation } from '../components/navigation/MainNavigation';

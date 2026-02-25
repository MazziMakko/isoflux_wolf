// =====================================================
// CLIENT-SIDE TOKEN UPDATE UTILITY
// This file is a reference for updating fluxforge_token to wolf_shield_token
// Do not import this file - it's documentation only
// =====================================================

export const TOKEN_UPDATE_GUIDE = {
  OLD_KEY: 'fluxforge_token',
  NEW_KEY: 'wolf_shield_token',
  
  FILES_TO_UPDATE: [
    'src/app/signup/page.tsx',
    'src/app/login/page.tsx',
    'src/app/dashboard/page.tsx',
    'src/app/dashboard/api-keys/page.tsx',
  ],
  
  FIND: "localStorage.setItem('fluxforge_token'",
  REPLACE: "localStorage.setItem('wolf_shield_token'",
  
  FIND_2: "localStorage.getItem('fluxforge_token')",
  REPLACE_2: "localStorage.getItem('wolf_shield_token')",
  
  FIND_3: "localStorage.removeItem('fluxforge_token')",
  REPLACE_3: "localStorage.removeItem('wolf_shield_token')",
};

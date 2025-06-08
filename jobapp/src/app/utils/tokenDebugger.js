'use client';

/**
 * Utility to debug JWT tokens
 */
export function debugToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found in localStorage');
      return null;
    }
    
    console.log('Token found:', token.substring(0, 15) + '...');
    
    // For JWT tokens
    if (token.split('.').length === 3) {
      try {
        // Decode JWT token to get user information
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        console.log('JWT payload:', payload);
        
        // Check various common JWT fields for user ID
        const userId = payload.sub || payload.email || payload.username || payload.user_id;
        console.log('Extracted user ID:', userId);
        
        // Log all potential ID fields
        console.log('Potential ID fields:');
        console.log('- sub:', payload.sub);
        console.log('- email:', payload.email);
        console.log('- username:', payload.username);
        console.log('- user_id:', payload.user_id);
        console.log('- id:', payload.id);
        console.log('- uid:', payload.uid);
        
        return payload;
      } catch (jwtError) {
        console.error('Error decoding JWT:', jwtError);
      }
    } else {
      console.log('Token is not a standard JWT (does not have 3 parts)');
    }
    
    return token;
  } catch (error) {
    console.error('Error in debugToken:', error);
    return null;
  }
} 
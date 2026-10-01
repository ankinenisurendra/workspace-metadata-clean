import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import App from '@/App';
import { AuthProvider } from '@/hooks/AuthContext';
import type { IAuthService } from '@/services/IAuthService';

describe('App routes', () => {
  it('shows the governance preview at the public preview route', async () => {
    window.history.pushState({}, '', '/preview');

    const authService: IAuthService = {
      fabricAuthEnabled: false,
      signIn: vi.fn().mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
      }),
      signOut: vi.fn().mockResolvedValue(undefined),
      getCurrentUser: vi.fn().mockResolvedValue(null),
      initEmbeddedAuth: vi.fn().mockResolvedValue(null),
    };

    render(
      <AuthProvider authService={authService}>
        <App />
      </AuthProvider>
    );

    expect(
      await screen.findByRole('heading', { name: 'Welcome, Surendra!' })
    ).toBeInTheDocument();
    expect(screen.getByText('Workspace Metadata Catalog Process')).toBeInTheDocument();
  });
});

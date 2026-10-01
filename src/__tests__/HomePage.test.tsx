import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '@/hooks/AuthContext';
import type { IAuthService } from '@/services/IAuthService';
import {
  getWorkspaceMetadataSubmissions,
  submitWorkspaceMetadata,
} from '@/services/workspaceMetadataService';
import { HomePage } from '@/pages/HomePage';

vi.mock('@/services/workspaceMetadataService', () => ({
  getWorkspaceMetadataSubmissions: vi.fn().mockResolvedValue([]),
  submitWorkspaceMetadata: vi.fn().mockResolvedValue(undefined),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getWorkspaceMetadataSubmissions).mockResolvedValue([]);
  vi.mocked(submitWorkspaceMetadata).mockResolvedValue(undefined);
});

function renderHomePage(authenticated = true) {
  const user = {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Surendra Ankineni',
  };
  const authService: IAuthService = {
    fabricAuthEnabled: false,
    signIn: vi.fn().mockResolvedValue(user),
    signOut: vi.fn().mockResolvedValue(undefined),
    getCurrentUser: vi.fn().mockResolvedValue(authenticated ? user : null),
    initEmbeddedAuth: vi.fn().mockResolvedValue(null),
  };

  return render(
    <AuthProvider authService={authService}>
      <HomePage />
    </AuthProvider>
  );
}

describe('HomePage', () => {
  it('searches workspaces and updates the metadata status on submit', async () => {
    const user = userEvent.setup();
    renderHomePage();

    await screen.findByRole('heading', { name: 'Welcome, Surendra!' });
    const workspaceSearch = screen.getByRole('textbox', { name: 'Search workspace' });
    await user.type(workspaceSearch, 'Sales');

    expect(screen.getByRole('button', { name: /Sales Reporting/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Finance Analytics/ })).not.toBeInTheDocument();

    await user.clear(workspaceSearch);
    await user.click(screen.getByRole('button', { name: /HR Dashboard/ }));
    expect(screen.getByText('Description', { selector: 'li' })).toBeInTheDocument();

    await user.type(
      screen.getByRole('textbox', { name: 'Description *' }),
      'Workforce planning and reporting.'
    );
    await user.click(screen.getByRole('radio', { name: 'EF' }));
    const businessFunction = screen.getByRole('combobox', { name: 'Business Function *' });
    await user.type(businessFunction, 'HR - Employee');
    const businessFunctionList = screen.getByRole('listbox');
    expect(within(businessFunctionList).getByRole('option', { name: 'HR - Employee' })).toBeInTheDocument();
    expect(within(businessFunctionList).queryByRole('option', { name: 'Finance' })).not.toBeInTheDocument();
    await user.click(within(businessFunctionList).getByRole('option', { name: 'HR - Employee' }));
    const usagePurpose = screen.getByRole('combobox', { name: 'Usage Purpose *' });
    await user.click(usagePurpose);
    const usagePurposeList = screen.getByRole('listbox');
    expect(within(usagePurposeList).getAllByRole('option')).toHaveLength(2);
    expect(within(usagePurposeList).getByRole('option', { name: 'Productive' })).toBeInTheDocument();
    expect(within(usagePurposeList).getByRole('option', { name: 'Non-Productive' })).toBeInTheDocument();
    await user.click(within(usagePurposeList).getByRole('option', { name: 'Productive' }));
    await user.click(screen.getByRole('button', { name: /Submit/ }));

    expect(
      await screen.findByText(
        'HR Dashboard metadata was saved to Rayfin. Run the Fabric pipeline to sync it to the Lakehouse.'
      )
    ).toBeInTheDocument();
    expect(submitWorkspaceMetadata).toHaveBeenCalledWith({
      workspaceId: 'WS-009876',
      workspaceName: 'HR Dashboard',
      description: 'Workforce planning and reporting.',
      division: 'EF',
      businessFunction: 'HR - Employee',
      usagePurpose: 'Productive',
      contacts: '',
      submittedById: 'user-1',
      submittedByEmail: 'user@example.com',
    });
    expect(screen.getByText('Complete', { selector: '.large-status' })).toBeInTheDocument();
    expect(screen.getByText('All mandatory fields are complete.')).toBeInTheDocument();
  });

  it('does not mark metadata as saved when the Rayfin request fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(submitWorkspaceMetadata).mockRejectedValueOnce(new Error('Backend unavailable'));
    renderHomePage();

    await screen.findByRole('heading', { name: 'Welcome, Surendra!' });
    await user.click(screen.getByRole('button', { name: /HR Dashboard/ }));
    await user.type(
      screen.getByRole('textbox', { name: 'Description *' }),
      'Workforce planning and reporting.'
    );
    await user.click(screen.getByRole('radio', { name: 'EF' }));
    const businessFunction = screen.getByRole('combobox', { name: 'Business Function *' });
    await user.type(businessFunction, 'HR - Employee');
    await user.click(screen.getByRole('option', { name: 'HR - Employee' }));
    const usagePurpose = screen.getByRole('combobox', { name: 'Usage Purpose *' });
    await user.click(usagePurpose);
    await user.click(screen.getByRole('option', { name: 'Productive' }));
    await user.click(screen.getByRole('button', { name: /Submit/ }));

    expect(
      await screen.findByText(
        "Couldn't save HR Dashboard metadata to Rayfin: Backend unavailable"
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Missing Metadata', { selector: '.large-status' })).toBeInTheDocument();
  });

  it('does not send changes to Rayfin from the unauthenticated preview', async () => {
    const user = userEvent.setup();
    renderHomePage(false);

    await screen.findByRole('heading', { name: 'Welcome, Surendra!' });
    await user.click(screen.getByRole('button', { name: /Submit/ }));

    expect(
      await screen.findByText(
        'Sign in to submit metadata. Preview mode does not save changes.'
      )
    ).toBeInTheDocument();
    expect(submitWorkspaceMetadata).not.toHaveBeenCalled();
  });

  it('restores the latest saved workspace metadata from Rayfin after loading', async () => {
    const user = userEvent.setup();
    vi.mocked(getWorkspaceMetadataSubmissions).mockResolvedValueOnce([
      {
        id: 'submission-1',
        workspaceId: 'WS-001234',
        workspaceName: 'Finance Analytics',
        description: 'Finance metadata persisted in Rayfin.',
        division: 'CH',
        businessFunction: 'Finance',
        usagePurpose: 'Productive',
        contacts: 'finance@example.com',
        submittedById: 'user-1',
        submittedByEmail: 'user@example.com',
        submittedAt: new Date('2026-09-28T12:00:00.000Z'),
      },
      {
        id: 'submission-2',
        workspaceId: 'WS-009876',
        workspaceName: 'HR Dashboard',
        description: 'HR metadata persisted in Rayfin.',
        division: 'EF',
        businessFunction: 'HR - Employee',
        usagePurpose: 'Non-Productive',
        contacts: 'hr@example.com',
        submittedById: 'user-1',
        submittedByEmail: 'user@example.com',
        submittedAt: new Date('2026-09-28T12:05:00.000Z'),
      },
    ]);
    renderHomePage();

    await screen.findByRole('heading', { name: 'Welcome, Surendra!' });
    expect(
      await screen.findByRole('button', { name: /Finance Analytics.*Complete/s })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Description *' })
    ).toHaveValue('Finance metadata persisted in Rayfin.');

    await user.click(screen.getByRole('button', { name: /HR Dashboard/ }));
    expect(
      screen.getByRole('button', { name: /HR Dashboard.*Complete/s })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Description *' })
    ).toHaveValue('HR metadata persisted in Rayfin.');
    expect(
      screen.getByRole('combobox', { name: 'Usage Purpose *' })
    ).toHaveValue('Non-Productive');
  });

  it('changes available Business Functions when the selected Business Division changes', async () => {
    const user = userEvent.setup();
    renderHomePage();

    await screen.findByRole('heading', { name: 'Welcome, Surendra!' });
    const businessFunction = screen.getByRole('combobox', { name: 'Business Function *' });
    await user.click(businessFunction);
    expect(within(screen.getByRole('listbox')).getAllByRole('option')).toHaveLength(13);
    expect(screen.getByRole('option', { name: 'Finance' })).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'CS' }));
    expect(businessFunction).toHaveValue('');
    await user.click(businessFunction);
    expect(within(screen.getByRole('listbox')).getAllByRole('option')).toHaveLength(36);
    expect(
      screen.getByRole('option', { name: 'Customer - Enterprise Account Enablement' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Finance' })).not.toBeInTheDocument();
  });

  it('searches Business Functions and Usage Purposes before selection', async () => {
    const user = userEvent.setup();
    renderHomePage();

    await screen.findByRole('heading', { name: 'Welcome, Surendra!' });
    await user.click(screen.getByRole('radio', { name: 'EF' }));

    const businessFunction = screen.getByRole('combobox', {
      name: 'Business Function *',
    });
    await user.type(businessFunction, 'employee');
    const businessFunctionList = screen.getByRole('listbox');
    expect(within(businessFunctionList).getByRole('option', { name: 'HR - Employee' })).toBeInTheDocument();
    expect(within(businessFunctionList).queryByRole('option', { name: 'Finance' })).not.toBeInTheDocument();
    await user.click(within(businessFunctionList).getByRole('option', { name: 'HR - Employee' }));

    const usagePurpose = screen.getByRole('combobox', { name: 'Usage Purpose *' });
    await user.type(usagePurpose, 'non');
    expect(screen.getByRole('option', { name: 'Non-Productive' })).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Non-Productive' }));

    await user.click(usagePurpose);
    await user.type(usagePurpose, 'unknown');
    expect(screen.getByText('No matching options')).toBeInTheDocument();
  });

  it('shows only pending workspaces when Pending Updates is selected', async () => {
    const user = userEvent.setup();
    renderHomePage();

    await screen.findByRole('heading', { name: 'Welcome, Surendra!' });
    await user.click(screen.getByRole('button', { name: /Pending Updates/ }));

    const list = screen.getByRole('region', { name: 'Workspace list' });
    expect(within(list).getByRole('button', { name: /Finance Analytics/ })).toBeInTheDocument();
    expect(within(list).getByRole('button', { name: /HR Dashboard/ })).toBeInTheDocument();
    expect(within(list).queryByRole('button', { name: /Sales Reporting/ })).not.toBeInTheDocument();
  });

  it('lists every workspace and opens the selected metadata editor', async () => {
    const user = userEvent.setup();
    renderHomePage();

    await screen.findByRole('heading', { name: 'Welcome, Surendra!' });
    await user.click(screen.getByRole('button', { name: 'All Workspaces' }));

    const directory = screen.getByRole('region', { name: 'All workspaces' });
    expect(within(directory).getByText('Total workspaces')).toBeInTheDocument();
    expect(within(directory).getByText('Finance Analytics')).toBeInTheDocument();
    expect(within(directory).getByText('Sales Reporting')).toBeInTheDocument();
    expect(within(directory).getByText('Marketing Insights')).toBeInTheDocument();

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter workspaces by status' }),
      'Complete'
    );
    expect(within(directory).queryByText('Finance Analytics')).not.toBeInTheDocument();
    expect(within(directory).getByText('Sales Reporting')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit Sales Reporting metadata' }));
    expect(screen.getByRole('heading', { name: 'My Workspaces' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Workspace Name' })).toHaveValue('Sales Reporting');
  });

  it('shows the metadata FAQ and its external support links', async () => {
    const user = userEvent.setup();
    renderHomePage();

    await screen.findByRole('heading', { name: 'Welcome, Surendra!' });
    await user.click(screen.getByRole('button', { name: 'Help & Support' }));

    expect(screen.getByRole('heading', { name: 'Frequently asked questions' })).toBeInTheDocument();
    const faq = screen.getByRole('region', { name: 'Frequently asked questions' });
    await user.click(
      within(faq).getByRole('button', { name: /How do I choose the right Usage Purpose/ })
    );
    expect(within(faq).getByText('Productive')).toBeInTheDocument();
    expect(within(faq).getByText('Non-Productive')).toBeInTheDocument();
    await user.click(
      within(faq).getByRole('button', { name: /How do I request access to update workspace metadata/ })
    );
    expect(within(faq).getByText('Choose Entitlements')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Continue to Bayer IdentityNow/ })).toHaveAttribute(
      'href',
      'https://bayer.identitynow.com/ui/d/request-center'
    );
    expect(screen.getByRole('link', { name: /Metadata update guide/ })).toHaveAttribute(
      'href',
      'https://bayergroup.sharepoint.com/:w:/r/sites/APIDataIntegrationToolsUnit2-DataVisualizationToolsSquad/_layouts/15/Doc.aspx?sourcedoc=%7B42EC5DA6-CF2A-4641-88F3-083D4A9BBF6C%7D&file=Steps%20to%20Update%20Workspace%20Metadata%20Catalog%20Process.docx&action=default&mobileredirect=true'
    );
  });
});

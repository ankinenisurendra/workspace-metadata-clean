import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { useAuth } from '@/hooks/AuthContext';
import {
  getWorkspaceMetadataSubmissions,
  submitWorkspaceMetadata,
} from '@/services/workspaceMetadataService';

type WorkspaceStatus = 'Missing' | 'Complete';
type Division = 'CH' | 'CS' | 'PH' | 'EF';
type UsagePurpose = 'Productive' | 'Non-Productive';
type AllWorkspaceStatusFilter = 'All statuses' | WorkspaceStatus;
const usagePurposes: UsagePurpose[] = ['Productive', 'Non-Productive'];
const noOptions: readonly string[] = [];

const businessFunctionsByDivision: Record<Division, readonly string[]> = {
  EF: [
    'A2R - Change Management',
    'Cybersecurity Analytics & Reporting',
    'A2R - Investment Management',
    'A2R - Material Management / Spare parts',
    'A2R - Plant Maintenance',
    'A2R - Service Management',
    'EMDA - Business Partner',
    'EMDA - Company',
    'EMDA - Data Quality',
    'EMDA - Data Standards',
    'EMDA - Material',
    'EMDA - Pricing Condition',
    'FACT - Overhead Management (COOM)',
    'FACT - Sales and P&L (COPA)',
    'FACT - Product Costing (PC)',
    'FACT - Tax (Tax)',
    'FACT - Group Reporting and Closing (GRC)',
    'FACT - Working Capital and Cash (CASH)',
    'FACT - Finance Master Data (FMD)',
    'FACT - Financial Planning (FP)',
    'FACT - Asset Management (AM)',
    'FACT - General Accounting (GA)',
    'FACT - Payments and Bank Accounting (PBA)',
    'FACT - Transactional Accounting (TA)',
    'FACT - Intercompany Accounting (IA)',
    'FACT - Cost Accounting (CA)',
    'FACT - Revenue Accounting (RA)',
    'FACT - Treasury (TR)',
    'GBS – Enterprise Support Solutions',
    'HR - Employee',
    'HR - Talent Management',
    'HR - Time Management',
    'HR - Compensation & Benefits',
    'HR - Organization Management',
    'HR - Travel Management',
    'IT4ALL - Identity and Access',
    'IT4ALL - IT Asset',
    'IT4ALL - IT Order Management',
    'IT4ALL - IT Service Management',
    'IT4ALL - Telemetry',
    'LPC - Company Location',
    'LPC - Legal',
    'O2C - Sales',
    'O2C - Billing',
    'O2C - Invoice',
    'O2C - Foreign Trade',
    'O2C - Contract to Cash',
    'O2C - Vistex',
    'PRO - Analyzing & Reports',
    'PRO - Enabling Processing',
    'PRO - Procurement functional definitions',
    'PRO - Strategic Procurement',
    'PRO - Supplier Management',
    'PRO - Value Delivery',
    'PRO – Reports & Automations',
    'SSHE - Health Safety Environment',
    'SSHE - Sustainability',
    'Shared Content - Change Logs',
    'Shared Content - Pricing Condition',
    'Shared Content - Invoice Approval',
    'Shared Content - Meta Data',
    'SCL - Cross Supply Chain Management (SCM)',
    'SCL - Downstream (DS)',
    'SCL - Inventory & Write-off (INVWO)',
    'SCL - Production Planning (PP)',
    'SCL - Quality Management (QM)',
    'SCL - Demand & Supply Planning (DSP)',
    'DTIT',
    'Data & Analytics (IT-managed)',
    'MOBEDM-Mobility Operations DLC',
    'MOBEDM – Travel and Expense Management APAC',
  ],
  PH: [
    'Commercial Analytics',
    'PS - Manufacturing Execution Data',
    'PS - Equipment Processes',
    'PS - Quality Assurance',
    'PS - Quality Control Lab Processes',
    'PS - Health, Safety and Environment (HSE)',
    'PS - Energy',
    'PS - Supply Chain Management',
    'PS - CMC Formulation',
    'PS - CMC Medical Device',
    'PS - CMC Product',
    'PS - PS & MFG',
    'PS-EMEX',
    'CO - Customer Engagement',
    'CO - Master & Reference Data',
    'CO - Analytical Products',
    'CO - Digital Assets',
    'CO - Compliance',
    'CO - Financials',
    'CO - Quality',
    'CO - Market Insight',
    'CO - Data Foundations US',
    'CO - Data Foundations CN',
    'CO - Market Autonomy Zones',
    'RAD - General Clinical Imaging Services',
    'RAD - Contrast Media Research',
    'AS - Electronic Health Records Data',
    'AS - Healthcare Claims & Administrative Data',
    'AS - Patient Registry Data',
    'AS - Population Health & Epidemiological Study Data',
    'AS - Digital Health & Biosensor Data',
    'AS - Scientific Communication',
    'AS - ICSR Management',
    'AS - Regulatory',
    'AS - Benefit Risk Management',
    'AS - CMO Quality Management',
    'AS - Medical Info Management',
    'AS - Product Supply Quality Assurance',
    'R&D - Chemistry',
    'R&D - Bioactivity Data',
    'R&D - Toxicology & Safety',
    'R&D - Biomarker',
    'R&D - OMICS',
    'R&D - Clinical',
    'R&D - Master & Reference Data',
    'R&D - Biomarker (Human)',
    'R&D - Competitive Intelligence Data',
    'R&D - Literature',
    'R&D - Patent',
    'R&D - Regulatory Submissions and Filings',
    'R&D - Product Registration Data',
    'R&D - Pipeline & Portfolio',
  ],
  CH: [
    'Product Supply – Manufacturing',
    'Product Supply – Supply Chain',
    'Medical, Product, R&D',
    'Market',
    'Customer Fragmented',
    'Customer Ecomm',
    'Customer Consolidated',
    'Consumer',
    'Finance',
    'DTIT',
    'CO-Quality',
    'Cross-Domain Data & Analytics (Business managed)',
    'Cross-Domain Data & Analytics (IT-managed)',
  ],
  CS: [
    'Customer - Enterprise Account Enablement',
    'Customer - Enterprise Sales Enablement',
    'Customer - Enterprise Products & Services',
    'Customer - Enterprise Order Enablement',
    'Customer - Enterprise Marketing Enablement',
    'Market - Market & Competitor Intelligence',
    'Market - Market Master Data',
    'Market - Consumers',
    'Market - End Consumer Master Data',
    'Market - Consumer Geographies',
    'Operations - Location-Facility',
    'Operations - Health, Safety, Environment (HSE)',
    'Operations - Location Master Data',
    'Product - Product Master Data',
    'Product - Seeds & Traits',
    'Product - Crop Protection',
    'Product - Regulatory',
    'Product - Supply Chain',
    'Product - Digital',
    'Product - Quality',
    'R&D - Biology',
    'R&D - Chemical Process Research',
    'R&D - Chemistry Analytics',
    'R&D - Field Trial Experiment',
    'R&D - Formulation Development',
    'R&D - Germplasm Pipeline',
    'R&D - Location',
    'R&D - Material',
    'R&D - Microbial Formulation Development',
    'R&D - Models & Algorithms',
    'R&D - Molecule Discovery',
    'R&D - Omics',
    'R&D - Pipeline',
    'R&D - Regulatory',
    'R&D – Plant Biotechology',
    'R&D - Trait Pipeline',
  ],
};

interface WorkspaceMetadata {
  description: string;
  division: Division | '';
  businessFunction: string;
  usagePurpose: UsagePurpose | '';
  contacts: string;
}

interface Workspace extends WorkspaceMetadata {
  id: string;
  name: string;
  status: WorkspaceStatus;
  updated: string;
  icon: string;
  color: string;
}

const initialWorkspaces: Workspace[] = [
  {
    id: 'WS-001234',
    name: 'Finance Analytics',
    description: 'This workspace is used for finance reporting and analysis.',
    division: 'CH',
    businessFunction: 'Finance',
    usagePurpose: 'Productive',
    contacts: 'finance-team@contoso.com',
    status: 'Missing',
    updated: 'Not updated yet',
    icon: '◉',
    color: 'blue',
  },
  {
    id: 'WS-005678',
    name: 'Sales Reporting',
    description: 'Curated reporting for sales operations and regional performance.',
    division: 'CS',
    businessFunction: 'Customer - Enterprise Sales Enablement',
    usagePurpose: 'Productive',
    contacts: 'sales-analytics@contoso.com',
    status: 'Complete',
    updated: 'Yesterday',
    icon: '▥',
    color: 'purple',
  },
  {
    id: 'WS-009876',
    name: 'HR Dashboard',
    description: '',
    division: '',
    businessFunction: 'HR - Employee',
    usagePurpose: '',
    contacts: '',
    status: 'Missing',
    updated: 'Not updated yet',
    icon: '♧',
    color: 'green',
  },
  {
    id: 'WS-012345',
    name: 'Marketing Insights',
    description: 'Marketing campaign metrics and customer engagement trends.',
    division: 'CS',
    businessFunction: 'Market - Consumers',
    usagePurpose: 'Productive',
    contacts: 'marketing-data@contoso.com',
    status: 'Complete',
    updated: '2 days ago',
    icon: '◈',
    color: 'orange',
  },
  {
    id: 'WS-017890',
    name: 'Operations Data',
    description: 'Operational performance and service delivery metrics.',
    division: 'PH',
    businessFunction: 'PS - Supply Chain Management',
    usagePurpose: 'Non-Productive',
    contacts: 'operations@contoso.com',
    status: 'Complete',
    updated: '3 days ago',
    icon: '▤',
    color: 'teal',
  },
];

const requiredMetadataFields = [
  'Description',
  'Business Division',
  'Business Function',
  'Usage Purpose',
];

const identityNowUrl = 'https://bayer.identitynow.com/ui/d/request-center';
const processDocumentUrl =
  'https://bayergroup.sharepoint.com/:w:/r/sites/APIDataIntegrationToolsUnit2-DataVisualizationToolsSquad/_layouts/15/Doc.aspx?sourcedoc=%7B42EC5DA6-CF2A-4641-88F3-083D4A9BBF6C%7D&file=Steps%20to%20Update%20Workspace%20Metadata%20Catalog%20Process.docx&action=default&mobileredirect=true';

interface FaqItem {
  id: string;
  question: string;
  category: string;
  searchText: string;
  answer: ReactNode;
}

const faqItems: FaqItem[] = [
  {
    id: 'eligibility',
    question: 'Who can update Workspace Metadata?',
    category: 'Getting started',
    searchText: 'workspace admins Bayer employees external users guests access permissions',
    answer: (
      <p>
        Only <strong>Workspace Admins and Bayer employees</strong> are permitted to
        review and update Workspace Metadata. External users, guests, or non-Bayer
        users should not update workspace metadata.
      </p>
    ),
  },
  {
    id: 'required-information',
    question: 'What information needs to be updated?',
    category: 'Metadata fields',
    searchText: 'workspace description business division business function usage purpose fields',
    answer: (
      <>
        <p>Workspace owners and admins should review and maintain these fields:</p>
        <ul>
          <li>Workspace Description</li>
          <li>Business Division</li>
          <li>Business Function</li>
          <li>Usage Purpose</li>
        </ul>
      </>
    ),
  },
  {
    id: 'description',
    question: 'What is Workspace Description?',
    category: 'Metadata fields',
    searchText: 'workspace description purpose business use case data reports dashboards solutions',
    answer: (
      <p>
        A brief explanation of the workspace purpose, business use case, and the
        data, reports, dashboards, or solutions maintained within the workspace.
        It should help users understand why the workspace exists and how it is used.
      </p>
    ),
  },
  {
    id: 'division',
    question: 'What is Business Division?',
    category: 'Metadata fields',
    searchText: 'business division Crop Science CS Pharma PH Consumer Health CH Enable Functions EF',
    answer: (
      <p>
        Business Division identifies the broader business area that owns or
        primarily uses the workspace, such as Crop Science (CS), Pharma (PH),
        Consumer Health (CH), or Enable Functions (EF).
      </p>
    ),
  },
  {
    id: 'business-function',
    question: 'What is Business Function?',
    category: 'Metadata fields',
    searchText: 'business function team department finance supply chain commercial R&D IT data analytics',
    answer: (
      <p>
        Business Function identifies the specific business team or department
        that owns or primarily uses the workspace (for example, Finance, Supply
        Chain, Commercial, R&amp;D, IT, or Data &amp; Analytics).
      </p>
    ),
  },
  {
    id: 'request-business-function',
    question: 'What if my Business Function is not available?',
    category: 'Getting started',
    searchText: 'business function unavailable missing contact Surendra email request new value',
    answer: (
      <p>
        Contact{' '}
        <a href="mailto:Surendra.ankineni@bayer.com">
          Surendra.ankineni@bayer.com
        </a>{' '}
        and share the Business Function name. After validation, it can be added
        to the Workspace Metadata application.
      </p>
    ),
  },
  {
    id: 'usage-purpose',
    question: 'How do I choose the right Usage Purpose?',
    category: 'Metadata fields',
    searchText: 'usage purpose productive non-productive production business development testing training',
    answer: (
      <div className="purpose-guide">
        <p className="purpose-intro">
          Choose the option that best describes how the workspace is used today.
        </p>
        <div className="purpose-options">
          <div className="purpose-option productive">
            <span className="purpose-option-icon" aria-hidden="true">↗</span>
            <span className="purpose-option-copy">
              <strong>Productive</strong>
              <small>Live business use</small>
              <span>
                Active operations, production reporting, dashboards, or solutions
                regularly used by end users.
              </span>
            </span>
          </div>
          <div className="purpose-option non-productive">
            <span className="purpose-option-icon" aria-hidden="true">⌘</span>
            <span className="purpose-option-copy">
              <strong>Non-Productive</strong>
              <small>Build, test, or learn</small>
              <span>
                Development, testing, proof-of-concepts (POCs), training, or
                other non-business-critical activities.
              </span>
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'access',
    question: 'How do I request access to update workspace metadata?',
    category: 'Access & support',
    searchText: 'access IdentityNow Request for Myself Entitlements DataVisualization PowerBI Workspace Owner security group',
    answer: (
      <div className="access-guide">
        <p>
          Request membership in the{' '}
          <strong>DataVisualization-PowerBI-Workspace-Owner</strong> group
          through Bayer IdentityNow.
        </p>
        <ol className="access-steps">
          <li><span>1</span><div><strong>Start a request</strong><small>Select “Request for Myself”.</small></div></li>
          <li><span>2</span><div><strong>Choose Entitlements</strong><small>Open the Entitlements category.</small></div></li>
          <li><span>3</span><div><strong>Find the workspace-owner group</strong><small>Search DataVisualization-PowerBI-Workspace-Owner.</small></div></li>
          <li><span>4</span><div><strong>Explain why access is needed</strong><small>“Required to access the Power BI Workspace Metadata application and review/update workspace information for governance purposes.”</small></div></li>
          <li><span>5</span><div><strong>Review and submit</strong><small>Confirm the request details and submit for approval.</small></div></li>
        </ol>
        <a className="access-portal-button" href={identityNowUrl} target="_blank" rel="noreferrer">
          Continue to Bayer IdentityNow <span aria-hidden="true">↗</span>
        </a>
      </div>
    ),
  },
  {
    id: 'process-document',
    question: 'Where can I find detailed process instructions?',
    category: 'Access & support',
    searchText: 'detailed instructions workspace metadata catalog process document SharePoint',
    answer: (
      <p>
        Open the{' '}
        <a href={processDocumentUrl} target="_blank" rel="noreferrer">
          Workspace Metadata Catalog Process document
        </a>{' '}
        for detailed instructions on reviewing and updating workspace metadata.
      </p>
    ),
  },
  {
    id: 'review-frequency',
    question: 'How often should metadata be reviewed?',
    category: 'Best practices',
    searchText: 'how often review update metadata ownership business purpose division function usage changes',
    answer: (
      <p>
        Review and update metadata whenever there is a significant change to the
        workspace, such as a change in ownership, business purpose, division,
        function, or usage purpose. As a best practice, review it periodically to
        keep the information accurate and up to date.
      </p>
    ),
  },
];

type Section = 'Home' | 'My Workspaces' | 'Pending Updates' | 'All Workspaces' | 'Help & Support';

function getMissingFields(metadata: WorkspaceMetadata) {
  const missing: string[] = [];
  if (!metadata.description.trim()) missing.push('Description');
  if (!metadata.division) missing.push('Business Division');
  if (!metadata.businessFunction) missing.push('Business Function');
  if (!metadata.usagePurpose) missing.push('Usage Purpose');
  return missing;
}

type SearchableSelectProps = {
  ariaLabel: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder: string;
  value: string;
};

function SearchableSelect({
  ariaLabel,
  disabled = false,
  onChange,
  options,
  placeholder,
  value,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const filteredOptions = options.filter((option) =>
    option.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  );
  const listboxId = `${ariaLabel.toLocaleLowerCase().replaceAll(' ', '-')}-options`;

  useEffect(() => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(0);
  }, [disabled, options, value]);

  function chooseOption(option: string) {
    onChange(option);
    setIsOpen(false);
    setQuery('');
    setActiveIndex(0);
  }

  return (
    <div className="searchable-select">
      <span className="searchable-select-icon" aria-hidden="true">⌕</span>
      <input
        aria-activedescendant={
          isOpen && filteredOptions[activeIndex]
            ? `${listboxId}-option-${activeIndex}`
            : undefined
        }
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-required="true"
        autoComplete="off"
        className="searchable-select-input"
        disabled={disabled}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          setIsOpen(true);
        }}
        onFocus={() => {
          setQuery('');
          setActiveIndex(0);
          setIsOpen(true);
        }}
        onBlur={() => {
          setIsOpen(false);
          setQuery('');
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsOpen(false);
            setQuery('');
          } else if (event.key === 'ArrowDown' && filteredOptions.length > 0) {
            event.preventDefault();
            setIsOpen(true);
            setActiveIndex((index) => (index + 1) % filteredOptions.length);
          } else if (event.key === 'ArrowUp' && filteredOptions.length > 0) {
            event.preventDefault();
            setIsOpen(true);
            setActiveIndex(
              (index) => (index - 1 + filteredOptions.length) % filteredOptions.length
            );
          } else if (event.key === 'Enter' && isOpen && filteredOptions[activeIndex]) {
            event.preventDefault();
            chooseOption(filteredOptions[activeIndex]);
          }
        }}
        placeholder={placeholder}
        role="combobox"
        type="text"
        value={isOpen ? query : value}
      />
      <span className={`searchable-select-chevron${isOpen ? ' is-open' : ''}`} aria-hidden="true">
        ▾
      </span>
      {isOpen && (
        <div className="searchable-select-list" id={listboxId} role="listbox">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                aria-selected={option === value}
                className={`searchable-select-option${index === activeIndex ? ' is-active' : ''}`}
                id={`${listboxId}-option-${index}`}
                key={option}
                onClick={() => chooseOption(option)}
                onMouseDown={(event) => event.preventDefault()}
                role="option"
              >
                {option}
              </div>
            ))
          ) : (
            <div className="searchable-select-empty" role="status">
              No matching options
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function HomePage() {
  const { signOut, isAuthenticated, user } = useAuth();
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [selectedId, setSelectedId] = useState(initialWorkspaces[0].id);
  const selectedIdRef = useRef(initialWorkspaces[0].id);
  const [metadata, setMetadata] = useState<WorkspaceMetadata>({
    ...initialWorkspaces[0],
  });
  const [search, setSearch] = useState('');
  const [allWorkspaceStatusFilter, setAllWorkspaceStatusFilter] =
    useState<AllWorkspaceStatusFilter>('All statuses');
  const [section, setSection] = useState<Section>('My Workspaces');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSavedMetadata, setIsLoadingSavedMetadata] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>('eligibility');

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let cancelled = false;
    setIsLoadingSavedMetadata(true);

    void getWorkspaceMetadataSubmissions(user.id)
      .then((submissions) => {
        if (cancelled) return;

        const latestByWorkspace = new Map<
          string,
          (typeof submissions)[number]
        >();
        for (const submission of submissions) {
          const existing = latestByWorkspace.get(submission.workspaceId);
          if (
            !existing ||
            new Date(submission.submittedAt).getTime() >
              new Date(existing.submittedAt).getTime()
          ) {
            latestByWorkspace.set(submission.workspaceId, submission);
          }
        }

        const restoredWorkspaces = initialWorkspaces.map((workspace): Workspace => {
          const submission = latestByWorkspace.get(workspace.id);
          if (!submission) return workspace;

          const restoredMetadata: WorkspaceMetadata = {
            description: submission.description,
            division: submission.division,
            businessFunction: submission.businessFunction,
            usagePurpose: submission.usagePurpose,
            contacts: submission.contacts ?? '',
          };
          const missing = getMissingFields(restoredMetadata);

          return {
            ...workspace,
            ...restoredMetadata,
            status: missing.length === 0 ? 'Complete' : 'Missing',
            updated: new Date(submission.submittedAt).toLocaleString(),
          };
        });

        setWorkspaces(restoredWorkspaces);
        const selectedWorkspace = restoredWorkspaces.find(
          (workspace) => workspace.id === selectedIdRef.current
        );
        if (selectedWorkspace) setMetadata({ ...selectedWorkspace });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error('Could not load saved workspace metadata:', error);
        const reason =
          error instanceof Error && error.message
            ? error.message
            : 'Unknown Rayfin API error';
        setMessage(`Couldn't load saved metadata from Rayfin: ${reason}`);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSavedMetadata(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user]);

  const selectedWorkspace =
    workspaces.find((workspace) => workspace.id === selectedId) ?? workspaces[0];
  const validationMissingFields = getMissingFields(metadata);
  const missingFields =
    validationMissingFields.length > 0
      ? validationMissingFields
      : selectedWorkspace.status === 'Missing'
        ? requiredMetadataFields
        : [];
  const visibleWorkspaces = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return workspaces.filter((workspace) => {
      const matchesSearch =
        !query ||
        workspace.name.toLocaleLowerCase().includes(query) ||
        workspace.id.toLocaleLowerCase().includes(query);
      const matchesSection =
        section !== 'Pending Updates' || workspace.status === 'Missing';
      return matchesSearch && matchesSection;
    });
  }, [search, section, workspaces]);
  const allWorkspaceRows = visibleWorkspaces.filter(
    (workspace) =>
      allWorkspaceStatusFilter === 'All statuses' ||
      workspace.status === allWorkspaceStatusFilter
  );
  const filteredFaqItems = useMemo(() => {
    const query = faqSearch.trim().toLocaleLowerCase();
    if (!query) return faqItems;
    return faqItems.filter((item) =>
      `${item.question} ${item.category} ${item.searchText}`
        .toLocaleLowerCase()
        .includes(query)
    );
  }, [faqSearch]);
  function selectWorkspace(workspace: Workspace) {
    selectedIdRef.current = workspace.id;
    setSelectedId(workspace.id);
    setMetadata({ ...workspace });
    setMessage('');
  }

  function updateMetadata<K extends keyof WorkspaceMetadata>(
    field: K,
    value: WorkspaceMetadata[K]
  ) {
    setMetadata((current) => ({ ...current, [field]: value }));
    setMessage('');
  }

  function updateDivision(division: Division) {
    setMetadata((current) => ({
      ...current,
      division,
      businessFunction: '',
    }));
    setMessage('');
  }

  function resetMetadata() {
    setMetadata({ ...selectedWorkspace });
    setMessage('Changes reset to the latest saved metadata.');
  }

  async function submitMetadata() {
    const missing = validationMissingFields;
    if (missing.length > 0) {
      setMessage(`Please complete: ${missing.join(', ')}.`);
      return;
    }

    if (!isAuthenticated || !user) {
      setMessage('Sign in to submit metadata. Preview mode does not save changes.');
      return;
    }

    if (!metadata.division || !metadata.usagePurpose) {
      setMessage('Please select a Business Division and Usage Purpose before submitting.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    try {
      await submitWorkspaceMetadata({
        workspaceId: selectedWorkspace.id,
        workspaceName: selectedWorkspace.name,
        description: metadata.description,
        division: metadata.division,
        businessFunction: metadata.businessFunction,
        usagePurpose: metadata.usagePurpose,
        contacts: metadata.contacts,
        submittedById: user.id,
        submittedByEmail: user.email,
      });
      setWorkspaces((current) =>
        current.map((workspace) =>
          workspace.id === selectedWorkspace.id
            ? { ...workspace, ...metadata, status: 'Complete', updated: 'Just now' }
            : workspace
        )
      );
      setMessage(
        `${selectedWorkspace.name} metadata was saved to Rayfin. Run the Fabric pipeline to sync it to the Lakehouse.`
      );
    } catch (error) {
      console.error('Workspace metadata submission failed:', error);
      const reason =
        error instanceof Error && error.message
          ? error.message
          : 'Unknown Rayfin API error';
      setMessage(
        `Couldn't save ${selectedWorkspace.name} metadata to Rayfin: ${reason}`
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const pendingCount = workspaces.filter(
    (workspace) => workspace.status === 'Missing'
  ).length;
  const displayName = user?.name || 'Surendra Ankineni';
  const displayEmail = user?.email || 'surendra@contoso.com';

  return (
    <div className="governance-app">
      <header className="fabric-header">
        <a className="fabric-brand" href="/preview" aria-label="Microsoft Fabric home">
          <span className="fabric-logo" aria-hidden="true"><i /><b /></span>
          <span>Microsoft Fabric</span>
        </a>
        <span className="fabric-header-divider" />
        <span className="fabric-product-name">Workspace Metadata Catalog Process</span>
        <div className="fabric-profile-wrap">
          <button
            className="fabric-profile"
            onClick={() => setProfileOpen((open) => !open)}
            aria-expanded={profileOpen}
          >
            <span className="profile-avatar">{displayName.slice(0, 1)}</span>
            <span className="profile-copy">
              <strong>{displayName}</strong>
              <small>{displayEmail}</small>
            </span>
            <span className="profile-chevron">⌄</span>
          </button>
          {profileOpen && (
            <div className="profile-menu">
              {isAuthenticated && (
                <button onClick={() => void signOut()}>Sign out</button>
              )}
              <span>Sample preview</span>
            </div>
          )}
        </div>
      </header>

      <aside className="governance-sidebar">
        <nav className="governance-nav" aria-label="Main navigation">
          {(
            [
              ['Home', '⌂'],
              ['My Workspaces', '♧'],
              ['Pending Updates', '◉'],
              ['All Workspaces', '♧'],
              ['Help & Support', '?'],
            ] as [Section, string][]
          ).map(([label, icon]) => (
            <button
              key={label}
              className={`governance-nav-item${section === label ? ' selected' : ''}`}
              onClick={() => {
                setSection(label);
                setMessage('');
              }}
            >
              <span className="governance-nav-icon" aria-hidden="true">{icon}</span>
              <span>{label}</span>
              {label === 'Pending Updates' && pendingCount > 0 && (
                <span className="nav-alert-count">{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-promo">
          <span className="promo-fabric-mark"><i /><b /></span>
          <p>Better Metadata<br />Better Governance<br />Stronger Fabric</p>
          <div className="promo-wave promo-wave-one" />
          <div className="promo-wave promo-wave-two" />
        </div>
      </aside>

      <main className="governance-main">
        <div className="governance-content">
          {section !== 'Help & Support' && (
          <section className="welcome-banner">
            <div className="welcome-illustration" aria-hidden="true">
              <span className="clipboard-lines"><i /><i /><i /></span>
              <span className="clipboard-check">✓</span>
            </div>
            <div className="welcome-copy">
              <h1>Welcome, {displayName.split(' ')[0]}!</h1>
              <p>
                Keep your workspace metadata up to date. It helps us improve governance,<br className="desktop-break" />
                security and discoverability across Microsoft Fabric.
              </p>
            </div>
            <div className="welcome-art" aria-hidden="true">
              <span className="welcome-cloud">☁</span>
              <span className="welcome-window">
                <i /><i /><i /><b /><b /><b />
              </span>
              <span className="welcome-tile"><i /><i /><i /></span>
            </div>
          </section>
          )}

          {section === 'Home' ? (
            <section className="overview-panel">
              <span className="section-kicker">WORKSPACE GOVERNANCE</span>
              <h2>Your metadata at a glance</h2>
              <div className="overview-cards">
                <button onClick={() => setSection('All Workspaces')}>
                  <strong>{workspaces.length}</strong><span>Assigned workspaces</span>
                </button>
                <button onClick={() => setSection('Pending Updates')}>
                  <strong>{pendingCount}</strong><span>Need metadata updates</span>
                </button>
                <button onClick={() => setSection('All Workspaces')}>
                  <strong>{workspaces.length - pendingCount}</strong><span>Complete</span>
                </button>
              </div>
              <button className="overview-action" onClick={() => setSection('My Workspaces')}>
                Review my workspaces <span>→</span>
              </button>
            </section>
          ) : section === 'All Workspaces' ? (
            <section className="all-workspaces-page" aria-label="All workspaces">
              <div className="all-workspaces-heading">
                <div>
                  <span className="section-kicker">WORKSPACE DIRECTORY</span>
                  <h2>All Workspaces</h2>
                  <p>Browse every workspace assigned to you and review its metadata status.</p>
                </div>
                <button
                  className="all-workspaces-refresh"
                  onClick={() => {
                    setSearch('');
                    setAllWorkspaceStatusFilter('All statuses');
                  }}
                >
                  <span aria-hidden="true">↻</span> Reset filters
                </button>
              </div>

              <div className="all-workspaces-stats">
                <article className="all-workspaces-stat">
                  <span className="all-stat-icon total">▦</span>
                  <span><small>Total workspaces</small><strong>{workspaces.length}</strong></span>
                </article>
                <article className="all-workspaces-stat">
                  <span className="all-stat-icon needs-attention">!</span>
                  <span><small>Missing metadata</small><strong>{pendingCount}</strong></span>
                </article>
                <article className="all-workspaces-stat">
                  <span className="all-stat-icon complete">✓</span>
                  <span><small>Metadata complete</small><strong>{workspaces.length - pendingCount}</strong></span>
                </article>
              </div>

              <div className="all-workspaces-directory">
                <div className="directory-toolbar">
                  <div>
                    <h3>Workspace directory</h3>
                    <p>Select a workspace to view or update its metadata.</p>
                  </div>
                  <div className="directory-filters">
                    <label className="workspace-search directory-search">
                      <span aria-hidden="true">⌕</span>
                      <input
                        aria-label="Search all workspaces"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search name or workspace ID"
                      />
                    </label>
                    <select
                      aria-label="Filter workspaces by status"
                      value={allWorkspaceStatusFilter}
                      onChange={(event) => {
                        const value = event.target.value;
                        setAllWorkspaceStatusFilter(
                          value === 'Missing' || value === 'Complete'
                            ? value
                            : 'All statuses'
                        );
                      }}
                    >
                      <option>All statuses</option>
                      <option>Missing</option>
                      <option>Complete</option>
                    </select>
                  </div>
                </div>

                <div className="directory-table-wrap">
                  <table className="directory-table">
                    <thead>
                      <tr>
                        <th scope="col">WORKSPACE</th>
                        <th scope="col">DIVISION</th>
                        <th scope="col">BUSINESS FUNCTION</th>
                        <th scope="col">USAGE PURPOSE</th>
                        <th scope="col">METADATA STATUS</th>
                        <th scope="col">LAST UPDATED</th>
                        <th scope="col" aria-label="Action" />
                      </tr>
                    </thead>
                    <tbody>
                      {allWorkspaceRows.map((workspace) => (
                        <tr key={workspace.id}>
                          <td>
                            <div className="directory-workspace">
                              <span className={`workspace-list-icon ${workspace.color}`}>{workspace.icon}</span>
                              <span>
                                <strong>{workspace.name}</strong>
                                <small>{workspace.id}</small>
                              </span>
                            </div>
                          </td>
                          <td>{workspace.division || <span className="directory-empty-value">Not provided</span>}</td>
                          <td>{workspace.businessFunction || <span className="directory-empty-value">Not provided</span>}</td>
                          <td>{workspace.usagePurpose || <span className="directory-empty-value">Not provided</span>}</td>
                          <td>
                            <span className={`workspace-status ${workspace.status.toLowerCase()}`}>
                              <span className="directory-status-dot" />
                              {workspace.status === 'Missing' ? 'Missing metadata' : 'Complete'}
                            </span>
                          </td>
                          <td className="directory-updated">{workspace.updated}</td>
                          <td>
                            <button
                              className="directory-edit-button"
                              onClick={() => {
                                selectWorkspace(workspace);
                                setSection('My Workspaces');
                              }}
                              aria-label={`Edit ${workspace.name} metadata`}
                            >
                              View details <span aria-hidden="true">→</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {allWorkspaceRows.length === 0 && (
                    <div className="directory-empty">
                      <strong>No workspaces found</strong>
                      <span>Try a different search or status filter.</span>
                      <button
                        onClick={() => {
                          setSearch('');
                          setAllWorkspaceStatusFilter('All statuses');
                        }}
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </div>

                <footer className="directory-footer">
                  <span>Showing {allWorkspaceRows.length} of {workspaces.length} workspaces</span>
                  <span>Sample workspace data</span>
                </footer>
              </div>
            </section>
          ) : section === 'Help & Support' ? (
            <section className="help-page" aria-label="Help and support">
              <header className="help-heading">
                <span className="section-kicker">HELP CENTER</span>
                <h2>Help &amp; Support</h2>
                <p>Find answers about workspace metadata, access, and governance.</p>
              </header>

              <div className="help-shortcuts" aria-label="Support resources">
                <a
                  className="help-shortcut"
                  href={identityNowUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="help-shortcut-icon access">↗</span>
                  <span>
                    <strong>Request workspace access</strong>
                    <small>Open Bayer IdentityNow</small>
                  </span>
                  <span className="help-shortcut-arrow" aria-hidden="true">→</span>
                </a>
                <a
                  className="help-shortcut"
                  href={processDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="help-shortcut-icon guide">▤</span>
                  <span>
                    <strong>Metadata update guide</strong>
                    <small>Read the process instructions</small>
                  </span>
                  <span className="help-shortcut-arrow" aria-hidden="true">→</span>
                </a>
              </div>

              <section className="faq-section" aria-label="Frequently asked questions">
                <div className="faq-section-heading">
                  <div>
                    <h3>Frequently asked questions</h3>
                    <p>Browse common questions or search for a topic.</p>
                  </div>
                  <span className="faq-count">
                    {filteredFaqItems.length} {filteredFaqItems.length === 1 ? 'answer' : 'answers'}
                  </span>
                </div>
                <label className="faq-search">
                  <span aria-hidden="true">⌕</span>
                  <input
                    aria-label="Search help topics"
                    type="search"
                    value={faqSearch}
                    onChange={(event) => setFaqSearch(event.target.value)}
                    placeholder="Search metadata, access, purpose..."
                  />
                  {faqSearch && (
                    <button
                      type="button"
                      aria-label="Clear help search"
                      onClick={() => setFaqSearch('')}
                    >
                      ×
                    </button>
                  )}
                </label>

                <div className="faq-list">
                  {filteredFaqItems.map((item, index) => {
                    const expanded = openFaqId === item.id;
                    const answerId = `faq-answer-${item.id}`;
                    return (
                      <article className={`faq-card${expanded ? ' expanded' : ''}`} key={item.id}>
                        <button
                          className="faq-question"
                          type="button"
                          aria-expanded={expanded}
                          aria-controls={answerId}
                          onClick={() =>
                            setOpenFaqId((current) => current === item.id ? null : item.id)
                          }
                        >
                          <span className="faq-number">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="faq-question-copy">
                            <small>{item.category}</small>
                            <strong>{item.question}</strong>
                          </span>
                          <span className="faq-toggle" aria-hidden="true">
                            {expanded ? '−' : '+'}
                          </span>
                        </button>
                        {expanded && (
                          <div className="faq-answer" id={answerId}>
                            {item.answer}
                          </div>
                        )}
                      </article>
                    );
                  })}
                  {filteredFaqItems.length === 0 && (
                    <div className="faq-empty">
                      <strong>No matching help topics</strong>
                      <span>Try a different keyword or clear your search.</span>
                      <button type="button" onClick={() => setFaqSearch('')}>
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </section>
          ) : (
            <>
              <div className="workspace-page-heading">
                <div>
                  <h2>{section}</h2>
                  <p>Select a workspace to view and update its metadata. You can only see the workspaces<br className="desktop-break" /> that are assigned to you.</p>
                </div>
              </div>

              <div className="governance-grid">
                <section className="workspace-list-panel" aria-label="Workspace list">
                  <label className="workspace-search">
                    <span aria-hidden="true">⌕</span>
                    <input
                      aria-label="Search workspace"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search workspace..."
                    />
                  </label>
                  <div className="workspace-list">
                    {visibleWorkspaces.map((workspace) => (
                      <button
                        className={`workspace-list-item${selectedId === workspace.id ? ' active' : ''}`}
                        key={workspace.id}
                        onClick={() => selectWorkspace(workspace)}
                      >
                        <span className={`workspace-list-icon ${workspace.color}`}>{workspace.icon}</span>
                        <span className="workspace-list-copy">
                          <strong>{workspace.name}</strong>
                          <small>{workspace.id}</small>
                        </span>
                        <span className={`workspace-status ${workspace.status.toLowerCase()}`}>
                          {workspace.status}
                        </span>
                      </button>
                    ))}
                    {visibleWorkspaces.length === 0 && (
                      <div className="workspace-empty">No workspaces match your search.</div>
                    )}
                  </div>
                  <div className="workspace-list-footer">
                    Showing {visibleWorkspaces.length ? 1 : 0} - {visibleWorkspaces.length} of {visibleWorkspaces.length} workspaces
                  </div>
                </section>

                <section className="metadata-form-panel" aria-label="Workspace metadata form">
                  <div className="form-heading">
                    <h3>Workspace Details</h3>
                    <label className="form-view-select">
                      <span className="sr-only">Metadata view</span>
                      <select aria-label="Metadata view" defaultValue="All">
                        <option>All</option>
                        <option>Required fields</option>
                      </select>
                    </label>
                  </div>
                  <div className="form-info">
                    <span aria-hidden="true">i</span>
                    <span>Fields marked with <b>*</b> are mandatory. Please provide the missing information.</span>
                  </div>
                  <form
                    className="metadata-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      submitMetadata();
                    }}
                    onReset={(event) => {
                      event.preventDefault();
                      resetMetadata();
                    }}
                  >
                    <div className="form-two-columns">
                      <label className="form-field">
                        <span>Workspace Name</span>
                        <input value={selectedWorkspace.name} readOnly />
                      </label>
                      <label className="form-field">
                        <span>Workspace ID</span>
                        <input value={selectedWorkspace.id} readOnly />
                      </label>
                    </div>

                    <label className="form-field">
                      <span>Description <b>*</b></span>
                      <div className={`textarea-wrap${metadata.description.trim() ? ' valid' : ''}`}>
                        <textarea
                          aria-label="Description *"
                          value={metadata.description}
                          onChange={(event) =>
                            updateMetadata('description', event.target.value.slice(0, 500))
                          }
                          maxLength={500}
                          aria-required="true"
                        />
                        {metadata.description.trim() && <span className="field-valid" aria-label="Complete">✓</span>}
                        <small>{metadata.description.length}/500</small>
                      </div>
                    </label>

                    <fieldset className="division-field">
                      <legend>Business Division <b>*</b></legend>
                      <div className="division-options">
                        {(['CH', 'CS', 'PH', 'EF'] as Division[]).map((division) => (
                          <label key={division}>
                            <input
                              type="radio"
                              name="division"
                              value={division}
                              checked={metadata.division === division}
                              onChange={() => updateDivision(division)}
                            />
                            <span>{division}</span>
                          </label>
                        ))}
                        {metadata.division && <span className="division-valid" aria-label="Division selected">✓</span>}
                      </div>
                    </fieldset>

                    <div className="form-two-columns select-columns">
                      <label className="form-field">
                        <span>Business Function <b>*</b></span>
                        <SearchableSelect
                          ariaLabel="Business Function *"
                          disabled={!metadata.division}
                          onChange={(value) => updateMetadata('businessFunction', value)}
                          options={
                            metadata.division
                              ? businessFunctionsByDivision[metadata.division]
                              : noOptions
                          }
                          placeholder={
                            metadata.division
                              ? 'Select or search a function...'
                              : 'Select a division first'
                          }
                          value={metadata.businessFunction}
                        />
                      </label>
                      <label className="form-field">
                        <span>Usage Purpose <b>*</b></span>
                        <SearchableSelect
                          ariaLabel="Usage Purpose *"
                          onChange={(value) => {
                            if (value === 'Productive' || value === 'Non-Productive') {
                              updateMetadata('usagePurpose', value);
                            }
                          }}
                          options={usagePurposes}
                          placeholder="Select or search a purpose..."
                          value={metadata.usagePurpose}
                        />
                      </label>
                    </div>

                    <label className="form-field contacts-field">
                      <span>Workspace Contact</span>
                      <div className="textarea-wrap contacts-wrap">
                        <textarea
                          value={metadata.contacts}
                          onChange={(event) =>
                            updateMetadata('contacts', event.target.value.slice(0, 500))
                          }
                          maxLength={500}
                          aria-label="Contacts"
                        />
                        <small>{metadata.contacts.length}/500</small>
                      </div>
                    </label>

                    <div className={`form-message${message.includes('saved to Rayfin') ? ' success' : ''}`} role="status">
                      {message ? (
                        <><span>{message.includes('saved to Rayfin') ? '✓' : '!'}</span>{message}</>
                      ) : isLoadingSavedMetadata ? (
                        <><span>i</span>Loading saved metadata from Rayfin...</>
                      ) : missingFields.length > 0 ? (
                        <><span>!</span>Please complete all mandatory fields before submitting.</>
                      ) : (
                        <><span>i</span>Review the details and submit your metadata updates.</>
                      )}
                    </div>
                  </form>
                </section>

                <aside className="metadata-summary" aria-label="Workspace status">
                  <section className="summary-card status-summary-card">
                    <h3>Workspace Status</h3>
                    <span className={`large-status ${missingFields.length === 0 ? 'complete' : 'missing'}`}>
                      <span>{missingFields.length === 0 ? '✓' : '♥'}</span>
                      {missingFields.length === 0 ? 'Complete' : 'Missing Metadata'}
                    </span>
                    <p>
                      {missingFields.length === 0
                        ? 'All required metadata is complete.'
                        : 'Some important information is missing.'}
                    </p>
                    <p>{missingFields.length === 0 ? 'Your workspace details are up to date.' : 'Please update the details and submit.'}</p>
                  </section>

                  <section className="summary-card missing-summary-card">
                    <h3><span className="summary-heading-icon">!</span>Missing Fields</h3>
                    {missingFields.length > 0 ? (
                      <ul>
                        {missingFields.map((field) => <li key={field}>{field}</li>)}
                      </ul>
                    ) : (
                      <p className="all-fields-complete">All mandatory fields are complete.</p>
                    )}
                  </section>

                  <section className="summary-card updated-summary-card">
                    <h3><span className="clock-icon">◷</span>Last Updated</h3>
                    <p>{selectedWorkspace.updated}</p>
                  </section>

                  <button
                    className="submit-metadata-button"
                    onClick={submitMetadata}
                    type="button"
                    disabled={isSubmitting || isLoadingSavedMetadata}
                  >
                    <span>➤</span>{isSubmitting ? 'Saving...' : 'Submit'}
                  </button>
                  <button className="reset-metadata-button" onClick={resetMetadata} type="button">
                    <span>↻</span>Reset
                  </button>
                  <p className="sample-data-caption">Sample data · changes are preview-only</p>
                </aside>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

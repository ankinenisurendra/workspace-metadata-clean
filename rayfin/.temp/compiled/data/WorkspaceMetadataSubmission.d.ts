export declare class WorkspaceMetadataSubmission {
    id: string;
    workspaceId: string;
    workspaceName: string;
    description: string;
    division: 'CH' | 'CS' | 'PH' | 'EF';
    businessFunction: string;
    usagePurpose: 'Productive' | 'Non-Productive';
    contacts?: string;
    submittedById: string;
    submittedByEmail?: string;
    submittedAt: Date;
}

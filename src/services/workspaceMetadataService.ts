import { getRayfinClient } from './rayfinClient';
import type { WorkspaceMetadataSubmission } from '../../rayfin/data/WorkspaceMetadataSubmission';

export interface WorkspaceMetadataSubmissionInput {
  workspaceId: string;
  workspaceName: string;
  description: string;
  division: 'CH' | 'CS' | 'PH' | 'EF';
  businessFunction: string;
  usagePurpose: 'Productive' | 'Non-Productive';
  contacts?: string;
  submittedById: string;
  submittedByEmail?: string;
}

export async function getWorkspaceMetadataSubmissions(
  submittedById: string
): Promise<WorkspaceMetadataSubmission[]> {
  const client = getRayfinClient();
  const submissions: WorkspaceMetadataSubmission[] = [];
  let cursor: string | undefined;

  do {
    let query = client.data.WorkspaceMetadataSubmission.select([
      'id',
      'workspaceId',
      'workspaceName',
      'description',
      'division',
      'businessFunction',
      'usagePurpose',
      'contacts',
      'submittedById',
      'submittedByEmail',
      'submittedAt',
    ])
      .where({ submittedById: { eq: submittedById } })
      .first(100)
      .orderBy({ submittedAt: 'desc' })
      .orderBy({ id: 'asc' });

    if (cursor) query = query.after(cursor);

    const page = await query.executePaginated();
    submissions.push(...page.items);
    cursor = page.hasNextPage ? page.endCursor : undefined;
  } while (cursor);

  return submissions;
}

export async function submitWorkspaceMetadata(
  submission: WorkspaceMetadataSubmissionInput
): Promise<void> {
  await getRayfinClient().data.WorkspaceMetadataSubmission.create({
    ...submission,
    submittedAt: new Date(),
  });
}

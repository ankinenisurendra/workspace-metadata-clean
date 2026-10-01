import {
  authenticated,
  date,
  entity,
  set,
  text,
  uuid,
} from '@microsoft/rayfin-core';

@entity()
@authenticated(['create', 'read'], {
  policy: (claims, item) => claims.sub.eq(item.submittedById),
})
export class WorkspaceMetadataSubmission {
  @uuid() id!: string;
  @text({ min: 1, max: 100 }) workspaceId!: string;
  @text({ min: 1, max: 200 }) workspaceName!: string;
  @text({ max: 500 }) description!: string;
  @set('CH', 'CS', 'PH', 'EF') division!: 'CH' | 'CS' | 'PH' | 'EF';
  @text({ min: 1, max: 200 }) businessFunction!: string;
  @set('Productive', 'Non-Productive')
  usagePurpose!: 'Productive' | 'Non-Productive';
  @text({ max: 500, optional: true }) contacts?: string;
  @text({ min: 1, max: 256 }) submittedById!: string;
  @text({ max: 320, optional: true }) submittedByEmail?: string;
  @date() submittedAt!: Date;
}

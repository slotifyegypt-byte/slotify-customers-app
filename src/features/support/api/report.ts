import type { CreateSupportTicketPayload } from './supportApi';

// User-generated content (reviews, business chat messages) is reported through
// the existing support-ticket API: there is no dedicated moderation endpoint.
export type ReportKind = 'review' | 'message';
export type ReportReason = 'spam' | 'offensive' | 'fake' | 'other';

export const REPORT_REASONS: readonly ReportReason[] = ['spam', 'offensive', 'fake', 'other'];

// Staff read the ticket, so the reason is always the English label, whatever
// language the reporter's app is in.
const REASON_LABELS: Record<ReportReason, string> = {
  spam: 'Spam',
  offensive: 'Offensive or abusive',
  fake: 'Fake or misleading',
  other: 'Other',
};

export interface ReportInput {
  kind: ReportKind;
  targetId: string;
  reason: ReportReason;
  note?: string;
  /** The booking a chat message belongs to. */
  context?: string;
}

export function buildReportTicket(input: ReportInput): CreateSupportTicketPayload {
  const note = input.note?.trim();
  const lines = [
    `Kind: ${input.kind}`,
    `Target ID: ${input.targetId}`,
    `Reason: ${REASON_LABELS[input.reason]}`,
    ...(input.context ? [`Context: booking ${input.context}`] : []),
    `Note: ${note || '(none)'}`,
  ];
  return { subject: `Report: ${input.kind} ${input.targetId}`, message: lines.join('\n') };
}

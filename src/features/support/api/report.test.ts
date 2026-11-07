import { buildReportTicket } from './report';

describe('buildReportTicket', () => {
  it('files a review report with kind, target id, reason and note', () => {
    expect(
      buildReportTicket({
        kind: 'review',
        targetId: 'r-1',
        reason: 'offensive',
        note: '  rude words  ',
      }),
    ).toEqual({
      subject: 'Report: review r-1',
      message: 'Kind: review\nTarget ID: r-1\nReason: Offensive or abusive\nNote: rude words',
    });
  });

  it('files a message report with its booking as context and no note', () => {
    expect(
      buildReportTicket({ kind: 'message', targetId: 'm-9', reason: 'spam', context: 'b-3' }),
    ).toEqual({
      subject: 'Report: message m-9',
      message: 'Kind: message\nTarget ID: m-9\nReason: Spam\nContext: booking b-3\nNote: (none)',
    });
  });

  it('treats a blank note as no note', () => {
    expect(
      buildReportTicket({ kind: 'review', targetId: 'r-2', reason: 'fake', note: '   ' }).message,
    ).toContain('Note: (none)');
  });
});

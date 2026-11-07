import * as Sentry from '@sentry/react-native';

import { initSentry, scrubBreadcrumb, scrubEvent } from './sentry';

jest.mock('@sentry/react-native', () => ({ init: jest.fn() }));
jest.mock('./config', () => ({ appConfig: { env: 'production' }, isDev: false }));

describe('initSentry', () => {
  it('never sends default PII and scrubs events, transactions and breadcrumbs', () => {
    initSentry();
    const options = (Sentry.init as jest.Mock).mock.calls[0][0];
    expect(options.sendDefaultPii).toBe(false);
    expect(options.beforeSend).toBe(scrubEvent);
    expect(options.beforeSendTransaction).toBe(scrubEvent);
    expect(options.beforeBreadcrumb).toBe(scrubBreadcrumb);
  });
});

describe('scrubEvent', () => {
  it('keeps only the user id, never email, name, phone or IP', () => {
    const event = scrubEvent({
      user: { id: 'u1', email: 'a@b.co', username: 'Lina', ip_address: '1.2.3.4' },
    });
    expect(event.user).toEqual({ id: 'u1' });
  });

  it('drops a user with no id altogether', () => {
    expect(scrubEvent({ user: { email: 'a@b.co' } }).user).toBeUndefined();
  });

  it('redacts emails, phones and tokens in messages and request data', () => {
    const event = scrubEvent({
      message: 'failed for a@b.co on +201001234567',
      request: { headers: { Authorization: 'Bearer abc.def' } },
    });
    expect(event.message).toBe('failed for [email] on [phone]');
    expect(event.request?.headers?.Authorization).toBe('[redacted]');
  });
});

describe('scrubBreadcrumb', () => {
  it('redacts personal data in breadcrumbs', () => {
    const crumb = scrubBreadcrumb({ message: 'sent to a@b.co', data: { access_token: 'x' } });
    expect(crumb).toEqual({ message: 'sent to [email]', data: { access_token: '[redacted]' } });
  });
});

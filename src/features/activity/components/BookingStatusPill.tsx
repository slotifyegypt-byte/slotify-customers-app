import { useTranslation } from 'react-i18next';

import { Pill } from '@/components/Pill';
import type { BookingRead } from '@/features/booking/api/schemas';

import { bookingStatusMeta } from '../utils/bookingDisplay';

/** The booking's state as a sentence-case pill: the word first, the tone second. */
export function BookingStatusPill({
  booking,
}: {
  booking: Pick<BookingRead, 'booking_status' | 'booking_type'>;
}) {
  const { t } = useTranslation();
  const meta = bookingStatusMeta(booking);
  return <Pill label={t(meta.labelKey)} tone={meta.tone} />;
}

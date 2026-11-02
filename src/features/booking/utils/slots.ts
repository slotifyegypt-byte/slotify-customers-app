import type { AvailabilityResponse, AvailabilitySlot } from '../api/schemas';

/**
 * "Any specialist": the availability function returns free slots per
 * employee (`employees[].available_slots`); the grid shows one flat,
 * earliest-first list. Each start time appears once and goes to the FIRST
 * listed employee who is free then — that slot's `employee_id` is what gets
 * booked, which is how "Any specialist" resolves to a concrete person.
 * With a specific specialist picked the server only returns that employee, so
 * this is just their own list.
 */
export function mergeSpecialistSlots(employees: AvailabilityResponse['employees']): AvailabilitySlot[] {
  const byInstant = new Map<number, AvailabilitySlot>();
  for (const employee of employees) {
    for (const slot of employee.available_slots) {
      const instant = Date.parse(slot.start_time);
      if (!byInstant.has(instant)) byInstant.set(instant, slot);
    }
  }
  return [...byInstant.entries()].sort(([a], [b]) => a - b).map(([, slot]) => slot);
}

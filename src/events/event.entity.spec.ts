import { Event } from './event.entity';

test('Event should be initialized through constructor', () => {
  const event = new Event({
    name: 'Intresting event 2',
    description: 'That was fun',
  });

  expect(event).toEqual({
    name: 'Intresting event 2',
    description: 'That was fun',
    id: undefined,
    when: undefined,
    address: undefined,
    attendees: undefined,
    organizer: undefined,
    organizerId: undefined,
    event: undefined,
    attendeeCount: undefined,
    attendeeRejected: undefined,
    attendeeMaybe: undefined,
    attendeeAccepted: undefined,
  });
});

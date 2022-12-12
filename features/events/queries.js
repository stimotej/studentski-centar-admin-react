const eventKeys = {
  events: ["events"],
  eventsFiltered: (filters) => [...eventKeys.events, filters],
  event: (id) => [...eventKeys.events, id],
};

export default eventKeys;

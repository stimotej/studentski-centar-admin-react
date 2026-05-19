const newsletterKeys = {
  all: ["newsletter"],
  broadcasts: ["newsletter", "broadcasts"],
  broadcast: (id) => [...newsletterKeys.broadcasts, id],
  contacts: ["newsletter", "contacts"],
};

export default newsletterKeys;

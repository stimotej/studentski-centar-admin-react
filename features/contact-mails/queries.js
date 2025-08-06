const contactMailKeys = {
  contactMails: ["contactMails"],
  contactMailsFiltered: (filters) => [...contactMailKeys.contactMails, filters],
};

export default contactMailKeys;

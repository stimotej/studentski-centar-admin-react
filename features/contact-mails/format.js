const formatContactMail = (contactMail) => ({
  id: contactMail.id,
  date: contactMail.date,
  email: contactMail.meta.email,
  name: contactMail.meta.name,
  message: contactMail.meta.message,
});

export default formatContactMail;

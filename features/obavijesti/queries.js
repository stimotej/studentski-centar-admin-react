const obavijestiKeys = {
  obavijesti: ["obavijesti"],
  categories: ["categories"],
  obavijestiFiltered: (filters) => [...obavijestiKeys.obavijesti, filters],
  obavijest: (id) => [...obavijestiKeys.obavijesti, id],
  sliderObavijesti: ["obavijesti", "slider"],
};

export default obavijestiKeys;

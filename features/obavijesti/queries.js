const obavijestiKeys = {
  obavijesti: ["obavijesti"],
  categories: ["categories"],
  obavijest: (id) => [...obavijestiKeys.obavijesti, id],
};

export default obavijestiKeys;

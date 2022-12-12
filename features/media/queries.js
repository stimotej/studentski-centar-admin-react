const mediaKeys = {
  allMedia: ["obavijesti"],
  mediaFiltered: (filters) => [...mediaKeys.allMedia, filters],
  oneMedia: (id) => [...mediaKeys.allMedia, id],
};

export default mediaKeys;

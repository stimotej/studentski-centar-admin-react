const mediaKeys = {
  allMedia: ["media"],
  mediaFiltered: (filters) => [...mediaKeys.allMedia, filters],
  mediaFolders: (filters) => [...mediaKeys.allMedia, "folders", filters],
  mediaFolder: (id) => [...mediaKeys.mediaFolders(), id],
  oneMedia: (id) => [...mediaKeys.allMedia, id],
};

export default mediaKeys;

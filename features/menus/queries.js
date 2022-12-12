const menuKeys = {
  menus: ["menus"],
  menusFiltered: (filters) => [...menuKeys.menus, filters],
  menu: (id) => [...menuKeys.menus, id],
};

export default menuKeys;

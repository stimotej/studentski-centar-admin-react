const menuKeys = {
  menus: ["menus"],
  menusFiltered: (filters) => [...menuKeys.menus, filters],
  menuByDate: (date) => [...menuKeys.menus, date],
  menu: (id) => [...menuKeys.menus, id],
};

export default menuKeys;

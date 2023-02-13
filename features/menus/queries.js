const menuKeys = {
  menus: ["menus"],
  menusFiltered: (filters) => [...menuKeys.menus, filters],
  menuByDate: (data) => [...menuKeys.menus, data],
  menu: (id) => [...menuKeys.menus, id],
};

export default menuKeys;

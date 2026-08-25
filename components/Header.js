import Button from "./Elements/Button";
import LocaleToggle from "./Elements/LocaleToggle";

/**
 * `localeToggle` opts a page into bilingual editing. Left off, the page behaves
 * exactly as before — so pages with nothing translatable (media library,
 * newsletter, daily menus) do not show a switch that would do nothing.
 */
const Header = ({ title, localeToggle = false, ...props }) => {
  return (
    <header className="flex items-center justify-between flex-wrap gap-2 p-5 sm:p-10">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="flex items-center gap-3 flex-wrap">
        {localeToggle && <LocaleToggle />}
        {(props.text || props.icon) && <Button {...props} />}
      </div>
    </header>
  );
};

export default Header;

import {
  faChevronDown,
  faChevronRight,
  faSignOut,
  faUser as faUserRegular,
} from "@fortawesome/pro-regular-svg-icons";
import { faUser } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import NextLink from "next/link";
import React from "react";
import { useRef } from "react";
import { useState } from "react";

export default function Drawer({ navLinks }) {
  function loopLinks(links) {
    return links.map((link, index) => {
      if (link.items) {
        return (
          <LinkDropdown key={index} title={link.title} icon={link.icon}>
            {loopLinks(link.items)}
          </LinkDropdown>
        );
      } else {
        return (
          <Link
            key={index}
            title={link.title}
            icon={link.icon}
            href={link.href}
          />
        );
      }
    });
  }

  return (
    <div className="w-[250px] h-screen fixed bg-white z-50 overflow-auto shadow-xl">
      <Header />
      <div className="py-2 px-5 mt-2">
        <User />
      </div>

      <nav className="flex flex-col py-2 pb-4 px-2 gap-[2px]">
        {loopLinks(navLinks)}
      </nav>
    </div>
  );
}

function User() {
  return (
    <button className="w-full text-left p-1 rounded-lg border group">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center bg-gray-100 rounded-full aspect-square w-10 h-10">
          <FontAwesomeIcon icon={faUser} size={24} className="text-gray-600" />
        </div>
        <div className="flex flex-col">
          <h1 className="font-semibold text-sm line-clamp-1">Ana Anić</h1>
          <h3 className="text-xs font-light line-clamp-1">Prehrana</h3>
        </div>
      </div>
      <div className="flex flex-col gap-1 transform max-h-0 group-hover:max-h-20 overflow-hidden transition-[max-height]">
        <Link title="Profil" href="#" icon={faUserRegular} className="mt-2" />
        <Link
          title="Odjavi se"
          href="#"
          icon={faSignOut}
          iconClassName="!text-error"
          className="hover:bg-error/5"
        />
      </div>
    </button>
  );
}

function Header() {
  return (
    <div className="flex items-center gap-2 py-3 px-5 border-b">
      <Image
        src="/zaposlenici/logo.svg"
        alt="SC logo"
        width={54}
        height={54}
        className="object-cover"
      />
      <div className="flex flex-col">
        <h1 className="text-xs uppercase tracking-wider font-semibold">
          Studentski Centar
        </h1>
        <h3 className="text-xs font-light">Administracija</h3>
      </div>
    </div>
  );
}

function Link({ title, icon, href, className, iconClassName }) {
  return (
    <NextLink
      href={href}
      className={`flex items-center gap-2 py-1 px-4 text-sm hover:bg-gray-100 rounded-sm width-full ${className}`}
    >
      {icon ? (
        <FontAwesomeIcon
          icon={icon}
          size={24}
          className={`text-blue-500 ${iconClassName}`}
        />
      ) : null}
      {title}
    </NextLink>
  );
}

function LinkDropdown({ title, icon, children }) {
  const [opened, setOpened] = useState(false);

  const buttonRef = useRef(null);

  const honadleToggleDropdown = () => {
    setOpened(!opened);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={honadleToggleDropdown}
        className="py-1 px-4 text-sm hover:bg-gray-100 rounded-sm width-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {icon ? (
            <FontAwesomeIcon icon={icon} size={24} className="text-blue-500" />
          ) : null}
          {title}
        </div>
        <FontAwesomeIcon
          icon={opened ? faChevronDown : faChevronRight}
          size={24}
          className="text-blue-500"
        />
      </button>
      <div
        timeoutRef
        className={`flex flex-col [&>*]:pl-10 gap-[2px] overflow-hidden ${
          opened ? `max-h-fit` : "max-h-0"
        }`}
      >
        {children}
      </div>
    </>
  );
}

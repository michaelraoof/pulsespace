import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

function SidebarRow({ Icon, IconSolid, title, src, route, active }) {
  // Logic to determine which icon to render. 
  // HeaderIcon uses IconSolid always. We'll prioritize IconSolid if active or present, 
  // but let's try to mimic the "Active = Solid, Inactive = Outline" pattern IF possible, 
  // OR just stick to what HeaderIcon did (Always Solid).
  // HeaderIcon.js: <IconSolid ... />.
  // So it seems they are always solid.

  const DisplayIcon = IconSolid || Icon;

  return (
    <Link to={route}>
      <div
        className={`cursor-pointer flex items-center space-x-4 p-4 hover:bg-gray-100 rounded-md group ${active ? "text-purple-600 font-bold" : "text-gray-600"}`}
      >
        {src && <Image src={src} alt="profile pic" />}
        {DisplayIcon && (
          <DisplayIcon
            className={`h-7 w-7 group-hover:text-purple-600 ${active ? "text-purple-600" : "text-gray-500"}`}
          />
        )}
        <p
          style={{
            fontFamily: "Inter",
            fontSize: "1.05rem",
          }}
          className={`hidden sm:inline-flex text-l ${active ? "font-bold" : "font-medium"}`}
        >
          {title}
        </p>
      </div>
    </Link>
  );
}

export default SidebarRow;

const Image = styled.img`
  object-fit: cover;
  height: 2.48rem;
  width: 2.48rem;
  border-radius: 50%;
`;

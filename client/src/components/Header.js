import React, { useState } from "react";
import ClickAwayListener from "react-click-away-listener";
import {
  SearchIcon,
  HomeIcon,
  UsersIcon,
  BellIcon,
  ChatAltIcon,
  CogIcon,
} from "@heroicons/react/outline";
import {
  SearchIcon as SearchIconSolid,
  HomeIcon as HomeIconSolid,
  UsersIcon as UsersIconSolid,
  BellIcon as BellIconSolid,
  ChatAltIcon as ChatAltIconSolid,
  CogIcon as CogIconSolid,
} from "@heroicons/react/solid";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";

import HeaderIcon from "./HelperComponents/HeaderIcon";
import RoundedIcon from "./HelperComponents/RoundedIcon";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Dropdown from "./Dropdown";
import SearchDropdown from "./SearchDropdown";

function Header({ user }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchDropdown, setShowSearchDropdown] = useState(false);

  const location = useLocation();
  const activeRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex bg-white sticky top-0 z-50 shadow-lg h-16 items-center">
      {/* Left */}
      <div className="ml-2 sm:ml-5 p-1 flex items-center">
        <div className="hidden sm:flex items-center">
          <p
            style={{
              fontFamily: "Merienda",
              color: "#686869",
              fontWeight: "700",
              fontSize: "1.8rem",
            }}
          >
            PulseSpace
          </p>
        </div>

        <div className="flex sm:hidden items-center">
          <p
            style={{
              fontFamily: "Merienda",
              color: "#686869",
              fontWeight: "700",
              fontSize: "1.8rem",
            }}
          >
            PulseSpace
          </p>
        </div>

        <div
          onClick={() => setShowSearchDropdown(true)}
          className="flex ml-3 items-center rounded-full bg-gray-100 p-2  h-12"
        >
          <SearchIcon className="h-5 text-gray-600 px-1.5 lg:px-0 cursor-pointer" />
          <input
            className="ml-2 bg-transparent outline-none placeholder-gray-500 font-thin hidden lg:flex md:items-center flex-shrink"
            style={{ width: "7.5rem" }}
            type="text"
            placeholder="Search users"
          />
        </div>
      </div>
      {searchDropdown && (
        <SearchDropdown setShowSearchDropdown={setShowSearchDropdown} />
      )}

      {/* Mid */}
      <div className="flex justify-center flex-grow">
        <div className="flex items-center space-x-4 md:space-x-4 lg:space-x-8">
          <Link to="/">
            <div>
              <HeaderIcon
                active={activeRoute("/")}
                Icon={HomeIcon}
                IconSolid={HomeIconSolid}
              ></HeaderIcon>
            </div>
          </Link>
          <Link to={`/user/${user._id}/following`}>
            <div className="hidden sm:inline-flex">
              <HeaderIcon
                active={activeRoute(`/user/${user._id}/following`)}
                Icon={UsersIcon}
                IconSolid={UsersIconSolid}
              ></HeaderIcon>
            </div>
          </Link>
          <Link to="/notifications">
            <div>
              <HeaderIcon
                active={activeRoute("/notifications")}
                Icon={BellIcon}
                IconSolid={BellIconSolid}
                unread={user.unreadNotification}
              ></HeaderIcon>
            </div>
          </Link>{" "}
          <Link to="/chats">
            <div>
              <HeaderIcon
                active={activeRoute("/chats")}
                Icon={ChatAltIcon}
                IconSolid={ChatAltIconSolid}
                unread={user.unreadMessage}
              ></HeaderIcon>
            </div>
          </Link>
        </div>
      </div>

      {/* Right */}
      <Link to={`/${user.username}`}>
        <div className="flex lg:ml-10 items-center h-12 sm:hover:bg-gray-200 px-1 rounded-3xl m-3 cursor-pointer">
          <Image
            className="rounded-full mr-3 hidden sm:inline-flex"
            src={user.profilePicUrl}
            alt="user avatar"
          />
          <p
            className="hidden sm:inline-flex  text-gray-600 sm:mr-4"
            style={{
              fontFamily: "Roboto",
              fontSize: "1.05rem",
              fontWeight: "700",
            }}
          >
            {user.name}
          </p>
        </div>
      </Link>
      <Link to="/settings">
        <div className="hidden sm:flex items-center mr-3">
          <RoundedIcon
            active={activeRoute("/settings")}
            Icon={CogIcon}
          ></RoundedIcon>
        </div>
      </Link>
      <ClickAwayListener onClickAway={() => setShowDropdown(false)}>
        <div
          onClick={() => {
            setShowDropdown((prev) => !prev);
          }}
          className="flex items-center mr-5"
        >
          <RoundedIcon
            stayVisible={true}
            padding={"px-0.5"}
            Icon={ArrowDropDownIcon}
          ></RoundedIcon>
        </div>
      </ClickAwayListener>

      {showDropdown ? (
        <Dropdown
          user={user}
          setShowDropdown={setShowDropdown}
          showDropdown={showDropdown}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export default Header;

const Image = styled.img`
  object-fit: cover;
  height: 2.7rem;
  width: 2.7rem;
`;

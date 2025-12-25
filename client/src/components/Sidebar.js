import { useLocation } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  BellIcon,
  ChatIcon,
  CogIcon,
  UserGroupIcon,
} from "@heroicons/react/outline";
import {
  HomeIcon as HomeIconSolid,
  UsersIcon as UsersIconSolid,
  BellIcon as BellIconSolid,
  ChatIcon as ChatIconSolid,
  CogIcon as CogIconSolid,
  UserGroupIcon as UserGroupIconSolid,
} from "@heroicons/react/solid";

import SidebarRow from "./HelperComponents/SidebarRow";

function Sidebar({ user, topDist, maxWidth }) {
  const location = useLocation();
  const activeRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div
      className={
        maxWidth
          ? `p-2 max-w-[400px] xl:min-w-[230px]  sticky xl:ml-6`
          : `p-2 max-w-[600px] xl:min-w-[300px] sticky xl:ml-6`
      }
      style={{
        alignSelf: "flex-start",
        top: topDist ? `${topDist}` : "4.5rem",
        fontFamily: "Inter",
      }}
    >
      <SidebarRow
        src={user.profilePicUrl}
        title={user.name}
        route={`/${user.username}`}
        active={activeRoute(`/${user.username}`)}
      />
      <SidebarRow
        Icon={UsersIcon}
        IconSolid={UsersIconSolid}
        title="Following"
        route={`/user/${user._id}/following`}
        active={activeRoute(`/user/${user._id}/following`)}
      />
      <SidebarRow
        Icon={UserGroupIcon}
        IconSolid={UserGroupIconSolid}
        title="Followers"
        route={`/user/${user._id}/followers`}
        active={activeRoute(`/user/${user._id}/followers`)}
      />
      <SidebarRow
        Icon={BellIcon}
        IconSolid={BellIconSolid}
        title="Notifications"
        route={"/notifications"}
        active={activeRoute("/notifications")}
      />
      <SidebarRow
        Icon={ChatIcon}
        IconSolid={ChatIconSolid}
        title="Messenger"
        route={"/chats"}
        active={activeRoute("/chats")}
      />
    </div>
  );
}

export default Sidebar;

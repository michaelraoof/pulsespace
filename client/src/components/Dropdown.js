import React, { useRef } from "react";
import styled from "styled-components";
import { LogoutIcon, CogIcon } from "@heroicons/react/solid";
import { logoutUser } from "utils/authUser";
import { useClickAway } from "react-use";
import { useNavigate, Link } from "react-router-dom";

function Dropdown({ user, showDropdown, setShowDropdown }) {
  // const ref = useRef(null);
  // useClickAway(ref, () => {
  //   if (showDropdown) {
  //     setShowDropdown(false);
  //   }
  // });

  const router = useNavigate();

  return (
    <div
      // ref={ref}
      style={{
        position: "absolute",
        top: "4rem",
        right: "1rem",
        height: "15rem",
        width: "15rem",
        backgroundColor: "white",
        zIndex: "100",
        padding: "0.67rem",
        borderRadius: "0.7rem",
        boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
      }}
    >
      <div
        onClick={() => {
          setShowDropdown(false);
          router(`/${user.username}`);
        }}
      >
        <ContainerDiv>
          <div>
            <Image
              className="rounded-full mr-3"
              src={user.profilePicUrl}
              alt="user avatar"
            />
          </div>

          <div className="ml-0.5 flex flex-col">
            <p
              className="text-gray-600"
              style={{
                fontFamily: "Roboto",
                fontSize: "1.09rem",
                fontWeight: "500",
                marginBottom: "-0.19rem",
              }}
            >
              {user.name}
            </p>
            <p className="text-gray-500" style={{ fontWeight: "400" }}>
              My profile
            </p>
          </div>
        </ContainerDiv>
      </div>
      <span
        style={{
          height: "0.65px",
          backgroundColor: "lightgrey",
          margin: "1rem 0.8rem .7rem 0.8rem",
          display: "block",
        }}
      ></span>

      <div
        onClick={() => {
          setShowDropdown(false);
          router("/settings");
        }}
      >
        <ButtonDiv>
          <Icondiv>
            <CogIcon style={{ height: "1.5rem" }} />
          </Icondiv>
          <p>Settings</p>
        </ButtonDiv>
      </div>
      <ButtonDiv onClick={() => logoutUser(user.email, router)}>
        <Icondiv>
          <LogoutIcon style={{ height: "1.5rem" }} />
        </Icondiv>
        <p>Log Out</p>
      </ButtonDiv>
    </div>
  );
}

export default Dropdown;

const Image = styled.img`
  object-fit: cover;
  height: 3.3rem;
  width: 3.3rem;
`;

const ButtonDiv = styled.div`
  cursor: pointer;
  padding: 0.5rem 0.5rem;
  border-radius: 0.375rem;
  display: flex;
  justify-content: start;
  column-gap: 0.5rem;
  align-items: center;
  :hover {
    background-color: #eaeced;
  }
`;

const Icondiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 50%;
  background-color: #e4e4e5;
`;

const ContainerDiv = styled.div`
  display: flex;
  align-items: center;
  border-radius: 0.375rem;
  padding: 0.5rem;
  cursor: pointer;
  :hover {
    background-color: #eaeced;
  }
`;

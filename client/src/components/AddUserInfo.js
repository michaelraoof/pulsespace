import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Heading, Subheading } from "../components/HelperComponents/Headings";
import {
  CustomInput,
  Password,
  PasswordInput,
} from "components/HelperComponents/Inputs";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import axios from "axios";
import baseUrl from "utils/baseUrl";
import { CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import useBearStore from "store/store";
import { validateEmail } from "../utils/emailValidator";

const regexUserName = /^(?!.*\\.\\.)(?!.*\\.$)[^\\W][\\w.]{0,29}$/; //regex to validate username

let cancel;

function AddUserInfo({
  setUserData,
  setNextDisabled,
  errorMessage,
  setErrorMessage,
}) {
  const setSignUpDetails = useBearStore((state) => state.setSignUpDetails);

  const [visibility, setVisibility] = useState(false);
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { name, email, password } = user;

  const [username, setUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);

  // Email validation state
  const [emailValidation, setEmailValidation] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => ({ ...prev, [name]: value }));

    // Validate email format on change
    if (name === "email") {
      const validation = validateEmail(value);
      setEmailValidation(validation);
      // Reset availability when email changes so new email gets checked
      setEmailAvailable(true);
    } else {
      // For other fields, clear any error message
      if (errorMessage !== "") {
        setErrorMessage("");
      }
    }
  };

  // Debounced email availability check
  const checkEmailAvailability = useCallback(async () => {
    if (!email || email.length < 3) return;

    const validation = validateEmail(email);
    if (!validation?.isValid) return;

    setEmailLoading(true);

    try {
      const res = await axios.get(`${baseUrl}/api/signup/email/${encodeURIComponent(email)}`);

      if (res.data === "Available") {
        setEmailAvailable(true);
        // Clear any existing email error when email becomes available
        setErrorMessage((prevError) =>
          prevError.includes("Email") ? "" : prevError
        );
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setEmailAvailable(false);
        setErrorMessage("Email already registered. Please login instead.");
      }
    }

    setEmailLoading(false);
  }, [email, setErrorMessage]);

  // Debounced username check
  const checkUsername = useCallback(async () => {
    setUsernameLoading(true);

    try {
      cancel && cancel();

      const CancelToken = axios.CancelToken;

      const res = await axios.get(`${baseUrl}/api/signup/${username}`, {
        cancelToken: new CancelToken((canceler) => {
          cancel = canceler;
        }),
      });

      // Clear only username-related errors when username becomes available
      setErrorMessage((prevError) =>
        prevError.includes("Username") ? "" : prevError
      );

      if (res.data === "Available") {
        setUsernameAvailable(true);
        setUser((prev) => ({ ...prev, username }));
      }
      if (res.data === "Username already taken") {
        setErrorMessage("Username Not Available");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          setErrorMessage("Username Not Available");
        }
      }

      setUsernameAvailable(false);
    }

    setUsernameLoading(false);
  }, [username]);

  // Debounce email availability check
  useEffect(() => {
    if (email === "" || !emailValidation?.isValid) {
      setEmailAvailable(true);
      return;
    }

    const timer = setTimeout(() => {
      checkEmailAvailability();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [email, emailValidation, checkEmailAvailability]);

  // Debounce username check
  useEffect(() => {
    if (username === "") {
      setUsernameAvailable(false);
      return;
    }

    const timer = setTimeout(() => {
      checkUsername();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  // Load from session storage
  useEffect(() => {
    setUser({
      name: sessionStorage.getItem("name") || "",
      email: sessionStorage.getItem("email") || "",
      password: sessionStorage.getItem("password") || "",
    });

    setUsername(sessionStorage.getItem("username") || "");
  }, []);

  // Check if all fields are valid
  useEffect(() => {
    const isUser = Object.values({ name, email, password, username }).every(
      (item) => Boolean(item)
    );

    const isPasswordValid = password.length >= 6; // Just check minimum length

    const isEmailValid = emailValidation?.isValid !== false && emailAvailable;

    const hasNoErrors = errorMessage === "";

    if (isUser && usernameAvailable && isPasswordValid && isEmailValid && hasNoErrors) {
      sessionStorage.setItem("name", name);
      sessionStorage.setItem("email", email);
      sessionStorage.setItem("password", password);
      sessionStorage.setItem("username", username);
      setSignUpDetails({ name, email, password, username });
      setNextDisabled(false);
    } else {
      setNextDisabled(true);
    }
  }, [name, email, password, username, usernameAvailable, emailValidation, emailAvailable, errorMessage, setNextDisabled, setSignUpDetails]);

  return (
    <>
      <Container>
        <HeaderContainer>
          <h1
            style={{
              fontSize: "2.8rem",
              fontFamily: "Poppins",
              fontWeight: "600",
              marginBottom: "-0.1rem",
            }}
          >
            Sign Up for your
          </h1>
          <Heading fontSize={"2.6rem"} fontWeight={"600"}>
            PulseSpace <Subheading fontSize={"1.7rem"}>of attention.</Subheading>
          </Heading>
        </HeaderContainer>

        <FormContainer>
          <InputField
            placeholder="Enter Name"
            name="name"
            value={name}
            onChange={handleChange}
            aria-label="Full name"
          />

          <InputField
            placeholder="Enter Email"
            name="email"
            value={email}
            onChange={handleChange}
            aria-label="Email address"
            style={{
              borderColor: !emailAvailable ? '#fe6f8a' :
                emailValidation?.isValid === false ? '#fe6f8a' :
                  emailValidation?.isValid === true ? '#4caf50' : undefined
            }}
          />
          {email && emailValidation?.isValid && emailAvailable && (
            <EmailCheckIcon>
              <CheckCircleIcon style={{ fontSize: '1.2rem', color: '#4caf50' }} />
            </EmailCheckIcon>
          )}

          <PasswordInputWrapper>
            <InputField
              placeholder="Enter Password (6+ characters)"
              name="password"
              value={password}
              onChange={handleChange}
              type={visibility ? "text" : "password"}
              aria-label="Password"
            />
            <PasswordToggle
              onClick={() => setVisibility((prev) => !prev)}
              aria-label={visibility ? "Hide password" : "Show password"}
            >
              {visibility ? <Visibility /> : <VisibilityOff />}
            </PasswordToggle>
          </PasswordInputWrapper>

          <UsernameInputWrapper>
            <InputField
              placeholder="Enter Username"
              name="username"
              value={username}
              onChange={(e) => {
                if (errorMessage !== "") {
                  setErrorMessage("");
                }

                setUsername(e.target.value);
                if (e.target.value.length < 1) {
                  setUsernameAvailable(false);
                  return;
                }

                if (!regexUserName.test(e.target.value)) {
                  setUsernameAvailable(false);
                }
              }}
              aria-label="Username"
            />
            <UsernameStatus>
              {usernameLoading ? (
                <CircularProgress size={20} />
              ) : usernameAvailable ? (
                <CheckCircleIcon style={{ color: "#4caf50" }} />
              ) : username.length > 0 ? (
                <CancelIcon style={{ color: "#fe6f8a" }} />
              ) : (
                <CancelIcon style={{ color: "#e0e0e0" }} />
              )}
            </UsernameStatus>
          </UsernameInputWrapper>

          {errorMessage !== "" && (
            <ErrorContainer>
              <div>
                <ErrorOutlineIcon
                  style={{
                    fontSize: "1.31rem",
                    color: "#fe6f8a",
                  }}
                />
              </div>

              <ErrorText>{errorMessage}</ErrorText>
            </ErrorContainer>
          )}
        </FormContainer>
      </Container>
    </>
  );
}

const Container = styled.div`
  padding-top: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 90vh;
  background-color: whitesmoke;
  overflow-x: hidden;
  
  @media only screen and (max-width: 600px) {
    padding-top: 2rem;
  }
`;

const HeaderContainer = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  animation: fadeInDown 0.6s ease-out;

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 28rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 0 2rem;

  @media only screen and (max-width: 600px) {
    padding: 0 1rem;
    max-width: 100%;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;

  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const EmailInputContainer = styled.div`
  position: relative;
`;

const EmailCheckIcon = styled.div`
  position: absolute;
  right: 2.5rem;
  top: 3.3rem;
  animation: scaleIn 0.3s ease-out;

  @keyframes scaleIn {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }

  @media only screen and (max-width: 600px) {
    right: 1.5rem;
  }
`;

// Consistent input field styling
const InputField = styled.input`
  font-size: 1.18rem;
  font-weight: 400;
  outline: none;
  padding: 18px;
  margin: 0 auto;
  margin-top: 1.6rem;
  border: 1.5px solid #f0e6ff;
  color: black;
  border-radius: 10px;
  width: 100%;
  max-width: 25rem;
  transition: all 0.3s ease;
  
  ::placeholder {
    color: #8f85de;
    opacity: 0.46;
  }

  :focus {
    border: 1.5px solid #a097ea;
    box-shadow: 0 4px 12px rgba(160, 151, 234, 0.2);
    transform: translateY(-2px);
  }

  @media only screen and (max-width: 600px) {
    max-width: 100%;
  }
`;

// Password input wrapper with toggle button
const PasswordInputWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 25rem;
  margin: 0 auto;

  @media only screen and (max-width: 600px) {
    max-width: 100%;
  }
`;

const PasswordToggle = styled.div`
  position: absolute;
  right: 18px;
  top: 64%;
  transform: translateY(-50%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8f85de;
  transition: color 0.2s ease;

  &:hover {
    color: #6050dc;
  }
`;

// Username input wrapper with status indicator
const UsernameInputWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 25rem;
  margin: 0 auto;

  @media only screen and (max-width: 600px) {
    max-width: 100%;
  }
`;

const UsernameStatus = styled.div`
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
`;

const ErrorText = styled.p`
  color: #fe6f8a;
  font-size: 1.01rem;
  font-family: "Roboto", sans-serif;
  font-weight: 600;
  width: 100%;
  margin-left: 0.4rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  margin-top: 0.5rem;
  align-items: center;
  animation: shake 0.4s ease-in-out;

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;

export default AddUserInfo;

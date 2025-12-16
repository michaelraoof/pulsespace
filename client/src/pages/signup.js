import styles from "styles/styles.module.css";
import { useState, useRef, useEffect } from "react";
import AddProfilePic from "components/AddProfilePic";
import AddUserInfo from "components/AddUserInfo";

import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import styled from "styled-components";
import ProgressStepper from "components/ProgressStepper";

function Signup() {
  const firstUpdate = useRef(true);
  const [animationClass, setAnimationClass] = useState(
    `${styles.fadeinreally}`
  );
  const [errorMessage, setErrorMessage] = useState("");
  const arrayOfPages = [AddUserInfo, AddProfilePic];
  const [nextDisabled, setNextDisabled] = useState(true);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    username: "",
  });

  const [currentPage, setCurrentPage] = useState({
    index: 0,
    value: arrayOfPages[0],
  });

  const steps = ["Account Info", "Customize Profile"];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Enter key to proceed
      if (e.key === "Enter" && !nextDisabled && currentPage.index < arrayOfPages.length - 1) {
        handleNext();
      }
      // Escape key to go back
      if (e.key === "Escape" && currentPage.index > 0) {
        handleBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage.index, nextDisabled]);

  const handleNext = () => {
    if (nextDisabled) {
      setErrorMessage("Please fill in all required fields correctly.");
      return;
    }

    setAnimationClass(`${styles.fadeinlol}`);
    if (currentPage.index !== arrayOfPages.length - 1) {
      setCurrentPage((prev) => ({
        index: prev.index + 1,
        value: arrayOfPages[prev.index + 1],
      }));
      setErrorMessage("");
    }
  };

  const handleBack = () => {
    setAnimationClass(`${styles.fadeinreally}`);
    if (currentPage.index > 0) {
      setCurrentPage((prev) => ({
        index: prev.index - 1,
        value: arrayOfPages[prev.index - 1],
      }));
      setErrorMessage("");
    }
  };

  return (
    <>
      <Container>
        <ProgressStepper
          currentStep={currentPage.index + 1}
          totalSteps={arrayOfPages.length}
          steps={steps}
        />

        <ContentWrapper>
          <div className={animationClass}>
            {currentPage.index === 0 && (
              <AddUserInfo
                setUserData={setUserData}
                setNextDisabled={setNextDisabled}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
              />
            )}
            {currentPage.index === 1 && (
              <AddProfilePic setErrorMessage={setErrorMessage} />
            )}
          </div>
        </ContentWrapper>

        <NavigationContainer>
          {currentPage.index > 0 && (
            <NavButton onClick={handleBack} aria-label="Go back" variant="secondary">
              <ChevronLeftRoundedIcon
                style={{
                  fontSize: "1.5rem",
                }}
              />
              <NavText>Back</NavText>
            </NavButton>
          )}

          {currentPage.index < arrayOfPages.length - 1 && (
            <NavButton
              onClick={handleNext}
              disabled={nextDisabled}
              aria-label="Continue to next step"
              variant="primary"
            >
              <NavText>Next</NavText>
              <ChevronRightRoundedIcon
                style={{
                  fontSize: "1.5rem",
                }}
              />
            </NavButton>
          )}
        </NavigationContainer>

        {currentPage.index < arrayOfPages.length - 1 && (
          <KeyboardHint>
            Press <kbd>Enter</kbd> to continue or <kbd>Esc</kbd> to go back
          </KeyboardHint>
        )}
      </Container>
    </>
  );
}

export default Signup;

const Container = styled.div`
  background-color: whitesmoke;
  min-height: 100vh;
  overflow-x: hidden;
`;

const ContentWrapper = styled.div`
  width: 100%;
`;

const NavigationContainer = styled.div`
  height: 10vh;
  display: flex;
  justify-content: ${props => props.theme?.justifyContent || 'center'};
  align-items: center;
  gap: 1.5rem;
  padding: 0 2rem;
  margin-top: 1rem;

  @media only screen and (max-width: 600px) {
    gap: 1rem;
    padding: 0 1rem;
    margin-top: 0.5rem;
  }
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1.8rem;
  background: ${props => {
    if (props.disabled) return '#e0e0e0';
    if (props.variant === 'secondary') return 'white';
    return 'linear-gradient(135deg, #6050dc 0%, #8b7ae8 100%)';
  }};
  color: ${props => {
    if (props.disabled) return '#9e9e9e';
    if (props.variant === 'secondary') return '#6050dc';
    return 'white';
  }};
  border: ${props => props.variant === 'secondary' ? '2px solid #6050dc' : 'none'};
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: ${props => {
    if (props.disabled) return 'none';
    if (props.variant === 'secondary') return '0 2px 8px rgba(96, 80, 220, 0.15)';
    return '0 4px 15px rgba(96, 80, 220, 0.3)';
  }};
  min-width: 120px;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => {
    if (props.disabled) return 'none';
    if (props.variant === 'secondary') return '0 4px 12px rgba(96, 80, 220, 0.25)';
    return '0 6px 20px rgba(96, 80, 220, 0.4)';
  }};
    background: ${props => {
    if (props.disabled) return '#e0e0e0';
    if (props.variant === 'secondary') return '#f5f3ff';
    return 'linear-gradient(135deg, #3e2fb3 0%, #6050dc 100%)';
  }};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }

  @media only screen and (max-width: 600px) {
    padding: 0.7rem 1.4rem;
    font-size: 1rem;
    min-width: 100px;
  }
`;

const NavText = styled.span`
  @media only screen and (max-width: 400px) {
    display: none;
  }
`;

const KeyboardHint = styled.div`
  text-align: center;
  padding: 1rem;
  font-size: 0.85rem;
  color: #718096;
  font-family: 'Roboto', sans-serif;

  kbd {
    display: inline-block;
    padding: 0.2rem 0.5rem;
    background: white;
    border: 1px solid #cbd5e0;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin: 0 0.2rem;
  }

  @media only screen and (max-width: 600px) {
    font-size: 0.75rem;
    
    kbd {
      font-size: 0.7rem;
      padding: 0.15rem 0.4rem;
    }
  }
`;

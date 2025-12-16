import React, { useRef, useState } from "react";
import styled from "styled-components";

import { Heading, Subheading } from "./HelperComponents/Headings";
import {
  CustomInput,
  Input,
  SocialMedia,
  SocialMediaInput,
} from "./HelperComponents/Inputs";
import ImageDiv from "./ImageDiv";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import mediaqueries from "../utils/mediaqueries";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Circle } from "better-react-spinkit";
import uploadPic from "utils/uploadPic";
import { registerUser } from "../utils/authUser";
import ErrorComponent from "./HelperComponents/Error";
import useBearStore from "store/store";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function AddProfilePic() {
  const router = useNavigate();

  const signUpDetails = useBearStore((state) => state.signUpDetails);

  const inputRef = useRef();

  const [optionalDetails, setOptionalDetails] = useState({
    bio: "",
    youtube: "",
    twitter: "",
    instagram: "",
    facebook: "",
  });

  const { bio, youtube, twitter, instagram, facebook } = optionalDetails;
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "media") {
      setMedia(files[0]);
      setMediaPreview(URL.createObjectURL(files[0]));
    } else {
      setOptionalDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const submitProfile = async () => {
    let profilePicUrl = null;
    setLoading(true);
    if (media !== null) {
      profilePicUrl = await uploadPic(media);
    }
    if (media !== null && !profilePicUrl) {
      setLoading(false);
      return setErrorMessage("Error Uploading Image");
    }

    await registerUser(
      { ...signUpDetails, ...optionalDetails },
      profilePicUrl,
      setErrorMessage,
      setLoading,
      router
    );

    // Show success animation before redirect
    setSuccess(true);
  };

  return (
    <>
      <Container>
        {success ? (
          <SuccessContainer>
            <SuccessIcon>
              <CheckCircleIcon style={{ fontSize: '5rem', color: '#4caf50' }} />
            </SuccessIcon>
            <SuccessText>Account Created Successfully!</SuccessText>
            <SuccessSubtext>Redirecting you to PulseSpace...</SuccessSubtext>
          </SuccessContainer>
        ) : (
          <>
            <HeaderContainer>
              <Heading fontSize={"2.4rem"} fontWeight={"600"}>
                Customize Your <Subheading fontSize={"1.6rem"}>Profile</Subheading>
              </Heading>
              <SubText>Add a photo and tell us about yourself (optional)</SubText>
            </HeaderContainer>

            <ContentContainer>
              <ImageDiv
                mediaPreview={mediaPreview}
                setMediaPreview={setMediaPreview}
                setMedia={setMedia}
                inputRef={inputRef}
                handleChange={handleChange}
              ></ImageDiv>

              <Bio
                name="bio"
                value={bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows="3"
                wrap="soft"
              />

              <SocialMediaGrid>
                <SocialMedia>
                  <YouTubeIcon style={{ color: "#8f85de" }} />
                  <SocialMediaInput
                    name="youtube"
                    value={youtube}
                    onChange={handleChange}
                    placeholder="YouTube"
                  />
                </SocialMedia>
                <SocialMedia>
                  <TwitterIcon style={{ color: "#8f85de" }} />
                  <SocialMediaInput
                    name="twitter"
                    value={twitter}
                    onChange={handleChange}
                    placeholder="Twitter"
                  />
                </SocialMedia>
                <SocialMedia>
                  <InstagramIcon style={{ color: "#8f85de" }} />
                  <SocialMediaInput
                    name="instagram"
                    value={instagram}
                    onChange={handleChange}
                    placeholder="Instagram"
                  />
                </SocialMedia>
                <SocialMedia>
                  <FacebookIcon style={{ color: "#8f85de" }} />
                  <SocialMediaInput
                    name="facebook"
                    value={facebook}
                    onChange={handleChange}
                    placeholder="Facebook"
                  />
                </SocialMedia>
              </SocialMediaGrid>

              {errorMessage !== "" && <ErrorComponent errorMessage={errorMessage} />}

              <NextButton onClick={() => submitProfile()} disabled={loading}>
                {loading ? (
                  <Circle size={20} color="white" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowForwardRoundedIcon style={{ fontSize: "1.5rem" }} />
                  </>
                )}
              </NextButton>
            </ContentContainer>
          </>
        )}
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

const SubText = styled.p`
  font-size: 1rem;
  color: #718096;
  font-family: 'Roboto', sans-serif;
  margin-top: 0.5rem;
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 0 2rem;
  animation: fadeInUp 0.6s ease-out 0.2s;
  animation-fill-mode: both;

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

  @media only screen and (max-width: 600px) {
    padding: 0 1rem;
  }
`;

const Bio = styled.textarea`
  overflow: hidden;
  resize: none;
  font-size: 1.18rem;
  font-weight: 400;
  outline: none;
  padding: 18px;
  border: 1.5px solid #f0e6ff;
  color: black;
  border-radius: 10px;
  width: 100%;
  max-width: 37rem;
  transition: all 0.3s ease;
  background: white;

  @media only screen and (max-width: 600px) {
    min-width: auto;
  }

  ::placeholder {
    color: #8f85de;
    opacity: 0.46;
  }

  :focus {
    border: 1.5px solid #a097ea;
    box-shadow: 0 4px 12px rgba(160, 151, 234, 0.2);
    transform: translateY(-2px);
  }
`;

const SocialMediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
  max-width: 28rem;
  margin: 1.5rem auto 0;

  @media only screen and (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  @media only screen and (max-width: 320px) {
    margin-top: 1rem;
    height: 3.5rem;
    width: 3.5rem;
  }
`;

const NextButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.9rem 1.8rem;
  margin: 2rem auto 0;
  background: ${props => props.disabled ? '#e0e0e0' : 'linear-gradient(135deg, #6050dc 0%, #8b7ae8 100%)'};
  color: ${props => props.disabled ? '#9e9e9e' : 'white'};
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.disabled ? 'none' : '0 4px 15px rgba(96, 80, 220, 0.3)'};
  min-width: 180px;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 6px 20px rgba(96, 80, 220, 0.4)'};
    background: ${props => props.disabled ? '#e0e0e0' : 'linear-gradient(135deg, #3e2fb3 0%, #6050dc 100%)'};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }

  @media only screen and (max-width: 600px) {
    padding: 0.7rem 1.4rem;
    font-size: 1rem;
    min-width: 150px;
  }
`;

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  animation: successPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);

  @keyframes successPop {
    0% {
      opacity: 0;
      transform: scale(0.5);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const SuccessIcon = styled.div`
  animation: checkmarkPulse 1s ease-in-out infinite;

  @keyframes checkmarkPulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
`;

const SuccessText = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: #2d3748;
  font-family: 'Poppins', sans-serif;
  margin-top: 1.5rem;
  text-align: center;
`;

const SuccessSubtext = styled.p`
  font-size: 1.1rem;
  color: #718096;
  font-family: 'Roboto', sans-serif;
  margin-top: 0.5rem;
  text-align: center;
`;

export default AddProfilePic;

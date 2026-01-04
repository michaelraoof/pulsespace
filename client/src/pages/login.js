import { useState, useEffect } from "react";
import cookie from "js-cookie";
import { loginUser } from "utils/authUser";

import { Link, useNavigate, useLocation } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Heading, Subheading } from "components/HelperComponents/Headings";
import {
  Input,
  Password,
  PasswordInput,
} from "components/HelperComponents/Inputs";
import ErrorComponent from "components/HelperComponents/Error";

import { ThreeBounce } from "better-react-spinkit";
import useAuth from "hooks/useAuth";
import useBearStore from "store/store";

function Login() {
  const router = useNavigate();
  const [visibility, setVisibility] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const { email, password } = user;
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => ({ ...prev, [name]: value }));
    //[name] refers to the name of the object property that we want to change.
  };

  useEffect(() => {
    const isUser = Object.values({ email, password }).every((item) =>
      Boolean(item)
    );

    isUser ? setSubmitDisabled(false) : setSubmitDisabled(true);
  }, [email, password]);

  const handleSubmit = async (e) => {
    await loginUser(user, router, setErrorMessage, setLoading);
  };

  useEffect(() => {
    const userEmail = cookie.get("userEmail");
    if (userEmail) setUser((prev) => ({ ...prev, email: userEmail }));
  }, []);

  return (
    <>
      <div className="pt-24 flex flex-col items-center min-h-screen bg-surface-background overflow-x-hidden sm:pt-6">
        <h1
          style={{
            fontSize: "2.8rem",
            fontFamily: "Poppins",
            fontWeight: "600",
            marginBottom: "-0.1rem",
          }}
        >
          Log In
        </h1>
        <Heading fontSize={"2.6rem"} fontWeight={"600"}>
          PulseSpace
        </Heading>
        <Subheading fontSize={"1.48rem"}>
          Full Social Media Features Available | End-to-End Encryption Coming
          Soon...
        </Subheading>
        <div className="flex flex-col mt-5 bg-surface rounded-card shadow-[0_2.8px_2.2px_rgba(0,0,0,0.034),0_6.7px_5.3px_rgba(0,0,0,0.048),0_12.5px_10px_rgba(0,0,0,0.06),0_22.3px_17.9px_rgba(0,0,0,0.072),0_41.8px_33.4px_rgba(0,0,0,0.086),0_100px_80px_rgba(0,0,0,0.12)] min-w-[24rem] max-w-[30.5rem] w-[90%] h-[29.25rem] lg:w-[30.5rem] sm:min-w-auto sm:w-[95%]">
          <div className="flex justify-center mb-4 px-8 mt-4">
            <button
              type="button"
              onClick={() =>
                setUser({
                  email: "raoofmichael@yahoo.com",
                  password: "123456",
                })
              }
              className="w-full py-2 rounded-md bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors flex flex-col items-center gap-0.5 border border-blue-200"
            >
              <span>Tap to use Demo Account</span>
              <span className="text-xs text-blue-400 font-normal">
                (raoofmichael@yahoo.com)
              </span>
            </button>
          </div>

          <Input
            placeholder="Enter Email"
            name="email"
            value={email}
            onChange={handleChange}
          />
          <div className="relative w-full flex flex-col">
            <Input
              placeholder="Enter Password"
              name="password"
              value={password}
              onChange={handleChange}
              type={visibility ? "text" : "password"}
            />
            <div
              className="absolute right-12 top-[64%] -translate-y-1/2 cursor-pointer flex items-center justify-center text-text-secondary transition-colors duration-200 hover:text-primary"
              onClick={() => setVisibility((prev) => !prev)}
              aria-label={visibility ? "Hide password" : "Show password"}
            >
              {visibility ? <Visibility /> : <VisibilityOff />}
            </div>
          </div>

          {errorMessage !== "" && (
            <ErrorComponent errorMessage={errorMessage} />
          )}

          <button
            className="transition-all duration-400 cursor-pointer rounded-button bg-primary text-white text-[1.39rem] font-poppins m-[2.2rem_2.2rem_1.5rem_2.2rem] p-[15px] font-medium border-none hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-primary-disabled"
            disabled={submitDisabled}
            onClick={handleSubmit}
          >
            {loading ? <ThreeBounce size={9} color="#fff" /> : "Log In"}
          </button>
          <p className="cursor-pointer text-center text-text-muted font-roboto text-xl hover:underline">
            Forgotten Password?
          </p>
          <span
            style={{
              height: "1.5px",
              backgroundColor: "#f0e6ff",
              margin: "0.4rem 2.2rem 0 2.2rem",
            }}
          ></span>

          <span className="text-text-muted text-lg text-center font-roboto mt-8 font-light flex items-center justify-center">
            New to PulseSpace?{" "}
            <Link to="/signup">
              <p className="text-accent hover:underline cursor-pointer">
                Create an account.
              </p>
            </Link>
          </span>
        </div>
      </div>
    </>
  );
}
function AuthHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";
  const isAuthenticated = useBearStore((state) => state.isAuthenticated);
  const { loading } = useAuth();
  if (!loading) {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    } else {
      return <Login />;
    }
  }
}
export default AuthHandler;

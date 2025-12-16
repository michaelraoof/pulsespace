import { Navigate } from "react-router-dom";
import useAuth from "hooks/useAuth";
import useBearStore from "store/store";
import Layout from "./Layout";

const AuthenticatedRoute = ({ children }) => {
  const isAuthenticated = useBearStore((state) => state.isAuthenticated);
  const { loading } = useAuth();

  if (!loading) {
    return isAuthenticated ? (
      <Layout>{children}</Layout>
    ) : (
      <Navigate to="/login" />
    );
  }
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #8b5cf6",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthenticatedRoute;

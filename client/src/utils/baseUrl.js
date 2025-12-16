const baseUrl =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://pulsespace-zwfv.onrender.com";
const baseUrlFE =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3001"
    : "https://pulsespacex.vercel.app";

export default baseUrl;
export { baseUrlFE };

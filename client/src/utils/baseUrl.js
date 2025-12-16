const baseUrl =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://pulsespace.onrender.com";
const baseUrlFE =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3001"
    : "https://pulsespace.vercel.app";

export default baseUrl;
export { baseUrlFE };

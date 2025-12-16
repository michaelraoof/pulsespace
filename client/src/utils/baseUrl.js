const baseUrl =
  import.meta.env.MODE !== "production"
    ? "http://localhost:3000"
    : "https://pulsespace-zwfv.onrender.com";
const baseUrlFE =
  import.meta.env.MODE !== "production"
    ? "http://localhost:3001"
    : "https://pulsespacex.vercel.app";

export default baseUrl;
export { baseUrlFE };

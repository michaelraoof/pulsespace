module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6050dc",
          hover: "#3e2fb3",
          disabled: "#a097ea",
        },
        accent: {
          DEFAULT: "#ff8af2",
        },
        surface: {
          DEFAULT: "#ffffff",
          background: "whitesmoke",
          divider: "#f0e6ff",
        },
        text: {
          muted: "#b19cd9",
          secondary: "#8f85de",
        },
      },
      borderRadius: {
        card: "20px",
        button: "10px",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};

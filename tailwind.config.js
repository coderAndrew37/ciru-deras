// tailwind.config.js
module.exports = {
  content: ["./public/**/*.{html,js}", "./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF9900", // Branding orange
        dark: "#333333", // Dark gray for background/buttons
        light: "#FFFFFF", // White for text
        accent: "#CCCCCC", // Light gray for subtle accents
      },
      fontFamily: {
        sans: ["Montserrat", "sans-serif"], // Matching their font style
      },
      spacing: {
        128: "32rem", // Custom spacing for large components
        144: "36rem",
      },
      borderRadius: {
        xl: "1.5rem", // For rounded buttons/cards
      },
    },
  },
  plugins: [],
};

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: withOpacity("--color-primary"),
        secondary: withOpacity("--color-secondary"),
        background: withOpacity("--color-background"),
        error: withOpacity("--color-error"),
      },
      fontFamily: {
        // sans: ["Montserrat", "sans-serif"],
        sans: ["Open Sans", "sans-serif"],
      },
      maxHeight: { 90: "90%" },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

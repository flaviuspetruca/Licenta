/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,jsx,tsx}"],
    theme: {
        extend: {
            keyframes: {
                riseUp: {
                    "0%": { transform: "translateY(20%)" },
                    "100%": { transform: "translateY(0)" },
                },
                dropOff: {
                    "0%": { transform: "translateY(100%)" },
                    "100%": { transform: "translateY(0%)" },
                },
            },
            borderRadius: {
                "4xl": "2rem",
            },
            animation: {
                "rise-up": "0.2s ease-in-out 0.1s 1 riseUp",
                "drop-off": "0.2s ease-in-out 0s 1 dropOff",
            },
            transitionProperty: {
                height: "height",
                maxHeight: "max-height",
            },
            transitionDuration: {
                10000: "10000ms",
            },
            maxHeight: {
                128: "70rem",
            },
        },
    },
    plugins: [],
};

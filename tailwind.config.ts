import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}"
	],
	theme: {
		extend: {
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))"
			},
			fontSize: {
				xxs: "0.625rem", // 10px
				xxxs: "0.5rem" // 8px
			},
			keyframes: {
				"fade-in-up": {
					"0%": {
						opacity: "0",
						transform: "translateY(20px)"
					},
					"100%": {
						opacity: "1",
						transform: "translateY(0)"
					}
				},
				// for coloring
				text: {
					"0%, 100%": {
						"background-size": "200% 200%",
						"background-position": "left center"
					},
					"50%": {
						"background-size": "200% 200%",
						"background-position": "right center"
					}
				}
			},
			animation: {
				"fade-in-up": "fade-in-up 0.5s ease-out forwards",
				text: "text 5s ease infinite"
			}
		}
	},
	plugins: []
};
export default config;

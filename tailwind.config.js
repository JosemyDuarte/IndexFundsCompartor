/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				// Revolut-inspired palette
				revolut: {
					dark: '#0C0E16',
					darker: '#05060A',
					card: '#1A1D29',
					blue: '#0075FF',
					'blue-dark': '#0056CC',
					purple: '#8B3DFF',
					green: '#00D46A',
					red: '#FF3B5C',
					orange: '#FF8A00',
					yellow: '#FFD700'
				}
			},
			boxShadow: {
				'revolut-card': '0 4px 24px rgba(0, 0, 0, 0.25)',
				'revolut-hover': '0 8px 32px rgba(0, 0, 0, 0.35)',
				'revolut-glow-blue': '0 0 20px rgba(0, 117, 255, 0.3)',
				'revolut-glow-purple': '0 0 20px rgba(139, 61, 255, 0.3)'
			},
			backgroundImage: {
				'gradient-revolut': 'linear-gradient(135deg, #0C0E16 0%, #1A1D29 100%)',
				'gradient-card': 'linear-gradient(135deg, rgba(26, 29, 41, 0.8) 0%, rgba(12, 14, 22, 0.8) 100%)',
				'gradient-blue': 'linear-gradient(135deg, #0075FF 0%, #0056CC 100%)',
				'gradient-purple': 'linear-gradient(135deg, #8B3DFF 0%, #6B1FE0 100%)'
			}
		}
	},
	plugins: []
};

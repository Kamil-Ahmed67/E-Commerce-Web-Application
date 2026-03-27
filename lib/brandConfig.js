// Brand configuration for all 4 brand pages
// Colors are derived from each brand's actual logo palette

export const BRAND_CONFIGS = {
    vidjar: {
        slug: 'vidjar',
        name: 'Vidjar',
        category: 'Classic Wear',
        logo: '/mingle logos/Vidjar.png',
        heroImage: '/images/about/Men.jpg',
        storyImage: '/images/about/Men.jpg',
        logoBg: 'white',
        youtubeId: null, // e.g. 'dQw4w9WgXcQ' — the part after ?v= in the YouTube URL
        tagline: 'Define Classic.',
        subTagline: 'Timeless style built for the modern man who never settles.',
        // Vidjar logo: bold charcoal/black text + vibrant teal V-arrow
        gradientFrom: '#f4faf9',
        gradientVia: '#e6f5f3',
        gradientTo: '#d6efeb',
        accentColor: '#2EC4B6',
        accentColorLight: '#7ee8e0',
        textOnHero: '#2EC4B6',
        story: {
            heading: 'The Art of Classic Dressing',
            paragraphs: [
                'Vidjar was built on a timeless principle: that true style is never loud. It is refined, composed, and enduring. Launched as a classic wear label, Vidjar exists for the man who values quality over trend — the individual who understands that the most powerful statement is an impeccably dressed one.',
                'Every Vidjar garment is a study in restraint. Clean lines, precise tailoring, and fabrics selected for their ability to hold structure and drape effortlessly through the years. Nothing is added without purpose; nothing endures without merit.',
                'From boardrooms to weekends, from formal occasions to casual confidence — Vidjar dresses the moments that matter. Classic is not a style choice. For Vidjar wearers, it is a way of life.',
            ],
        },
        values: [
            { icon: '✦', title: 'Timeless Design', desc: 'Clean silhouettes that look as sharp in five years as they do today.' },
            { icon: '🧵', title: 'Precise Tailoring', desc: 'Every garment is cut and finished with exacting attention to form.' },
            { icon: '🏆', title: 'Lasting Quality', desc: 'Premium fabrics chosen to be worn, washed, and worn again.' },
        ],
        testimonials: [
            { quote: 'Vidjar changed how I dress for work. Every piece looks sharp and feels premium — I always get compliments.', author: 'Raihan A.', role: 'Corporate Professional' },
            { quote: 'Finally a brand that understands what classic actually means. No gimmicks, just genuinely well-made clothes.', author: 'Tanvir H.', role: 'Entrepreneur' },
            { quote: 'I have repurchased the same shirt three times. The quality holds up wash after wash. That says everything.', author: 'Sabbir M.', role: 'Architect' },
        ],
    },

    avasaa: {
        slug: 'avasaa',
        name: 'Avasaa',
        category: 'Comfort Wear',
        logo: '/mingle logos/Avasaa.png',
        heroImage: '/images/about/Women.jpg',
        storyImage: '/images/Avasa.jpeg',
        logoBg: 'white',
        youtubeId: null, // Replace null with your YouTube video ID e.g. 'dQw4w9WgXcQ'
        tagline: 'Feel Comfortable.',
        subTagline: 'Clothing designed around you — soft, breathable, effortlessly yours.',
        // Avasaa logo: sage green feather + layered teal/forest serif letters
        gradientFrom: '#f5f9f7',
        gradientVia: '#eaf4ef',
        gradientTo: '#dcece4',
        accentColor: '#6DBF9E',
        accentColorLight: '#a8dfc5',
        textOnHero: '#6DBF9E',
        story: {
            heading: 'Where Comfort is Everything',
            paragraphs: [
                'Avasaa was created around a single, deeply human need: to feel good in what you wear. Not just look good — feel good. Comfort wear is often dismissed as a compromise, a trade-off between style and ease. Avasaa rejects that entirely.',
                'Inspired by the gentleness of natural textures — the softness of woven cotton, the lightness of breathable linen, the warmth of thoughtfully layered fabrics — every Avasaa piece is designed to move with you, not against you.',
                'Whether you are working from home, stepping out for brunch, or simply existing in the quiet of your own space, Avasaa ensures that what you wear supports your day rather than distracting from it. Comfort, they say, is the greatest luxury.',
            ],
        },
        values: [
            { icon: '🌿', title: 'Soft by Design', desc: 'Fabrics chosen specifically for feel — gentle against every skin type.' },
            { icon: '🌬️', title: 'All-Day Breathability', desc: 'Lightweight construction that keeps you comfortable from morning to night.' },
            { icon: '💚', title: 'Made with Care', desc: 'Each piece designed with your wellbeing — not just your wardrobe — in mind.' },
        ],
        testimonials: [
            { quote: 'I wore my Avasaa set all day — from home office to an evening out. Comfortable and still put-together. Perfect.', author: 'Nadia R.', role: 'Freelance Designer' },
            { quote: 'The fabric is so soft I almost forgot I was wearing anything. This is what clothing should feel like.', author: 'Sadia K.', role: 'Teacher' },
            { quote: 'Avasaa is the only brand I trust for everyday wear. Comfortable, beautiful, and they last so long.', author: 'Mim F.', role: 'Healthcare Worker' },
        ],
    },

    purenorth: {
        slug: 'purenorth',
        name: 'Pure North',
        category: 'Active Wear',
        logo: '/mingle logos/Pure North.png',
        heroImage: '/images/PureNorth.jpg',
        storyImage: '/images/PureNorth.jpg',
        logoBg: 'white',
        youtubeId: null, // Replace null with your YouTube video ID e.g. 'dQw4w9WgXcQ'
        tagline: 'Move Further.',
        subTagline: 'Active wear engineered for performance and built for real life.',
        // Pure North logo: bold black serif + small teal mountain peak accent
        gradientFrom: '#f3f9f9',
        gradientVia: '#e4f3f3',
        gradientTo: '#d1ecec',
        accentColor: '#39B2AC',
        accentColorLight: '#80d8d4',
        textOnHero: '#39B2AC',
        story: {
            heading: 'Engineered for Motion',
            paragraphs: [
                'Pure North was built for people who move. Runners, hikers, gym-goers, cyclists, and everyone in between — Pure North active wear is designed to perform where other clothing gives up. Every seam, every panel, every fabric choice begins with a single question: will this hold up when it matters?',
                'Drawing inspiration from the unyielding landscapes of the north — mountain trails, open terrain, wind-swept ridges — Pure North combines technical performance with a clean, minimal aesthetic. You should never have to choose between looking good and moving freely.',
                'Our active wear range uses breathable, moisture-wicking, and stretch-engineered fabrics that adapt to your body in motion. From warm-up to cooldown, pure performance from first rep to last.',
            ],
        },
        values: [
            { icon: '⛰️', title: 'Performance Built', desc: 'Technical fabrics that stretch, breathe, and move exactly as you do.' },
            { icon: '💧', title: 'Moisture Control', desc: 'Engineered to keep you dry, cool, and comfortable through any workout.' },
            { icon: '🎯', title: 'Function Meets Form', desc: 'Active wear that looks as sharp off the trail as it performs on it.' },
        ],
        testimonials: [
            { quote: 'I ran a half marathon in Pure North leggings. Zero chafing, stayed in place the whole way. Incredible.', author: 'Arif B.', role: 'Marathon Runner' },
            { quote: 'The moisture control is real. I was dripping sweat but my shirt felt dry. Best gym purchase I have made.', author: 'Imran C.', role: 'Personal Trainer' },
            { quote: 'Hiking gear that actually keeps up. These joggers survived three treks. Still look brand new.', author: 'Rafi S.', role: 'Outdoor Enthusiast' },
        ],
    },

    mingle: {
        slug: 'mingle',
        name: 'Mingle',
        category: 'Ethnic Wear',
        logo: '/mingle logos/mingle.png',
        heroImage: '/images/about/banner.jpg',
        storyImage: '/images/about/sweat.jpg',
        logoBg: 'white',
        youtubeId: null, // Replace null with your YouTube video ID e.g. 'dQw4w9WgXcQ'
        tagline: 'Wear Your Roots.',
        subTagline: 'Ethnic wear that honours tradition and celebrates who you are.',
        // Mingle logo: near-black/charcoal wordmark with teal dot + teal square accent
        gradientFrom: '#f4f9f7',
        gradientVia: '#e6f5ef',
        gradientTo: '#d5eee5',
        accentColor: '#2EC4B6',
        accentColorLight: '#7ee8e0',
        textOnHero: '#2EC4B6',
        story: {
            heading: 'Fashion Rooted in Culture',
            paragraphs: [
                'Mingle was born from a celebration of heritage. As an ethnic wear brand rooted in the rich textile traditions of South Asia, Mingle was created to bring the beauty of cultural fashion into the modern wardrobe — without diluting what makes it extraordinary.',
                'From intricately patterned fabrics to hand-finished embroidery details, every Mingle piece carries the weight of a tradition and the lightness of contemporary design. We collaborate with skilled artisans who have spent generations perfecting their craft, ensuring that every garment tells a story worth wearing.',
                'Ethnic wear is not an occasion — it is an identity. Mingle exists to make that identity accessible, wearable, and deeply personal. Wherever you are in the world, Mingle brings a piece of home with you.',
            ],
        },
        values: [
            { icon: '🪡', title: 'Artisan Crafted', desc: 'Handcrafted details by skilled artisans honouring generations of tradition.' },
            { icon: '🌍', title: 'Cultural Heritage', desc: 'Designs rooted in the rich textile legacy of South Asian fashion.' },
            { icon: '✨', title: 'Modern Occasion', desc: 'Traditional aesthetics made wearable for the contemporary everyday.' },
        ],
        testimonials: [
            { quote: 'I wore a Mingle kurta to Eid and received more compliments than ever before. The embroidery is stunning.', author: 'Farhan N.', role: 'Business Owner' },
            { quote: 'Finally ethnic wear that feels modern and fits beautifully. Mingle nailed the balance between tradition and style.', author: 'Tasnim A.', role: 'Fashion Blogger' },
            { quote: 'The fabric quality is extraordinary and it holds colour beautifully after multiple washes. Worth every taka.', author: 'Shafiq R.', role: 'University Lecturer' },
        ],
    },
};

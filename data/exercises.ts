
import { Exercise, CognitiveDomain, DifficultyTier } from '../types';

export const exercises: Exercise[] = [
  {
    id: 'ex-001',
    title: 'Verbal Fluency Cascade',
    domain: CognitiveDomain.LINGUISTIC,
    tier: DifficultyTier.TIER_1,
    duration: 3,
    description: 'Enhance your verbal retrieval speed and vocabulary access through a guided association chain.',
    thumbnailVisualPrompt: 'A surreal explosion of colorful letters and glowing typography forming a fountain, digital art style, vibrant',
    benefits: ['Improved word recall', 'Faster verbal processing', 'Reduced tip-of-the-tongue states'],
    script: [
      {
        id: 's1',
        text: 'Welcome, aspiring intellectual! I am Cerebro. Relax your shoulders. We are about to lubricate your linguistic gears.',
        visualPrompt: 'Abstract representation of neural networks lighting up in blue and gold, digital art',
        isInteractive: false
      },
      {
        id: 's2',
        text: 'I will give you a category. I want you to name as many items in that category as you can, aloud, until I say stop. Do not worry about repeats initially.',
        isInteractive: false
      },
      {
        id: 's3',
        text: 'Category: "Things that are green found in nature." Go! Ferns, emeralds, moss... continue!',
        visualPrompt: 'Lush green forest floor with ferns, moss, and emerald gemstones hidden in the grass, macro photography style',
        isInteractive: true
      },
      {
        id: 's4',
        text: 'Splendid! Now, switch gears. Words starting with "L" that represent an action. Lift, Laugh, Leap! Your turn.',
        visualPrompt: 'Dynamic typography of action verbs starting with L floating in a kinetic energy field',
        isInteractive: true
      },
      {
        id: 's5',
        text: 'Marvelous work. Feel that frontal lobe humming? That is the sound of cognitive brilliance.',
        isInteractive: false
      }
    ]
  },
  {
    id: 'ex-002',
    title: 'Spatial Rotation Matrix',
    domain: CognitiveDomain.SPATIAL,
    tier: DifficultyTier.TIER_2,
    duration: 5,
    description: 'Manipulate mental objects to improve spatial reasoning and navigational skills.',
    thumbnailVisualPrompt: 'A glowing isometric 3D maze floating in deep space, cyan and neon purple, synthwave aesthetic',
    benefits: ['Better parking skills', 'Map reading efficiency', 'Object visualization'],
    script: [
      {
        id: 's1',
        text: 'Cerebro here. Let us twist the fabric of space—in your mind, of course. Focus on the screen.',
        visualPrompt: '3D geometric shapes floating in a void, glowing wireframe, blueprints background',
        isInteractive: false
      },
      {
        id: 's2',
        text: 'Visualize a capital letter "P". Now, rotate it 90 degrees clockwise. It should look like a flag on a pole lying down.',
        visualPrompt: 'A glowing neon letter P rotating 90 degrees clockwise in 3D space',
        isInteractive: true
      },
      {
        id: 's3',
        text: 'Now, flip that image horizontally. What do you see? Hold that shape. Don\'t let it dissolve!',
        visualPrompt: 'A mirror reflection of a rotated letter P, abstract spatial puzzle concept',
        isInteractive: true
      },
      {
        id: 's4',
        text: 'Release. You are strengthening your parietal lobes. Navigation will be child\'s play for you now.',
        isInteractive: false
      }
    ]
  },
  {
    id: 'ex-tier4-01',
    title: 'Alien Logic Lab',
    domain: CognitiveDomain.LOGICAL,
    tier: DifficultyTier.TIER_4,
    duration: 60,
    description: 'Disengage anthropocentrism. Simulate a non-human mind with axiomatic consistency.',
    thumbnailVisualPrompt: 'A futuristic containment cell holding a glowing purple alien brain, sci-fi laboratory, high detail',
    publicationPrize: 'Publication in "Xenopsychology Monthly"',
    benefits: ['Expands Theory of Mind', 'Creates consistent alien logic', 'Increases flexibility in mental models'],
    script: [
      {
        id: 'al-1',
        text: 'Welcome to the deep end! I am Cerebro, and today we abandon humanity. Metaphorically. We will build a mind that thinks sideways.',
        visualPrompt: 'A futuristic laboratory with a hologram of a non-human brain, glowing purple and weird',
        isInteractive: false
      },
      {
        id: 'al-2',
        text: 'Choose an entity: A fungal network, a silicon hive-mind, or a sentient storm. Visualize it.',
        visualPrompt: 'A glowing fungal network intelligence connecting trees in a dark forest, bioluminescent veins, sci-fi style',
        isInteractive: true
      },
      {
        id: 'al-3',
        text: 'Define its Truths. For a fungus, perhaps "Entropy is Love" and "Symmetry is Death". What does your entity believe?',
        visualPrompt: 'Abstract representation of entropy vs symmetry, chaotic fractals clashing with perfect grids',
        isInteractive: true
      },
      {
        id: 'al-4',
        text: 'Now, the Logic. Write a rule: "If a pattern repeats twice, terminate it." Strict, alien code. Create one now.',
        visualPrompt: 'Alien hieroglyphs or code cascading down a screen, matrix style but organic',
        isInteractive: true
      },
      {
        id: 'al-5',
        text: 'The Test: Your entity faces a dilemma. Humans offer it order. It must reject order to survive. Write the reaction.',
        visualPrompt: 'A human hand offering a geometric crystal to a swirling mass of chaotic shadow matter',
        isInteractive: true
      },
      {
        id: 'al-6',
        text: 'Brilliant! You have successfully simulated non-human consciousness. Do come back to Earth now.',
        isInteractive: false
      }
    ]
  },
  {
    id: 'ex-tier4-02',
    title: 'The Linguistic Relativity Swap',
    domain: CognitiveDomain.LINGUISTIC,
    tier: DifficultyTier.TIER_4,
    duration: 90,
    description: 'Challenge reality through vocabulary. Remove core concepts to force new cognitive pathways.',
    thumbnailVisualPrompt: 'A dictionary melting into liquid gold, surreal art, salvador dali style',
    publicationPrize: 'Feature in "Cognitive Linguistics Review"',
    benefits: ['Deepens cultural immersion', 'Enhances character voice', 'Challenges narrative biases'],
    script: [
      {
        id: 'lr-1',
        text: 'Cerebro at your service! Let us perform surgery on language itself. We are going to delete a concept from your brain.',
        visualPrompt: 'A dictionary with words dissolving into smoke, surreal library background',
        isInteractive: false
      },
      {
        id: 'lr-2',
        text: 'Pick a concept: "Ownership". Now, imagine a culture that lacks this word entirely. It is un-thinkable.',
        visualPrompt: 'A futuristic utopian society where objects float freely between people, no fences or locks',
        isInteractive: true
      },
      {
        id: 'lr-3',
        text: 'Instead, they have 20 words for "Temporary Stewardship" or "Shared Utility". Invent one now. Sound it out!',
        visualPrompt: 'Close up of an alien mouth speaking complex sound waves, visual representation of sound',
        isInteractive: true
      },
      {
        id: 'lr-4',
        text: 'Conflict time! Two characters must dispute a theft, but they cannot use the word "Steal". How do they argue? Proceed.',
        visualPrompt: 'Two sci-fi characters arguing over a glowing artifact, intense facial expressions, cinematic lighting',
        isInteractive: true
      },
      {
        id: 'lr-5',
        text: 'Fascinating! If you cannot say "Mine", can you truly be greedy? You are rewiring your moral cognition!',
        visualPrompt: 'A brain glowing with new colorful connections, rewiring synapses concept art',
        isInteractive: true
      }
    ]
  },
  {
    id: 'ex-tier4-03',
    title: 'The False Narrative Anchor',
    domain: CognitiveDomain.EXISTENTIAL,
    tier: DifficultyTier.TIER_4,
    duration: 120,
    description: 'Meta-cognitive horror. Destabilize the reader\'s reality by layering conflicting truths.',
    thumbnailVisualPrompt: 'A shattered mirror reflecting different realities in each shard, dark and mysterious',
    benefits: ['High-level plot twisting', 'Complexity in narrative structure', 'Advanced reader engagement'],
    script: [
      {
        id: 'fa-1',
        text: 'Prepare yourself. I am Cerebro, and we are entering the hall of mirrors. We will construct a lie, then break it.',
        visualPrompt: 'A hall of mirrors in a dark carnival, infinite reflections, eerie atmosphere',
        isInteractive: false
      },
      {
        id: 'fa-2',
        text: 'Establish a cliché. A haunted house. A monster in the woods. Make it convincing. Ground us.',
        visualPrompt: 'A classic spooky Victorian haunted house on a hill, lightning striking, gothic style',
        isInteractive: true
      },
      {
        id: 'fa-3',
        text: 'Twist One: The ghost is a hologram. The house is a projection. Shatter the supernatural with the technological.',
        visualPrompt: 'The haunted house glitching like a bad video file, revealing wireframes underneath',
        isInteractive: true
      },
      {
        id: 'fa-4',
        text: 'Twist Two: The technology is ALSO a lie. The protagonist is a brain in a jar imagining the hologram. Pull the rug again!',
        visualPrompt: 'A human brain in a glass jar connected to wires, seeing a dream of a house, sci-fi horror',
        isInteractive: true
      },
      {
        id: 'fa-5',
        text: 'The challenge: Write the transition. Keep the reader anchored while the world dissolves twice. Good luck.',
        visualPrompt: 'A writer\'s hand dissolving into ink, reality warping around a notebook',
        isInteractive: true
      }
    ]
  }
];
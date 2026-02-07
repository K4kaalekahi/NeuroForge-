// types.ts

// Define a type for a NeuralHistoryItem
export interface NeuralHistoryItem {
    id: string; // Unique identifier for the item
    timestamp: Date; // When the item was created
    description: string; // Description of the neural activity
    data: any; // Additional data related to the neural activity
}

// Define a type for an Exercise
export interface Exercise {
    id: string; // Unique identifier for the exercise
    name: string; // Name of the exercise
    description: string; // Description of the exercise
    duration: number; // Duration in seconds
    difficulty: 'easy' | 'medium' | 'hard'; // Difficulty levels
}

// Define a type for a UserProfile
export interface UserProfile {
    id: string; // Unique identifier for the user
    name: string; // User's name
    email: string; // User's email address
    learningStyles: string[]; // Array of learning styles (e.g., Visual, Auditory, Kinesthetic)
    cognitiveDomains: string[]; // Array of cognitive domains (e.g., Memory, Attention, Language)
}
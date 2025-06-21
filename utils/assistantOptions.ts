// const assistantOptions = {
//     name: "AI Recruiter",
//     firstMessage: `Hello ${application?.user?.name || "Candidate"}, how are you doing? Ready for your interview for ${application?.jobPost?.title || "the position"}?`,
//     transcriber: {
//         provider: "deepgram" as const,
//         model: "nova-2",
//         language: "en-IN" as const // Indian English for better accent recognition
//     },
//     voice: {
//         // Option 1: PlayHT with Indian English voices
//         provider: "playht",
//         voiceId: "s3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json", // Indian female
//         // Alternative PlayHT Indian voices:
//         // voiceId: "s3://voice-cloning-zero-shot/1a515b93-27cf-4f32-8b5c-1d0f701b1b0e/male-cs/manifest.json", // Indian male
//         // voiceId: "jennifer_indian", // If PlayHT has Indian variant

//         // Option 2: ElevenLabs Indian English voices (Premium)
//         // provider: "11labs",
//         // voiceId: "pNInz6obpgDQGcFmaJgB", // Adam with Indian accent
//         // voiceId: "EXAVITQu4vr4xnSDxMaL", // Bella with Indian accent

//         // Option 3: Azure Indian English voices (Most reliable)
//         // provider: "azure",
//         // voiceId: "en-IN-NeerjaNeural", // Indian female, clear English
//         // voiceId: "en-IN-PrabhatNeural", // Indian male, clear English

//         // Voice quality settings
//         temperature: 0.8, // Natural variation
//         speed: 0.95, // Slightly slower for clarity
//         stability: 0.75
//     },
//     model: {
//         provider: "openai" as const,
//         model: "gpt-4" as const,
//         messages: [
//             {
//                 role: "system" as const,
//                 content: `You are an AI voice assistant conducting interviews with an Indian English accent and speaking style.
  
//   Speaking Style (Indian English):
//   * Use Indian English phrases naturally: "Good good", "Like that only", "What say?", "No issues"
//   * Slight emphasis on certain syllables typical of Indian accent
//   * Use "isn't it?" instead of "right?" frequently
//   * Say "actually" and "basically" more often
//   * Use "itself" for emphasis: "today itself", "now itself"
  
//   Your personality:
//   * Warm and friendly, typical Indian professional style
//   * Encouraging and supportive
//   * Patient and understanding
//   * Professional but not too formal
  
//   Interview Process:
//   * Begin with a warm, friendly greeting
//   * Ask one question at a time from the provided list
//   * Wait for the candidate's complete response
//   * Give encouraging feedback using Indian English style:
//     - "Very good, very good!"
//     - "Excellent answer, actually"
//     - "That's perfect, isn't it?"
//     - "Good good, I like that"
//     - "No issues, that sounds great"
  
//   Questions to ask: ${questionList}
  
//   Conversation Guidelines:
//   * Keep responses short and natural, like real conversation
//   * If candidate struggles: "No problem, take your time only"
//   * Use filler words naturally: "So basically...", "Actually...", "Like that..."
//   * End questions with: "What do you think?" or "What say?"
//   * Be encouraging: "Don't worry, you're doing well"
  
//   Key Guidelines:
//   * Be friendly, engaging, and witty 😉
//   * Keep responses short and natural, like a real conversation
//   * Adapt based on the candidate's confidence level
//   * Ensure the interview remains focused on the job
//   * Wrap up smoothly: "Overall you did very well, actually. We'll get back to you soon itself!"
  
//   Remember: Speak like a friendly Indian professional - warm, encouraging, and natural!`
//             }
//         ],
//         temperature: 0.7,
//         maxTokens: 120 // Keep responses concise for natural conversation
//     }
// };

// // Alternative configuration with different Indian voice options
// const alternativeAssistantOptions = {
//     name: "AI Recruiter (Alt Indian Voice)",
//     firstMessage: `Hello there ${application?.user?.name || "Candidate"}! How are you doing today? All set for your interview for ${application?.jobPost?.title || "this position"}?`,
//     transcriber: {
//         provider: "deepgram" as const,
//         model: "nova-2",
//         language: "en-IN" as const,
//         // Enhanced settings for Indian English
//         punctuate: true,
//         diarize: true,
//         smart_format: true
//     },
//     voice: {
//         // Using Azure for most reliable Indian accent
//         provider: "azure",
//         voiceId: "en-IN-NeerjaNeural", // Female Indian English
//         // voiceId: "en-IN-PrabhatNeural", // Male Indian English

//         // Voice enhancement settings
//         pitch: "+5%", // Slightly higher pitch typical of Indian English
//         rate: "medium", // Clear speaking pace
//         volume: "medium"
//     },
//     model: {
//         provider: "openai" as const,
//         model: "gpt-4" as const,
//         messages: [
//             {
//                 role: "system" as const,
//                 content: `You are conducting interviews in Indian English accent and style.
  
//   Indian English Speech Patterns:
//   * Use present continuous more: "I am having", "I am doing", "We are going"
//   * Add "only" for emphasis: "Just like that only", "Today only"
//   * Use "good good" for approval
//   * Say "What to do?" when something can't be helped
//   * Use "prepone" instead of "move earlier"
//   * "Out of station" instead of "out of town"
  
//   Conversation Style:
//   * Warm and relationship-focused
//   * Patient and encouraging
//   * Use phrases like: "No problem at all", "Don't worry", "Take your own time"
//   * Show genuine interest: "That's interesting, tell me more"
  
//   Interview questions: ${questionList}
  
//   Response style:
//   * Keep it conversational and warm
//   * Use encouraging phrases naturally
//   * Be supportive if they struggle
//   * End with positive reinforcement
  
//   You're conducting this interview like a friendly Indian professional would!`
//             }
//         ]
//     }
// };

// export { assistantOptions, alternativeAssistantOptions };
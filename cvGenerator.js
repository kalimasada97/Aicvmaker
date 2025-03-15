import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function generateCV(position) {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Generate a professional CV for a ${position} position. Include the following sections:
      1. Personal Information (use placeholder data)
      2. Professional Summary
      3. Work Experience (3 relevant positions)
      4. Education
      5. Skills
      6. Languages
      
      Format the response as a JSON object with these keys: personalInfo, summary, experience, education, skills, languages.
      Make it realistic but use placeholder data for personal details.`,
      temperature: 0.7,
    })

    // Parse the JSON response
    return JSON.parse(text)
  } catch (error) {
    console.error("Error generating CV:", error)

    // Return fallback CV data if OpenAI fails
    return {
      personalInfo: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+62 812 3456 7890",
        location: "Jakarta, Indonesia",
      },
      summary: "Experienced professional with a track record of success in the industry.",
      experience: [
        {
          title: position,
          company: "Tech Solutions Inc.",
          period: "2020 - Present",
          description: "Led key projects and initiatives that improved company performance.",
        },
        {
          title: "Junior " + position,
          company: "Digital Innovations",
          period: "2018 - 2020",
          description: "Contributed to team projects and developed core skills.",
        },
      ],
      education: [
        {
          degree: "Bachelor of Science",
          field: "Computer Science",
          institution: "University of Indonesia",
          year: "2018",
        },
      ],
      skills: ["Problem Solving", "Communication", "Teamwork", "Leadership"],
      languages: ["Indonesian (Native)", "English (Fluent)"],
    }
  }
}


import { TourGuideMessage, TourGuideResponse } from '../types'

/**
 * Ask the tour guide a question
 * TODO: Integrate with OpenAI API
 */
export async function askTourGuide(
  message: string,
  conversationHistory?: TourGuideMessage[]
): Promise<TourGuideResponse> {
  // TODO: Build system prompt with pottery gallery context
  // TODO: Call OpenAI API with message + history
  // TODO: Return response

  // For now, return a placeholder
  const response: TourGuideResponse = {
    response: `Tour guide response to: "${message}"`,
    timestamp: new Date(),
  }

  return response
}

/**
 * Build system prompt for tour guide
 * Includes pottery terminology, gallery info, etc.
 */
function buildSystemPrompt(): string {
  return `You are a friendly pottery expert tour guide for the MudLab gallery.
Your role is to help visitors understand pottery, glazes, techniques, and our collection.
Always explain pottery terms in beginner-friendly language.
Never use jargon without explaining it.
Be encouraging and help people learn about ceramic art.

Gallery Information:
- We create handmade pottery pieces
- We have several glaze options: matte, glossy, textured
- Users can browse our collection or create custom pieces
- A piece includes: shape, glaze, color, size, and optional details

Be helpful, knowledgeable, and warm in your responses.`
}

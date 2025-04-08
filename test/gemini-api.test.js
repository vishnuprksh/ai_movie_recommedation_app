require('dotenv').config();
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const fs = require("node:fs");
const mime = require("mime-types");

// Check if API key is available
if (!process.env.GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY environment variable is not set");
  process.exit(1);
}

async function testGeminiAPI() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.0-flash",
    });

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    };

    const tools = [{
      google_search: {},
    }];

    console.log("Sending test prompt to Gemini API with search grounding...");
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: "Time now in India?" }],
      }],
      tools,
      generationConfig,
    });

    // Handle response candidates and grounding metadata
    const candidates = result.response.candidates;
    for(let candidate of candidates) {
      if(candidate.groundingMetadata) {
        console.log("\nGrounding Metadata:");
        console.log("==================");
        console.log(JSON.stringify(candidate.groundingMetadata, null, 2));
      }
      for(let part_index = 0; part_index < candidate.content.parts.length; part_index++) {
        const part = candidate.content.parts[part_index];
        if(part.inlineData) {
          try {
            const filename = `output_${candidate_index}_${part_index}.${mime.extension(part.inlineData.mimeType)}`;
            fs.writeFileSync(filename, Buffer.from(part.inlineData.data, 'base64'));
            console.log(`Output written to: ${filename}`);
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
    
    console.log("\nAPI Response:");
    console.log("=============");
    console.log(result.response.text());
    
    console.log("\nTest completed successfully!");
    return true;
  } catch (error) {
    console.error("Error testing Gemini API:", error);
    return false;
  }
}

// Run the test
testGeminiAPI()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });

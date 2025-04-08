import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

def test_gemini_api():
    try:
        # Initialize the API client
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
            
        client = genai.Client(api_key=api_key)

        # Configure the model and content
        model = "gemini-2.0-flash"
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text="What are the latest technology news headlines?"),
                ],
            ),
        ]

        # Set up tools including Google Search
        tools = [
            types.Tool(google_search=types.GoogleSearch())
        ]
        
        # Configure generation parameters
        generate_content_config = types.GenerateContentConfig(
            tools=tools,
            response_mime_type="text/plain",
        )

        print("Sending test prompt to Gemini API...")
        print("\nAPI Response:")
        print("=============")

        # Stream the response
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            print(chunk.text, end="")

        print("\n\nTest completed successfully!")
        return True

    except Exception as e:
        print(f"Error testing Gemini API: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_gemini_api()
    if not success:
        exit(1)

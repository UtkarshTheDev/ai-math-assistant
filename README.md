# Math Assistant CLI

A friendly command-line calculator powered by Google's Gemini AI that understands natural language and provides step-by-step explanations of calculations.

## Features

- 🧮 Natural language math calculations
- 💬 Friendly, conversational responses
- 📝 Step-by-step explanations
- ⚡ Fast and efficient processing
- 🔄 Interactive CLI interface
- 🎯 Precise numerical results

## Prerequisites

Before you begin, ensure you have installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Bun](https://bun.sh/) (v1.0 or higher)
- A Google Gemini API key ([Get it here](https://makersuite.google.com/app/apikey))

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Developer-Utkarsh/ai-math-assistant.git
cd ai-math-assistant
```

2. Install dependencies:

```bash
bun install
```

3. Create a `.env` file in the root directory:

```bash
GOOGLE_API_KEY=your_gemini_api_key_here
```

## Usage

1. Start the application:

```bash
bun run index.ts
```

2. The manual will be displayed showing available commands and examples.

3. Enter mathematical queries in natural language:

```
> add 25 and 35, then multiply by 2
> what is 13 plus 14 times 5
> multiply 6 by 8 and add 10
```

### Special Commands

- `help` - Display the user manual
- `clear` - Clear the screen
- `exit` - Exit the program
- `Ctrl+C` - Force exit the program

### Example Interactions

```
> add 25 and 35, then multiply by 2
First, I added 25 and 35 to get 60. Then, I multiplied 60 by 2.
Final result: 120

> what is 13 plus 14 times 5
First, I added 13 and 14 to get 27. Then, I multiplied 27 by 5.
Final result: 135
```

## Technical Details

### Architecture

The application uses:

- LangChain.js for AI agent orchestration
- Google's Gemini Pro model for natural language understanding
- Custom tools for mathematical operations
- State Graph for managing conversation flow

### Tools Available

1. `addTool`: Performs addition of two numbers
2. `multiplyTool`: Performs multiplication of two numbers
3. `divideTool`: Performs Division of two numbers

### Response Format

Each response includes:

- Step-by-step explanation of the calculation
- Clear final numerical result
- Friendly, conversational tone

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Gemini AI for natural language processing
- LangChain.js for agent framework
- Bun for TypeScript runtime

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Developer-Utkarsh/ai-maths-assistant/issues) page
2. Create a new issue with detailed description

## Security

The application uses environment variables for API key management. Never commit your `.env` file or share your API keys.

## Best Practices

1. Always use clear, natural language for queries
2. One calculation per query for best results
3. Use 'help' command when unsure
4. Check error messages for troubleshooting

## Troubleshooting

Common issues and solutions:

1. **Slow responses:**

   - Check your internet connection
   - Verify API key status

2. **Invalid API Key:**

   - Ensure `.env` file is properly configured
   - Verify API key is valid and active

3. **Calculation Errors:**
   - Try rephrasing your question
   - Break complex calculations into steps

## Stay Connected

- Follow on [Twitter](https://x.com/UtkarshTheDev/)
- Star the repository for updates
- Join our community discussions

---

Made with ❤️ by Utkarsh Tiwari

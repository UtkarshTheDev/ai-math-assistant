import { tool } from "@langchain/core/tools";
import { z } from 'zod';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from 'dotenv';
import {
  SystemMessage,
  ToolMessage,
  HumanMessage,
  AIMessage,
  BaseMessage
} from "@langchain/core/messages";
import { createInterface } from 'readline';
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";

// Load environment variables
dotenv.config();

// Initialize Google Gemini
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
if (!GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY environment variable not set");
}

const llm = new ChatGoogleGenerativeAI({
  modelName: "gemini-2.5-pro",
  apiKey: GOOGLE_API_KEY,
  maxOutputTokens: 1024,
  timeout: 10000,
});

// Define tools with simpler descriptions
const addTool = tool(
  async ({ a, b }: { a: number; b: number }) => `${a + b}`,
  {
    name: "addTool",
    description: "Add two numbers",
    schema: z.object({
      a: z.number().describe("first"),
      b: z.number().describe("second"),
    }),
  }
);

const multiplyTool = tool(
  async ({ a, b }: { a: number; b: number }) => `${a * b}`,
  {
    name: "multiplyTool",
    description: "Multiply two numbers",
    schema: z.object({
      a: z.number().describe("first"),
      b: z.number().describe("second"),
    }),
  }
);

const tools = [addTool, multiplyTool];
const toolsByName = Object.fromEntries(tools.map((tool) => [tool.name, tool]));
const llmWithTools = llm.bindTools(tools);

type AgentState = {
  messages: BaseMessage[];
};

async function llmCall(state: AgentState) {
  try {
    const result = await Promise.race([
      llmWithTools.invoke([
        new SystemMessage("You are a friendly and helpful math assistant. After performing calculations, explain the steps clearly and provide the final result in a conversational way. Be concise but friendly."),
        ...state.messages
      ]),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("LLM call timed out")), 15000)
      )
    ]);
    return { messages: [result] };
  } catch (error) {
    console.error("LLM call failed:", error);
    return { 
      messages: [new AIMessage({ content: "I apologize, but I ran into a small issue with the calculation. Could you please try again?" })]
    };
  }
}

async function toolNode(state: AgentState) {
  const results: ToolMessage[] = [];
  const lastMessage = state.messages.at(-1);

  if (lastMessage?.tool_calls?.length) {
    for (const toolCall of lastMessage.tool_calls) {
      const tool = toolsByName[toolCall.name];
      if (!tool) continue;
      
      try {
        const observation = await tool.invoke(toolCall.args);
        results.push(new ToolMessage({
          content: observation,
          tool_call_id: toolCall.id,
        }));
      } catch (error) {
        console.error(`Tool error:`, error);
        results.push(new ToolMessage({
          content: "I encountered an error in the calculation. Let me try a different approach.",
          tool_call_id: toolCall.id,
        }));
      }
    }
  }

  return { messages: results };
}

function shouldContinue(state: AgentState) {
  const lastMessage = state.messages.at(-1);
  return lastMessage?.tool_calls?.length ? "Action" : "__end__";
}

const agentBuilder = new StateGraph(MessagesAnnotation)
  .addNode("llmCall", llmCall)
  .addNode("tools", toolNode)
  .addEdge("__start__", "llmCall")
  .addConditionalEdges(
    "llmCall",
    shouldContinue,
    {
      "Action": "tools",
      "__end__": "__end__",
    }
  )
  .addEdge("tools", "llmCall")
  .compile();

async function showManual() {
  console.log("\n=== Math Assistant Manual ===");
  console.log("Welcome to the friendly Math Assistant! Here's how to use it:");
  console.log("\n1. Basic Operations:");
  console.log("   - Addition: 'add 5 and 3' or 'what is 10 plus 20'");
  console.log("   - Multiplication: 'multiply 4 by 6' or 'what is 5 times 3'");
  console.log("   - Combined: 'add 10 and 20, then multiply by 3'");
  console.log("\n2. Special Commands:");
  console.log("   - 'help' - Show this manual");
  console.log("   - 'exit' - Exit the program");
  console.log("   - 'clear' - Clear the screen");
  console.log("\nExamples:");
  console.log("   > add 25 and 35, then multiply by 2");
  console.log("   > what is 13 plus 14 times 5");
  console.log("\nTip: Use natural language - the assistant understands plain English!");
  console.log("\n=========================\n");
}

async function startInteractiveCLI() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  // Show manual at start
  await showManual();

  async function askQuestion() {
    try {
      rl.question('\nEnter your math question (or type help/exit): ', async (input) => {
        input = input.trim().toLowerCase();
        
        if (input === 'exit') {
          console.log('\nThank you for using Math Assistant. Goodbye!');
          rl.close();
          process.exit(0);
          return;
        }

        if (input === 'help') {
          await showManual();
          askQuestion();
          return;
        }

        if (input === 'clear') {
          console.clear();
          askQuestion();
          return;
        }

        if (input === '') {
          console.log('Please enter a math question or type "help" for instructions.');
          askQuestion();
          return;
        }

        try {
          const messages = [new HumanMessage(input)];
          const result = await agentBuilder.invoke({ messages });
          
          const toolMessages = result.messages.filter(msg => msg instanceof ToolMessage);
          const aiMessages = result.messages.filter(msg => msg instanceof AIMessage);
          
          let finalResult = "";
          if (toolMessages.length > 0) {
            finalResult = toolMessages[toolMessages.length - 1].content;
          }
          
          let explanation = "";
          if (aiMessages.length > 0) {
            explanation = aiMessages[aiMessages.length - 1].content;
          }
          
          if (explanation && finalResult) {
            console.log('\n' + explanation);
            console.log(`\nFinal result: ${finalResult}`);
          } else {
            console.log("\nHere's what I calculated:", finalResult);
          }
        } catch (error) {
          console.error("\nI apologize, but I encountered an error:", error.message);
          console.log("Could you please try rephrasing your question?");
        }

        askQuestion();
      });
    } catch (error) {
      console.error("\nAn error occurred with the CLI interface. Restarting...");
      askQuestion();
    }
  }

  // Handle interrupts gracefully
  process.on('SIGINT', () => {
    console.log('\nThank you for using Math Assistant. Goodbye!');
    rl.close();
    process.exit(0);
  });

  askQuestion();
}

// Start the interactive CLI
startInteractiveCLI();

import { HandlerContext, ApiResponse } from "@xmtp/message-kit";

import { textGeneration } from "../lib/openai.js";
const chatHistories: Record<string, any[]> = {};

interface EnsData {
  address?: string;
  avatar?: string;
  avatar_small?: string;
  avatar_url?: string;
  contentHash?: string;
  description?: string;
  ens?: string;
  ens_primary?: string;
  github?: string;
  resolverAddress?: string;
  twitter?: string;
  url?: string;
  wallets?: {
    eth?: string;
  };
}

const BACKEND_URL = process.env.BACKEND_URL

interface LLMResponse {
  answer?: string;
  error?: string;
}

async function askLLM(question: string): Promise<string> {
  try {
    const response = await fetch(`${BACKEND_URL}/ask-llm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ question }),
    });

    if (!response.ok) {
      console.error(`Error: ${response.statusText}`);
      return `Error: ${response.statusText}`;
    }

    // Explicitly cast the response to the expected type
    const data = (await response.json()) as LLMResponse;

    if (data.answer) {
      console.log("Response from /ask-llm:", data.answer);
      return data.answer;
    } else if (data.error) {
      console.error("Error from /ask-llm:", data.error);
      return `Error: ${data.error}`;
    } else {
      console.error("Unexpected response format:", data);
      return "Error: Unexpected response format";
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error("Request failed:", err.message);
      return `Error: ${err.message}`;
    } else {
      console.error("Unknown error occurred:", err);
      return "Error: An unknown error occurred";
    }
  }
}

async function askLLMWithContext(question: string): Promise<string> {
  try {
    const response = await fetch(`${BACKEND_URL}/ask-llm-with-context`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ question }),
    });

    if (!response.ok) {
      console.error(`Error: ${response.statusText}`);
      return `Error: ${response.statusText}`;
    }

    // Explicitly cast the response to the expected type
    const data = (await response.json()) as LLMResponse;

    if (data.answer) {
      console.log("Response from /ask-llm-with-context:", data.answer);
      return data.answer;
    } else if (data.error) {
      console.error("Error from /ask-llm-with-context:", data.error);
      return `Error: ${data.error}`;
    } else {
      console.error("Unexpected response format:", data);
      return "Error: Unexpected response format";
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error("Request failed:", err.message);
      return `Error: ${err.message}`;
    } else {
      console.error("Unknown error occurred:", err);
      return "Error: An unknown error occurred";
    }
  }
}




export async function handleCommand(context: HandlerContext) {
  const {
    message: {
      content: { command },
    },
  } = context;
    
  switch (command) {
    case "ask":
      return handleAsk(context);

    case "register":
      return handleRegister(context);

    case "ens":  // New /ens command
      return handleEns(context);

    case "help":
      return handleHelp(context);

    case "info":
      return handleInfo(context);

    case "check":
      return handleCheck(context);

    case "start":
      return handleStart(context);

    case "bid":
      return handleBid(context);

    case "verify":
      return handleVerify(context);

    case "gm":
      return handleGm(context);

    case "collage":
      return handleCollage(context);

    case "friend":
      return handleFriend(context);

    case "tip":
      return handleTip(context);

    default:
      context.reply("Unknown command. Please use /help to see the list of available commands.");
  }
}

interface EnsResponse {
  execution_result?: string;
  error?: string;
}

// Helper function to call the backend /generate-ens API
async function generateENS(name: string, address: string): Promise<string> {
  try {
    const response = await fetch(`${BACKEND_URL}/generate-ens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ name, address }),
    });

    if (!response.ok) {
      console.error(`Error: ${response.statusText}`);
      return `Error: ${response.statusText}`;
    }

    const data = (await response.json()) as EnsResponse;

    if (data.execution_result) {
      console.log("Response from /generate-ens:", data.execution_result);
      return `ENS generation successful: ${data.execution_result}`;
    } else if (data.error) {
      console.error("Error from /generate-ens:", data.error);
      return `Error: ${data.error}`;
    } else {
      console.error("Unexpected response format:", data);
      return "Error: Unexpected response format";
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error("Request failed:", err.message);
      return `Error: ${err.message}`;
    } else {
      console.error("Unknown error occurred:", err);
      return "Error: An unknown error occurred";
    }
  }
}


// New handler for the /ens command
export async function handleEns(context: HandlerContext) {
  const {
    message: {
      content: { params },
    },
  } = context;

  const { name, token } = params;

  if (!name || !token) {
    context.reply("Missing required parameters. Please provide both name and token.");
    return;
  }

  const message = await generateENS(name, token);
  context.send(message);
}

export async function handleCheck(context: HandlerContext) {
  const {
    message: {
      content: { params },
    },
  } = context;
  const { domain } = params;

  if (!domain) {
    context.reply("Missing required parameters. Please provide domain.");
    return;
  }

  const response = await fetch(`https://ensdata.net/${domain}`);
  const data = await response.json();

  //@ts-ignore
  if (response.status == 404) {
    context.send(
      `Looks like ${domain} is available! Do you want to register it? https://ens.steer.fun/frames/manage?name=${domain}`
    );
  } else {
    context.send(
      `Looks like ${domain} is already registered! Let's try another one.`
    );
  }
}


export async function handleBid(context: HandlerContext) {
  const {
    message: {
      content: { params },
    },
  } = context;
  const { project, amount } = params;

  if (!project || !amount) {
    context.reply("Missing required parameters. Please provide project and amount.");
    return;
  }
  context.send(`Bid placed on project ${project} with amount ${amount}.`);
}

export async function handleVerify(context: HandlerContext) {
  const {
    message: {
      content: { params },
    },
  } = context;
  const { github_link } = params;

  if (!github_link) {
    context.reply("Missing required parameters. Please provide GitHub link.");
    return;
  }
  context.send(`Verifying project with GitHub link: ${github_link}`);
}

export async function benderAgent(context: HandlerContext) {
  console.log("benderAgent called with context:", context);

  if (!process?.env?.OPEN_AI_API_KEY) {
    console.log("No OPEN_AI_API_KEY found in .env");
    return;
  }

  const {
    message: {
      content: { content, params },
      sender,
    },
  } = context;

  console.log("Message content:", content);
  console.log("Message params:", params);
  console.log("Sender address:", sender.address);

  const systemPrompt = generateSystemPrompt(context);
  console.log("Generated system prompt:", systemPrompt);

  try {
    let userPrompt = params?.prompt ?? content;
    console.log("User prompt:", userPrompt);

    const { reply, history } = await textGeneration(
      userPrompt,
      systemPrompt,
      chatHistories[sender.address]
    );

    console.log("Reply from textGeneration:", reply);
    console.log("Updated chat history:", history);

    chatHistories[sender.address] = history; // Update chat history for the user

    const messages = reply
      .split("\n")
      .filter((message) => message.trim() !== "");

    for (const message of messages) {
      console.log("Processing message:", message);

      if (message.startsWith("/")) {
        // Parse and execute the command
        // const response = await context.intent(message);

        const response = await context.intent(message);
        console.log("Response :", response);

        await context.send((response as ApiResponse)?.message);


      } else {
        
        // Send the message as a text response
        await context.send(message);
      }
    }
  } catch (error) {
    console.error("Error during OpenAI call:", error);
    await context.send("An error occurred while processing your request.");
  }
}

function generateSystemPrompt(context: HandlerContext) {
  const systemPrompt = `
    You are a helpful assistant that converts user input into the appropriate command(s) from the list below.

    - Only provide answers by responding with the appropriate command(s) from the list below.
    - Do not provide additional explanations or messages outside of the commands.
    - Users can start a conversation by chatting 1:1.
    - You can respond with multiple messages if needed. Each message should be separated by a newline character.
    - You can execute commands by sending the command as a message.

    ## Commands
    - /help: Show the list of commands
    - /ask [question]: Ask info about a hackathon
    - /register [project_name]: Register a project for a hackathon
    - /friend: Find a friend
    - /gm: Get a good morning message

    ## Examples
    - User says: "Register my project named BenderBite"
      Assistant responds: "/register BenderBite"
    - User says: "I need a friend."
      Assistant responds:
      /friend
    - User says: "What's the schedule for the hackathon?"
      Assistant responds: "/ask What's the schedule for the hackathon?"
  `;
  return systemPrompt;
}



export async function handleHelp(context: HandlerContext) {
  const message = "Here is the list of commands:\n/register [project]: Register a project.\n/friend Find a friend.\n/ask [question]: ask questions about hackathon.\n/help: Show the list of commands";

  context.send(message);
  
  return { code: 200, message };

}

export async function handleStart(context: HandlerContext) {
  // Implement the logic for the /start command
  context.send("Welcome!");
}


export async function handleAsk(context: HandlerContext) {
  const {
    message: {
      content: { params },
    },
  } = context;
  const { question } = params;
  console.log(question);
  // Add logic to process the question
  const message = await askLLMWithContext(question);
  context.send(message);

}

export async function handleInfo(context: HandlerContext) {
  const {
    message: {
      content: { params },
    },
  } = context;
  const { domain } = params;
  const response = await fetch(`https://ensdata.net/${domain}`);
  const data: EnsData = (await response.json()) as EnsData;
  //@ts-ignore
  const formattedData = {
    Address: data?.address,
    "Avatar URL": data?.avatar_url,
    Description: data?.description,
    ENS: data?.ens,
    "Primary ENS": data?.ens_primary,
    GitHub: data?.github,
    "Resolver address": data?.resolverAddress,
    Twitter: data?.twitter,
    URL: `https://app.ens.domains/${domain}`,
  };

  let message = "Domain information:\n\n";
  for (const [key, value] of Object.entries(formattedData)) {
    if (value) {
      message += `${key}: ${value}\n`;
    }
  }

  context.send(message);
}


interface WalletResponse {
  wallet_id?: string;
  wallet_address?: string;
  ens_address?: string;
  error?: string;
}

export async function handleRegister(context: HandlerContext) {
  const {
    message: {
      content: { params },
    },
  } = context;

  const { project } = params; // Change to match the command configuration

  // Check if project is provided
  if (!project) {
    context.reply("Missing required parameters. Please provide a project name.");
    return;
  }

  console.log(project);

  try {
    // Call the backend to register the project and get the wallet info
    const response = await fetch(`${BACKEND_URL}/register-project`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ project }),
    });

    if (!response.ok) {
      console.error(`Error: ${response.statusText}`);
      context.reply(`Error: ${response.statusText}`);
      return;
    }

    const data = (await response.json()) as WalletResponse;

    if (data.wallet_id && data.wallet_address) {
      context.send(
        `Project "${project}" registered successfully!\n` +
        `Wallet ID: ${data.wallet_id}\n` +
        `Wallet Address: ${data.wallet_address}\n` +
        `Ens Address: ${data.ens_address}`
      );
    } else if (data.error) {
      console.error("Error from /register-project:", data.error);
      context.reply(`Error: ${data.error}`);
    } else {
      console.error("Unexpected response format:", data);
      context.reply("Error: Unexpected response format");
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error("Request failed:", err.message);
      context.reply(`Error: ${err.message}`);
    } else {
      console.error("Unknown error occurred:", err);
      context.reply("Error: An unknown error occurred");
    }
  }
}



export async function handleGm(context: HandlerContext) {
  // Implement the logic for sending a good morning picture
  context.send("Good morning! ☀️");
}

export async function handleCollage(context: HandlerContext) {
  // Implement the logic for generating a photo collage
  context.send("Generating a photo collage...");
}

// Define the Project interface
interface Project {
  name: string;
  wallet_id: string;
  wallet_address: string;
  ens_address: string;
}

export async function handleFriend(context: HandlerContext) {
  try {
    // Fetch random project from the backend
    const response = await fetch(`${BACKEND_URL}/random-project`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Error: ${response.statusText}`);
      context.reply(`Error: ${response.statusText}`);
      return;
    }

    // Parse the response and cast it to the Project interface
    const project = (await response.json()) as Project;

    if (project?.ens_address && project?.name) {
      // Send the message with the project details
      const message = `Meet ${project.ens_address} near the coffee station and discuss ${project.name} project. Have fun!`;
      context.send(message);
    } else {
      console.error("Unexpected response format:", project);
      context.reply("Error: Unexpected response format");
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error("Request failed:", err.message);
      context.reply(`Error: ${err.message}`);
    } else {
      console.error("Unknown error occurred:", err);
      context.reply("Error: An unknown error occurred");
    }
  }
}


export async function handleTip(context: HandlerContext) {
  const {
    message: {
      content: { params },
    },
  } = context;
  const { amount } = params;

  if (!amount) {
    context.reply("Missing required parameters. Please provide amount.");
    return;
  }
  context.send(`Tip of ${amount} sent.`);
}


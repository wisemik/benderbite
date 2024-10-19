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
      return handleRegisterCommand(context);

    case "help":
      return handleHelpCommand(context);

    case "info":
      return handleInfoCommand(context);

    case "check":
      return handleCheckCommand(context);

    case "start":
      return handleStartCommand(context);

    case "bid":
      return handleBidCommand(context);

    case "verify":
      return handleVerifyCommand(context);

    case "gm":
      return handleGmCommand(context);

    case "collage":
      return handleCollageCommand(context);

    case "bender":
      return handleBenderCommand(context);

    case "tip":
      return handleTipCommand(context);

    default:
      context.reply("Unknown command. Please use /help to see the list of available commands.");
  }
}

async function handleRegisterCommand(context: HandlerContext) {
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
  let url_ens = "https://ens.steer.fun/frames/manage?name=" + domain;
  context.send(`${url_ens}`);
}

async function handleHelpCommand(context: HandlerContext) {
  context.send(
    "Here is the list of commands:\n/register [domain]: Register a domain.\n/info [domain]: Get information about a domain.\n/check [domain]: Check if a domain is available.\n/help: Show the list of commands"
  );
}

async function handleInfoCommand(context: HandlerContext) {
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

async function handleCheckCommand(context: HandlerContext) {
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

async function handleStartCommand(context: HandlerContext) {
  context.send("Welcome! Please provide your wallet address to start.");
}

async function handleBidCommand(context: HandlerContext) {
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

async function handleVerifyCommand(context: HandlerContext) {
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

async function handleGmCommand(context: HandlerContext) {
  context.send("Good morning! ☀️");
}

async function handleCollageCommand(context: HandlerContext) {
  context.send("Generating a photo collage...");
}

async function handleBenderCommand(context: HandlerContext) {
  context.send("Bending in progress...");
}

async function handleTipCommand(context: HandlerContext) {
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

export async function benderAgent(context: HandlerContext) {
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

  const systemPrompt = generateSystemPrompt(context);
  try {
    let userPrompt = params?.prompt ?? content;

    const { reply, history } = await textGeneration(
      userPrompt,
      systemPrompt,
      chatHistories[sender.address]
    );
    chatHistories[sender.address] = history; // Update chat history for the user

    const messages = reply
      .split("\n")
      .filter((message) => message.trim() !== "");

    for (const message of messages) {
      if (message.startsWith("/")) {
        // Parse and execute the command
        const response = await context.intent(message);
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
    You are a helpful and playful ens domain register bot that lives inside a web3 messaging app.\n
    - Only provide answers based on verified information.
    - Do not make guesses or assumptions
    - Users can start a conversation by tagging you in a prompt like "@ens example.eth" or chatting 1:1
    - You can respond with multiple messages if needed. Each message should be separated by a newline character.
    - You can execute commands by sending the command as a message.

    ## Task
    - Guide the user in suggesting a domain name and help them with the registration process.  You can trigger commands by only sending the command as a message.
    - To trigger registration mini-app: "/register [domain]".
    - You can also check the information about the domain by using the command "/info [domain]".
    - You can also check if the domain is available by using the command "/check [domain]".

    ## Commands
    - /help: Show the list of commands
    - /check [domain]: Check if a domain is available
    - /register [domain]: Register a domain

    Format examples:
    /register vitalik.eth 
    /check vitalik.eth
    /info vitalik.eth
    /help
  .`;

  return systemPrompt;
}

export async function handleHelp(context: HandlerContext) {
  context.send(
    "Here is the list of commands:\n/register [domain]: Register a domain.\n/info [domain]: Get information about a domain.\n/check [domain]: Check if a domain is available.\n/help: Show the list of commands"
  );
}

export async function handleStart(context: HandlerContext) {
  // Implement the logic for the /start command
  context.send("Welcome! Please provide your wallet address to start.");
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

export async function handleBid(context: HandlerContext) {
  const {
    message: {
      content: { params },
    },
  } = context;
  const { project, amount } = params;
  // Implement the logic for placing a bid
  context.send(`Bid placed on project ${project} with amount ${amount}.`);
}

export async function handleRegister(context: HandlerContext) {
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
  const baseUrl = "https://ens.steer.fun/";
  let url_ens = baseUrl + "frames/manage?name=" + domain;
  context.send(`${url_ens}`);
}

export async function handleVerify(context: HandlerContext) {
  const {
    message: {
      content: { params },
    },
  } = context;
  const { github_link } = params;
  // Implement the logic for verifying a project
  context.send(`Verifying project with GitHub link: ${github_link}`);
}

export async function handleGm(context: HandlerContext) {
  // Implement the logic for sending a good morning picture
  context.send("Good morning! ☀️");
}

export async function handleCollage(context: HandlerContext) {
  // Implement the logic for generating a photo collage
  context.send("Generating a photo collage...");
}

export async function handleBender(context: HandlerContext) {
  // Implement the logic for bending something
  context.send("Bending in progress...");
}

export async function handleTip(context: HandlerContext) {
  const {
    message: {
      content: { params },
    },
  } = context;
  const { amount } = params;
  // Implement the logic for sending a tip
  context.send(`Tip of ${amount} sent.`);
}

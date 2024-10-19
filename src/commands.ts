import type { CommandGroup } from "@xmtp/message-kit";
import { handleCommand, handleAsk, handleInfo, 
  handleBid, handleRegister, handleVerify,
   handleGm, handleCollage, handleBender,
    handleTip, handleStart, handleCheck, handleEns
   } from "./handler/bender.js";

export const commands: CommandGroup[] = [
  {
    name: "Bender Bot",
    description: "Became a hackathon winne using this bot, and make bids!",
    triggers: [
      "/help",
      "/start",
      "/ask",
      "/register",
      "/check",
      "/info",
      "/verify",
      "/bid",
      "/gm",
      "/photo",
      "/bender",
      "/tip",
      "/ens"
    ],
    commands: [
      {
        command: "/help",
        handler: undefined,
        description: "Get help with the bot.",
        params: {},
      },
      {
        command: "/start",
        handler: handleStart, // Add appropriate handler
        description: "Start the bot and get the wallet address.",
        params: {},
      },
      {
        command: "/ask [question]",
        handler: handleAsk, // Add appropriate handler
        description: "Ask a question.",
        params: {
          question: {
            type: "string",
          },
        },
      },    
      {
        command: "/info [project]",
        handler: handleInfo,
        description: "Get information about a project.",
        params: {
          project: {
            type: "string",
          },
        },
      },
      {
        command: "/bid [project] [amount]",
        handler: handleBid, // Add appropriate handler
        description: "Place a bid.",
        params: {
          project: {
            type: "string",
          },
          amount: {
            type: "number",
          },
        },
      },
      {
        command: "/register [project]",
        handler: handleRegister,
        description: "Register a project.",
        params: {
          project: {
            type: "string",
          },
        },
      },               
      {
        command: "/verify [github_link]",
        handler: handleVerify, // Add appropriate handler
        description: "Verify a project with a github link.",
        params: {
          github_link: {
            type: "string",
          },
        },
      },    
      {
        command: "/gm",
        handler: handleGm, // Add appropriate handler
        description: "Send a good morning picture.",
        params: {},
      },
      {
        command: "/collage",
        handler: handleCollage, // Add appropriate handler
        description: "Geerate a photo collage.",
        params: {},
      },
      {
        command: "/bender",
        handler: handleBender, // Add appropriate handler
        description: "Bend something.",
        params: {},
      },
      {
        command: "/tip [amount]",
        handler: handleTip, // Add appropriate handler
        description: "Send a tip.",
        params: {
          amount: {
            type: "number",
          },
        },
      },
      {
        command: "/check",
        handler: handleCheck, // Add appropriate handler
        description: "Check the status of a project.",
        params: {
          project: {
            type: "string",
          },
        },
      },
      {
        command: "/ens [name] [token]", // Add new /ens command
        handler: handleEns, // Attach handleEns as the handler
        description: "Generate ENS with a given name and token.",
        params: {
          name: {
            type: "string",
          },
          token: {
            type: "string",
          },
        },
      },
    ],
  },
];

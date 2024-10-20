import { run, HandlerContext } from "@xmtp/message-kit";
import { handleCommand, benderAgent } from "./handler/bender.js";

run(async (context: HandlerContext) => {
  const {
    message: {
      typeId,
      content: { content: text, command, params },
    },
    group,
  } = context;
  if (group) return;
  if (typeId !== "text") return;
  if (text.startsWith("/")) {
    await handleCommand(context);
    // if (response) {
    //   await context.send(response);
    // }
    return;
  }
  await benderAgent(context);
});

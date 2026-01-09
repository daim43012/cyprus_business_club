import prisma from "$lib/prisma";

export async function createTransferMessage(
  senderId: string,
  receiverId: string,
  amount: number,
  currency: string
) {
  console.log("=== [Chat] Creating transfer message ===");

  try {
    // Find or create chat
    let chat = await prisma.chat.findFirst({
      where: {
        participants: {
          some: { userId: senderId }
        },
        AND: {
          participants: {
            some: { userId: receiverId }
          }
        }
      }
    });

    if (!chat) {
      console.log("[Chat] Not found, creating new chat");

      chat = await prisma.chat.create({
        data: {
          participants: {
            create: [
              { userId: senderId },
              { userId: receiverId }
            ]
          }
        }
      });
    }

    // Create message text
    const content = `Вы получили перевод ${amount} ${currency}`;

    const message = await prisma.message.create({
      data: {
        chatId: chat.id,
        senderId,
        type: "transfer",
        content
      }
    });

    console.log("[Chat] Message created:", message.id);
  } catch (err) {
    console.log("[Chat ERROR] Failed to create transfer message:", err);
  }
}

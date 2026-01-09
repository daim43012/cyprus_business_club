import prisma from "$lib/prisma";

export type CreateNotificationParams = {
  userId: string;
  emoji?: string;
  textKey: string;
  params?: Record<string, any>;
  status?: string;
  type?: string;
  link?: string;
};

export async function createNotification({
  userId,
  emoji,
  textKey,
  params,
  status,
  type,
  link,
}: CreateNotificationParams) {
  return await prisma.notification.create({
    data: {
      userId,
      emoji,
      textKey,
      params,
      status,
      type,
      link,
    },
  });
}

export async function getNotificationsByUserId(
  userId: string,
  onlyUnread = false
) {
  return await prisma.notification.findMany({
    where: {
      userId,
      ...(onlyUnread ? { isRead: false } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function countUnreadNotifications(userId: string) {
  return await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

export async function markNotificationAsRead(id: string) {
  return await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

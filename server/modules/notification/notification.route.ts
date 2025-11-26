import { protectedProcedure } from "@/server/api/trpc";
import { router } from "@/server/trpc";

import { NotificationController } from "./notification.controller";
import { NotificationValidation } from "./notification.validation";

export const notificationRouter = router({
  list: protectedProcedure
    .input(NotificationValidation.list)
    .query(({ ctx, input }) => NotificationController.list(ctx, input)),
  detail: protectedProcedure
    .input(NotificationValidation.detail)
    .query(({ ctx, input }) => NotificationController.detail(ctx, input)),
  unseenCount: protectedProcedure.query(({ ctx }) => NotificationController.unseenCount(ctx)),
});

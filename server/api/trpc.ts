import { initTRPC, TRPCError } from "@trpc/server";
import { parse } from "cookie";

import { prisma } from "@/server/db";
import {
  ActiveSession,
  SESSION_COOKIE_NAME,
  findSessionByToken,
  buildSessionRemovalCookie,
} from "@/server/auth/session";

type CreateContextOptions = {
  headers: Headers;
};

/**
 * Context factory for tRPC procedures.
 */
export const createTRPCContext = async (opts: CreateContextOptions) => {
  const responseHeaders = new Headers();
  const cookieHeader = opts.headers.get("cookie") ?? "";
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const token = cookies?.[SESSION_COOKIE_NAME] as string | undefined;

  let session: ActiveSession | null = null;

  if (token) {
    session = await findSessionByToken(token);
    if (!session) {
      responseHeaders.append("set-cookie", buildSessionRemovalCookie());
    }
  }

  return {
    headers: opts.headers,
    prisma,
    responseHeaders,
    session,
  } satisfies TRPCContext;
};

export type TRPCContext = {
  headers: Headers;
  prisma: typeof prisma;
  responseHeaders: Headers;
  session: ActiveSession | null;
};

const t = initTRPC.context<TRPCContext>().create();

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

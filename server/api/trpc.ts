import { initTRPC } from "@trpc/server";

/**
 * Context factory for tRPC procedures.
 * Extend this when wiring authentication/session data.
 */
export const createTRPCContext = (opts: { headers: Headers }) => ({
  headers: opts.headers,
});

export type TRPCContext = ReturnType<typeof createTRPCContext>;

const t = initTRPC.context<TRPCContext>().create();

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

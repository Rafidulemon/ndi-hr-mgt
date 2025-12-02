import type { TRPCContext } from "@/server/api/trpc";
import type {
  HrInvoiceCreateInput,
  HrInvoiceDashboardResponse,
  HrInvoiceListItem,
  InvoiceDetailResponse,
} from "@/types/invoice";

import { hrInvoiceService } from "./invoices.service";

export const hrInvoiceController = {
  dashboard: ({ ctx }: { ctx: TRPCContext }): Promise<HrInvoiceDashboardResponse> =>
    hrInvoiceService.dashboard({ ctx }),
  create: ({
    ctx,
    input,
  }: {
    ctx: TRPCContext;
    input: HrInvoiceCreateInput;
  }): Promise<HrInvoiceListItem> => hrInvoiceService.create({ ctx, input }),
  send: ({
    ctx,
    input,
  }: {
    ctx: TRPCContext;
    input: { invoiceId: string };
  }): Promise<HrInvoiceListItem> => hrInvoiceService.send({ ctx, input }),
  detail: ({
    ctx,
    input,
  }: {
    ctx: TRPCContext;
    input: { invoiceId: string };
  }): Promise<InvoiceDetailResponse> => hrInvoiceService.detail({ ctx, input }),
};

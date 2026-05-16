import { NextRequest, NextResponse } from "next/server";
import { getComputeBroker } from "@/lib/0g-compute";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { action, amount, provider: providerAddress, service } = await req.json();

  if (!action) {
    return NextResponse.json(
      {
        error:
          "action is required (create-ledger | deposit | transfer | get-balance)",
      },
      { status: 400 }
    );
  }

  try {
    const broker = await getComputeBroker();

    if (action === "create-ledger") {
      const depositAmount = Number(amount) || 0.5;
      await broker.ledger.addLedger(depositAmount);
      return NextResponse.json({
        success: true,
        action: "create-ledger",
        depositAmount,
        message: `Ledger created with ${depositAmount} A0GI`,
      });
    }

    if (action === "deposit") {
      const depositAmount = Number(amount) || 0.5;
      await broker.ledger.depositFund(depositAmount);
      return NextResponse.json({
        success: true,
        action: "deposit",
        amount: depositAmount,
        message: `Deposited ${depositAmount} A0GI to ledger`,
      });
    }

    if (action === "transfer") {
      if (!providerAddress) {
        return NextResponse.json(
          { error: "provider address is required for transfer" },
          { status: 400 }
        );
      }
      const amtFloat = Number(amount) || 0.1;
      const neuron = BigInt(Math.floor(amtFloat * 1e18));

      const serviceType = service === "fine-tuning" ? "fine-tuning" : "inference";
      await broker.ledger.transferFund(providerAddress, serviceType, neuron);
      return NextResponse.json({
        success: true,
        action: "transfer",
        provider: providerAddress,
        amount: amtFloat,
        service: serviceType,
        neuron: neuron.toString(),
        message: `Transferred ${amtFloat} A0GI to provider ${serviceType} sub-account`,
      });
    }

    if (action === "get-balance") {
      const ledger = await broker.ledger.getLedger();
      return NextResponse.json({
        success: true,
        action: "get-balance",
        ledger: JSON.parse(
          JSON.stringify(ledger, (_k, v) =>
            typeof v === "bigint" ? v.toString() : v
          )
        ),
      });
    }

    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

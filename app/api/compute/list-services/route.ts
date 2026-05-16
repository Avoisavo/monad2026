import { NextResponse } from "next/server";
import { getComputeBroker } from "@/lib/0g-compute";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST() {
  try {
    const broker = await getComputeBroker();
    const services = await broker.inference.listService(0, 50, true);

    const formatted = services.map((s) => ({
      provider: s.provider,
      model: s.model,
      serviceType: s.serviceType,
      url: s.url,
      inputPrice: s.inputPrice.toString(),
      outputPrice: s.outputPrice.toString(),
      verifiability: s.verifiability,
    }));

    return NextResponse.json({
      success: true,
      count: formatted.length,
      services: formatted,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

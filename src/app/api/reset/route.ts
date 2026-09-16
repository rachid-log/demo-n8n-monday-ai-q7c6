import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await execAsync("npx tsx prisma/seed.ts");
    return NextResponse.json({
      success: true,
      message: "Database successfully re-seeded to initial production state!",
    });
  } catch (error) {
    console.error("Failed to re-seed database:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset database state" },
      { status: 500 }
    );
  }
}

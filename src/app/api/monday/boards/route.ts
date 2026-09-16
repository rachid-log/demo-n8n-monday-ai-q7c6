import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const boards = await db.mondayBoard.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        items: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({ success: true, data: boards });
  } catch (error) {
    console.error("Failed to fetch Monday boards:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Monday boards" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { boardId, name, status = "Synced", priority = "Medium", columnValues = {} } = body;

    if (!boardId || !name) {
      return NextResponse.json(
        { success: false, error: "boardId and name are required" },
        { status: 400 }
      );
    }

    const item = await db.mondayItem.create({
      data: {
        boardId,
        name,
        status,
        priority,
        columnValues: JSON.stringify(columnValues),
        syncSource: "direct_api",
      },
    });

    await db.mondayBoard.update({
      where: { id: boardId },
      data: { lastSyncAt: new Date() },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("Failed to create Monday item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create item in Monday board" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId, status, priority, columnValues } = body;

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "itemId is required" },
        { status: 400 }
      );
    }

    const existing = await db.mondayItem.findUnique({
      where: { id: itemId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    let mergedValues = existing.columnValues;
    if (columnValues) {
      try {
        const parsed = JSON.parse(existing.columnValues);
        mergedValues = JSON.stringify({ ...parsed, ...columnValues });
      } catch {
        mergedValues = JSON.stringify(columnValues);
      }
    }

    const updated = await db.mondayItem.update({
      where: { id: itemId },
      data: {
        status: status !== undefined ? status : existing.status,
        priority: priority !== undefined ? priority : existing.priority,
        columnValues: mergedValues,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update Monday item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update item" },
      { status: 500 }
    );
  }
}

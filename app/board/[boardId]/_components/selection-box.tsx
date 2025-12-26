"use client";

import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { LayerType, Side, XYWH } from "@/types/canvas";
import { useSelf, useStorage } from "@liveblocks/react";
import { memo } from "react";

interface SelectionBoxProps {
  onResizeHandlePointerDown: (corner: Side, initialBounds: XYWH) => void;
}

const HANDLE_WIDTH = 8;

export const SelectionBox = memo(
  ({ onResizeHandlePointerDown }: SelectionBoxProps) => {
    const soleLayerId = useSelf((me) =>
      me.presence.selection.length === 1 ? me.presence.selection[0] : null
    );

    const isShowingHandles = useStorage(
      (root) =>
        soleLayerId && root.layers.get(soleLayerId)?.type != LayerType.Path
    );

    const bounds = useSelectionBounds();

    if (!bounds) {
      console.log("❌ SelectionBox skipped: no bounds");
      return null;
    }

    // 🔍 Debug logs ---------------------------
    console.log("🟦 Selection Bounds:", bounds);

    const TL = {
      x: bounds.x - HANDLE_WIDTH / 2,
      y: bounds.y - HANDLE_WIDTH / 2,
    };

    const TM = {
      x: bounds.x + bounds.width / 2 - HANDLE_WIDTH / 2,
      y: bounds.y - HANDLE_WIDTH / 2,
    };

    const TR = {
      x: bounds.x + bounds.width - HANDLE_WIDTH / 2,
      y: bounds.y - HANDLE_WIDTH / 2,
    };

    console.log("🔴 TL Handle:", TL);
    console.log("🟡 TM Handle:", TM);
    console.log("🟢 TR Handle:", TR);
    console.log("✅ Rendering SelectionBox");
    // -----------------------------------------

    return (
      <>
        {/* MAIN SELECTION BOX */}
        <rect
          className="fill-transparent stroke-blue-500 stroke-1 pointer-events-none"
          x={bounds.x}
          y={bounds.y}
          width={bounds.width}
          height={bounds.height}
        />

        {isShowingHandles && (
          <>
            {/* DEBUG */}
            {console.log("🎯 Rendering 8 handles")}

            {/* ========== CORNERS ========== */}

            {/* TOP LEFT (NW) */}
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={bounds.x - HANDLE_WIDTH / 2}
              y={bounds.y - HANDLE_WIDTH / 2}
              width={HANDLE_WIDTH}
              height={HANDLE_WIDTH}
              style={{ cursor: "nwse-resize" }}
              onPointerDown={(e) => {
                console.log("🟥 NW Handle PointerDown", bounds);
                e.stopPropagation();
              }}
            />

            {/* TOP RIGHT (NE) */}
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={bounds.x + bounds.width - HANDLE_WIDTH / 2}
              y={bounds.y - HANDLE_WIDTH / 2}
              width={HANDLE_WIDTH}
              height={HANDLE_WIDTH}
              style={{ cursor: "nesw-resize" }}
              onPointerDown={(e) => {
                console.log("🟩 NE Handle PointerDown", bounds);
                e.stopPropagation();
              }}
            />

            {/* BOTTOM RIGHT (SE) */}
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={bounds.x + bounds.width - HANDLE_WIDTH / 2}
              y={bounds.y + bounds.height - HANDLE_WIDTH / 2}
              width={HANDLE_WIDTH}
              height={HANDLE_WIDTH}
              style={{ cursor: "nwse-resize" }}
              onPointerDown={(e) => {
                console.log("🟦 SE Handle PointerDown", bounds);
                e.stopPropagation();
              }}
            />

            {/* BOTTOM LEFT (SW) */}
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={bounds.x - HANDLE_WIDTH / 2}
              y={bounds.y + bounds.height - HANDLE_WIDTH / 2}
              width={HANDLE_WIDTH}
              height={HANDLE_WIDTH}
              style={{ cursor: "nesw-resize" }}
              onPointerDown={(e) => {
                console.log("🟨 SW Handle PointerDown", bounds);
                e.stopPropagation();
              }}
            />

            {/* ========== EDGES ========== */}

            {/* TOP (N) */}
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={bounds.x + bounds.width / 2 - HANDLE_WIDTH / 2}
              y={bounds.y - HANDLE_WIDTH / 2}
              width={HANDLE_WIDTH}
              height={HANDLE_WIDTH}
              style={{ cursor: "ns-resize" }}
              onPointerDown={(e) => {
                console.log("🔵 N Handle PointerDown", bounds);
                e.stopPropagation();
              }}
            />

            {/* BOTTOM (S) */}
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={bounds.x + bounds.width / 2 - HANDLE_WIDTH / 2}
              y={bounds.y + bounds.height - HANDLE_WIDTH / 2}
              width={HANDLE_WIDTH}
              height={HANDLE_WIDTH}
              style={{ cursor: "ns-resize" }}
              onPointerDown={(e) => {
                console.log("🟣 S Handle PointerDown", bounds);
                e.stopPropagation();
              }}
            />

            {/* RIGHT (E) */}
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={bounds.x + bounds.width - HANDLE_WIDTH / 2}
              y={bounds.y + bounds.height / 2 - HANDLE_WIDTH / 2}
              width={HANDLE_WIDTH}
              height={HANDLE_WIDTH}
              style={{ cursor: "ew-resize" }}
              onPointerDown={(e) => {
                console.log("🟠 E Handle PointerDown", bounds);
                e.stopPropagation();
              }}
            />

            {/* LEFT (W) */}
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={bounds.x - HANDLE_WIDTH / 2}
              y={bounds.y + bounds.height / 2 - HANDLE_WIDTH / 2}
              width={HANDLE_WIDTH}
              height={HANDLE_WIDTH}
              style={{ cursor: "ew-resize" }}
              onPointerDown={(e) => {
                console.log("🟤 W Handle PointerDown", bounds);
                e.stopPropagation();
              }}
            />
          </>
        )}
      </>
    );
  }
);

SelectionBox.displayName = "SelectionBox";

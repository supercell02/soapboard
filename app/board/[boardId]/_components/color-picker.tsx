"use client";

import { colorToCss} from "@/lib/utils";
import { Color } from "@/types/canvas";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";

interface ColorPickerProps {
  onChange: (color: Color) => void;
}

export const ColorPicker = ({ onChange }: ColorPickerProps) => {
  return (
    <div className="flex flex-wrap gap-2 items-center max-w-41 pr-2 mr-2 border-r border-neutral-200">
      {/* Neutral / Muted */}
      <ColorButton color={{ r: 243, g: 82, b: 35 }} onClick={onChange} />
      <ColorButton color={{ r: 64, g: 64, b: 64 }} onClick={onChange} />
      <ColorButton color={{ r: 210, g: 180, b: 140 }} onClick={onChange} />

      {/* Pastel */}
      <ColorButton color={{ r: 255, g: 182, b: 193 }} onClick={onChange} />
      <ColorButton color={{ r: 176, g: 224, b: 230 }} onClick={onChange} />
      <ColorButton color={{ r: 193, g: 225, b: 193 }} onClick={onChange} />
      <ColorButton color={{ r: 221, g: 160, b: 221 }} onClick={onChange} />


      {/* Rainbow Picker */}
      <RainbowPickerButton onChange={onChange} />
    </div>
  );
};
interface ColorButtonProps {
  onClick: (color: Color) => void;
  color: Color;
}

const ColorButton = ({ onClick, color }: ColorButtonProps) => {
  return (
    <button
      className="w-8 h-8 items-center flex justify-center hover:opacity-75 transition relative"
      onClick={() => onClick(color)}
    >
      <div
        className="h-8 w-8 rounded-md border border-neutral-300"
        style={{ background: colorToCss(color) }}
      />
    </button>
  );
};
const RainbowPickerButton = ({ onChange }: { onChange: (c: Color) => void }) => {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState("#ff00ff");

  const handleChange = (hexColor: string) => {
    setHex(hexColor);
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    onChange({ r, g, b });
  };

  return (
    <div className="relative">
      {/* Rainbow Button */}
      <button
        className="w-8 h-8 rounded-md border border-neutral-300 hover:opacity-80 transition"
        style={{
          background:
            "linear-gradient(45deg, red, orange, yellow, green, cyan, blue, purple)",
        }}
        onClick={() => setOpen(!open)}
      />

      {/* Popover */}
      {open && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 p-2 rounded-xl bg-white border shadow-lg">
          <HexColorPicker color={hex} onChange={handleChange} />
        </div>
      )}
    </div>
  );
};

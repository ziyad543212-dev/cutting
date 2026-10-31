import assert from "node:assert/strict";
import test from "node:test";
import { solveGuillotineCutting } from "./guillotineSolver.js";

test("places every requested part and accounts for kerf and offcuts", () => {
  const result = solveGuillotineCutting({
    sheetLength: 100,
    sheetWidth: 60,
    kerf: 2,
    parts: [
      {
        id: "panel",
        label: "Panel",
        length: 40,
        width: 20,
        quantity: 3,
        allowRotation: true,
      },
    ],
  });

  assert.equal(result.pieceCount, 3);
  assert.equal(
    result.sheets.reduce((sum, sheet) => sum + sheet.parts.length, 0),
    3,
  );
  assert.ok(result.sheets.length >= 1);
  assert.ok(result.kerfWasteArea > 0);
  assert.ok(result.offcuts.length > 0);
  assert.ok(
    Math.abs(
      result.stockArea -
        result.usedArea -
        result.kerfWasteArea -
        result.usableOffcutArea -
        result.scrapArea,
    ) < 1e-7,
  );
});

test("classifies only offcuts with at least 300 by 200 dimensions as reusable", () => {
  const result = solveGuillotineCutting({
    sheetLength: 1000,
    sheetWidth: 500,
    kerf: 5,
    parts: [
      { id: "large", length: 600, width: 300, quantity: 1, allowRotation: false },
    ],
  });

  assert.ok(result.usableOffcuts.length > 0);
  assert.ok(result.scrapOffcuts.length > 0);
  assert.ok(
    result.usableOffcuts.every(
      (offcut) => Math.min(offcut.length, offcut.width) >= 200 &&
        Math.max(offcut.length, offcut.width) >= 300,
    ),
  );
  assert.equal(
    result.usableOffcutArea,
    result.usableOffcuts.reduce((area, offcut) => area + offcut.area, 0),
  );
  assert.equal(
    result.scrapArea,
    result.scrapOffcuts.reduce((area, offcut) => area + offcut.area, 0),
  );
  assert.equal(result.wasteArea, result.kerfWasteArea + result.scrapArea);
  assert.equal(result.wastePercentage, (100 * result.wasteArea) / result.stockArea);
  assert.ok(
    Math.abs(
      result.stockArea -
        result.usedArea -
        result.kerfWasteArea -
        result.usableOffcutArea -
        result.scrapArea,
    ) < 1e-7,
  );
});

test("chooses the split orientation that produces the largest reusable remnant", () => {
  const result = solveGuillotineCutting({
    sheetLength: 1000,
    sheetWidth: 500,
    kerf: 5,
    parts: [
      { id: "panel", length: 600, width: 300, quantity: 1, allowRotation: false },
    ],
  });

  assert.equal(result.sheets[0].cuts[0].axis, "length");
  assert.deepEqual(
    [result.largestOffcut.length, result.largestOffcut.width],
    [395, 500],
  );
});

test("all reported cuts span the full edge-to-edge parent section", () => {
  const result = solveGuillotineCutting({
    sheetLength: 120,
    sheetWidth: 80,
    kerf: 3,
    parts: [
      { id: "a", length: 55, width: 31, quantity: 2, allowRotation: true },
      { id: "b", length: 27, width: 18, quantity: 3, allowRotation: false },
    ],
  });

  for (const sheet of result.sheets) {
    for (const cut of sheet.cuts) {
      if (cut.axis === "length") {
        assert.equal(cut.y, cut.parent.y);
        assert.equal(cut.span, cut.parent.width);
        assert.ok(cut.x >= cut.parent.x);
        assert.ok(cut.x <= cut.parent.x + cut.parent.length);
      } else {
        assert.equal(cut.x, cut.parent.x);
        assert.equal(cut.span, cut.parent.length);
        assert.ok(cut.y >= cut.parent.y);
        assert.ok(cut.y <= cut.parent.y + cut.parent.width);
      }
    }
  }
});

test("deducts exactly one kerf between adjacent full-width parts", () => {
  const result = solveGuillotineCutting({
    sheetLength: 100,
    sheetWidth: 60,
    kerf: 2,
    parts: [
      { id: "strip", length: 49, width: 60, quantity: 2, allowRotation: false },
    ],
  });

  assert.equal(result.sheets.length, 1);
  assert.equal(result.sheets[0].parts.length, 2);
  assert.equal(result.sheets[0].cuts.length, 1);
  assert.equal(result.sheets[0].parts[1].x - result.sheets[0].parts[0].x, 51);
  assert.equal(result.kerfWasteArea, 120);
  assert.equal(result.offcuts.length, 0);
});

test("rotates a part when only the rotated orientation fits", () => {
  const result = solveGuillotineCutting({
    sheetLength: 50,
    sheetWidth: 80,
    kerf: 2,
    parts: [
      { id: "rotated", length: 70, width: 40, quantity: 1, allowRotation: true },
    ],
  });

  assert.equal(result.sheets.length, 1);
  assert.equal(result.sheets[0].parts[0].rotated, true);
  assert.equal(result.sheets[0].parts[0].length, 40);
  assert.equal(result.sheets[0].parts[0].width, 70);
});

test("automatically allocates enough master sheets for all requested parts", () => {
  const result = solveGuillotineCutting({
    sheetLength: 100,
    sheetWidth: 60,
    kerf: 2,
    parts: [
      { id: "large-panel", length: 60, width: 40, quantity: 5, allowRotation: false },
    ],
  });

  assert.equal(result.totalSheetsNeeded, result.sheets.length);
  assert.ok(result.totalSheetsNeeded > 1);
  assert.equal(
    result.sheets.reduce((total, sheet) => total + sheet.parts.length, 0),
    5,
  );
  assert.ok(result.sheets.every((sheet) => sheet.parts.length > 0));
});

test("supports fractional sheet, part, and kerf dimensions", () => {
  const result = solveGuillotineCutting({
    sheetLength: 100.5,
    sheetWidth: 60.25,
    kerf: 1.25,
    parts: [
      { id: "fractional", length: 49.625, width: 60.25, quantity: 2, allowRotation: false },
    ],
  });

  assert.equal(result.totalSheetsNeeded, 1);
  assert.equal(result.sheets[0].parts.length, 2);
  assert.equal(result.kerfWasteArea, 1.25 * 60.25);
  assert.equal(result.sheets[0].parts[1].x - result.sheets[0].parts[0].x, 50.875);
});

test("rejects a nominal fit that leaves less than one kerf for a required cut", () => {
  assert.throws(
    () =>
      solveGuillotineCutting({
        sheetLength: 100,
        sheetWidth: 60,
        kerf: 5,
        parts: [
          { id: "tight", length: 98, width: 60, quantity: 1, allowRotation: false },
        ],
      }),
    /cannot be separated from the stock/,
  );
});

test("rejects parts larger than the stock in every allowed orientation", () => {
  assert.throws(
    () =>
      solveGuillotineCutting({
        sheetLength: 50,
        sheetWidth: 40,
        kerf: 2,
        parts: [
          { id: "oversize", length: 60, width: 45, quantity: 1, allowRotation: true },
        ],
      }),
    /larger than the stock sheet/,
  );
});

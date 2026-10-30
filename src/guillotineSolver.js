const EPSILON = 1e-9;

const SORT_HEURISTICS = [
  {
    name: "Largest area first",
    sort: (a, b) => b.area - a.area || b.longestSide - a.longestSide,
  },
  {
    name: "Longest side first",
    sort: (a, b) =>
      b.longestSide - a.longestSide ||
      b.shortestSide - a.shortestSide ||
      b.area - a.area,
  },
  {
    name: "Largest perimeter first",
    sort: (a, b) => b.perimeter - a.perimeter || b.area - a.area,
  },
  { name: "Matching strip sizes", sort: null },
];

function makeStripComparator(pieces) {
  const counts = new Map();
  for (const piece of pieces) {
    for (const side of new Set([piece.length, piece.width])) {
      counts.set(side, (counts.get(side) ?? 0) + 1);
    }
  }
  const sharedSide = [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort(([sideA, countA], [sideB, countB]) => countB - countA || sideB - sideA)[0]?.[0];

  if (sharedSide === undefined) {
    return (a, b) =>
      a.stripKey.localeCompare(b.stripKey, undefined, { numeric: true }) ||
      b.area - a.area;
  }

  return (a, b) => {
    const aMatches = a.length === sharedSide || a.width === sharedSide;
    const bMatches = b.length === sharedSide || b.width === sharedSide;
    if (aMatches !== bMatches) return aMatches ? -1 : 1;
    if (aMatches) {
      const aOtherSide = a.length === sharedSide ? a.width : a.length;
      const bOtherSide = b.length === sharedSide ? b.width : b.length;
      return bOtherSide - aOtherSide || b.area - a.area;
    }
    return b.longestSide - a.longestSide || b.area - a.area;
  };
}

function assertPositiveFinite(value, label) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive number.`);
  }
}

function normalizeParts(parts, sheetLength, sheetWidth, kerf) {
  if (!Array.isArray(parts) || parts.length === 0) {
    throw new Error("Add at least one part to the cut list.");
  }

  const expanded = [];
  for (const [partIndex, part] of parts.entries()) {
    const label = String(part.label ?? "").trim() || `Part ${partIndex + 1}`;
    assertPositiveFinite(part.length, `${label} length`);
    assertPositiveFinite(part.width, `${label} width`);
    if (!Number.isSafeInteger(part.quantity) || part.quantity < 1) {
      throw new Error(`${label} quantity must be a positive whole number.`);
    }

    const canRotate = Boolean(part.allowRotation);
    const fitsNormally =
      part.length <= sheetLength + EPSILON &&
      part.width <= sheetWidth + EPSILON;
    const fitsRotated =
      canRotate &&
      part.width <= sheetLength + EPSILON &&
      part.length <= sheetWidth + EPSILON;
    if (!fitsNormally && !fitsRotated) {
      throw new Error(
        `${label} (${part.length} × ${part.width}) is larger than the stock sheet in every allowed orientation.`,
      );
    }

    for (let index = 0; index < part.quantity; index += 1) {
      expanded.push({
        partId: String(part.id ?? partIndex + 1),
        pieceId: `${String(part.id ?? partIndex + 1)}-${index + 1}`,
        label,
        length: part.length,
        width: part.width,
        allowRotation: canRotate,
        area: part.length * part.width,
        longestSide: Math.max(part.length, part.width),
        shortestSide: Math.min(part.length, part.width),
        perimeter: 2 * (part.length + part.width),
        stripKey: `${Math.min(part.length, part.width)}:${Math.max(part.length, part.width)}`,
      });
    }
  }
  return expanded;
}

function splitSpace(space, axis, size, kerf) {
  const dimension = axis === "length" ? space.length : space.width;
  const gap = dimension - size;
  if (gap < -EPSILON) return null;

  if (gap <= EPSILON) {
    return {
      near: { ...space, ...(axis === "length" ? { length: size } : { width: size }) },
      far: null,
      cut: null,
    };
  }
  if (gap + EPSILON < kerf) return null;

  const remaining = Math.max(0, gap - kerf);
  const near = {
    ...space,
    ...(axis === "length" ? { length: size } : { width: size }),
  };
  const far =
    remaining <= EPSILON
      ? null
      : axis === "length"
        ? {
            x: space.x + size + kerf,
            y: space.y,
            length: remaining,
            width: space.width,
          }
        : {
            x: space.x,
            y: space.y + size + kerf,
            length: space.length,
            width: remaining,
          };

  const cut =
    axis === "length"
      ? {
          axis,
          x: space.x + size + kerf / 2,
          y: space.y,
          span: space.width,
          parent: { x: space.x, y: space.y, length: space.length, width: space.width },
          localPosition: size,
        }
      : {
          axis,
          x: space.x,
          y: space.y + size + kerf / 2,
          span: space.length,
          parent: { x: space.x, y: space.y, length: space.length, width: space.width },
          localPosition: size,
        };

  return { near, far, cut };
}

function makeCandidate(space, piece, pieceLength, pieceWidth, kerf, firstAxis, sheetIndex) {
  const secondAxis = firstAxis === "length" ? "width" : "length";
  const firstSize = firstAxis === "length" ? pieceLength : pieceWidth;
  const secondSize = secondAxis === "length" ? pieceLength : pieceWidth;
  const first = splitSpace(space, firstAxis, firstSize, kerf);
  if (!first) return null;

  const second = splitSpace(first.near, secondAxis, secondSize, kerf);
  if (!second) return null;

  const offcuts = [];
  if (first.far) {
    offcuts.push({ ...first.far, source: "first-far" });
  }
  if (second.far) {
    offcuts.push({ ...second.far, source: "second-far" });
  }

  const cuts = [];
  if (first.cut) {
    cuts.push({
      ...first.cut,
      parentSource: "free",
      nearSource: "first-near",
      farSource: "first-far",
    });
  }
  if (second.cut) {
    cuts.push({
      ...second.cut,
      parentSource: first.cut ? "first-near" : "free",
      nearSource: null,
      farSource: "second-far",
    });
  }

  return {
    space,
    piece,
    x: space.x,
    y: space.y,
    length: pieceLength,
    width: pieceWidth,
    rotated: pieceLength !== piece.length || pieceWidth !== piece.width,
    offcuts,
    cuts,
    sheetIndex,
    splitOrder: firstAxis,
    leftoverArea: offcuts.reduce((sum, item) => sum + item.length * item.width, 0),
    largestOffcutArea: offcuts.reduce(
      (largest, item) => Math.max(largest, item.length * item.width),
      0,
    ),
    kerfWaste: cuts.reduce((sum, cut) => sum + kerf * cut.span, 0),
  };
}

function compareNumbers(a, b) {
  for (let index = 0; index < Math.min(a.length, b.length); index += 1) {
    if (Math.abs(a[index] - b[index]) > EPSILON) return a[index] - b[index];
  }
  return a.length - b.length;
}

function candidateScore(candidate, placementPolicy) {
  const stable = [candidate.sheetIndex, candidate.space.id];
  if (placementPolicy === "largest-offcut") {
    return [
      candidate.offcuts.length,
      -candidate.largestOffcutArea,
      candidate.leftoverArea,
      candidate.kerfWaste,
      ...stable,
      candidate.splitOrder === "length" ? 0 : 1,
    ];
  }
  return [
    candidate.leftoverArea,
    candidate.offcuts.length,
    -candidate.largestOffcutArea,
    candidate.kerfWaste,
    ...stable,
    candidate.splitOrder === "length" ? 0 : 1,
  ];
}

function findBestCandidate(piece, sheets, sheetLength, sheetWidth, kerf, placementPolicy) {
  const candidates = [];
  sheets.forEach((sheet, sheetIndex) => {
    for (const space of sheet.free) {
      const orientations = [{ length: piece.length, width: piece.width }];
      if (
        piece.allowRotation &&
        Math.abs(piece.length - piece.width) > EPSILON
      ) {
        orientations.push({ length: piece.width, width: piece.length });
      }

      for (const orientation of orientations) {
        for (const firstAxis of ["length", "width"]) {
          const candidate = makeCandidate(
            space,
            piece,
            orientation.length,
            orientation.width,
            kerf,
            firstAxis,
            sheetIndex,
          );
          if (candidate) candidates.push(candidate);
        }
      }
    }
  });

  candidates.sort((a, b) =>
    compareNumbers(candidateScore(a, placementPolicy), candidateScore(b, placementPolicy)),
  );
  return candidates[0] ?? null;
}

function createSheet(sheetLength, sheetWidth, sheetNumber) {
  return {
    sheetNumber,
    parts: [],
    cuts: [],
    free: [
      {
        id: 1,
        x: 0,
        y: 0,
        length: sheetLength,
        width: sheetWidth,
      },
    ],
    nextSpaceId: 2,
  };
}

function applyCandidate(sheet, candidate, kerf) {
  sheet.free = sheet.free.filter((space) => space.id !== candidate.space.id);

  let firstNearId = candidate.space.id;
  if (candidate.cuts.some((cut) => cut.nearSource === "first-near")) {
    firstNearId = sheet.nextSpaceId;
    sheet.nextSpaceId += 1;
  }

  const sourceToId = {
    free: candidate.space.id,
    "first-near": firstNearId,
  };
  const assignedOffcuts = candidate.offcuts.map((offcut) => {
    const assigned = { ...offcut, id: sheet.nextSpaceId };
    sheet.nextSpaceId += 1;
    delete assigned.source;
    sheet.free.push(assigned);
    return assigned;
  });
  const offcutBySource = new Map(
    candidate.offcuts.map((offcut, index) => [offcut.source, assignedOffcuts[index]]),
  );

  candidate.cuts.forEach((cut) => {
    sheet.cuts.push({
      ...cut,
      number: sheet.cuts.length + 1,
      parentSpaceId: sourceToId[cut.parentSource],
      kerf,
      nearSpaceId: cut.nearSource ? sourceToId[cut.nearSource] : null,
      farSpaceId: offcutBySource.get(cut.farSource)?.id ?? null,
    });
  });

  sheet.parts.push({
    pieceId: candidate.piece.pieceId,
    partId: candidate.piece.partId,
    label: candidate.piece.label,
    x: candidate.x,
    y: candidate.y,
    length: candidate.length,
    width: candidate.width,
    originalLength: candidate.piece.length,
    originalWidth: candidate.piece.width,
    rotated: candidate.rotated,
    area: candidate.piece.area,
  });
}

function runPass(pieces, sheetLength, sheetWidth, kerf, sortHeuristic, placementPolicy) {
  const comparePieces =
    sortHeuristic.sort ?? makeStripComparator(pieces);
  const ordered = [...pieces].sort(
    (a, b) =>
      comparePieces(a, b) ||
      a.pieceId.localeCompare(b.pieceId, undefined, { numeric: true }),
  );
  const sheets = [];

  for (const piece of ordered) {
    if (sheets.length === 0) {
      sheets.push(createSheet(sheetLength, sheetWidth, 1));
    }
    let candidate = findBestCandidate(
      piece,
      sheets,
      sheetLength,
      sheetWidth,
      kerf,
      placementPolicy,
    );
    if (!candidate) {
      const sheet = createSheet(sheetLength, sheetWidth, sheets.length + 1);
      candidate = findBestCandidate(
        piece,
        [sheet],
        sheetLength,
        sheetWidth,
        kerf,
        placementPolicy,
      );
      if (!candidate) {
        throw new Error(
          `${piece.label} cannot be separated from the stock with a ${kerf} kerf. Check its dimensions or reduce the kerf.`,
        );
      }
      sheets.push(sheet);
      candidate.sheetIndex = sheets.length - 1;
    }
    applyCandidate(sheets[candidate.sheetIndex], candidate, kerf);
  }

  return sheets;
}

function summarizeLayout(sheets, sheetLength, sheetWidth, kerf) {
  const pieces = sheets.flatMap((sheet) => sheet.parts);
  const offcuts = sheets.flatMap((sheet) =>
    sheet.free.map((offcut) => ({
      ...offcut,
      sheetNumber: sheet.sheetNumber,
      area: offcut.length * offcut.width,
    })),
  );
  const usedArea = pieces.reduce((sum, piece) => sum + piece.area, 0);
  const kerfWasteArea = sheets.reduce(
    (sum, sheet) =>
      sum +
      sheet.cuts.reduce((cutSum, cut) => cutSum + kerf * cut.span, 0),
    0,
  );
  const stockArea = sheets.length * sheetLength * sheetWidth;
  const largestOffcut = [...offcuts].sort(
    (a, b) => b.area - a.area || b.length - a.length,
  )[0] ?? null;

  return {
    sheets,
    offcuts,
    pieceCount: pieces.length,
    usedArea,
    stockArea,
    kerfWasteArea,
    usableOffcutArea: offcuts.reduce((sum, offcut) => sum + offcut.area, 0),
    wasteArea: Math.max(0, stockArea - usedArea),
    wastePercentage: stockArea ? (100 * (stockArea - usedArea)) / stockArea : 0,
    largestOffcut,
  };
}

function layoutScore(layout) {
  const sheetUse = layout.sheets.map((sheet) =>
    sheet.parts.reduce((sum, part) => sum + part.area, 0),
  );
  const largestOffcutArea = layout.largestOffcut?.area ?? 0;
  const offcutCount = layout.offcuts.length;
  const kerfWaste = layout.kerfWasteArea;
  return [
    layout.sheets.length,
    ...sheetUse.map((area) => -area),
    -largestOffcutArea,
    offcutCount,
    kerfWaste,
  ];
}

/**
 * Packs rectangular parts using only full-span guillotine cuts.
 * All dimensions use the same user-selected unit.
 */
export function solveGuillotineCutting({
  sheetLength,
  sheetWidth,
  kerf,
  parts,
}) {
  assertPositiveFinite(sheetLength, "Sheet length");
  assertPositiveFinite(sheetWidth, "Sheet width");
  if (!Number.isFinite(kerf) || kerf < 0) {
    throw new Error("Blade kerf must be zero or a positive number.");
  }

  const pieces = normalizeParts(parts, sheetLength, sheetWidth, kerf);
  const layouts = [];

  for (const heuristic of SORT_HEURISTICS) {
    for (const placementPolicy of ["best-fit", "largest-offcut"]) {
      const sheets = runPass(
        pieces,
        sheetLength,
        sheetWidth,
        kerf,
        heuristic,
        placementPolicy,
      );
      layouts.push(summarizeLayout(sheets, sheetLength, sheetWidth, kerf));
    }
  }

  layouts.sort((a, b) => compareNumbers(layoutScore(a), layoutScore(b)));
  const best = layouts[0];
  return {
    ...best,
    sheetLength,
    sheetWidth,
    kerf,
    totalSheetsNeeded: best.sheets.length,
    heuristicPasses: layouts.length,
  };
}

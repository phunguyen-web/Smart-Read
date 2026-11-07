import { PDFArray, PDFDict, PDFDocument, PDFHexString, PDFName, PDFNumber, PDFRef, PDFString, degrees } from 'pdf-lib'
import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import {
  escapeCsv,
  escapeToml,
  escapeTsv,
  escapeHtml,
  escapeRtf,
  comicPageName,
  isComicFormat,
  isImageFormat,
  toCbz,
  slicePageRange,
  slicePagesByIndexes,
  toCsv,
  toToml,
  toTsv,
  escapeLatex,
  toIni,
  toAdoc,
  toRst,
  toTextile,
  toWiki,
  toDokuwiki,
  toDocbook,
  toOpml,
  toAtom,
  toTypst,
  toGemtext,
  toPod,
  toBbcode,
  toFountain,
  toTid,
  toTexinfo,
  toRoff,
  toIpynb,
  toBibtex,
  escapeBibtex,
  formatSrtTime,
  formatVttTime,
  formatLrcTime,
  formatIcsDate,
  formatCueIndex,
  formatAssTime,
  escapeIcs,
  escapeCue,
  escapeAss,
  toSrt,
  toVtt,
  toLrc,
  toIcs,
  toCue,
  toAss,
  formatTtmlTime,
  formatSbvTime,
  formatSamiTime,
  formatSubTime,
  formatStlTime,
  formatSccTime,
  formatUsfTime,
  formatRtTime,
  formatMplTime,
  toTtml,
  toSbv,
  toSami,
  toSub,
  toStl,
  toScc,
  toUsf,
  toRt,
  toMpl,
  toDjvu,
  toPs,
  toTei,
  toJats,
  toRis,
  toEnw,
  toCsljson,
  toNbib,
  toCslyaml,
  toEnxml,
  toMods,
  toCff,
  toDatacite,
  toMarcxml,
  toDublincore,
  toOnix,
  toUnixref,
  toBibjson,
  toPubmed,
  toJsonld,
  toBibframe,
  toCrossref,
  toEad,
  toMets,
  toPremis,
  toMix,
  toAlto,
  toPage,
  toFoxml,
  toEdm,
  toLido,
  toVra,
  toCdwa,
  toSpectrum,
  toDwc,
  toObjectid,
  toEac,
  toCrm,
  toRights,
  toTextmd,
  toPbcore,
  toEbucore,
  toMpeg7,
  toAes57,
  toLom,
  toImscp,
  toNewsml,
  toNitf,
  toSportsml,
  toEventsml,
  toNewsmlg2,
  toRnews,
  toPrism,
  toHnews,
  toIptc,
  toAnpa,
  toNinjs,
  toJsonfeed,
  toAs2,
  toGeojson,
  toKml,
  toGpx,
  toOsm,
  toGeorss,
  toWkt,
  toGml,
  toTopojson,
  toSvg,
  toDxf,
  toMapml,
  toCityjson,
  toIndoorgml,
  toCitygml,
  toLandxml,
  toIfcxml,
  toGbxml,
  toBcfxml,
  toCobiexml,
  toLandinfra,
  toInfragml,
  toOpendrive,
  toRailml,
  toTransxml,
  toDatex2,
  toNetex,
  toSiri,
  toTransxchange,
  toNaptan,
  toGtfs,
  toIfopt,
  toOjp,
  toTrias,
  toVdv453,
  toVdv454,
  toVdv452,
  toVdv462,
  toVdv455,
  toVdv731,
  toVdv301,
  toVdv423,
  toVdv431,
  toVdv300,
  toVdv451,
  toVdv432,
  toVdv433,
  toVdv434,
  toVdv435,
  toVdv436,
  toVdv456,
  toVdv457,
  toVdv459,
  toVdv461,
  toVdv458,
  toVdv460,
  toXliff,
  toTmx,
  toTbx,
  toPo,
  toDita,
  toVcard,
  toRdf,
  toOpds,
  toVtodo,
  toVjournal,
  toVfreebusy,
  toVavailability,
  escapeNbib,
  escapePs,
  escapeRis,
  escapeEnw,
  escapeTypst,
  toJsonl,
  toLatex,
  toOrg,
  escapeIni,
  toEpub,
  toFb2,
  toHtml,
  toJson,
  toMarkdown,
  toOdp,
  toOds,
  toOdt,
  toXml,
  toYaml,
  escapeYaml,
  toPptx,
  toRtf,
  toTxt,
  toXlsx,
  zipPdfParts,
} from './convert.ts'
import {
  pagesFromCsv,
  pagesFromToml,
  pagesFromTsv,
  pagesFromIni,
  pagesFromAdoc,
  pagesFromRst,
  imagesFromCbz,
  pagesFromTextile,
  pagesFromWiki,
  pagesFromDokuwiki,
  pagesFromDocbook,
  pagesFromOpml,
  pagesFromAtom,
  pagesFromTypst,
  pagesFromGemtext,
  pagesFromPod,
  pagesFromBbcode,
  pagesFromFountain,
  pagesFromTid,
  pagesFromTexinfo,
  pagesFromRoff,
  pagesFromIpynb,
  pagesFromBibtex,
  pagesFromSrt,
  pagesFromVtt,
  pagesFromLrc,
  pagesFromIcs,
  pagesFromCue,
  pagesFromAss,
  pagesFromTtml,
  pagesFromSbv,
  pagesFromSami,
  pagesFromSub,
  pagesFromStl,
  pagesFromScc,
  pagesFromUsf,
  pagesFromRt,
  pagesFromMpl,
  pagesFromDjvu,
  pagesFromPs,
  pagesFromTei,
  pagesFromJats,
  pagesFromRis,
  pagesFromEnw,
  pagesFromCsljson,
  pagesFromNbib,
  pagesFromCslyaml,
  pagesFromEnxml,
  pagesFromMods,
  pagesFromCff,
  pagesFromDatacite,
  pagesFromMarcxml,
  pagesFromDublincore,
  pagesFromOnix,
  pagesFromUnixref,
  pagesFromBibjson,
  pagesFromPubmed,
  pagesFromJsonld,
  pagesFromBibframe,
  pagesFromCrossref,
  pagesFromEad,
  pagesFromMets,
  pagesFromPremis,
  pagesFromMix,
  pagesFromAlto,
  pagesFromPage,
  pagesFromFoxml,
  pagesFromEdm,
  pagesFromLido,
  pagesFromVra,
  pagesFromCdwa,
  pagesFromSpectrum,
  pagesFromDwc,
  pagesFromObjectid,
  pagesFromEac,
  pagesFromCrm,
  pagesFromRights,
  pagesFromTextmd,
  pagesFromPbcore,
  pagesFromEbucore,
  pagesFromMpeg7,
  pagesFromAes57,
  pagesFromLom,
  pagesFromImscp,
  pagesFromNewsml,
  pagesFromNitf,
  pagesFromSportsml,
  pagesFromEventsml,
  pagesFromNewsmlg2,
  pagesFromRnews,
  pagesFromPrism,
  pagesFromHnews,
  pagesFromIptc,
  pagesFromAnpa,
  pagesFromNinjs,
  pagesFromJsonfeed,
  pagesFromAs2,
  pagesFromGeojson,
  pagesFromKml,
  pagesFromGpx,
  pagesFromOsm,
  pagesFromGeorss,
  pagesFromWkt,
  pagesFromGml,
  pagesFromTopojson,
  pagesFromSvg,
  pagesFromDxf,
  pagesFromMapml,
  pagesFromCityjson,
  pagesFromIndoorgml,
  pagesFromCitygml,
  pagesFromLandxml,
  pagesFromIfcxml,
  pagesFromGbxml,
  pagesFromBcfxml,
  pagesFromCobiexml,
  pagesFromLandinfra,
  pagesFromInfragml,
  pagesFromOpendrive,
  pagesFromRailml,
  pagesFromTransxml,
  pagesFromDatex2,
  pagesFromNetex,
  pagesFromSiri,
  pagesFromTransxchange,
  pagesFromNaptan,
  pagesFromGtfs,
  pagesFromIfopt,
  pagesFromOjp,
  pagesFromTrias,
  pagesFromVdv453,
  pagesFromVdv454,
  pagesFromVdv452,
  pagesFromVdv462,
  pagesFromVdv455,
  pagesFromVdv731,
  pagesFromVdv301,
  pagesFromVdv423,
  pagesFromVdv431,
  pagesFromVdv300,
  pagesFromVdv451,
  pagesFromVdv432,
  pagesFromVdv433,
  pagesFromVdv434,
  pagesFromVdv435,
  pagesFromVdv436,
  pagesFromVdv456,
  pagesFromVdv457,
  pagesFromVdv459,
  pagesFromVdv461,
  pagesFromVdv458,
  pagesFromVdv460,
  pagesFromXliff,
  pagesFromTmx,
  pagesFromTbx,
  pagesFromPo,
  pagesFromDita,
  pagesFromVcard,
  pagesFromRdf,
  pagesFromOpds,
  pagesFromVtodo,
  pagesFromVjournal,
  pagesFromVfreebusy,
  pagesFromVavailability,
  pagesFromJsonl,
  pagesFromLatex,
  pagesFromOrg,
  pagesFromDocx,
  pagesFromEpub,
  pagesFromFb2,
  pagesFromHtml,
  pagesFromImportedText,
  pagesFromJson,
  pagesFromMarkdown,
  pagesFromOdp,
  pagesFromOds,
  pagesFromOdt,
  pagesFromPptx,
  pagesFromPlainText,
  pagesFromRtf,
  pagesFromXlsx,
  pagesFromXml,
  pagesFromYaml,
  rtfToPlain,
  parseCsv,
  stripMarkup,
} from './import-text.ts'
import {
  BASE_PREVIEW_SCALE,
  BASE_THUMB_CONTRAST,
  MAX_PREVIEW_SCALE,
  SPARSE_THUMB_CONTRAST,
  blankPageIndexes,
  findPagesWithText,
  foldSearch,
  repeatedPageIndexes,
  contentBoundsFromRgba,
  grayscaleRgba,
  luma,
  previewScaleForPage,
  thumbnailContrastForPage,
  thumbnailScaleForPage,
} from './extract.ts'
import { assertPdfPassword, decryptPdfForEdit, encryptPdfForDownload } from './encrypt.ts'
import {
  decodeSnapshots,
  encodeSnapshots,
  formatPageList,
  editorExportSelection,
  restoreEditorView,
} from './persist.ts'
import {
  embeddedImageName,
  embeddedImageZipName,
  embeddedAttachmentName,
  embeddedAttachmentZipName,
  encryptedPdfName,
  extractedPdfName,
  imageKindFromFile,
  imagePageName,
  imageZipName,
  isImageKind,
  sourceKindFromFile,
  outlineSplitPartName,
  outlineSplitZipName,
  splitPartName,
  splitZipName,
  swapExtension,
} from './limits.ts'
import {
  A4_HEIGHT,
  A4_LANDSCAPE,
  A4_PORTRAIT,
  A4_WIDTH,
  A5_HEIGHT,
  A5_WIDTH,
  LETTER_HEIGHT,
  LETTER_WIDTH,
  addCoverPage,
  addHeaderFooter,
  addNamedDest,
  addNamedDestsForSelection,
  destNamesForPage,
  namedDestNameForPage,
  namedDestViewOf,
  namedDestXyzOf,
  namedDestXyzFromPageSize,
  namedDestXyzFromPaper,
  namedDestXyzFromDestPage,
  namedDestXyzFromZoomPreset,
  namedDestXyzFromAxisPreset,
  namedDestXyzAxisNeedsPageSize,
  namedDestXyzFromAxisDestPage,
  namedDestXyzZoomFromPreset,
  namedDestXyzZoomFromDestPage,
  listPageSizes,
  clearNamedDests,
  duplicateNamedDest,
  renameNamedDest,
  removeNamedDest,
  setNamedDestPage,
  setNamedDestView,
  setNamedDestXyz,
  parseNamedDestPageInput,
  parseNamedDestXyzInput,
  parseNamedDestXyzPart,
  NAMED_DEST_LEAF_SIZE,
  destNameTreeChildSpan,
  destNameTreeHasIntermediate,
  destNameTreeStyleFromDoc,
  addOutlineBookmarks,
  addOutlineFolder,
  bookletPreviewSheets,
  bookletSlotLabel,
  clearOutline,
  MAX_OUTLINE_DEPTH,
  canIndentOutlineItem,
  canMoveOutlineItem,
  canOutdentOutlineItem,
  indentOutlineItem,
  moveOutlineItem,
  outlineIndexAfterIndent,
  outlineIndexAfterMove,
  outlineIndexAfterOutdent,
  outdentOutlineItem,
  outlineItemIsFolder,
  renameOutlineItem,
  removeOutlineItem,
  setOutlineDest,
  setOutlineNamedDest,
  listNamedDests,
  setOutlineFolderOpen,
  setOutlineFoldersOpen,
  visibleOutlineItems,
  extractEmbeddedImages,
  formatPageLabel,
  frontMatterPageCount,
  listPageLabels,
  pageLabelForIndex,
  pageLabelsForCount,
  setFrontMatterPageLabels,
  setPageLabels,
  toRomanNumeral,
  addPageBorder,
  applyContentCrops,
  autoCropPages,
  AUTO_CROP_PADDING,
  cropBoxFromContentBounds,
  pageBoxEquals,
  TINTS,
  tintFill,
  tintPages,
  PAGE_BACKGROUNDS,
  pageBackgroundFill,
  colorPageBackgrounds,
  addPageNumbers,
  borderBoxForPage,
  borderStrokeWidth,
  addTextOverlay,
  addWatermark,
  assertRedactSize,
  highlightPages,
  HIGHLIGHT_FILL,
  redactBoxForPage,
  redactPages,
  REDACT_SIZES,
  OVERLAY_PRESETS,
  signPages,
  SIGNATURE_STROKE,
  signatureStrokesForBox,
  addTextFields,
  TEXT_FIELD_FILL,
  TEXT_FIELD_PREFIX,
  textFieldNameForPage,
  addCheckboxes,
  CHECKBOX_FILL,
  CHECKBOX_PREFIX,
  checkboxNameForPage,
  addFileAttachments,
  ATTACHMENT_ICON,
  ATTACHMENT_PREFIX,
  attachmentNameForPage,
  extractFileAttachments,
  listFileAttachments,
  addRadioButtons,
  RADIO_FILL,
  RADIO_OPTION,
  RADIO_PREFIX,
  radioNameForPage,
  addDropdowns,
  DROPDOWN_FILL,
  DROPDOWN_OPTION,
  DROPDOWN_PREFIX,
  dropdownNameForPage,
  addOptionLists,
  OPTION_LIST_FILL,
  OPTION_LIST_OPTION,
  OPTION_LIST_PREFIX,
  optionListNameForPage,
  addLinkAnnotations,
  LINK_BORDER,
  LINK_DEFAULT_URI,
  linkUriFromOverlay,
  addStampAnnotations,
  STAMP_COLOR,
  STAMP_NAME,
  addFreeTextAnnotations,
  FREETEXT_COLOR,
  FREETEXT_DA,
  addCaretAnnotations,
  CARET_COLOR,
  CARET_SY,
  addInkAnnotations,
  INK_COLOR,
  inkPathForBox,
  addSquareAnnotations,
  SQUARE_COLOR,
  SQUARE_FILL,
  addCircleAnnotations,
  CIRCLE_COLOR,
  CIRCLE_FILL,
  circleEllipseOps,
  addPolygonAnnotations,
  POLYGON_COLOR,
  POLYGON_FILL,
  polygonPathOps,
  polygonVerticesForBox,
  addPolylineAnnotations,
  POLYLINE_COLOR,
  polylinePathOps,
  polylineVerticesForBox,
  addLineAnnotations,
  LINE_COLOR,
  linePathOps,
  lineEndpointsForBox,
  addSquigglyAnnotations,
  SQUIGGLY_COLOR,
  squigglyPathOps,
  squigglyQuadPointsForBox,
  addHighlightAnnotations,
  HIGHLIGHT_ANNOT_COLOR,
  highlightPathOps,
  highlightQuadPointsForBox,
  addUnderlineAnnotations,
  UNDERLINE_ANNOT_COLOR,
  underlineAnnotPathOps,
  underlineAnnotQuadPointsForBox,
  addStrikeoutAnnotations,
  STRIKEOUT_ANNOT_COLOR,
  strikeoutAnnotPathOps,
  strikeoutAnnotQuadPointsForBox,
  addRedactAnnotations,
  REDACT_ANNOT_COLOR,
  redactAnnotPathOps,
  redactAnnotQuadPointsForBox,
  addPopupAnnotations,
  POPUP_COLOR,
  addWatermarkAnnotations,
  WATERMARK_ANNOT_COLOR,
  watermarkAnnotPathOps,
  addScreenAnnotations,
  SCREEN_COLOR,
  screenAnnotPathOps,
  addSoundAnnotations,
  SOUND_COLOR,
  soundAnnotPathOps,
  addMovieAnnotations,
  MOVIE_COLOR,
  movieAnnotPathOps,
  addRichMediaAnnotations,
  RICH_MEDIA_COLOR,
  richMediaAnnotPathOps,
  addThreeDAnnotations,
  THREE_D_COLOR,
  threeDAnnotPathOps,
  addPrinterMarkAnnotations,
  PRINTER_MARK_COLOR,
  printerMarkPathOps,
  addStickyNotes,
  STICKY_NOTE_COLOR,
  strikeoutPages,
  strikeoutStrokeForBox,
  underlinePages,
  underlineStrokeForBox,
  CROP_MARGINS,
  a4SizeForPage,
  cropBoxAfterMargin,
  cropPages,
  deinterleaveOddEven,
  deinterleaveOddEvenOrder,
  deletePages,
  duplicatePages,
  duplicatedIndexes,
  extractPages,
  fitPagesToA4,
  fitPagesToPaper,
  fittedPageRect,
  flipPages,
  formatPageNumber,
  imposeBooklet,
  IMAGE_PAGE_MAX_EDGE,
  imagePageSize,
  imagesToPdf,
  insertBlankPage,
  insertImages,
  interleaveHalves,
  interleaveHalvesOrder,
  isIdentityOrder,
  keepOutlineItem,
  keepPages,
  bookletSheetCount,
  bookletSlotOrder,
  MAX_METADATA_LENGTH,
  mergeBookmarkTitle,
  mergeInsertIndex,
  mergePdf,
  mergePdfWithBookmark,
  nUpCellRects,
  needsOrientation,
  nUpPages,
  nUpSheetCount,
  nUpSheetSize,
  MAX_PADDED_SIDE,
  movePage,
  movePages,
  orientPages,
  pageSizeEquals,
  padPages,
  paddedPageSize,
  paperSizeForPage,
  PAPER_LABELS,
  pageCount,
  listOutlineBookmarks,
  pageOrientation,
  displayedPageSize,
  readMetadata,
  remapAfterOrder,
  reorderPageBlock,
  replacePagesWithPngs,
  remapAfterSplitHalf,
  reversePages,
  reversedIndexes,
  rotatePages,
  rotatePagesBy,
  SCALE_PERCENTS,
  scaleFactor,
  scalePages,
  setMetadata,
  outlineItemRange,
  outlineSplitRanges,
  splitByOutline,
  splitEvery,
  splitPagesInHalf,
  textPagesToPdf,
  trimMetadataField,
  unifiedPageSize,
  unifyPageSizes,
  wrapPdfText,
} from './pdf.ts'
import { MAX_EDITOR_HISTORY, popSnapshot, pushSnapshot, snapshotOf } from './history.ts'
import {
  blockEdgeDropTo,
  blockNudgeDropTo,
  clampPageRange,
  evenPageIndexes,
  indexesFromPageRange,
  invertPageIndexes,
  movingIndexesForDrag,
  nextPageAfterDelete,
  oddPageIndexes,
  pageRange,
  parseGotoPage,
  gotoSuggestions,
  parsePageRange,
  parseSplitSize,
  togglePage,
} from './selection.ts'

async function samplePdf(pageLabels: string[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  for (const label of pageLabels) {
    const page = doc.addPage([200, 280])
    page.drawText(label, { x: 24, y: 140, size: 12 })
  }
  return new Uint8Array(await doc.save())
}

describe('pdf edits', () => {
  it('rotates a selected page', async () => {
    const bytes = await samplePdf(['A', 'B'])
    const rotated = await rotatePages(bytes, [0])
    const doc = await PDFDocument.load(rotated)
    expect(doc.getPage(0).getRotation().angle).toBe(90)
    expect(doc.getPage(1).getRotation().angle).toBe(0)
    const flipped = await rotatePagesBy(bytes, [1], 180)
    const flippedDoc = await PDFDocument.load(flipped)
    expect(flippedDoc.getPage(1).getRotation().angle).toBe(180)
    const back = await rotatePagesBy(rotated, [0], -90)
    expect((await PDFDocument.load(back)).getPage(0).getRotation().angle).toBe(0)
  })

  it('deletes a page and refuses to delete the last page', async () => {
    const bytes = await samplePdf(['A', 'B'])
    const next = await deletePages(bytes, [0])
    expect(await pageCount(next)).toBe(1)
    await expect(deletePages(next, [0])).rejects.toThrow(/ít nhất một trang/)
  })

  it('deletes several selected pages at once', async () => {
    const bytes = await samplePdf(['A', 'B', 'C', 'D'])
    const next = await deletePages(bytes, [1, 3])
    expect(await pageCount(next)).toBe(2)
    await expect(deletePages(bytes, [0, 1, 2, 3])).rejects.toThrow(/ít nhất một trang/)
  })

  it('reorders pages and merges at a chosen index', async () => {
    const first = await samplePdf(['A', 'B'])
    const moved = await movePage(first, 0, 1)
    expect(await pageCount(moved)).toBe(2)
    const extra = await samplePdf(['C'])
    const merged = await mergePdf(moved, extra, 1)
    expect(await pageCount(merged)).toBe(3)
    expect(mergeInsertIndex(2, 0, 'after')).toBe(1)
    expect(mergeInsertIndex(2, 0, 'start')).toBe(0)
    expect(mergeInsertIndex(2, 0, 'end')).toBe(2)
  })

  it('moves a multi-select as one contiguous block', async () => {
    const bytes = await samplePdf(['A', 'B', 'C', 'D'])
    expect(reorderPageBlock(3, [0], 2).order).toEqual([1, 2, 0])
    expect(reorderPageBlock(3, [2], 0).order).toEqual([2, 0, 1])
    expect(reorderPageBlock(4, [0, 1], 3)).toEqual({
      order: [2, 3, 0, 1],
      moved: [2, 3],
    })
    expect(reorderPageBlock(4, [2, 3], 0)).toEqual({
      order: [2, 3, 0, 1],
      moved: [0, 1],
    })
    expect(isIdentityOrder(reorderPageBlock(4, [1, 2], 1).order)).toBe(true)
    const blocked = await movePages(bytes, [0, 2], 3)
    expect(await pageCount(blocked)).toBe(4)
    const identity = await movePages(bytes, [1], 1)
    expect(identity).toBe(bytes)
  })

  it('draws a text overlay at a ratio', async () => {
    const bytes = await samplePdf(['A'])
    const next = await addTextOverlay(bytes, 0, 'Hi', { xRatio: 0.2, yRatio: 0.3 })
    expect(await pageCount(next)).toBe(1)
    await expect(addTextOverlay(bytes, 0, '   ')).rejects.toThrow(/Nhập nội dung/)
  })

  it('redacts a line, block, or full page at a ratio', async () => {
    const bytes = await samplePdf(['Secret'])
    expect(assertRedactSize('line')).toBe('line')
    expect(assertRedactSize('page')).toBe('page')
    expect(() => assertRedactSize('dot')).toThrow(/dòng/)
    expect(redactBoxForPage(200, 100, { xRatio: 0.5, yRatio: 0.5 }, 'block')).toEqual({
      x: 200 * 0.5 - (200 * REDACT_SIZES.block.widthRatio) / 2,
      y: 100 * 0.5 - (100 * REDACT_SIZES.block.heightRatio) / 2,
      width: 200 * REDACT_SIZES.block.widthRatio,
      height: 100 * REDACT_SIZES.block.heightRatio,
    })
    expect(redactBoxForPage(200, 100, { xRatio: 0.08, yRatio: 0.08 }, 'line').width).toBe(
      200 * REDACT_SIZES.line.widthRatio,
    )
    expect(redactBoxForPage(200, 100, OVERLAY_PRESETS['top-left'], 'page')).toEqual({
      x: 0,
      y: 0,
      width: 200,
      height: 100,
    })
    expect(OVERLAY_PRESETS['top-right']).toEqual({ xRatio: 0.92, yRatio: 0.08 })
    expect(OVERLAY_PRESETS['bottom-center']).toEqual({ xRatio: 0.5, yRatio: 0.88 })
    expect(OVERLAY_PRESETS['bottom-right']).toEqual({ xRatio: 0.92, yRatio: 0.88 })
    const blocked = await redactPages(bytes, [0], { xRatio: 0.5, yRatio: 0.5 }, 'block')
    expect(await pageCount(blocked)).toBe(1)
    const lined = await redactPages(bytes, [0], OVERLAY_PRESETS['top-left'], 'line')
    expect(await pageCount(lined)).toBe(1)
    const corner = await redactPages(bytes, [0], OVERLAY_PRESETS['top-right'], 'line')
    expect(await pageCount(corner)).toBe(1)
    const covered = await redactPages(bytes, [0], OVERLAY_PRESETS.center, 'page')
    expect(await pageCount(covered)).toBe(1)
    await expect(redactPages(bytes, [])).rejects.toThrow(/che chữ/)
  })

  it('highlights and underlines a line, block, or full page at a ratio', async () => {
    const bytes = await samplePdf(['Note'])
    expect(HIGHLIGHT_FILL.opacity).toBe(0.4)
    const box = redactBoxForPage(200, 100, { xRatio: 0.5, yRatio: 0.5 }, 'block')
    const stroke = underlineStrokeForBox(box)
    expect(stroke.thickness).toBeGreaterThan(0)
    expect(stroke.start.x).toBe(box.x)
    expect(stroke.end.x).toBe(box.x + box.width)
    const strike = strikeoutStrokeForBox(box)
    expect(strike.thickness).toBeGreaterThan(0)
    expect(strike.start.y).toBe(box.y + box.height / 2)
    expect(strike.end.x).toBe(box.x + box.width)
    const highlighted = await highlightPages(bytes, [0], { xRatio: 0.5, yRatio: 0.5 }, 'block')
    expect(await pageCount(highlighted)).toBe(1)
    const lined = await highlightPages(bytes, [0], OVERLAY_PRESETS['top-left'], 'line')
    expect(await pageCount(lined)).toBe(1)
    const covered = await highlightPages(bytes, [0], OVERLAY_PRESETS.center, 'page')
    expect(await pageCount(covered)).toBe(1)
    const underlined = await underlinePages(bytes, [0], OVERLAY_PRESETS['bottom-center'], 'line')
    expect(await pageCount(underlined)).toBe(1)
    const pageLine = await underlinePages(bytes, [0], OVERLAY_PRESETS.center, 'page')
    expect(await pageCount(pageLine)).toBe(1)
    const struck = await strikeoutPages(bytes, [0], OVERLAY_PRESETS['top-left'], 'block')
    expect(await pageCount(struck)).toBe(1)
    const pageStrike = await strikeoutPages(bytes, [0], OVERLAY_PRESETS.center, 'page')
    expect(await pageCount(pageStrike)).toBe(1)
    await expect(highlightPages(bytes, [])).rejects.toThrow(/tô vàng/)
    await expect(underlinePages(bytes, [])).rejects.toThrow(/gạch chân/)
    await expect(strikeoutPages(bytes, [])).rejects.toThrow(/gạch ngang/)
    expect(SIGNATURE_STROKE.b).toBeGreaterThan(SIGNATURE_STROKE.r)
    const ink = signatureStrokesForBox(box)
    expect(ink).toHaveLength(3)
    expect(ink[0]!.start.x).toBe(box.x)
    expect(ink[2]!.end.x).toBe(box.x + box.width)
    const signed = await signPages(bytes, [0], OVERLAY_PRESETS['top-left'], 'block')
    expect(await pageCount(signed)).toBe(1)
    const pageSign = await signPages(bytes, [0], OVERLAY_PRESETS.center, 'page')
    expect(await pageCount(pageSign)).toBe(1)
    await expect(signPages(bytes, [])).rejects.toThrow(/ký tên/)
  })

  it('adds a fillable text field at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(textFieldNameForPage(0)).toBe(`${TEXT_FIELD_PREFIX}.p1`)
    expect(textFieldNameForPage(0, 2)).toBe(`${TEXT_FIELD_PREFIX}.p1s2`)
    expect(TEXT_FIELD_FILL.b).toBeLessThan(1)
    const filled = await addTextFields(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const form = (await PDFDocument.load(filled)).getForm()
    expect(form.getFields()).toHaveLength(1)
    expect(form.getTextField(textFieldNameForPage(0)).getText()).toBe('Hello')
    const lined = await addTextFields(bytes, [0], OVERLAY_PRESETS.center, 'line')
    expect((await PDFDocument.load(lined)).getForm().getFields()).toHaveLength(1)
    const pageField = await addTextFields(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect((await PDFDocument.load(pageField)).getForm().getTextField(textFieldNameForPage(0)).getText()).toBe(
      'Page',
    )
    const again = await addTextFields(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    const names = (await PDFDocument.load(again))
      .getForm()
      .getFields()
      .map((field) => field.getName())
      .sort()
    expect(names).toEqual([textFieldNameForPage(0), textFieldNameForPage(0, 2)])
    await expect(addTextFields(bytes, [])).rejects.toThrow(/ô chữ/)
  })

  it('adds a sticky-note annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(STICKY_NOTE_COLOR.g).toBeGreaterThan(STICKY_NOTE_COLOR.b)
    const noted = await addStickyNotes(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(noted)).toBe(1)
    const doc = await PDFDocument.load(noted)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('Text'))
    expect(annot.lookup(PDFName.of('Name'), PDFName)).toBe(PDFName.of('Comment'))
    const blank = await addStickyNotes(bytes, [0], OVERLAY_PRESETS.center, 'line')
    expect((await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(1)
    const pageNote = await addStickyNotes(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageNote)).toBe(1)
    const again = await addStickyNotes(noted, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addStickyNotes(bytes, [])).rejects.toThrow(/ghi chú/)
  })

  it('adds a fillable checkbox at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(checkboxNameForPage(0)).toBe(`${CHECKBOX_PREFIX}.p1`)
    expect(checkboxNameForPage(0, 2)).toBe(`${CHECKBOX_PREFIX}.p1s2`)
    expect(CHECKBOX_FILL.b).toBeGreaterThan(CHECKBOX_FILL.r)
    const filled = await addCheckboxes(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'x')
    expect(await pageCount(filled)).toBe(1)
    const form = (await PDFDocument.load(filled)).getForm()
    expect(form.getFields()).toHaveLength(1)
    expect(form.getCheckBox(checkboxNameForPage(0)).isChecked()).toBe(true)
    const blank = await addCheckboxes(bytes, [0], OVERLAY_PRESETS.center, 'line')
    expect((await PDFDocument.load(blank)).getForm().getCheckBox(checkboxNameForPage(0)).isChecked()).toBe(
      false,
    )
    const pageBox = await addCheckboxes(bytes, [0], OVERLAY_PRESETS.center, 'page', 'on')
    expect((await PDFDocument.load(pageBox)).getForm().getCheckBox(checkboxNameForPage(0)).isChecked()).toBe(
      true,
    )
    const again = await addCheckboxes(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    const names = (await PDFDocument.load(again))
      .getForm()
      .getFields()
      .map((field) => field.getName())
      .sort()
    expect(names).toEqual([checkboxNameForPage(0), checkboxNameForPage(0, 2)])
    await expect(addCheckboxes(bytes, [])).rejects.toThrow(/hộp chọn/)
  })

  it('adds a file attachment at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(attachmentNameForPage(0)).toBe(`${ATTACHMENT_PREFIX}.p1`)
    expect(attachmentNameForPage(0, 2)).toBe(`${ATTACHMENT_PREFIX}.p1s2`)
    expect(ATTACHMENT_ICON).toBe('Paperclip')
    const filled = await addFileAttachments(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'x')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('FileAttachment'))
    expect(annot.lookup(PDFName.of('Name'), PDFName)).toBe(PDFName.of('Paperclip'))
    const blank = await addFileAttachments(bytes, [0], OVERLAY_PRESETS.center, 'line')
    expect((await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(
      1,
    )
    const pageBox = await addFileAttachments(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addFileAttachments(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addFileAttachments(bytes, [])).rejects.toThrow(/đính kèm/)
  })

  it('lists and extracts file attachments from selected pages', async () => {
    const bytes = await samplePdf(['Note'])
    expect(embeddedAttachmentName('demo.pdf', 0, 0, 'smartread.attach.p1.txt')).toBe(
      'demo-trang-1-dinh-kem-1.txt',
    )
    expect(embeddedAttachmentZipName('demo.pdf')).toBe('demo-dinh-kem.zip')
    await expect(listFileAttachments(bytes, [0])).resolves.toEqual([])
    await expect(extractFileAttachments(bytes, [0])).rejects.toThrow(/đính kèm/)
    await expect(extractFileAttachments(bytes, [])).rejects.toThrow(/đính kèm/)
    const filled = await addFileAttachments(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'hello')
    const listed = await listFileAttachments(filled, [0])
    expect(listed).toHaveLength(1)
    expect(listed[0]!.name).toBe(`${attachmentNameForPage(0)}.txt`)
    expect(listed[0]!.pageIndex).toBe(0)
    expect(listed[0]!.attachmentIndex).toBe(0)
    expect(new TextDecoder().decode(listed[0]!.bytes)).toBe('hello')
    const blank = await addFileAttachments(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const emptyFile = await extractFileAttachments(blank, [0])
    expect(emptyFile).toHaveLength(1)
    expect(emptyFile[0]!.bytes).toHaveLength(0)
    const again = await addFileAttachments(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    const two = await extractFileAttachments(again, [0])
    expect(two).toHaveLength(2)
    expect(two.map((file) => new TextDecoder().decode(file.bytes))).toEqual(['hello', 'More'])
  })

  it('adds a fillable radio button at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(radioNameForPage(0)).toBe(`${RADIO_PREFIX}.p1`)
    expect(radioNameForPage(0, 2)).toBe(`${RADIO_PREFIX}.p1s2`)
    expect(RADIO_FILL.r).toBeGreaterThan(RADIO_FILL.b)
    const filled = await addRadioButtons(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'x')
    expect(await pageCount(filled)).toBe(1)
    const form = (await PDFDocument.load(filled)).getForm()
    expect(form.getFields()).toHaveLength(1)
    expect(form.getRadioGroup(radioNameForPage(0)).getSelected()).toBe(RADIO_OPTION)
    const blank = await addRadioButtons(bytes, [0], OVERLAY_PRESETS.center, 'line')
    expect((await PDFDocument.load(blank)).getForm().getRadioGroup(radioNameForPage(0)).getSelected()).toBe(
      undefined,
    )
    const pageBox = await addRadioButtons(bytes, [0], OVERLAY_PRESETS.center, 'page', 'on')
    expect((await PDFDocument.load(pageBox)).getForm().getRadioGroup(radioNameForPage(0)).getSelected()).toBe(
      RADIO_OPTION,
    )
    const again = await addRadioButtons(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    const names = (await PDFDocument.load(again))
      .getForm()
      .getFields()
      .map((field) => field.getName())
      .sort()
    expect(names).toEqual([radioNameForPage(0), radioNameForPage(0, 2)])
    await expect(addRadioButtons(bytes, [])).rejects.toThrow(/nút chọn/)
  })

  it('adds a fillable dropdown at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(dropdownNameForPage(0)).toBe(`${DROPDOWN_PREFIX}.p1`)
    expect(dropdownNameForPage(0, 2)).toBe(`${DROPDOWN_PREFIX}.p1s2`)
    expect(DROPDOWN_FILL.b).toBeGreaterThan(DROPDOWN_FILL.r)
    const filled = await addDropdowns(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'x')
    expect(await pageCount(filled)).toBe(1)
    const form = (await PDFDocument.load(filled)).getForm()
    expect(form.getFields()).toHaveLength(1)
    expect(form.getDropdown(dropdownNameForPage(0)).getSelected()).toEqual([DROPDOWN_OPTION])
    const blank = await addDropdowns(bytes, [0], OVERLAY_PRESETS.center, 'line')
    expect((await PDFDocument.load(blank)).getForm().getDropdown(dropdownNameForPage(0)).getSelected()).toEqual(
      [],
    )
    const pageBox = await addDropdowns(bytes, [0], OVERLAY_PRESETS.center, 'page', 'on')
    expect((await PDFDocument.load(pageBox)).getForm().getDropdown(dropdownNameForPage(0)).getSelected()).toEqual(
      [DROPDOWN_OPTION],
    )
    const again = await addDropdowns(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    const names = (await PDFDocument.load(again))
      .getForm()
      .getFields()
      .map((field) => field.getName())
      .sort()
    expect(names).toEqual([dropdownNameForPage(0), dropdownNameForPage(0, 2)])
    await expect(addDropdowns(bytes, [])).rejects.toThrow(/danh sách/)
  })

  it('adds a fillable option list at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(optionListNameForPage(0)).toBe(`${OPTION_LIST_PREFIX}.p1`)
    expect(optionListNameForPage(0, 2)).toBe(`${OPTION_LIST_PREFIX}.p1s2`)
    expect(OPTION_LIST_FILL.g).toBeGreaterThan(OPTION_LIST_FILL.r)
    const filled = await addOptionLists(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'x')
    expect(await pageCount(filled)).toBe(1)
    const form = (await PDFDocument.load(filled)).getForm()
    expect(form.getFields()).toHaveLength(1)
    expect(form.getOptionList(optionListNameForPage(0)).getSelected()).toEqual([OPTION_LIST_OPTION])
    const blank = await addOptionLists(bytes, [0], OVERLAY_PRESETS.center, 'line')
    expect((await PDFDocument.load(blank)).getForm().getOptionList(optionListNameForPage(0)).getSelected()).toEqual(
      [],
    )
    const pageBox = await addOptionLists(bytes, [0], OVERLAY_PRESETS.center, 'page', 'on')
    expect((await PDFDocument.load(pageBox)).getForm().getOptionList(optionListNameForPage(0)).getSelected()).toEqual(
      [OPTION_LIST_OPTION],
    )
    const again = await addOptionLists(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    const names = (await PDFDocument.load(again))
      .getForm()
      .getFields()
      .map((field) => field.getName())
      .sort()
    expect(names).toEqual([optionListNameForPage(0), optionListNameForPage(0, 2)])
    await expect(addOptionLists(bytes, [])).rejects.toThrow(/hộp liệt kê/)
  })

  it('adds a URI link annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(linkUriFromOverlay('')).toBe(LINK_DEFAULT_URI)
    expect(linkUriFromOverlay(' https://example.com ')).toBe('https://example.com')
    expect(LINK_BORDER.b).toBeGreaterThan(LINK_BORDER.r)
    const filled = await addLinkAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'https://example.com')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('Link'))
    const action = annot.lookup(PDFName.of('A'), PDFDict)
    expect(action.lookup(PDFName.of('S'), PDFName)).toBe(PDFName.of('URI'))
    const uri = action.lookup(PDFName.of('URI'))
    expect(uri instanceof PDFHexString || uri instanceof PDFString).toBe(true)
    expect((uri as PDFHexString | PDFString).decodeText()).toBe('https://example.com')
    const blank = await addLinkAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankUri = (await PDFDocument.load(blank)).context.lookup(blankAnnot.get(0), PDFDict).lookup(PDFName.of('A'), PDFDict).lookup(PDFName.of('URI'))
    expect((blankUri as PDFHexString | PDFString).decodeText()).toBe(LINK_DEFAULT_URI)
    const pageBox = await addLinkAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'https://smart-read.local')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addLinkAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'https://more.example')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addLinkAnnotations(bytes, [])).rejects.toThrow(/liên kết/)
  })

  it('adds a stamp annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(STAMP_NAME).toBe('Draft')
    expect(STAMP_COLOR.r).toBeGreaterThan(STAMP_COLOR.g)
    const filled = await addStampAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('Stamp'))
    expect(annot.lookup(PDFName.of('Name'), PDFName)).toBe(PDFName.of(STAMP_NAME))
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blank = await addStampAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addStampAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addStampAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addStampAnnotations(bytes, [])).rejects.toThrow(/đóng dấu/)
  })

  it('adds a free-text annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(FREETEXT_DA).toContain('/Helv')
    expect(FREETEXT_COLOR.b).toBeGreaterThan(FREETEXT_COLOR.g)
    const filled = await addFreeTextAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('FreeText'))
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const da = annot.lookup(PDFName.of('DA'))
    expect(da instanceof PDFHexString || da instanceof PDFString).toBe(true)
    expect((da as PDFHexString | PDFString).decodeText()).toBe(FREETEXT_DA)
    const blank = await addFreeTextAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addFreeTextAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addFreeTextAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addFreeTextAnnotations(bytes, [])).rejects.toThrow(/chữ tự do/)
  })

  it('adds a caret annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(CARET_SY).toBe('P')
    expect(CARET_COLOR.g).toBeGreaterThan(CARET_COLOR.r)
    const filled = await addCaretAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('Caret'))
    expect(annot.lookup(PDFName.of('Sy'), PDFName)).toBe(PDFName.of(CARET_SY))
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blank = await addCaretAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addCaretAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addCaretAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addCaretAnnotations(bytes, [])).rejects.toThrow(/dấu chèn/)
  })

  it('adds an ink annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(INK_COLOR.b).toBeGreaterThan(INK_COLOR.g)
    const box = { x: 10, y: 20, width: 100, height: 50 }
    expect(inkPathForBox(box)).toHaveLength(8)
    expect(inkPathForBox(box)[0]).toBeCloseTo(22)
    const filled = await addInkAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('Ink'))
    const inkList = annot.lookup(PDFName.of('InkList'), PDFArray)
    expect(inkList.size()).toBe(1)
    expect(inkList.lookup(0, PDFArray).size()).toBe(8)
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blank = await addInkAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addInkAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addInkAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addInkAnnotations(bytes, [])).rejects.toThrow(/nét mực/)
  })

  it('adds a square annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(SQUARE_COLOR.r).toBeGreaterThan(SQUARE_COLOR.g)
    expect(SQUARE_FILL.r).toBeGreaterThan(SQUARE_COLOR.r)
    const filled = await addSquareAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('Square'))
    expect(annot.lookup(PDFName.of('IC'), PDFArray).size()).toBe(3)
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blank = await addSquareAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addSquareAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addSquareAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addSquareAnnotations(bytes, [])).rejects.toThrow(/hình vuông/)
  })

  it('adds a circle annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(CIRCLE_COLOR.g).toBeGreaterThan(CIRCLE_COLOR.r)
    expect(CIRCLE_FILL.g).toBeGreaterThan(CIRCLE_COLOR.g)
    const ops = circleEllipseOps(100, 50, 2)
    expect(ops).toContain(' c')
    expect(ops).toContain(' m')
    const filled = await addCircleAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('Circle'))
    expect(annot.lookup(PDFName.of('IC'), PDFArray).size()).toBe(3)
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blank = await addCircleAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addCircleAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addCircleAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addCircleAnnotations(bytes, [])).rejects.toThrow(/hình tròn/)
  })

  it('adds a polygon annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(POLYGON_COLOR.b).toBeGreaterThan(POLYGON_COLOR.r)
    expect(POLYGON_FILL.b).toBeGreaterThan(POLYGON_COLOR.b)
    const ops = polygonPathOps(100, 50, 2)
    expect(ops).toContain(' m')
    expect(ops).toContain(' l')
    expect(ops.endsWith(' h')).toBe(true)
    const verts = polygonVerticesForBox({ x: 10, y: 20, width: 40, height: 30 })
    expect(verts).toHaveLength(8)
    const filled = await addPolygonAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('Polygon'))
    expect(annot.lookup(PDFName.of('IC'), PDFArray).size()).toBe(3)
    expect(annot.lookup(PDFName.of('Vertices'), PDFArray).size()).toBe(8)
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blank = await addPolygonAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addPolygonAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addPolygonAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addPolygonAnnotations(bytes, [])).rejects.toThrow(/đa giác/)
  })

  it('adds a polyline annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(POLYLINE_COLOR.r).toBeGreaterThan(POLYLINE_COLOR.b)
    expect(POLYLINE_COLOR.g).toBeGreaterThan(POLYLINE_COLOR.b)
    const ops = polylinePathOps(100, 50, 2)
    expect(ops).toContain(' m')
    expect(ops).toContain(' l')
    expect(ops.endsWith(' h')).toBe(false)
    const verts = polylineVerticesForBox({ x: 10, y: 20, width: 40, height: 30 })
    expect(verts).toHaveLength(8)
    const filled = await addPolylineAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('PolyLine'))
    expect(annot.lookup(PDFName.of('Vertices'), PDFArray).size()).toBe(8)
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blank = await addPolylineAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addPolylineAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addPolylineAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addPolylineAnnotations(bytes, [])).rejects.toThrow(/đường gấp/)
  })

  it('adds a line annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(LINE_COLOR.b).toBeGreaterThan(LINE_COLOR.r)
    expect(LINE_COLOR.g).toBeGreaterThan(LINE_COLOR.r)
    const ops = linePathOps(100, 50, 2)
    expect(ops).toContain(' m')
    expect(ops).toContain(' l')
    expect(ops.endsWith(' h')).toBe(false)
    const ends = lineEndpointsForBox({ x: 10, y: 20, width: 40, height: 30 })
    expect(ends).toHaveLength(4)
    expect(ends).toEqual([10, 20, 50, 50])
    const filled = await addLineAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('Line'))
    expect(annot.lookup(PDFName.of('L'), PDFArray).size()).toBe(4)
    expect(annot.lookupMaybe(PDFName.of('Vertices'), PDFArray)).toBeUndefined()
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blank = await addLineAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addLineAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addLineAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addLineAnnotations(bytes, [])).rejects.toThrow(/đường thẳng/)
  })

  it('adds a squiggly underline annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(SQUIGGLY_COLOR.g).toBeGreaterThan(SQUIGGLY_COLOR.r)
    expect(SQUIGGLY_COLOR.g).toBeGreaterThan(SQUIGGLY_COLOR.b)
    const ops = squigglyPathOps(100, 50, 2)
    expect(ops).toContain(' m')
    expect(ops).toContain(' l')
    expect(ops.endsWith(' h')).toBe(false)
    const quads = squigglyQuadPointsForBox({ x: 10, y: 20, width: 40, height: 30 })
    expect(quads).toHaveLength(8)
    expect(quads).toEqual([10, 20, 50, 20, 50, 50, 10, 50])
    const filled = await addSquigglyAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('Squiggly'))
    expect(annot.lookup(PDFName.of('QuadPoints'), PDFArray).size()).toBe(8)
    expect(annot.lookupMaybe(PDFName.of('Vertices'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('L'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('IC'), PDFArray)).toBeUndefined()
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blank = await addSquigglyAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addSquigglyAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addSquigglyAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addSquigglyAnnotations(bytes, [])).rejects.toThrow(/gạch sóng/)
  })

  it('adds a highlight annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(HIGHLIGHT_ANNOT_COLOR.r).toBe(1)
    expect(HIGHLIGHT_ANNOT_COLOR.g).toBeGreaterThan(HIGHLIGHT_ANNOT_COLOR.b)
    expect(HIGHLIGHT_ANNOT_COLOR.g).toBeLessThan(HIGHLIGHT_ANNOT_COLOR.r)
    const ops = highlightPathOps(100, 50, 2)
    expect(ops).toContain(' re')
    expect(ops.endsWith(' h')).toBe(false)
    const quads = highlightQuadPointsForBox({ x: 10, y: 20, width: 40, height: 30 })
    expect(quads).toHaveLength(8)
    expect(quads).toEqual([10, 20, 50, 20, 50, 50, 10, 50])
    const filled = await addHighlightAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('Highlight'))
    expect(annot.lookup(PDFName.of('QuadPoints'), PDFArray).size()).toBe(8)
    expect(annot.lookupMaybe(PDFName.of('Vertices'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('L'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('IC'), PDFArray)).toBeUndefined()
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blank = await addHighlightAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addHighlightAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addHighlightAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addHighlightAnnotations(bytes, [])).rejects.toThrow(/tô sáng/)
  })

  it('adds an underline annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(UNDERLINE_ANNOT_COLOR.b).toBeGreaterThan(UNDERLINE_ANNOT_COLOR.g)
    expect(UNDERLINE_ANNOT_COLOR.g).toBeGreaterThan(UNDERLINE_ANNOT_COLOR.r)
    const ops = underlineAnnotPathOps(100, 50, 2)
    expect(ops).toContain(' m ')
    expect(ops).toContain(' l')
    expect(ops.includes(' re')).toBe(false)
    expect(ops.endsWith(' h')).toBe(false)
    const quads = underlineAnnotQuadPointsForBox({ x: 10, y: 20, width: 40, height: 30 })
    expect(quads).toHaveLength(8)
    expect(quads).toEqual([10, 20, 50, 20, 50, 50, 10, 50])
    const filled = await addUnderlineAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('Underline'))
    expect(annot.lookup(PDFName.of('QuadPoints'), PDFArray).size()).toBe(8)
    expect(annot.lookupMaybe(PDFName.of('Vertices'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('L'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('IC'), PDFArray)).toBeUndefined()
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blank = await addUnderlineAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addUnderlineAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addUnderlineAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addUnderlineAnnotations(bytes, [])).rejects.toThrow(/gạch dưới/)
  })

  it('adds a strikeout annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(STRIKEOUT_ANNOT_COLOR.r).toBeGreaterThan(STRIKEOUT_ANNOT_COLOR.g)
    expect(STRIKEOUT_ANNOT_COLOR.r).toBeGreaterThan(STRIKEOUT_ANNOT_COLOR.b)
    const ops = strikeoutAnnotPathOps(100, 50, 2)
    expect(ops).toContain(' m ')
    expect(ops).toContain(' l')
    expect(ops.includes(' re')).toBe(false)
    expect(ops.endsWith(' h')).toBe(false)
    const quads = strikeoutAnnotQuadPointsForBox({ x: 10, y: 20, width: 40, height: 30 })
    expect(quads).toHaveLength(8)
    expect(quads).toEqual([10, 20, 50, 20, 50, 50, 10, 50])
    const filled = await addStrikeoutAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('StrikeOut'))
    expect(annot.lookup(PDFName.of('QuadPoints'), PDFArray).size()).toBe(8)
    expect(annot.lookupMaybe(PDFName.of('Vertices'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('L'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('IC'), PDFArray)).toBeUndefined()
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blank = await addStrikeoutAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addStrikeoutAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addStrikeoutAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addStrikeoutAnnotations(bytes, [])).rejects.toThrow(/gạch xóa/)
  })

  it('adds a redact annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(REDACT_ANNOT_COLOR.r).toBeLessThan(0.2)
    expect(REDACT_ANNOT_COLOR.g).toBeLessThan(0.2)
    expect(REDACT_ANNOT_COLOR.b).toBeLessThan(0.2)
    const ops = redactAnnotPathOps(100, 50, 2)
    expect(ops).toContain(' re')
    expect(ops.endsWith(' h')).toBe(false)
    const quads = redactAnnotQuadPointsForBox({ x: 10, y: 20, width: 40, height: 30 })
    expect(quads).toHaveLength(8)
    expect(quads).toEqual([10, 20, 50, 20, 50, 50, 10, 50])
    const filled = await addRedactAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('Redact'))
    expect(annot.lookup(PDFName.of('QuadPoints'), PDFArray).size()).toBe(8)
    expect(annot.lookupMaybe(PDFName.of('Vertices'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('L'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('IC'), PDFArray)).toBeUndefined()
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blank = await addRedactAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addRedactAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addRedactAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addRedactAnnotations(bytes, [])).rejects.toThrow(/che hẳn/)
  })

  it('attaches a popup annotation to an existing sticky note at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(POPUP_COLOR.g).toBeGreaterThan(POPUP_COLOR.b)
    await expect(addPopupAnnotations(bytes, [0])).rejects.toThrow(/ghi chú/)
    const noted = await addStickyNotes(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    const filled = await addPopupAnnotations(noted, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(2)
    const noteRef = annots.get(0)
    const popupRef = annots.get(1)
    expect(noteRef).toBeInstanceOf(PDFRef)
    expect(popupRef).toBeInstanceOf(PDFRef)
    const note = doc.context.lookup(noteRef as PDFRef, PDFDict)
    const popup = doc.context.lookup(popupRef as PDFRef, PDFDict)
    expect(note.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('Text'))
    expect(popup.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('Popup'))
    expect(note.get(PDFName.of('Popup'))).toBe(popupRef)
    expect(popup.get(PDFName.of('Parent'))).toBe(noteRef)
    expect(popup.lookupMaybe(PDFName.of('QuadPoints'), PDFArray)).toBeUndefined()
    expect(popup.lookupMaybe(PDFName.of('Vertices'), PDFArray)).toBeUndefined()
    expect(popup.lookupMaybe(PDFName.of('L'), PDFArray)).toBeUndefined()
    expect(popup.lookupMaybe(PDFName.of('IC'), PDFArray)).toBeUndefined()
    expect(popup.lookupMaybe(PDFName.of('AP'), PDFDict)).toBeUndefined()
    const contents = popup.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blankNoted = await addStickyNotes(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blank = await addPopupAnnotations(blankNoted, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(2)
    const blankPopup = (await PDFDocument.load(blank)).context.lookup(blankAnnot.get(1), PDFDict)
    expect(blankPopup.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('Popup'))
    expect((blankPopup.lookup(PDFName.of('Contents')) as PDFHexString | PDFString).decodeText()).toBe('')
    const pageNoted = await addStickyNotes(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    const pageBox = await addPopupAnnotations(pageNoted, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    await expect(addPopupAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')).rejects.toThrow(
      /cửa sổ/,
    )
    await expect(addPopupAnnotations(bytes, [])).rejects.toThrow(/cửa sổ/)
  })

  it('adds a watermark annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(WATERMARK_ANNOT_COLOR.b).toBeGreaterThan(WATERMARK_ANNOT_COLOR.r)
    const ops = watermarkAnnotPathOps(100, 50, 2)
    expect(ops).toContain(' re')
    expect(ops.endsWith(' h')).toBe(false)
    const filled = await addWatermarkAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('Watermark'))
    expect(annot.lookupMaybe(PDFName.of('QuadPoints'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('Vertices'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('L'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('IC'), PDFArray)).toBeUndefined()
    expect(annot.lookup(PDFName.of('FixedPrint'), PDFDict)).toBeTruthy()
    expect(annot.lookup(PDFName.of('AP'), PDFDict)).toBeTruthy()
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blank = await addWatermarkAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addWatermarkAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addWatermarkAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addWatermarkAnnotations(bytes, [])).rejects.toThrow(/dấu nước/)
  })

  it('adds a screen annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(SCREEN_COLOR.g).toBeGreaterThan(SCREEN_COLOR.r)
    const ops = screenAnnotPathOps(100, 50, 2)
    expect(ops).toContain(' re')
    expect(ops.endsWith(' h')).toBe(false)
    const filled = await addScreenAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('Screen'))
    expect(annot.lookupMaybe(PDFName.of('QuadPoints'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('Vertices'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('L'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('IC'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('FixedPrint'), PDFDict)).toBeUndefined()
    expect(annot.lookup(PDFName.of('AP'), PDFDict)).toBeTruthy()
    expect(annot.lookup(PDFName.of('MK'), PDFDict)).toBeTruthy()
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blank = await addScreenAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addScreenAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addScreenAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addScreenAnnotations(bytes, [])).rejects.toThrow(/màn hình/)
  })

  it('adds a sound annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(SOUND_COLOR.r).toBeGreaterThan(SOUND_COLOR.g)
    const ops = soundAnnotPathOps(100, 50, 2)
    expect(ops).toContain(' m ')
    expect(ops.endsWith(' h')).toBe(true)
    const filled = await addSoundAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('Sound'))
    expect(annot.lookup(PDFName.of('Name'), PDFName)).toBe(PDFName.of('Speaker'))
    expect(annot.lookup(PDFName.of('Sound'))).toBeTruthy()
    expect(annot.get(PDFName.of('Sound'))).toBeInstanceOf(PDFRef)
    expect(annot.lookupMaybe(PDFName.of('QuadPoints'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('Vertices'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('L'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('IC'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('MK'), PDFDict)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('FixedPrint'), PDFDict)).toBeUndefined()
    expect(annot.lookup(PDFName.of('AP'), PDFDict)).toBeTruthy()
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blank = await addSoundAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addSoundAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addSoundAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addSoundAnnotations(bytes, [])).rejects.toThrow(/âm thanh/)
  })

  it('adds a movie annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(MOVIE_COLOR.r).toBeGreaterThan(MOVIE_COLOR.g)
    const ops = movieAnnotPathOps(100, 50, 2)
    expect(ops).toContain(' m ')
    expect(ops.endsWith(' h')).toBe(true)
    const filled = await addMovieAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('Movie'))
    expect(annot.lookup(PDFName.of('Movie'), PDFDict)).toBeTruthy()
    expect(annot.lookup(PDFName.of('A'), PDFDict)).toBeTruthy()
    expect(annot.lookupMaybe(PDFName.of('Name'), PDFName)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('Sound'), PDFRef)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('QuadPoints'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('Vertices'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('L'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('IC'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('MK'), PDFDict)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('FixedPrint'), PDFDict)).toBeUndefined()
    expect(annot.lookup(PDFName.of('AP'), PDFDict)).toBeTruthy()
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blank = await addMovieAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addMovieAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addMovieAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addMovieAnnotations(bytes, [])).rejects.toThrow(/phim/)
  })

  it('adds a rich media annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(RICH_MEDIA_COLOR.g).toBeGreaterThan(RICH_MEDIA_COLOR.r)
    const ops = richMediaAnnotPathOps(100, 50, 2)
    expect(ops).toContain(' m ')
    expect(ops.endsWith(' h')).toBe(true)
    const filled = await addRichMediaAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('RichMedia'))
    expect(annot.lookup(PDFName.of('RichMediaContent'), PDFDict)).toBeTruthy()
    expect(annot.lookup(PDFName.of('RichMediaSettings'), PDFDict)).toBeTruthy()
    expect(annot.lookupMaybe(PDFName.of('Movie'), PDFDict)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('Sound'), PDFRef)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('Name'), PDFName)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('QuadPoints'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('Vertices'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('L'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('IC'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('MK'), PDFDict)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('FixedPrint'), PDFDict)).toBeUndefined()
    expect(annot.lookup(PDFName.of('AP'), PDFDict)).toBeTruthy()
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blank = await addRichMediaAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addRichMediaAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addRichMediaAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addRichMediaAnnotations(bytes, [])).rejects.toThrow(/phương tiện/)
  })

  it('adds a 3D annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(THREE_D_COLOR.r).toBeGreaterThan(THREE_D_COLOR.g)
    const ops = threeDAnnotPathOps(100, 50, 2)
    expect(ops).toContain(' m ')
    expect(ops.endsWith(' h')).toBe(true)
    const filled = await addThreeDAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('3D'))
    expect(annot.lookup(PDFName.of('3DD'))).toBeTruthy()
    expect(annot.lookup(PDFName.of('3DA'), PDFDict)).toBeTruthy()
    expect(annot.lookupMaybe(PDFName.of('Movie'), PDFDict)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('Sound'), PDFRef)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('Name'), PDFName)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('RichMediaContent'), PDFDict)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('QuadPoints'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('Vertices'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('L'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('IC'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('MK'), PDFDict)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('FixedPrint'), PDFDict)).toBeUndefined()
    expect(annot.lookup(PDFName.of('AP'), PDFDict)).toBeTruthy()
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blank = await addThreeDAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addThreeDAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addThreeDAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addThreeDAnnotations(bytes, [])).rejects.toThrow(/mô hình/)
  })

  it('adds a printer mark annotation at the overlay box', async () => {
    const bytes = await samplePdf(['Note'])
    expect(PRINTER_MARK_COLOR.g).toBeGreaterThan(PRINTER_MARK_COLOR.r)
    const ops = printerMarkPathOps(100, 50, 2)
    expect(ops).toContain(' m ')
    expect(ops.endsWith(' h')).toBe(true)
    const filled = await addPrinterMarkAnnotations(bytes, [0], OVERLAY_PRESETS['top-left'], 'block', 'Hello')
    expect(await pageCount(filled)).toBe(1)
    const doc = await PDFDocument.load(filled)
    const annots = doc.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(annots.size()).toBe(1)
    const annot = doc.context.lookup(annots.get(0), PDFDict)
    expect(annot.lookup(PDFName.of('Subtype'), PDFName)).toBe(PDFName.of('PrinterMark'))
    expect(annot.lookup(PDFName.of('MN'), PDFName)).toBe(PDFName.of('Registration'))
    expect(annot.lookupMaybe(PDFName.of('Movie'), PDFDict)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('Sound'), PDFRef)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('Name'), PDFName)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('RichMediaContent'), PDFDict)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('3DD'), PDFRef)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('QuadPoints'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('Vertices'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('L'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('IC'), PDFArray)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('MK'), PDFDict)).toBeUndefined()
    expect(annot.lookupMaybe(PDFName.of('FixedPrint'), PDFDict)).toBeUndefined()
    expect(annot.lookup(PDFName.of('AP'), PDFDict)).toBeTruthy()
    const contents = annot.lookup(PDFName.of('Contents'))
    expect(contents instanceof PDFHexString || contents instanceof PDFString).toBe(true)
    expect((contents as PDFHexString | PDFString).decodeText()).toBe('Hello')
    const blank = await addPrinterMarkAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'line')
    const blankAnnot = (await PDFDocument.load(blank)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray)
    expect(blankAnnot.size()).toBe(1)
    const blankContents = (await PDFDocument.load(blank)).context
      .lookup(blankAnnot.get(0), PDFDict)
      .lookup(PDFName.of('Contents'))
    expect((blankContents as PDFHexString | PDFString).decodeText()).toBe('')
    const pageBox = await addPrinterMarkAnnotations(bytes, [0], OVERLAY_PRESETS.center, 'page', 'Page')
    expect(await pageCount(pageBox)).toBe(1)
    const again = await addPrinterMarkAnnotations(filled, [0], OVERLAY_PRESETS['bottom-right'], 'line', 'More')
    expect((await PDFDocument.load(again)).getPage(0).node.lookup(PDFName.of('Annots'), PDFArray).size()).toBe(2)
    await expect(addPrinterMarkAnnotations(bytes, [])).rejects.toThrow(/dấu in/)
  })

  it('duplicates selected pages after the last selected index', async () => {
    const bytes = await samplePdf(['A', 'B', 'C'])
    expect(duplicatedIndexes([0, 2])).toEqual([3, 4])
    const duplicated = await duplicatePages(bytes, [0, 2])
    expect(await pageCount(duplicated)).toBe(5)
    await expect(duplicatePages(bytes, [])).rejects.toThrow(/nhân bản/)
  })

  it('reverses page order and stamps page numbers', async () => {
    const bytes = await samplePdf(['A', 'B', 'C'])
    expect(reversedIndexes(3, [0, 2])).toEqual([0, 2])
    expect(reversedIndexes(3, [0])).toEqual([2])
    const reversed = await reversePages(bytes)
    expect(await pageCount(reversed)).toBe(3)
    const identity = await reversePages(await samplePdf(['Only']))
    expect(await pageCount(identity)).toBe(1)
    expect(formatPageNumber(0, 4, 'n')).toBe('1')
    expect(formatPageNumber(1, 4, 'n-of-total')).toBe('2 / 4')
    expect(formatPageNumber(2, 4, 'trang-n')).toBe('Trang 3')
    const numbered = await addPageNumbers(bytes, {
      indexes: [0, 2],
      position: 'bottom-center',
      style: 'n-of-total',
    })
    expect(await pageCount(numbered)).toBe(3)
    await expect(addPageNumbers(bytes, { indexes: [] })).resolves.toBeTruthy()
  })

  it('extracts selected pages into a new PDF and inserts a blank page', async () => {
    const bytes = await samplePdf(['A', 'B', 'C'])
    const extracted = await extractPages(bytes, [0, 2])
    expect(await pageCount(extracted)).toBe(2)
    await expect(extractPages(bytes, [])).rejects.toThrow(/tách/)
    const withBlank = await insertBlankPage(bytes, 0)
    expect(await pageCount(withBlank)).toBe(4)
    const first = (await PDFDocument.load(bytes)).getPage(0).getSize()
    const blank = (await PDFDocument.load(withBlank)).getPage(1).getSize()
    expect(blank.width).toBe(first.width)
    expect(blank.height).toBe(first.height)
  })

  it('keeps only selected pages and splits every N pages', async () => {
    const bytes = await samplePdf(['A', 'B', 'C', 'D', 'E'])
    const kept = await keepPages(bytes, [0, 2, 4])
    expect(await pageCount(kept)).toBe(3)
    const identity = await keepPages(bytes, [0, 1, 2, 3, 4])
    expect(identity).toBe(bytes)
    await expect(keepPages(bytes, [])).rejects.toThrow(/giữ/)
    const parts = await splitEvery(bytes, 2)
    expect(parts).toHaveLength(3)
    expect(await pageCount(parts[0]!)).toBe(2)
    expect(await pageCount(parts[1]!)).toBe(2)
    expect(await pageCount(parts[2]!)).toBe(1)
    await expect(splitEvery(bytes, 0)).rejects.toThrow(/từ 1/)
    const zip = await zipPdfParts([
      { name: splitPartName('demo.pdf', 1, 2), bytes: parts[0]! },
      { name: splitPartName('demo.pdf', 2, 2), bytes: parts[1]! },
    ])
    const loaded = await JSZip.loadAsync(await zip.arrayBuffer())
    expect(loaded.file('demo-phan-1-cua-2.pdf')).toBeTruthy()
    expect(splitZipName('demo.pdf')).toBe('demo-tach.zip')
  })

  it('splits by top-level outline bookmarks and merges with a bookmark', async () => {
    const bytes = await samplePdf(['A', 'B', 'C', 'D'])
    expect(mergeBookmarkTitle('phu-luc.pdf')).toBe('phu-luc')
    expect(mergeBookmarkTitle('.pdf')).toBe('Tài liệu gộp')
    await expect(splitByOutline(bytes)).rejects.toThrow(/dấu trang/)
    const marked = await addOutlineBookmarks(bytes, [0], 'Mở đầu')
    const marked2 = await addOutlineBookmarks(marked, [2], 'Phần hai')
    expect(outlineSplitRanges(await listOutlineBookmarks(marked2), 4)).toEqual([
      { title: 'Mở đầu', start: 0, end: 2 },
      { title: 'Phần hai', start: 2, end: 4 },
    ])
    const late = await addOutlineBookmarks(bytes, [2], 'Giữa')
    expect(outlineSplitRanges(await listOutlineBookmarks(late), 4)).toEqual([
      { title: 'Trang đầu', start: 0, end: 2 },
      { title: 'Giữa', start: 2, end: 4 },
    ])
    const parts = await splitByOutline(marked2)
    expect(parts).toHaveLength(2)
    expect(parts[0]!.title).toBe('Mở đầu')
    expect(await pageCount(parts[0]!.bytes)).toBe(2)
    expect(await pageCount(parts[1]!.bytes)).toBe(2)
    expect(outlineSplitPartName('demo.pdf', 'Phần hai', 2, 2)).toBe('demo-phan-2-Phần-hai.pdf')
    expect(outlineSplitZipName('demo.pdf')).toBe('demo-tach-muc-luc.zip')
    const extra = await samplePdf(['X'])
    const merged = await mergePdfWithBookmark(bytes, extra, 'Phụ lục.pdf')
    expect(await pageCount(merged)).toBe(5)
    expect(await listOutlineBookmarks(merged)).toEqual([
      { title: 'Phụ lục', pageIndex: 4, depth: 0 },
    ])
    const front = await mergePdfWithBookmark(bytes, extra, 'Bìa', 0)
    expect((await listOutlineBookmarks(front))[0]).toEqual({
      title: 'Bìa',
      pageIndex: 0,
      depth: 0,
    })
  })

  it('keeps the selected outline item in the working document', async () => {
    const bytes = await samplePdf(['A', 'B', 'C', 'D'])
    await expect(keepOutlineItem(bytes, 0)).rejects.toThrow(/dấu trang/)
    const marked = await addOutlineBookmarks(bytes, [0], 'Mở đầu')
    const marked2 = await addOutlineBookmarks(marked, [2], 'Phần hai')
    const outline = await listOutlineBookmarks(marked2)
    expect(outlineItemRange(outline, 0, 4)).toEqual({ title: 'Mở đầu', start: 0, end: 2 })
    expect(outlineItemRange(outline, 1, 4)).toEqual({ title: 'Phần hai', start: 2, end: 4 })
    expect(() => outlineItemRange(outline, 9, 4)).toThrow(/mục lục/)
    const first = await keepOutlineItem(marked2, 0)
    expect(await pageCount(first)).toBe(2)
    const second = await keepOutlineItem(marked2, 1)
    expect(await pageCount(second)).toBe(2)
    const nested = await addOutlineFolder(bytes, [0, 1], 'Phần A')
    const withLater = await addOutlineBookmarks(nested, [2], 'Phần B')
    const nestedOutline = await listOutlineBookmarks(withLater)
    expect(outlineItemRange(nestedOutline, 0, 4)).toEqual({
      title: 'Phần A',
      start: 0,
      end: 2,
    })
    expect(outlineItemRange(nestedOutline, 2, 4)).toEqual({
      title: 'Phần A · 2',
      start: 1,
      end: 2,
    })
    const keptFolder = await keepOutlineItem(withLater, 0)
    expect(await pageCount(keptFolder)).toBe(2)
    const keptChild = await keepOutlineItem(withLater, 2)
    expect(await pageCount(keptChild)).toBe(1)
  })

  it('builds a PDF from imported text pages and wraps long lines', async () => {
    const pdf = await textPagesToPdf(['Hello', 'Page two'])
    expect(await pageCount(pdf)).toBe(2)
    expect(wrapPdfText('one two three', (value) => value.length, 7)).toEqual(['one two', 'three'])
    await expect(textPagesToPdf([])).rejects.toThrow(/nội dung/)
  })

  it('stamps a watermark and crops selected pages', async () => {
    const bytes = await samplePdf(['A', 'B'])
    expect(cropBoxAfterMargin({ x: 0, y: 0, width: 200, height: 280 }, 20)).toEqual({
      x: 20,
      y: 20,
      width: 160,
      height: 240,
    })
    expect(() => cropBoxAfterMargin({ x: 0, y: 0, width: 80, height: 80 }, 30)).toThrow(/Lề cắt/)
    const marked = await addWatermark(bytes, {
      text: 'DRAFT',
      indexes: [0],
      style: 'diagonal',
    })
    expect(await pageCount(marked)).toBe(2)
    const markedVi = await addWatermark(bytes, { text: 'Bản nháp', indexes: [1], style: 'footer' })
    expect(await pageCount(markedVi)).toBe(2)
    await expect(addWatermark(bytes, { text: '   ' })).rejects.toThrow(/chữ mờ/)
    const cropped = await cropPages(bytes, [1], CROP_MARGINS.medium)
    const before = (await PDFDocument.load(bytes)).getPage(1).getCropBox()
    const after = (await PDFDocument.load(cropped)).getPage(1).getCropBox()
    expect(after.width).toBeCloseTo(before.width - CROP_MARGINS.medium * 2)
    expect(after.height).toBeCloseTo(before.height - CROP_MARGINS.medium * 2)
    expect((await PDFDocument.load(cropped)).getPage(0).getCropBox().width).toBe(before.width)
    await expect(cropPages(bytes, [], 12)).rejects.toThrow(/cắt lề/)
    await expect(cropPages(bytes, [0], 90)).rejects.toThrow(/Lề cắt/)
    expect(paddedPageSize({ width: 200, height: 280 }, 12)).toEqual({
      width: 224,
      height: 304,
    })
    expect(() => paddedPageSize({ width: 200, height: 280 }, 0)).toThrow(/Lề thêm/)
    expect(() => paddedPageSize({ width: MAX_PADDED_SIDE, height: 40 }, 12)).toThrow(/quá lớn/)
    const padded = await padPages(bytes, [0], CROP_MARGINS.medium)
    const paddedDoc = await PDFDocument.load(padded)
    expect(paddedDoc.getPage(0).getSize()).toEqual({
      width: 200 + CROP_MARGINS.medium * 2,
      height: 280 + CROP_MARGINS.medium * 2,
    })
    expect(paddedDoc.getPage(1).getSize()).toEqual({ width: 200, height: 280 })
    await expect(padPages(bytes, [], 12)).rejects.toThrow(/thêm lề/)
    const headed = await addHeaderFooter(bytes, {
      header: 'Báo cáo',
      footer: 'Trang chân',
      indexes: [0],
    })
    expect(await pageCount(headed)).toBe(2)
    expect((await PDFDocument.load(headed)).getPage(1).getSize()).toEqual({
      width: 200,
      height: 280,
    })
    await expect(addHeaderFooter(bytes, { header: '  ', footer: '' })).rejects.toThrow(
      /đầu trang hoặc cuối trang/,
    )
    await expect(addHeaderFooter(bytes, { header: 'Hi', indexes: [9] })).rejects.toThrow(
      /đầu\/cuối trang/,
    )
  })

  it('unifies mixed page sizes onto one sheet', async () => {
    expect(unifiedPageSize([{ width: 200, height: 280 }, { width: 300, height: 240 }])).toEqual({
      width: 300,
      height: 280,
    })
    expect(pageSizeEquals({ width: 10, height: 10 }, { width: 10, height: 10 })).toBe(true)
    expect(pageSizeEquals({ width: 10, height: 10 }, { width: 11, height: 10 })).toBe(false)
    expect(() => unifiedPageSize([])).toThrow(/đồng khổ/)
    expect(() =>
      unifiedPageSize([{ width: MAX_PADDED_SIDE + 1, height: 40 }, { width: 12, height: 12 }]),
    ).toThrow(/quá lớn/)
    const mixed = await PDFDocument.create()
    for (const size of [
      [200, 280],
      [300, 240],
      [200, 280],
    ] as const) {
      const page = mixed.addPage([...size])
      page.drawText('P', { x: 24, y: 140, size: 12 })
    }
    const bytes = new Uint8Array(await mixed.save())
    const unified = await unifyPageSizes(bytes, [0, 1])
    const doc = await PDFDocument.load(unified)
    expect(doc.getPage(0).getSize()).toEqual({ width: 300, height: 280 })
    expect(doc.getPage(1).getSize()).toEqual({ width: 300, height: 280 })
    expect(doc.getPage(2).getSize()).toEqual({ width: 200, height: 280 })
    const same = await unifyPageSizes(bytes, [0, 2])
    expect(same).toBe(bytes)
    await expect(unifyPageSizes(bytes, [0])).rejects.toThrow(/đồng khổ/)
    await expect(unifyPageSizes(bytes, [])).rejects.toThrow(/đồng khổ/)
  })

  it('adds an A4 cover page and strokes an inset border', async () => {
    expect(borderBoxForPage({ width: 200, height: 280 }, 12)).toEqual({
      x: 12,
      y: 12,
      width: 176,
      height: 256,
    })
    expect(borderStrokeWidth(36)).toBeCloseTo(2)
    expect(() => borderBoxForPage({ width: 40, height: 40 }, 12)).toThrow(/Lề cắt/)
    expect(() => borderStrokeWidth(0)).toThrow(/Lề khung/)
    const bytes = await samplePdf(['A', 'B'])
    const bordered = await addPageBorder(bytes, [0], CROP_MARGINS.medium)
    expect(await pageCount(bordered)).toBe(2)
    expect((await PDFDocument.load(bordered)).getPage(1).getSize()).toEqual(
      (await PDFDocument.load(bytes)).getPage(1).getSize(),
    )
    await expect(addPageBorder(bytes, [], 12)).rejects.toThrow(/đóng khung/)
    await expect(addPageBorder(bytes, [0], 0)).rejects.toThrow(/Lề khung/)
    const covered = await addCoverPage(bytes, { title: 'Báo cáo', subtitle: '2026' })
    const coverDoc = await PDFDocument.load(covered)
    expect(coverDoc.getPageCount()).toBe(3)
    expect(coverDoc.getPage(0).getSize()).toEqual({ width: A4_WIDTH, height: A4_HEIGHT })
    expect(coverDoc.getPage(1).getSize()).toEqual((await PDFDocument.load(bytes)).getPage(0).getSize())
    await expect(addCoverPage(bytes, { title: '   ' })).rejects.toThrow(/tiêu đề trang bìa/)
  })

  it('overlays a reading tint and crops to ink bounds', async () => {
    expect(tintFill('cream')).toEqual(TINTS.cream)
    expect(() => tintFill('pink' as 'cream')).toThrow(/Màu đọc/)
    const bytes = await samplePdf(['A', 'B'])
    const tinted = await tintPages(bytes, [0], 'sepia')
    expect(await pageCount(tinted)).toBe(2)
    expect((await PDFDocument.load(tinted)).getPage(1).getSize()).toEqual(
      (await PDFDocument.load(bytes)).getPage(1).getSize(),
    )
    await expect(tintPages(bytes, [], 'night')).rejects.toThrow(/màu đọc/)

    expect(pageBackgroundFill('yellow')).toEqual(PAGE_BACKGROUNDS.yellow)
    expect(() => pageBackgroundFill('pink' as 'cream')).toThrow(/Màu nền/)
    const painted = await colorPageBackgrounds(bytes, [0], 'blue')
    expect(await pageCount(painted)).toBe(2)
    expect((await PDFDocument.load(painted)).getPage(0).getSize()).toEqual(
      (await PDFDocument.load(bytes)).getPage(0).getSize(),
    )
    expect((await PDFDocument.load(painted)).getPage(1).getSize()).toEqual(
      (await PDFDocument.load(bytes)).getPage(1).getSize(),
    )
    await expect(colorPageBackgrounds(bytes, [], 'gray')).rejects.toThrow(/phủ nền/)

    expect(assertPdfPassword('  secret  ', 'secret')).toBe('secret')
    expect(() => assertPdfPassword('   ')).toThrow(/mật khẩu/)
    expect(() => assertPdfPassword('one', 'two')).toThrow(/không khớp/)
    expect(encryptedPdfName('notes.pdf')).toBe('notes-khoa.pdf')
    const locked = await encryptPdfForDownload(bytes, 's3cret', 's3cret')
    expect(locked.byteLength).toBeGreaterThan(0)
    await expect(PDFDocument.load(locked)).rejects.toThrow(/encrypt/i)
    await expect(PDFDocument.load(bytes)).resolves.toBeTruthy()
    await expect(encryptPdfForDownload(bytes, '   ')).rejects.toThrow(/mật khẩu/)
    await expect(pageCount(locked)).rejects.toThrow(/khóa/)
    const opened = await decryptPdfForEdit(locked, 's3cret')
    expect(await pageCount(opened)).toBe(2)
    await expect(PDFDocument.load(opened)).resolves.toBeTruthy()
    await expect(decryptPdfForEdit(locked, 'wrong')).rejects.toThrow(/không đúng/)
    await expect(decryptPdfForEdit(locked, '   ')).rejects.toThrow(/mật khẩu/)

    const marked = await addOutlineBookmarks(bytes, [1], 'Chương hai')
    expect(await listOutlineBookmarks(marked)).toEqual([
      { title: 'Chương hai', pageIndex: 1, depth: 0 },
    ])
    const again = await addOutlineBookmarks(marked, [0, 1], 'Mục')
    expect(await listOutlineBookmarks(again)).toEqual([
      { title: 'Chương hai', pageIndex: 1, depth: 0 },
      { title: 'Mục · 1', pageIndex: 0, depth: 0 },
      { title: 'Mục · 2', pageIndex: 1, depth: 0 },
    ])
    await expect(addOutlineBookmarks(bytes, [], 'X')).rejects.toThrow(/trang/)
    await expect(addOutlineBookmarks(bytes, [0], '  ')).rejects.toThrow(/mục lục/)
    const nested = await addOutlineFolder(bytes, [0, 1], 'Phần A')
    expect(await listOutlineBookmarks(nested)).toEqual([
      { title: 'Phần A', pageIndex: 0, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
    ])
    const nestedDoc = await PDFDocument.load(nested)
    const nestedRoot = nestedDoc.catalog.lookup(PDFName.of('Outlines'), PDFDict)
    const nestedFolder = nestedDoc.context.lookup(nestedRoot.get(PDFName.of('First')), PDFDict)
    expect(nestedFolder.has(PDFName.of('Dest'))).toBe(false)
    expect(nestedFolder.has(PDFName.of('First'))).toBe(true)
    const nestedAgain = await addOutlineBookmarks(nested, [1], 'Phụ lục')
    expect(await listOutlineBookmarks(nestedAgain)).toEqual([
      { title: 'Phần A', pageIndex: 0, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
      { title: 'Phụ lục', pageIndex: 1, depth: 0 },
    ])
    await expect(addOutlineFolder(bytes, [], 'X')).rejects.toThrow(/trang/)
    const collapsed = await setOutlineFoldersOpen(nested, false)
    expect(await listOutlineBookmarks(collapsed)).toEqual([
      { title: 'Phần A', pageIndex: 0, depth: 0, destless: true, open: false },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
    ])
    const collapsedDoc = await PDFDocument.load(collapsed)
    const outlines = collapsedDoc.catalog.lookup(PDFName.of('Outlines'), PDFDict)
    const firstFolder = collapsedDoc.context.lookup(outlines.get(PDFName.of('First')), PDFDict)
    expect(firstFolder.lookup(PDFName.of('Count'), PDFNumber).asNumber()).toBe(-2)
    expect(firstFolder.has(PDFName.of('Dest'))).toBe(false)
    const expanded = await setOutlineFoldersOpen(collapsed, true)
    expect(await listOutlineBookmarks(expanded)).toEqual([
      { title: 'Phần A', pageIndex: 0, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
    ])
    await expect(setOutlineFoldersOpen(bytes, false)).rejects.toThrow(/thư mục/)
    expect(MAX_OUTLINE_DEPTH).toBe(3)
    const deep = await addOutlineFolder(nested, [1], 'Mục 1', 0)
    expect(await listOutlineBookmarks(deep)).toEqual([
      { title: 'Phần A', pageIndex: 0, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
      { title: 'Mục 1', pageIndex: 1, depth: 1, destless: true },
      { title: 'Mục 1 · 2', pageIndex: 1, depth: 2 },
    ])
    expect(outlineItemIsFolder(await listOutlineBookmarks(deep), 0)).toBe(true)
    expect(outlineItemIsFolder(await listOutlineBookmarks(deep), 3)).toBe(true)
    expect(outlineItemIsFolder(await listOutlineBookmarks(deep), 4)).toBe(false)
    const deeper = await addOutlineFolder(deep, [0], 'Mục 1a', 3)
    expect(await listOutlineBookmarks(deeper)).toEqual([
      { title: 'Phần A', pageIndex: 0, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
      { title: 'Mục 1', pageIndex: 1, depth: 1, destless: true },
      { title: 'Mục 1 · 2', pageIndex: 1, depth: 2 },
      { title: 'Mục 1a', pageIndex: 0, depth: 2, destless: true },
      { title: 'Mục 1a · 1', pageIndex: 0, depth: 3 },
    ])
    await expect(addOutlineFolder(deeper, [0], 'Quá sâu', 5)).rejects.toThrow(/3 cấp/)
    await expect(addOutlineFolder(nested, [0], 'X', 9)).rejects.toThrow(/mục lục cha/)
    expect(canMoveOutlineItem(await listOutlineBookmarks(nestedAgain), 0, 'down')).toBe(true)
    expect(canMoveOutlineItem(await listOutlineBookmarks(nestedAgain), 0, 'up')).toBe(false)
    expect(canMoveOutlineItem(await listOutlineBookmarks(nestedAgain), 3, 'down')).toBe(false)
    expect(outlineIndexAfterMove(await listOutlineBookmarks(nestedAgain), 0, 'down')).toBe(1)
    const movedDown = await moveOutlineItem(nestedAgain, 0, 'down')
    expect(await listOutlineBookmarks(movedDown)).toEqual([
      { title: 'Phụ lục', pageIndex: 1, depth: 0 },
      { title: 'Phần A', pageIndex: 0, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
    ])
    const movedUp = await moveOutlineItem(movedDown, 1, 'up')
    expect(await listOutlineBookmarks(movedUp)).toEqual(await listOutlineBookmarks(nestedAgain))
    const movedChild = await moveOutlineItem(nested, 1, 'down')
    expect(await listOutlineBookmarks(movedChild)).toEqual([
      { title: 'Phần A', pageIndex: 1, depth: 0, destless: true },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
    ])
    await expect(moveOutlineItem(nestedAgain, 0, 'up')).rejects.toThrow(/trên cùng/)
    await expect(moveOutlineItem(nestedAgain, 3, 'down')).rejects.toThrow(/dưới cùng/)
    await expect(moveOutlineItem(bytes, 0, 'up')).rejects.toThrow(/mục lục/)
    expect(canIndentOutlineItem(await listOutlineBookmarks(nested), 0)).toBe(false)
    expect(canIndentOutlineItem(await listOutlineBookmarks(nested), 2)).toBe(true)
    expect(canOutdentOutlineItem(await listOutlineBookmarks(nested), 0)).toBe(false)
    expect(canOutdentOutlineItem(await listOutlineBookmarks(nested), 1)).toBe(true)
    expect(outlineIndexAfterIndent(await listOutlineBookmarks(nested), 2)).toBe(2)
    expect(outlineIndexAfterOutdent(await listOutlineBookmarks(nested), 1)).toBe(2)
    const indentedChild = await indentOutlineItem(nested, 2)
    expect(await listOutlineBookmarks(indentedChild)).toEqual([
      { title: 'Phần A', pageIndex: 1, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 1, depth: 1, destless: true },
      { title: 'Phần A · 2', pageIndex: 1, depth: 2 },
    ])
    const outdentedChild = await outdentOutlineItem(indentedChild, 2)
    expect(await listOutlineBookmarks(outdentedChild)).toEqual([
      { title: 'Phần A', pageIndex: 1, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 1, depth: 1 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
    ])
    const outdentedFirst = await outdentOutlineItem(nested, 1)
    expect(await listOutlineBookmarks(outdentedFirst)).toEqual([
      { title: 'Phần A', pageIndex: 1, depth: 0, destless: true },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
      { title: 'Phần A · 1', pageIndex: 0, depth: 0 },
    ])
    const indentedTop = await indentOutlineItem(nestedAgain, 3)
    expect(await listOutlineBookmarks(indentedTop)).toEqual([
      { title: 'Phần A', pageIndex: 0, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
      { title: 'Phụ lục', pageIndex: 1, depth: 1 },
    ])
    await expect(indentOutlineItem(nested, 0)).rejects.toThrow(/liền trước/)
    await expect(outdentOutlineItem(nested, 0)).rejects.toThrow(/ngoài cùng/)
    await expect(indentOutlineItem(bytes, 0)).rejects.toThrow(/mục lục/)
    await expect(outdentOutlineItem(bytes, 0)).rejects.toThrow(/mục lục/)
    expect(canIndentOutlineItem(await listOutlineBookmarks(deeper), 5)).toBe(false)
    expect(canIndentOutlineItem(await listOutlineBookmarks(deeper), 6)).toBe(false)
    await expect(indentOutlineItem(deeper, 6)).rejects.toThrow(/liền trước/)
    await expect(indentOutlineItem(deeper, 5)).rejects.toThrow(/3 cấp/)
    const retargeted = await setOutlineDest(marked, 0, 0)
    expect((await listOutlineBookmarks(retargeted))[0]).toEqual({
      title: 'Chương hai',
      pageIndex: 0,
      depth: 0,
    })
    await expect(setOutlineDest(nested, 0, 1)).rejects.toThrow(/gắn trang đích/)
    await expect(setOutlineDest(marked, 0, 9)).rejects.toThrow(/trang đích/)
    await expect(setOutlineDest(bytes, 0, 0)).rejects.toThrow(/mục lục/)
    const oneClosed = await setOutlineFolderOpen(deep, 3, false)
    expect(await listOutlineBookmarks(oneClosed)).toEqual([
      { title: 'Phần A', pageIndex: 0, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 1 },
      { title: 'Mục 1', pageIndex: 1, depth: 1, destless: true, open: false },
      { title: 'Mục 1 · 2', pageIndex: 1, depth: 2 },
    ])
    expect(visibleOutlineItems(await listOutlineBookmarks(oneClosed)).map((row) => row.index)).toEqual([
      0, 1, 2, 3,
    ])
    const parentClosed = await setOutlineFolderOpen(oneClosed, 0, false)
    expect((await listOutlineBookmarks(parentClosed))[0]).toEqual({
      title: 'Phần A',
      pageIndex: 0,
      depth: 0,
      destless: true,
      open: false,
    })
    expect((await listOutlineBookmarks(parentClosed))[3]).toEqual({
      title: 'Mục 1',
      pageIndex: 1,
      depth: 1,
      destless: true,
      open: false,
    })
    expect(visibleOutlineItems(await listOutlineBookmarks(parentClosed)).map((row) => row.index)).toEqual([
      0,
    ])
    const reopened = await setOutlineFolderOpen(parentClosed, 0, true)
    expect((await listOutlineBookmarks(reopened))[0]).toEqual({
      title: 'Phần A',
      pageIndex: 0,
      depth: 0,
      destless: true,
    })
    await expect(setOutlineFolderOpen(deep, 4, false)).rejects.toThrow(/không phải thư mục/)
    await expect(setOutlineFolderOpen(deep, 9, false)).rejects.toThrow(/thư mục/)
    const renamed = await renameOutlineItem(nested, 0, 'Chương A')
    expect((await listOutlineBookmarks(renamed))[0]).toEqual({
      title: 'Chương A',
      pageIndex: 0,
      depth: 0,
      destless: true,
    })
    await expect(renameOutlineItem(nested, 9, 'X')).rejects.toThrow(/mục lục/)
    await expect(renameOutlineItem(nested, 0, '  ')).rejects.toThrow(/mục lục/)
    const removedLeaf = await removeOutlineItem(nested, 2)
    expect(await listOutlineBookmarks(removedLeaf)).toEqual([
      { title: 'Phần A', pageIndex: 0, depth: 0, destless: true },
      { title: 'Phần A · 1', pageIndex: 0, depth: 1 },
    ])
    const removedFolder = await removeOutlineItem(nested, 0)
    expect(await listOutlineBookmarks(removedFolder)).toEqual([
      { title: 'Phần A · 1', pageIndex: 0, depth: 0 },
      { title: 'Phần A · 2', pageIndex: 1, depth: 0 },
    ])
    const lastBookmark = await addOutlineBookmarks(bytes, [0], 'Một')
    expect(await listOutlineBookmarks(await removeOutlineItem(lastBookmark, 0))).toEqual([])
    await expect(removeOutlineItem(bytes, 0)).rejects.toThrow(/mục lục/)
    const cleared = await clearOutline(nested)
    expect(await listOutlineBookmarks(cleared)).toEqual([])
    await expect(clearOutline(bytes)).rejects.toThrow(/mục lục/)

    const named = await addNamedDest(bytes, 'ChapTwo', 1)
    expect(await listNamedDests(named)).toEqual([{ name: 'ChapTwo', pageIndex: 1 }])
    expect(await listNamedDests(await addNamedDest(named, 'ChapTwo', 1))).toEqual([
      { name: 'ChapTwo', pageIndex: 1 },
    ])
    await expect(addNamedDest(named, 'ChapTwo', 0)).rejects.toThrow(/đã dùng/)
    await expect(addNamedDest(bytes, '  ', 0)).rejects.toThrow(/tên đích/)
    await expect(addNamedDest(bytes, '1bad', 0)).rejects.toThrow(/chữ/)
    await expect(addNamedDest(bytes, 'Chap', 9)).rejects.toThrow(/trang đích/)
    const namedLeaf = await addOutlineBookmarks(named, [0], 'Mở đầu')
    const linked = await setOutlineNamedDest(namedLeaf, 0, 'ChapTwo')
    expect((await listOutlineBookmarks(linked))[0]).toEqual({
      title: 'Mở đầu',
      pageIndex: 1,
      depth: 0,
      destName: 'ChapTwo',
    })
    const linkedDoc = await PDFDocument.load(linked)
    const linkedRoot = linkedDoc.catalog.lookup(PDFName.of('Outlines'), PDFDict)
    const linkedItem = linkedDoc.context.lookup(linkedRoot.get(PDFName.of('First')), PDFDict)
    expect(linkedItem.lookup(PDFName.of('Dest'), PDFName)).toEqual(PDFName.of('ChapTwo'))
    const unlinked = await setOutlineDest(linked, 0, 0)
    expect((await listOutlineBookmarks(unlinked))[0]).toEqual({
      title: 'Mở đầu',
      pageIndex: 0,
      depth: 0,
    })
    await expect(setOutlineNamedDest(nested, 0, 'ChapTwo')).rejects.toThrow(/đích tên/)
    await expect(setOutlineNamedDest(namedLeaf, 0, 'Missing')).rejects.toThrow(/đích tên/)
    await expect(setOutlineNamedDest(bytes, 0, 'ChapTwo')).rejects.toThrow(/mục lục/)
    const namedFolder = await addNamedDest(nested, 'ChapTwo', 1)
    const folderLinked = await setOutlineNamedDest(namedFolder, 0, 'ChapTwo')
    expect((await listOutlineBookmarks(folderLinked))[0]).toEqual({
      title: 'Phần A',
      pageIndex: 1,
      depth: 0,
      destName: 'ChapTwo',
    })
    const folderDoc = await PDFDocument.load(folderLinked)
    const folderRoot = folderDoc.catalog.lookup(PDFName.of('Outlines'), PDFDict)
    const folderItem = folderDoc.context.lookup(folderRoot.get(PDFName.of('First')), PDFDict)
    expect(folderItem.lookup(PDFName.of('Dest'), PDFName)).toEqual(PDFName.of('ChapTwo'))
    const folderRetarget = await setNamedDestPage(folderLinked, 'ChapTwo', 0)
    expect(await listNamedDests(folderRetarget)).toEqual([{ name: 'ChapTwo', pageIndex: 0 }])
    expect((await listOutlineBookmarks(folderRetarget))[0]).toEqual({
      title: 'Phần A',
      pageIndex: 0,
      depth: 0,
      destName: 'ChapTwo',
    })

    const namedDoc = await PDFDocument.load(named)
    const namesTree = namedDoc.catalog.lookup(PDFName.of('Names'), PDFDict)
    const destsTree = namesTree.lookup(PDFName.of('Dests'), PDFDict)
    expect(destsTree.lookup(PDFName.of('Names'))).toBeTruthy()
    expect(await listNamedDests(await renameNamedDest(named, 'ChapTwo', 'ChapTwo'))).toEqual([
      { name: 'ChapTwo', pageIndex: 1 },
    ])
    const renamedDest = await renameNamedDest(linked, 'ChapTwo', 'Chap2')
    expect(await listNamedDests(renamedDest)).toEqual([{ name: 'Chap2', pageIndex: 1 }])
    expect((await listOutlineBookmarks(renamedDest))[0]).toEqual({
      title: 'Mở đầu',
      pageIndex: 1,
      depth: 0,
      destName: 'Chap2',
    })
    const renamedDoc = await PDFDocument.load(renamedDest)
    expect(renamedDoc.catalog.lookupMaybe(PDFName.of('Dests'), PDFDict)?.get(PDFName.of('ChapTwo'))).toBeUndefined()
    await expect(renameNamedDest(named, 'ChapTwo', '  ')).rejects.toThrow(/tên đích/)
    await expect(renameNamedDest(named, 'Missing', 'Chap2')).rejects.toThrow(/đích tên/)
    await expect(renameNamedDest(await addNamedDest(named, 'ChapOne', 0), 'ChapTwo', 'ChapOne')).rejects.toThrow(
      /đã dùng/,
    )
    await expect(renameNamedDest(named, 'ChapTwo', '1bad')).rejects.toThrow(/chữ/)

    const clearedDest = await removeNamedDest(linked, 'ChapTwo')
    expect(await listNamedDests(clearedDest)).toEqual([])
    expect((await listOutlineBookmarks(clearedDest))[0]).toEqual({
      title: 'Mở đầu',
      pageIndex: 1,
      depth: 0,
    })
    const emptyDestDoc = await PDFDocument.load(clearedDest)
    expect(emptyDestDoc.catalog.lookupMaybe(PDFName.of('Dests'), PDFDict)).toBeUndefined()
    expect(
      emptyDestDoc.catalog.lookupMaybe(PDFName.of('Names'), PDFDict)?.lookupMaybe(PDFName.of('Dests'), PDFDict),
    ).toBeUndefined()
    await expect(removeNamedDest(named, 'Missing')).rejects.toThrow(/đích tên/)
    await expect(removeNamedDest(named, '  ')).rejects.toThrow(/tên đích/)

    expect(await listNamedDests(await setNamedDestPage(named, 'ChapTwo', 1))).toEqual([
      { name: 'ChapTwo', pageIndex: 1 },
    ])
    const retargetedDest = await setNamedDestPage(named, 'ChapTwo', 0)
    expect(await listNamedDests(retargetedDest)).toEqual([{ name: 'ChapTwo', pageIndex: 0 }])
    const linkedRetarget = await setNamedDestPage(linked, 'ChapTwo', 0)
    expect((await listOutlineBookmarks(linkedRetarget))[0]).toEqual({
      title: 'Mở đầu',
      pageIndex: 0,
      depth: 0,
      destName: 'ChapTwo',
    })
    await expect(setNamedDestPage(named, 'Missing', 0)).rejects.toThrow(/đích tên/)
    await expect(setNamedDestPage(named, 'ChapTwo', 9)).rejects.toThrow(/trang đích/)
    await expect(setNamedDestPage(bytes, 'ChapTwo', 0)).rejects.toThrow(/đích tên/)
    await expect(setNamedDestPage(named, '  ', 0)).rejects.toThrow(/tên đích/)
    expect(parseNamedDestPageInput('2', 2)).toBe(1)
    expect(parseNamedDestPageInput('1', 2)).toBe(0)
    expect(parseNamedDestPageInput('', 2)).toBeNull()
    expect(parseNamedDestPageInput('0', 2)).toBeNull()
    expect(parseNamedDestPageInput('3', 2)).toBeNull()
    expect(parseNamedDestPageInput('1.5', 2)).toBeNull()

    const foreign = await PDFDocument.load(bytes)
    const foreignPages = foreign.getPages()
    const destAlpha = foreign.context.register(
      foreign.context.obj([foreignPages[0]!.ref, PDFName.of('XYZ'), null, null, null]),
    )
    const destBeta = foreign.context.register(
      foreign.context.obj([foreignPages[1]!.ref, PDFName.of('XYZ'), null, null, null]),
    )
    const leafA = foreign.context.obj({})
    leafA.set(PDFName.of('Limits'), foreign.context.obj([PDFHexString.fromText('Alpha'), PDFHexString.fromText('Alpha')]))
    const namesA = foreign.context.obj([])
    namesA.push(PDFHexString.fromText('Alpha'))
    namesA.push(destAlpha)
    leafA.set(PDFName.of('Names'), namesA)
    const leafB = foreign.context.obj({})
    leafB.set(PDFName.of('Limits'), foreign.context.obj([PDFHexString.fromText('Beta'), PDFHexString.fromText('Beta')]))
    const namesB = foreign.context.obj([])
    namesB.push(PDFHexString.fromText('Beta'))
    namesB.push(destBeta)
    leafB.set(PDFName.of('Names'), namesB)
    const kids = foreign.context.obj([])
    kids.push(foreign.context.register(leafA))
    kids.push(foreign.context.register(leafB))
    const tree = foreign.context.obj({})
    tree.set(PDFName.of('Kids'), kids)
    const namesDict = foreign.context.obj({})
    namesDict.set(PDFName.of('Dests'), tree)
    foreign.catalog.set(PDFName.of('Names'), namesDict)
    const foreignBytes = new Uint8Array(await foreign.save())
    expect(await listNamedDests(foreignBytes)).toEqual([
      { name: 'Alpha', pageIndex: 0 },
      { name: 'Beta', pageIndex: 1 },
    ])
    const mergedKids = await addNamedDest(foreignBytes, 'ChapTwo', 1)
    expect(await listNamedDests(mergedKids)).toEqual([
      { name: 'Alpha', pageIndex: 0 },
      { name: 'Beta', pageIndex: 1 },
      { name: 'ChapTwo', pageIndex: 1 },
    ])
    const mergedDoc = await PDFDocument.load(mergedKids)
    const mergedTree = mergedDoc.catalog
      .lookup(PDFName.of('Names'), PDFDict)
      .lookup(PDFName.of('Dests'), PDFDict)
    expect(mergedTree.lookup(PDFName.of('Kids'), PDFArray).size()).toBe(3)
    expect(mergedTree.lookupMaybe(PDFName.of('Names'), PDFArray)).toBeUndefined()
    const duplicated = await duplicateNamedDest(named, 'ChapTwo', 'ChapTwoCopy')
    expect(await listNamedDests(duplicated)).toEqual([
      { name: 'ChapTwo', pageIndex: 1 },
      { name: 'ChapTwoCopy', pageIndex: 1 },
    ])
    await expect(duplicateNamedDest(named, 'ChapTwo', 'ChapTwo')).rejects.toThrow(/đã dùng/)
    await expect(duplicateNamedDest(bytes, 'ChapTwo', 'ChapTwoCopy')).rejects.toThrow(/đích tên/)
    await expect(duplicateNamedDest(named, 'ChapTwo', '1bad')).rejects.toThrow(/chữ/)

    let branched = bytes
    for (const name of ['ChapA', 'ChapB', 'ChapC', 'ChapD', 'ChapE']) {
      branched = await addNamedDest(branched, name, name === 'ChapE' ? 1 : 0)
    }
    expect(NAMED_DEST_LEAF_SIZE).toBe(4)
    const branchedDoc = await PDFDocument.load(branched)
    const branchedTree = branchedDoc.catalog
      .lookup(PDFName.of('Names'), PDFDict)
      .lookup(PDFName.of('Dests'), PDFDict)
    expect(branchedTree.lookup(PDFName.of('Kids'), PDFArray).size()).toBe(2)
    expect(branchedTree.lookupMaybe(PDFName.of('Names'), PDFArray)).toBeUndefined()
    expect(await listNamedDests(branched)).toEqual([
      { name: 'ChapA', pageIndex: 0 },
      { name: 'ChapB', pageIndex: 0 },
      { name: 'ChapC', pageIndex: 0 },
      { name: 'ChapD', pageIndex: 0 },
      { name: 'ChapE', pageIndex: 1 },
    ])
    const retargetLeaf = await setNamedDestPage(branched, 'ChapA', 1)
    expect(await listNamedDests(retargetLeaf)).toEqual([
      { name: 'ChapA', pageIndex: 1 },
      { name: 'ChapB', pageIndex: 0 },
      { name: 'ChapC', pageIndex: 0 },
      { name: 'ChapD', pageIndex: 0 },
      { name: 'ChapE', pageIndex: 1 },
    ])
    expect(destNameTreeHasIntermediate(branchedDoc)).toBe(false)
    expect(destNameTreeChildSpan(17, NAMED_DEST_LEAF_SIZE)).toBe(16)
    expect(destNameTreeChildSpan(5, NAMED_DEST_LEAF_SIZE)).toBe(4)
    expect(destNameTreeChildSpan(3, 1)).toBe(1)

    let nestedKids = bytes
    for (let index = 0; index < 17; index += 1) {
      nestedKids = await addNamedDest(nestedKids, `Chap${String(index + 1).padStart(2, '0')}`, index === 16 ? 1 : 0)
    }
    const nestedKidsDoc = await PDFDocument.load(nestedKids)
    const nestedKidsTree = nestedKidsDoc.catalog
      .lookup(PDFName.of('Names'), PDFDict)
      .lookup(PDFName.of('Dests'), PDFDict)
    expect(nestedKidsTree.lookup(PDFName.of('Kids'), PDFArray).size()).toBe(2)
    expect(destNameTreeHasIntermediate(nestedKidsDoc)).toBe(true)
    expect(destNameTreeStyleFromDoc(nestedKidsDoc)).toEqual({
      forceKids: true,
      leafSize: NAMED_DEST_LEAF_SIZE,
    })
    const expectedNested = Array.from({ length: 17 }, (_, index) => ({
      name: `Chap${String(index + 1).padStart(2, '0')}`,
      pageIndex: index === 16 ? 1 : 0,
    }))
    expect(await listNamedDests(nestedKids)).toEqual(expectedNested)
    const retargetNested = await setNamedDestPage(nestedKids, 'Chap01', 1)
    expect(destNameTreeHasIntermediate(await PDFDocument.load(retargetNested))).toBe(true)
    expect(await listNamedDests(retargetNested)).toEqual(
      expectedNested.map((dest) => (dest.name === 'Chap01' ? { ...dest, pageIndex: 1 } : dest)),
    )

    expect(namedDestNameForPage(0, new Set())).toBe('p1')
    expect(namedDestNameForPage(0, new Set(['p1']))).toBe('p1-2')
    const selectedDests = await addNamedDestsForSelection(bytes, [1, 0])
    expect(await listNamedDests(selectedDests)).toEqual([
      { name: 'p1', pageIndex: 0 },
      { name: 'p2', pageIndex: 1 },
    ])
    const collisionDests = await addNamedDestsForSelection(await addNamedDest(bytes, 'p1', 1), [0])
    expect(await listNamedDests(collisionDests)).toEqual([
      { name: 'p1', pageIndex: 1 },
      { name: 'p1-2', pageIndex: 0 },
    ])
    await expect(addNamedDestsForSelection(bytes, [])).rejects.toThrow(/trang/)
    await expect(addNamedDestsForSelection(bytes, [9])).rejects.toThrow(/trang đích/)
    const linkedCleared = await clearNamedDests(linked)
    expect(await listNamedDests(linkedCleared)).toEqual([])
    expect((await listOutlineBookmarks(linkedCleared))[0]).toEqual({
      title: 'Mở đầu',
      pageIndex: 1,
      depth: 0,
    })
    const emptyClearDoc = await PDFDocument.load(linkedCleared)
    expect(emptyClearDoc.catalog.lookupMaybe(PDFName.of('Dests'), PDFDict)).toBeUndefined()
    await expect(clearNamedDests(bytes)).rejects.toThrow(/đích tên/)

    expect(namedDestViewOf(undefined)).toBe('XYZ')
    expect(namedDestViewOf({ name: 'ChapTwo', pageIndex: 1 })).toBe('XYZ')
    expect(destNamesForPage(await listNamedDests(named), 1)).toEqual(['ChapTwo'])
    expect(destNamesForPage(await listNamedDests(named), 0)).toEqual([])
    expect(await listNamedDests(await setNamedDestView(named, 'ChapTwo', 'XYZ'))).toEqual([
      { name: 'ChapTwo', pageIndex: 1 },
    ])
    const fitDest = await setNamedDestView(named, 'ChapTwo', 'Fit')
    expect(await listNamedDests(fitDest)).toEqual([{ name: 'ChapTwo', pageIndex: 1, view: 'Fit' }])
    const fitDoc = await PDFDocument.load(fitDest)
    const fitArray = fitDoc.context.lookup(
      fitDoc.catalog.lookup(PDFName.of('Dests'), PDFDict).get(PDFName.of('ChapTwo')),
      PDFArray,
    )
    expect(fitArray.get(1)).toEqual(PDFName.of('Fit'))
    const fitHDest = await setNamedDestView(named, 'ChapTwo', 'FitH')
    expect(await listNamedDests(fitHDest)).toEqual([{ name: 'ChapTwo', pageIndex: 1, view: 'FitH' }])
    const fitHDoc = await PDFDocument.load(fitHDest)
    const fitHArray = fitHDoc.context.lookup(
      fitHDoc.catalog.lookup(PDFName.of('Dests'), PDFDict).get(PDFName.of('ChapTwo')),
      PDFArray,
    )
    expect(fitHArray.get(1)).toEqual(PDFName.of('FitH'))
    const fitVDest = await setNamedDestView(named, 'ChapTwo', 'FitV')
    expect(await listNamedDests(fitVDest)).toEqual([{ name: 'ChapTwo', pageIndex: 1, view: 'FitV' }])
    const fitVDoc = await PDFDocument.load(fitVDest)
    const fitVArray = fitVDoc.context.lookup(
      fitVDoc.catalog.lookup(PDFName.of('Dests'), PDFDict).get(PDFName.of('ChapTwo')),
      PDFArray,
    )
    expect(fitVArray.get(1)).toEqual(PDFName.of('FitV'))
    const fitRDest = await setNamedDestView(named, 'ChapTwo', 'FitR')
    expect(await listNamedDests(fitRDest)).toEqual([{ name: 'ChapTwo', pageIndex: 1, view: 'FitR' }])
    const fitRDoc = await PDFDocument.load(fitRDest)
    const fitRArray = fitRDoc.context.lookup(
      fitRDoc.catalog.lookup(PDFName.of('Dests'), PDFDict).get(PDFName.of('ChapTwo')),
      PDFArray,
    )
    expect(fitRArray.get(1)).toEqual(PDFName.of('FitR'))
    expect(fitRArray.size()).toBe(6)
    const namedPage = (await PDFDocument.load(named)).getPages()[1]!
    const namedSize = namedPage.getSize()
    expect((fitRArray.get(2) as PDFNumber).asNumber()).toBe(0)
    expect((fitRArray.get(3) as PDFNumber).asNumber()).toBe(0)
    expect((fitRArray.get(4) as PDFNumber).asNumber()).toBeCloseTo(namedSize.width)
    expect((fitRArray.get(5) as PDFNumber).asNumber()).toBeCloseTo(namedSize.height)
    expect(await listNamedDests(await setNamedDestPage(fitDest, 'ChapTwo', 0))).toEqual([
      { name: 'ChapTwo', pageIndex: 0, view: 'Fit' },
    ])
    expect(await listNamedDests(await duplicateNamedDest(fitDest, 'ChapTwo', 'ChapFit'))).toEqual([
      { name: 'ChapFit', pageIndex: 1, view: 'Fit' },
      { name: 'ChapTwo', pageIndex: 1, view: 'Fit' },
    ])
    expect(await listNamedDests(await setNamedDestPage(fitVDest, 'ChapTwo', 0))).toEqual([
      { name: 'ChapTwo', pageIndex: 0, view: 'FitV' },
    ])
    expect(await listNamedDests(await duplicateNamedDest(fitRDest, 'ChapTwo', 'ChapRect'))).toEqual([
      { name: 'ChapRect', pageIndex: 1, view: 'FitR' },
      { name: 'ChapTwo', pageIndex: 1, view: 'FitR' },
    ])
    const fitBDest = await setNamedDestView(named, 'ChapTwo', 'FitB')
    expect(await listNamedDests(fitBDest)).toEqual([{ name: 'ChapTwo', pageIndex: 1, view: 'FitB' }])
    const fitBDoc = await PDFDocument.load(fitBDest)
    const fitBArray = fitBDoc.context.lookup(
      fitBDoc.catalog.lookup(PDFName.of('Dests'), PDFDict).get(PDFName.of('ChapTwo')),
      PDFArray,
    )
    expect(fitBArray.get(1)).toEqual(PDFName.of('FitB'))
    expect(fitBArray.size()).toBe(2)
    expect(await listNamedDests(await setNamedDestPage(fitBDest, 'ChapTwo', 0))).toEqual([
      { name: 'ChapTwo', pageIndex: 0, view: 'FitB' },
    ])
    expect(await listNamedDests(await duplicateNamedDest(fitBDest, 'ChapTwo', 'ChapBleed'))).toEqual([
      { name: 'ChapBleed', pageIndex: 1, view: 'FitB' },
      { name: 'ChapTwo', pageIndex: 1, view: 'FitB' },
    ])
    const fitBhDest = await setNamedDestView(named, 'ChapTwo', 'FitBH')
    expect(await listNamedDests(fitBhDest)).toEqual([{ name: 'ChapTwo', pageIndex: 1, view: 'FitBH' }])
    const fitBhDoc = await PDFDocument.load(fitBhDest)
    const fitBhArray = fitBhDoc.context.lookup(
      fitBhDoc.catalog.lookup(PDFName.of('Dests'), PDFDict).get(PDFName.of('ChapTwo')),
      PDFArray,
    )
    expect(fitBhArray.get(1)).toEqual(PDFName.of('FitBH'))
    expect(fitBhArray.size()).toBe(3)
    expect(await listNamedDests(await setNamedDestPage(fitBhDest, 'ChapTwo', 0))).toEqual([
      { name: 'ChapTwo', pageIndex: 0, view: 'FitBH' },
    ])
    expect(await listNamedDests(await duplicateNamedDest(fitBhDest, 'ChapTwo', 'ChapWide'))).toEqual([
      { name: 'ChapTwo', pageIndex: 1, view: 'FitBH' },
      { name: 'ChapWide', pageIndex: 1, view: 'FitBH' },
    ])
    const fitBvDest = await setNamedDestView(named, 'ChapTwo', 'FitBV')
    expect(await listNamedDests(fitBvDest)).toEqual([{ name: 'ChapTwo', pageIndex: 1, view: 'FitBV' }])
    const fitBvDoc = await PDFDocument.load(fitBvDest)
    const fitBvArray = fitBvDoc.context.lookup(
      fitBvDoc.catalog.lookup(PDFName.of('Dests'), PDFDict).get(PDFName.of('ChapTwo')),
      PDFArray,
    )
    expect(fitBvArray.get(1)).toEqual(PDFName.of('FitBV'))
    expect(fitBvArray.size()).toBe(3)
    expect(await listNamedDests(await setNamedDestPage(fitBvDest, 'ChapTwo', 0))).toEqual([
      { name: 'ChapTwo', pageIndex: 0, view: 'FitBV' },
    ])
    expect(await listNamedDests(await duplicateNamedDest(fitBvDest, 'ChapTwo', 'ChapTall'))).toEqual([
      { name: 'ChapTall', pageIndex: 1, view: 'FitBV' },
      { name: 'ChapTwo', pageIndex: 1, view: 'FitBV' },
    ])
    const foreignFit = await PDFDocument.load(bytes)
    const foreignFitPages = foreignFit.getPages()
    const fitRef = foreignFit.context.register(
      foreignFit.context.obj([foreignFitPages[0]!.ref, PDFName.of('Fit')]),
    )
    const fitBRef = foreignFit.context.register(
      foreignFit.context.obj([foreignFitPages[0]!.ref, PDFName.of('FitB')]),
    )
    const fitBhRef = foreignFit.context.register(
      foreignFit.context.obj([foreignFitPages[1]!.ref, PDFName.of('FitBH'), null]),
    )
    const fitBvRef = foreignFit.context.register(
      foreignFit.context.obj([foreignFitPages[0]!.ref, PDFName.of('FitBV'), null]),
    )
    const fitRRef = foreignFit.context.register(
      foreignFit.context.obj([foreignFitPages[1]!.ref, PDFName.of('FitR'), 0, 0, 200, 280]),
    )
    const fitCatalog = foreignFit.context.obj({})
    fitCatalog.set(PDFName.of('Whole'), fitRef)
    fitCatalog.set(PDFName.of('Bleed'), fitBRef)
    fitCatalog.set(PDFName.of('Wide'), fitBhRef)
    fitCatalog.set(PDFName.of('Tall'), fitBvRef)
    fitCatalog.set(PDFName.of('Rect'), fitRRef)
    foreignFit.catalog.set(PDFName.of('Dests'), fitCatalog)
    expect(await listNamedDests(new Uint8Array(await foreignFit.save()))).toEqual([
      { name: 'Bleed', pageIndex: 0, view: 'FitB' },
      { name: 'Rect', pageIndex: 1, view: 'FitR' },
      { name: 'Tall', pageIndex: 0, view: 'FitBV' },
      { name: 'Whole', pageIndex: 0, view: 'Fit' },
      { name: 'Wide', pageIndex: 1, view: 'FitBH' },
    ])
    await expect(setNamedDestView(named, 'Missing', 'Fit')).rejects.toThrow(/đích tên/)
    await expect(setNamedDestView(named, 'ChapTwo', 'Zoom')).rejects.toThrow(/XYZ/)
    await expect(setNamedDestView(bytes, 'ChapTwo', 'Fit')).rejects.toThrow(/đích tên/)

    expect(namedDestXyzOf(undefined)).toEqual({ left: null, top: null, zoom: null })
    expect(namedDestXyzOf({ name: 'ChapTwo', pageIndex: 1 })).toEqual({
      left: null,
      top: null,
      zoom: null,
    })
    expect(parseNamedDestXyzPart('', 'left')).toBeNull()
    expect(parseNamedDestXyzPart('72', 'left')).toBe(72)
    expect(parseNamedDestXyzPart('1.5', 'zoom')).toBe(1.5)
    expect(parseNamedDestXyzPart('0', 'zoom')).toBeUndefined()
    expect(parseNamedDestXyzPart('abc', 'top')).toBeUndefined()
    expect(parseNamedDestXyzInput('72', '720', '1.5')).toEqual({
      left: 72,
      top: 720,
      zoom: 1.5,
    })
    expect(parseNamedDestXyzInput('', '', '')).toEqual({
      left: null,
      top: null,
      zoom: null,
    })
    expect(parseNamedDestXyzInput('72', 'x', '1')).toBeNull()
    expect(await listNamedDests(await setNamedDestXyz(named, 'ChapTwo', { left: null, top: null, zoom: null }))).toEqual([
      { name: 'ChapTwo', pageIndex: 1 },
    ])
    const xyzDest = await setNamedDestXyz(named, 'ChapTwo', { left: 72, top: 720, zoom: 1.5 })
    expect(await listNamedDests(xyzDest)).toEqual([
      { name: 'ChapTwo', pageIndex: 1, xyz: { left: 72, top: 720, zoom: 1.5 } },
    ])
    const xyzDoc = await PDFDocument.load(xyzDest)
    const xyzArray = xyzDoc.context.lookup(
      xyzDoc.catalog.lookup(PDFName.of('Dests'), PDFDict).get(PDFName.of('ChapTwo')),
      PDFArray,
    )
    expect(xyzArray.get(1)).toEqual(PDFName.of('XYZ'))
    expect((xyzArray.get(2) as PDFNumber).asNumber()).toBe(72)
    expect((xyzArray.get(3) as PDFNumber).asNumber()).toBe(720)
    expect((xyzArray.get(4) as PDFNumber).asNumber()).toBeCloseTo(1.5)
    expect(
      await listNamedDests(await setNamedDestXyz(xyzDest, 'ChapTwo', { left: 72, top: 720, zoom: 1.5 })),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 72, top: 720, zoom: 1.5 } }])
    expect(await listNamedDests(await setNamedDestPage(xyzDest, 'ChapTwo', 0))).toEqual([
      { name: 'ChapTwo', pageIndex: 0, xyz: { left: 72, top: 720, zoom: 1.5 } },
    ])
    expect(await listNamedDests(await duplicateNamedDest(xyzDest, 'ChapTwo', 'ChapZoom'))).toEqual([
      { name: 'ChapTwo', pageIndex: 1, xyz: { left: 72, top: 720, zoom: 1.5 } },
      { name: 'ChapZoom', pageIndex: 1, xyz: { left: 72, top: 720, zoom: 1.5 } },
    ])
    expect(await listNamedDests(await setNamedDestView(xyzDest, 'ChapTwo', 'Fit'))).toEqual([
      { name: 'ChapTwo', pageIndex: 1, view: 'Fit' },
    ])
    expect(await listNamedDests(await setNamedDestView(xyzDest, 'ChapTwo', 'XYZ'))).toEqual([
      { name: 'ChapTwo', pageIndex: 1, xyz: { left: 72, top: 720, zoom: 1.5 } },
    ])
    const foreignXyz = await PDFDocument.load(bytes)
    const foreignXyzPages = foreignXyz.getPages()
    const xyzRef = foreignXyz.context.register(
      foreignXyz.context.obj([foreignXyzPages[1]!.ref, PDFName.of('XYZ'), 10, 20, 2]),
    )
    const xyzCatalog = foreignXyz.context.obj({})
    xyzCatalog.set(PDFName.of('Spot'), xyzRef)
    foreignXyz.catalog.set(PDFName.of('Dests'), xyzCatalog)
    expect(await listNamedDests(new Uint8Array(await foreignXyz.save()))).toEqual([
      { name: 'Spot', pageIndex: 1, xyz: { left: 10, top: 20, zoom: 2 } },
    ])
    await expect(setNamedDestXyz(named, 'Missing', { left: 1, top: 2, zoom: 1 })).rejects.toThrow(
      /đích tên/,
    )
    await expect(setNamedDestXyz(named, 'ChapTwo', { left: 1, top: 2, zoom: 0 })).rejects.toThrow(
      /XYZ/,
    )
    expect(namedDestXyzFromPageSize({ width: A4_WIDTH, height: A4_HEIGHT }, 'top-left')).toEqual({
      left: 0,
      top: A4_HEIGHT,
      zoom: null,
    })
    expect(namedDestXyzFromPageSize({ width: LETTER_WIDTH, height: LETTER_HEIGHT }, 'top')).toEqual({
      left: null,
      top: LETTER_HEIGHT,
      zoom: null,
    })
    expect(namedDestXyzFromPaper('a4', 'top-left')).toEqual({
      left: 0,
      top: A4_HEIGHT,
      zoom: null,
    })
    expect(namedDestXyzFromPaper('letter', 'top-right')).toEqual({
      left: LETTER_WIDTH,
      top: LETTER_HEIGHT,
      zoom: null,
    })
    expect(namedDestXyzFromPaper('a5', 'top-left')).toEqual({
      left: 0,
      top: A5_HEIGHT,
      zoom: null,
    })
    expect(await listNamedDests(await setNamedDestXyz(named, 'ChapTwo', namedDestXyzFromPaper('a4')))).toEqual([
      { name: 'ChapTwo', pageIndex: 1, xyz: { left: 0, top: A4_HEIGHT, zoom: null } },
    ])
    const destSizes = await listPageSizes(named)
    expect(destSizes[1]).toEqual({ width: 200, height: 280 })
    expect(await namedDestXyzFromDestPage(named, 'ChapTwo', 'top-left')).toEqual({
      left: 0,
      top: 280,
      zoom: null,
    })
    expect(await namedDestXyzFromDestPage(named, 'ChapTwo', 'top')).toEqual({
      left: null,
      top: 280,
      zoom: null,
    })
    expect(await namedDestXyzFromDestPage(named, 'ChapTwo', 'top-right')).toEqual({
      left: 200,
      top: 280,
      zoom: null,
    })
    expect(await namedDestXyzFromDestPage(named, 'ChapTwo', 'bottom-left')).toEqual({
      left: 0,
      top: 0,
      zoom: null,
    })
    expect(await namedDestXyzFromDestPage(named, 'ChapTwo', 'bottom')).toEqual({
      left: null,
      top: 0,
      zoom: null,
    })
    expect(await namedDestXyzFromDestPage(named, 'ChapTwo', 'bottom-right')).toEqual({
      left: 200,
      top: 0,
      zoom: null,
    })
    expect(await namedDestXyzFromDestPage(named, 'ChapTwo', 'left')).toEqual({
      left: 0,
      top: 140,
      zoom: null,
    })
    expect(await namedDestXyzFromDestPage(named, 'ChapTwo', 'center')).toEqual({
      left: 100,
      top: 140,
      zoom: null,
    })
    expect(await namedDestXyzFromDestPage(named, 'ChapTwo', 'right')).toEqual({
      left: 200,
      top: 140,
      zoom: null,
    })
    expect(namedDestXyzFromPageSize({ width: A4_WIDTH, height: A4_HEIGHT }, 'left')).toEqual({
      left: 0,
      top: A4_HEIGHT / 2,
      zoom: null,
    })
    expect(namedDestXyzFromPageSize({ width: A4_WIDTH, height: A4_HEIGHT }, 'center')).toEqual({
      left: A4_WIDTH / 2,
      top: A4_HEIGHT / 2,
      zoom: null,
    })
    expect(namedDestXyzFromPageSize({ width: LETTER_WIDTH, height: LETTER_HEIGHT }, 'right')).toEqual({
      left: LETTER_WIDTH,
      top: LETTER_HEIGHT / 2,
      zoom: null,
    })
    expect(namedDestXyzFromPageSize({ width: A4_WIDTH, height: A4_HEIGHT }, 'bottom-left')).toEqual({
      left: 0,
      top: 0,
      zoom: null,
    })
    expect(namedDestXyzFromPageSize({ width: A4_WIDTH, height: A4_HEIGHT }, 'bottom')).toEqual({
      left: null,
      top: 0,
      zoom: null,
    })
    expect(namedDestXyzFromPageSize({ width: LETTER_WIDTH, height: LETTER_HEIGHT }, 'bottom-right')).toEqual({
      left: LETTER_WIDTH,
      top: 0,
      zoom: null,
    })
    expect(
      await listNamedDests(
        await setNamedDestXyz(named, 'ChapTwo', await namedDestXyzFromDestPage(named, 'ChapTwo', 'top')),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: null, top: 280, zoom: null } }])
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          named,
          'ChapTwo',
          await namedDestXyzFromDestPage(named, 'ChapTwo', 'bottom-left'),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 0, top: 0, zoom: null } }])
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          named,
          'ChapTwo',
          await namedDestXyzFromDestPage(named, 'ChapTwo', 'center'),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 100, top: 140, zoom: null } }])
    await expect(namedDestXyzFromDestPage(named, 'Missing', 'top')).rejects.toThrow(/đích tên/)

    expect(namedDestXyzFromZoomPreset('100')).toEqual({
      left: null,
      top: null,
      zoom: 1,
    })
    expect(namedDestXyzFromZoomPreset('50', { left: 10, top: 20, zoom: 2 })).toEqual({
      left: 10,
      top: 20,
      zoom: 0.5,
    })
    expect(namedDestXyzFromZoomPreset('100', { left: 10, top: 20, zoom: 2 })).toEqual({
      left: 10,
      top: 20,
      zoom: 1,
    })
    expect(namedDestXyzFromZoomPreset('200', { left: 10, top: 20, zoom: 1 })).toEqual({
      left: 10,
      top: 20,
      zoom: 2,
    })
    expect(namedDestXyzFromZoomPreset('75', { left: 10, top: 20, zoom: 2 })).toEqual({
      left: 10,
      top: 20,
      zoom: 0.75,
    })
    expect(namedDestXyzFromZoomPreset('150', { left: 10, top: 20, zoom: 1 })).toEqual({
      left: 10,
      top: 20,
      zoom: 1.5,
    })
    expect(namedDestXyzFromZoomPreset('125', { left: 10, top: 20, zoom: 2 })).toEqual({
      left: 10,
      top: 20,
      zoom: 1.25,
    })
    expect(namedDestXyzFromZoomPreset('keep', { left: 10, top: 20, zoom: 2 })).toEqual({
      left: 10,
      top: 20,
      zoom: null,
    })
    expect(namedDestXyzFromZoomPreset('keep')).toEqual({
      left: null,
      top: null,
      zoom: null,
    })
    expect(namedDestXyzFromAxisPreset('keep-left', { left: 10, top: 20, zoom: 2 })).toEqual({
      left: null,
      top: 20,
      zoom: 2,
    })
    expect(namedDestXyzFromAxisPreset('keep-top', { left: 10, top: 20, zoom: 2 })).toEqual({
      left: 10,
      top: null,
      zoom: 2,
    })
    expect(namedDestXyzFromAxisPreset('keep-left')).toEqual({
      left: null,
      top: null,
      zoom: null,
    })
    expect(namedDestXyzFromAxisPreset('keep-top')).toEqual({
      left: null,
      top: null,
      zoom: null,
    })
    expect(namedDestXyzFromAxisPreset('zero-left', { left: 10, top: 20, zoom: 2 })).toEqual({
      left: 0,
      top: 20,
      zoom: 2,
    })
    expect(namedDestXyzFromAxisPreset('zero-top', { left: 10, top: 20, zoom: 2 })).toEqual({
      left: 10,
      top: 0,
      zoom: 2,
    })
    expect(namedDestXyzFromAxisPreset('zero-left')).toEqual({
      left: 0,
      top: null,
      zoom: null,
    })
    expect(namedDestXyzFromAxisPreset('zero-top')).toEqual({
      left: null,
      top: 0,
      zoom: null,
    })
    expect(namedDestXyzFromAxisPreset('origin', { left: 10, top: 20, zoom: 2 })).toEqual({
      left: 0,
      top: 0,
      zoom: 2,
    })
    expect(namedDestXyzFromAxisPreset('home', { left: 10, top: 20, zoom: 2 })).toEqual({
      left: 0,
      top: 0,
      zoom: 1,
    })
    expect(namedDestXyzFromAxisPreset('origin')).toEqual({
      left: 0,
      top: 0,
      zoom: null,
    })
    expect(namedDestXyzFromAxisPreset('home')).toEqual({
      left: 0,
      top: 0,
      zoom: 1,
    })
    expect(namedDestXyzFromAxisPreset('max-left', { left: 10, top: 20, zoom: 2 }, 200, 280)).toEqual({
      left: 200,
      top: 20,
      zoom: 2,
    })
    expect(namedDestXyzFromAxisPreset('max-top', { left: 10, top: 20, zoom: 2 }, 200, 280)).toEqual({
      left: 10,
      top: 280,
      zoom: 2,
    })
    expect(namedDestXyzFromAxisPreset('max-left')).toEqual({
      left: LETTER_WIDTH,
      top: null,
      zoom: null,
    })
    expect(namedDestXyzFromAxisPreset('max-top')).toEqual({
      left: null,
      top: LETTER_HEIGHT,
      zoom: null,
    })
    expect(namedDestXyzFromAxisPreset('far', { left: 10, top: 20, zoom: 2 }, 200, 280)).toEqual({
      left: 200,
      top: 280,
      zoom: 2,
    })
    expect(namedDestXyzFromAxisPreset('end', { left: 10, top: 20, zoom: 2 }, 200, 280)).toEqual({
      left: 200,
      top: 280,
      zoom: 1,
    })
    expect(namedDestXyzFromAxisPreset('far')).toEqual({
      left: LETTER_WIDTH,
      top: LETTER_HEIGHT,
      zoom: null,
    })
    expect(namedDestXyzFromAxisPreset('end')).toEqual({
      left: LETTER_WIDTH,
      top: LETTER_HEIGHT,
      zoom: 1,
    })
    expect(namedDestXyzFromAxisPreset('mid', { left: 10, top: 20, zoom: 2 }, 200, 280)).toEqual({
      left: 100,
      top: 140,
      zoom: 2,
    })
    expect(namedDestXyzFromAxisPreset('focus', { left: 10, top: 20, zoom: 2 }, 200, 280)).toEqual({
      left: 100,
      top: 140,
      zoom: 1,
    })
    expect(namedDestXyzFromAxisPreset('mid')).toEqual({
      left: LETTER_WIDTH / 2,
      top: LETTER_HEIGHT / 2,
      zoom: null,
    })
    expect(namedDestXyzFromAxisPreset('focus')).toEqual({
      left: LETTER_WIDTH / 2,
      top: LETTER_HEIGHT / 2,
      zoom: 1,
    })
    expect(namedDestXyzFromAxisPreset('mid-left', { left: 10, top: 20, zoom: 2 }, 200, 280)).toEqual({
      left: 100,
      top: 20,
      zoom: 2,
    })
    expect(namedDestXyzFromAxisPreset('mid-top', { left: 10, top: 20, zoom: 2 }, 200, 280)).toEqual({
      left: 10,
      top: 140,
      zoom: 2,
    })
    expect(namedDestXyzFromAxisPreset('mid-left')).toEqual({
      left: LETTER_WIDTH / 2,
      top: null,
      zoom: null,
    })
    expect(namedDestXyzFromAxisPreset('mid-top')).toEqual({
      left: null,
      top: LETTER_HEIGHT / 2,
      zoom: null,
    })
    expect(namedDestXyzFromAxisPreset('quarter-left', { left: 10, top: 20, zoom: 2 }, 200, 280)).toEqual({
      left: 50,
      top: 20,
      zoom: 2,
    })
    expect(namedDestXyzFromAxisPreset('quarter-top', { left: 10, top: 20, zoom: 2 }, 200, 280)).toEqual({
      left: 10,
      top: 70,
      zoom: 2,
    })
    expect(namedDestXyzFromAxisPreset('quarter-left')).toEqual({
      left: LETTER_WIDTH / 4,
      top: null,
      zoom: null,
    })
    expect(namedDestXyzFromAxisPreset('quarter-top')).toEqual({
      left: null,
      top: LETTER_HEIGHT / 4,
      zoom: null,
    })
    expect(
      namedDestXyzFromAxisPreset('three-quarter-left', { left: 10, top: 20, zoom: 2 }, 200, 280),
    ).toEqual({
      left: 150,
      top: 20,
      zoom: 2,
    })
    expect(
      namedDestXyzFromAxisPreset('three-quarter-top', { left: 10, top: 20, zoom: 2 }, 200, 280),
    ).toEqual({
      left: 10,
      top: 210,
      zoom: 2,
    })
    expect(namedDestXyzFromAxisPreset('three-quarter-left')).toEqual({
      left: (LETTER_WIDTH * 3) / 4,
      top: null,
      zoom: null,
    })
    expect(namedDestXyzFromAxisPreset('three-quarter-top')).toEqual({
      left: null,
      top: (LETTER_HEIGHT * 3) / 4,
      zoom: null,
    })
    expect(
      namedDestXyzFromAxisPreset('eighth-left', { left: 10, top: 20, zoom: 2 }, 200, 280),
    ).toEqual({
      left: 25,
      top: 20,
      zoom: 2,
    })
    expect(
      namedDestXyzFromAxisPreset('eighth-top', { left: 10, top: 20, zoom: 2 }, 200, 280),
    ).toEqual({
      left: 10,
      top: 35,
      zoom: 2,
    })
    expect(namedDestXyzFromAxisPreset('eighth-left')).toEqual({
      left: LETTER_WIDTH / 8,
      top: null,
      zoom: null,
    })
    expect(namedDestXyzFromAxisPreset('eighth-top')).toEqual({
      left: null,
      top: LETTER_HEIGHT / 8,
      zoom: null,
    })
    expect(
      namedDestXyzFromAxisPreset('sixteenth-left', { left: 10, top: 20, zoom: 2 }, 200, 280),
    ).toEqual({
      left: 12.5,
      top: 20,
      zoom: 2,
    })
    expect(
      namedDestXyzFromAxisPreset('sixteenth-top', { left: 10, top: 20, zoom: 2 }, 200, 280),
    ).toEqual({
      left: 10,
      top: 17.5,
      zoom: 2,
    })
    expect(namedDestXyzFromAxisPreset('sixteenth-left')).toEqual({
      left: LETTER_WIDTH / 16,
      top: null,
      zoom: null,
    })
    expect(namedDestXyzFromAxisPreset('sixteenth-top')).toEqual({
      left: null,
      top: LETTER_HEIGHT / 16,
      zoom: null,
    })
    expect(
      namedDestXyzFromAxisPreset('thirty-second-left', { left: 10, top: 20, zoom: 2 }, 200, 280),
    ).toEqual({
      left: 6.25,
      top: 20,
      zoom: 2,
    })
    expect(
      namedDestXyzFromAxisPreset('thirty-second-top', { left: 10, top: 20, zoom: 2 }, 200, 280),
    ).toEqual({
      left: 10,
      top: 8.75,
      zoom: 2,
    })
    expect(namedDestXyzFromAxisPreset('thirty-second-left')).toEqual({
      left: LETTER_WIDTH / 32,
      top: null,
      zoom: null,
    })
    expect(namedDestXyzFromAxisPreset('thirty-second-top')).toEqual({
      left: null,
      top: LETTER_HEIGHT / 32,
      zoom: null,
    })
    expect(
      namedDestXyzFromAxisPreset('sixty-fourth-left', { left: 10, top: 20, zoom: 2 }, 200, 280),
    ).toEqual({
      left: 3.125,
      top: 20,
      zoom: 2,
    })
    expect(
      namedDestXyzFromAxisPreset('sixty-fourth-top', { left: 10, top: 20, zoom: 2 }, 200, 280),
    ).toEqual({
      left: 10,
      top: 4.375,
      zoom: 2,
    })
    expect(namedDestXyzFromAxisPreset('sixty-fourth-left')).toEqual({
      left: LETTER_WIDTH / 64,
      top: null,
      zoom: null,
    })
    expect(namedDestXyzFromAxisPreset('sixty-fourth-top')).toEqual({
      left: null,
      top: LETTER_HEIGHT / 64,
      zoom: null,
    })
    expect(namedDestXyzAxisNeedsPageSize('max-left')).toBe(true)
    expect(namedDestXyzAxisNeedsPageSize('max-top')).toBe(true)
    expect(namedDestXyzAxisNeedsPageSize('far')).toBe(true)
    expect(namedDestXyzAxisNeedsPageSize('end')).toBe(true)
    expect(namedDestXyzAxisNeedsPageSize('mid')).toBe(true)
    expect(namedDestXyzAxisNeedsPageSize('focus')).toBe(true)
    expect(namedDestXyzAxisNeedsPageSize('mid-left')).toBe(true)
    expect(namedDestXyzAxisNeedsPageSize('mid-top')).toBe(true)
    expect(namedDestXyzAxisNeedsPageSize('quarter-left')).toBe(true)
    expect(namedDestXyzAxisNeedsPageSize('quarter-top')).toBe(true)
    expect(namedDestXyzAxisNeedsPageSize('three-quarter-left')).toBe(true)
    expect(namedDestXyzAxisNeedsPageSize('three-quarter-top')).toBe(true)
    expect(namedDestXyzAxisNeedsPageSize('eighth-left')).toBe(true)
    expect(namedDestXyzAxisNeedsPageSize('eighth-top')).toBe(true)
    expect(namedDestXyzAxisNeedsPageSize('sixteenth-left')).toBe(true)
    expect(namedDestXyzAxisNeedsPageSize('sixteenth-top')).toBe(true)
    expect(namedDestXyzAxisNeedsPageSize('thirty-second-left')).toBe(true)
    expect(namedDestXyzAxisNeedsPageSize('thirty-second-top')).toBe(true)
    expect(namedDestXyzAxisNeedsPageSize('sixty-fourth-left')).toBe(true)
    expect(namedDestXyzAxisNeedsPageSize('sixty-fourth-top')).toBe(true)
    expect(namedDestXyzAxisNeedsPageSize('origin')).toBe(false)
    expect(namedDestXyzAxisNeedsPageSize('home')).toBe(false)
    expect(namedDestXyzZoomFromPreset('50')).toBe(0.5)
    expect(namedDestXyzZoomFromPreset('75')).toBe(0.75)
    expect(namedDestXyzZoomFromPreset('100')).toBe(1)
    expect(namedDestXyzZoomFromPreset('125')).toBe(1.25)
    expect(namedDestXyzZoomFromPreset('150')).toBe(1.5)
    expect(namedDestXyzZoomFromPreset('200')).toBe(2)
    expect(namedDestXyzZoomFromPreset('keep')).toBeNull()
    expect(namedDestXyzFromZoomPreset('fit-width', { left: 10, top: 20, zoom: 2 })).toEqual({
      left: 0,
      top: 20,
      zoom: 1,
    })
    expect(namedDestXyzFromZoomPreset('fit-width', { left: 10, top: 20, zoom: 2 }, 200)).toEqual({
      left: 0,
      top: 20,
      zoom: LETTER_WIDTH / 200,
    })
    expect(namedDestXyzZoomFromPreset('fit-width', 200)).toBe(LETTER_WIDTH / 200)
    expect(namedDestXyzZoomFromPreset('fit-width', A4_WIDTH)).toBeCloseTo(LETTER_WIDTH / A4_WIDTH)
    expect(
      await listNamedDests(await setNamedDestXyz(named, 'ChapTwo', namedDestXyzFromZoomPreset('100'))),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: null, top: null, zoom: 1 } }])
    const zoomed = await setNamedDestXyz(named, 'ChapTwo', { left: 10, top: 20, zoom: 2 })
    expect(await namedDestXyzZoomFromDestPage(zoomed, 'ChapTwo', '100')).toEqual({
      left: 10,
      top: 20,
      zoom: 1,
    })
    expect(await namedDestXyzZoomFromDestPage(zoomed, 'ChapTwo', '50')).toEqual({
      left: 10,
      top: 20,
      zoom: 0.5,
    })
    expect(await namedDestXyzZoomFromDestPage(zoomed, 'ChapTwo', '200')).toEqual({
      left: 10,
      top: 20,
      zoom: 2,
    })
    expect(await namedDestXyzZoomFromDestPage(zoomed, 'ChapTwo', '75')).toEqual({
      left: 10,
      top: 20,
      zoom: 0.75,
    })
    expect(await namedDestXyzZoomFromDestPage(zoomed, 'ChapTwo', '150')).toEqual({
      left: 10,
      top: 20,
      zoom: 1.5,
    })
    expect(await namedDestXyzZoomFromDestPage(zoomed, 'ChapTwo', '125')).toEqual({
      left: 10,
      top: 20,
      zoom: 1.25,
    })
    expect(await namedDestXyzZoomFromDestPage(zoomed, 'ChapTwo', 'keep')).toEqual({
      left: 10,
      top: 20,
      zoom: null,
    })
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          zoomed,
          'ChapTwo',
          namedDestXyzFromAxisPreset('keep-left', { left: 10, top: 20, zoom: 2 }),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: null, top: 20, zoom: 2 } }])
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          zoomed,
          'ChapTwo',
          namedDestXyzFromAxisPreset('keep-top', { left: 10, top: 20, zoom: 2 }),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 10, top: null, zoom: 2 } }])
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          zoomed,
          'ChapTwo',
          namedDestXyzFromAxisPreset('zero-left', { left: 10, top: 20, zoom: 2 }),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 0, top: 20, zoom: 2 } }])
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          zoomed,
          'ChapTwo',
          namedDestXyzFromAxisPreset('zero-top', { left: 10, top: 20, zoom: 2 }),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 10, top: 0, zoom: 2 } }])
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          zoomed,
          'ChapTwo',
          namedDestXyzFromAxisPreset('origin', { left: 10, top: 20, zoom: 2 }),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 0, top: 0, zoom: 2 } }])
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          zoomed,
          'ChapTwo',
          namedDestXyzFromAxisPreset('home', { left: 10, top: 20, zoom: 2 }),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 0, top: 0, zoom: 1 } }])
    expect(await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'max-left')).toEqual({
      left: 200,
      top: 20,
      zoom: 2,
    })
    expect(await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'max-top')).toEqual({
      left: 10,
      top: 280,
      zoom: 2,
    })
    expect(
      await listNamedDests(
        await setNamedDestXyz(zoomed, 'ChapTwo', await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'max-left')),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 200, top: 20, zoom: 2 } }])
    expect(
      await listNamedDests(
        await setNamedDestXyz(zoomed, 'ChapTwo', await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'max-top')),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 10, top: 280, zoom: 2 } }])
    expect(await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'far')).toEqual({
      left: 200,
      top: 280,
      zoom: 2,
    })
    expect(await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'end')).toEqual({
      left: 200,
      top: 280,
      zoom: 1,
    })
    expect(
      await listNamedDests(
        await setNamedDestXyz(zoomed, 'ChapTwo', await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'far')),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 200, top: 280, zoom: 2 } }])
    expect(
      await listNamedDests(
        await setNamedDestXyz(zoomed, 'ChapTwo', await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'end')),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 200, top: 280, zoom: 1 } }])
    expect(await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'mid')).toEqual({
      left: 100,
      top: 140,
      zoom: 2,
    })
    expect(await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'focus')).toEqual({
      left: 100,
      top: 140,
      zoom: 1,
    })
    expect(
      await listNamedDests(
        await setNamedDestXyz(zoomed, 'ChapTwo', await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'mid')),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 100, top: 140, zoom: 2 } }])
    expect(
      await listNamedDests(
        await setNamedDestXyz(zoomed, 'ChapTwo', await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'focus')),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 100, top: 140, zoom: 1 } }])
    expect(await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'mid-left')).toEqual({
      left: 100,
      top: 20,
      zoom: 2,
    })
    expect(await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'mid-top')).toEqual({
      left: 10,
      top: 140,
      zoom: 2,
    })
    expect(
      await listNamedDests(
        await setNamedDestXyz(zoomed, 'ChapTwo', await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'mid-left')),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 100, top: 20, zoom: 2 } }])
    expect(
      await listNamedDests(
        await setNamedDestXyz(zoomed, 'ChapTwo', await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'mid-top')),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 10, top: 140, zoom: 2 } }])
    expect(await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'quarter-left')).toEqual({
      left: 50,
      top: 20,
      zoom: 2,
    })
    expect(await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'quarter-top')).toEqual({
      left: 10,
      top: 70,
      zoom: 2,
    })
    expect(
      await listNamedDests(
        await setNamedDestXyz(zoomed, 'ChapTwo', await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'quarter-left')),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 50, top: 20, zoom: 2 } }])
    expect(
      await listNamedDests(
        await setNamedDestXyz(zoomed, 'ChapTwo', await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'quarter-top')),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 10, top: 70, zoom: 2 } }])
    expect(await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'three-quarter-left')).toEqual({
      left: 150,
      top: 20,
      zoom: 2,
    })
    expect(await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'three-quarter-top')).toEqual({
      left: 10,
      top: 210,
      zoom: 2,
    })
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          zoomed,
          'ChapTwo',
          await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'three-quarter-left'),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 150, top: 20, zoom: 2 } }])
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          zoomed,
          'ChapTwo',
          await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'three-quarter-top'),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 10, top: 210, zoom: 2 } }])
    expect(await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'eighth-left')).toEqual({
      left: 25,
      top: 20,
      zoom: 2,
    })
    expect(await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'eighth-top')).toEqual({
      left: 10,
      top: 35,
      zoom: 2,
    })
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          zoomed,
          'ChapTwo',
          await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'eighth-left'),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 25, top: 20, zoom: 2 } }])
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          zoomed,
          'ChapTwo',
          await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'eighth-top'),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 10, top: 35, zoom: 2 } }])
    expect(await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'sixteenth-left')).toEqual({
      left: 12.5,
      top: 20,
      zoom: 2,
    })
    expect(await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'sixteenth-top')).toEqual({
      left: 10,
      top: 17.5,
      zoom: 2,
    })
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          zoomed,
          'ChapTwo',
          await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'sixteenth-left'),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 12.5, top: 20, zoom: 2 } }])
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          zoomed,
          'ChapTwo',
          await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'sixteenth-top'),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 10, top: 17.5, zoom: 2 } }])
    expect(await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'thirty-second-left')).toEqual({
      left: 6.25,
      top: 20,
      zoom: 2,
    })
    expect(await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'thirty-second-top')).toEqual({
      left: 10,
      top: 8.75,
      zoom: 2,
    })
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          zoomed,
          'ChapTwo',
          await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'thirty-second-left'),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 6.25, top: 20, zoom: 2 } }])
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          zoomed,
          'ChapTwo',
          await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'thirty-second-top'),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 10, top: 8.75, zoom: 2 } }])
    expect(await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'sixty-fourth-left')).toEqual({
      left: 3.125,
      top: 20,
      zoom: 2,
    })
    expect(await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'sixty-fourth-top')).toEqual({
      left: 10,
      top: 4.375,
      zoom: 2,
    })
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          zoomed,
          'ChapTwo',
          await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'sixty-fourth-left'),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 3.125, top: 20, zoom: 2 } }])
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          zoomed,
          'ChapTwo',
          await namedDestXyzFromAxisDestPage(zoomed, 'ChapTwo', 'sixty-fourth-top'),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 10, top: 4.375, zoom: 2 } }])
    expect(await namedDestXyzZoomFromDestPage(zoomed, 'ChapTwo', 'fit-width')).toEqual({
      left: 0,
      top: 20,
      zoom: LETTER_WIDTH / 200,
    })
    expect(
      await listNamedDests(
        await setNamedDestXyz(zoomed, 'ChapTwo', await namedDestXyzZoomFromDestPage(zoomed, 'ChapTwo', '100')),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 10, top: 20, zoom: 1 } }])
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          zoomed,
          'ChapTwo',
          await namedDestXyzZoomFromDestPage(zoomed, 'ChapTwo', 'fit-width'),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 0, top: 20, zoom: LETTER_WIDTH / 200 } }])
    expect(namedDestXyzFromZoomPreset('fit-height', { left: 10, top: 20, zoom: 2 })).toEqual({
      left: 10,
      top: 0,
      zoom: 1,
    })
    expect(namedDestXyzFromZoomPreset('fit-height', { left: 10, top: 20, zoom: 2 }, undefined, 200)).toEqual({
      left: 10,
      top: 0,
      zoom: LETTER_HEIGHT / 200,
    })
    expect(namedDestXyzZoomFromPreset('fit-height', undefined, 200)).toBe(LETTER_HEIGHT / 200)
    expect(namedDestXyzZoomFromPreset('fit-height', undefined, A4_HEIGHT)).toBeCloseTo(
      LETTER_HEIGHT / A4_HEIGHT,
    )
    expect(await namedDestXyzZoomFromDestPage(zoomed, 'ChapTwo', 'fit-height')).toEqual({
      left: 10,
      top: 0,
      zoom: LETTER_HEIGHT / 280,
    })
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          zoomed,
          'ChapTwo',
          await namedDestXyzZoomFromDestPage(zoomed, 'ChapTwo', 'fit-height'),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 10, top: 0, zoom: LETTER_HEIGHT / 280 } }])
    expect(namedDestXyzFromZoomPreset('fit-page', { left: 10, top: 20, zoom: 2 })).toEqual({
      left: 0,
      top: 0,
      zoom: 1,
    })
    expect(namedDestXyzFromZoomPreset('fit-page', { left: 10, top: 20, zoom: 2 }, 200, 200)).toEqual({
      left: 0,
      top: 0,
      zoom: Math.min(LETTER_WIDTH / 200, LETTER_HEIGHT / 200),
    })
    expect(namedDestXyzZoomFromPreset('fit-page', 200, 200)).toBe(
      Math.min(LETTER_WIDTH / 200, LETTER_HEIGHT / 200),
    )
    expect(namedDestXyzZoomFromPreset('fit-page', A4_WIDTH, A4_HEIGHT)).toBeCloseTo(
      Math.min(LETTER_WIDTH / A4_WIDTH, LETTER_HEIGHT / A4_HEIGHT),
    )
    expect(await namedDestXyzZoomFromDestPage(zoomed, 'ChapTwo', 'fit-page')).toEqual({
      left: 0,
      top: 0,
      zoom: Math.min(LETTER_WIDTH / 200, LETTER_HEIGHT / 280),
    })
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          zoomed,
          'ChapTwo',
          await namedDestXyzZoomFromDestPage(zoomed, 'ChapTwo', 'fit-page'),
        ),
      ),
    ).toEqual([
      {
        name: 'ChapTwo',
        pageIndex: 1,
        xyz: { left: 0, top: 0, zoom: Math.min(LETTER_WIDTH / 200, LETTER_HEIGHT / 280) },
      },
    ])
    expect(
      await listNamedDests(
        await setNamedDestXyz(
          zoomed,
          'ChapTwo',
          await namedDestXyzZoomFromDestPage(zoomed, 'ChapTwo', 'keep'),
        ),
      ),
    ).toEqual([{ name: 'ChapTwo', pageIndex: 1, xyz: { left: 10, top: 20, zoom: null } }])
    await expect(namedDestXyzZoomFromDestPage(named, 'Missing', '100')).rejects.toThrow(/đích tên/)
    expect(() => namedDestXyzFromZoomPreset('zoom' as '100')).toThrow(/Zoom XYZ/)

    expect(toRomanNumeral(2)).toBe('ii')
    expect(toRomanNumeral(4, true)).toBe('IV')
    expect(formatPageLabel('trang', 3)).toBe('Trang 3')
    expect(formatPageLabel('roman', 2)).toBe('ii')
    expect(frontMatterPageCount([0, 1], 4)).toBe(2)
    expect(frontMatterPageCount([0, 1, 2, 3], 4)).toBeNull()
    expect(frontMatterPageCount([1, 2], 4)).toBeNull()
    const labeled = await setPageLabels(bytes, 'trang')
    expect(await listPageLabels(labeled)).toEqual([
      { startIndex: 0, style: 'trang', prefix: 'Trang ', start: 1 },
    ])
    const roman = await setPageLabels(bytes, 'roman', 1)
    expect(await listPageLabels(roman)).toEqual([
      { startIndex: 0, style: 'roman', prefix: '', start: 1 },
    ])
    const split = await setFrontMatterPageLabels(await samplePdf(['A', 'B', 'C']), 1)
    expect(await listPageLabels(split)).toEqual([
      { startIndex: 0, style: 'roman', prefix: '', start: 1 },
      { startIndex: 1, style: 'decimal', prefix: '', start: 1 },
    ])
    expect(pageLabelForIndex([], 0)).toBe('1')
    expect(pageLabelForIndex([{ startIndex: 0, style: 'roman', prefix: '', start: 1 }], 1)).toBe(
      'ii',
    )
    expect(pageLabelsForCount(await listPageLabels(split), 3)).toEqual(['i', '1', '2'])
    expect(pageLabelsForCount(await listPageLabels(labeled), 2)).toEqual(['Trang 1', 'Trang 2'])
    await expect(setPageLabels(bytes, 'decimal', 0)).rejects.toThrow(/bắt đầu/)
    await expect(setFrontMatterPageLabels(bytes, 2)).rejects.toThrow(/mở đầu/)
    await expect(extractEmbeddedImages(bytes, [0])).rejects.toThrow(/ảnh nhúng/)
    await expect(extractEmbeddedImages(bytes, [])).rejects.toThrow(/ảnh nhúng/)

    const pixels = new Uint8ClampedArray(4 * 4 * 4)
    pixels.fill(255)
    pixels[4 * (1 * 4 + 1)] = 10
    pixels[4 * (1 * 4 + 1) + 1] = 10
    pixels[4 * (1 * 4 + 1) + 2] = 10
    pixels[4 * (1 * 4 + 1) + 3] = 255
    pixels[4 * (2 * 4 + 2)] = 20
    pixels[4 * (2 * 4 + 2) + 1] = 20
    pixels[4 * (2 * 4 + 2) + 2] = 20
    pixels[4 * (2 * 4 + 2) + 3] = 255
    expect(contentBoundsFromRgba(pixels, 4, 4)).toEqual({ minX: 1, minY: 1, maxX: 2, maxY: 2 })
    expect(contentBoundsFromRgba(new Uint8ClampedArray(16).fill(255), 2, 2)).toBeNull()

    const box = cropBoxFromContentBounds(
      { width: 200, height: 280 },
      { width: 4, height: 4 },
      { minX: 1, minY: 1, maxX: 2, maxY: 2 },
      0,
    )
    expect(box).toEqual({ x: 50, y: 70, width: 100, height: 140 })
    expect(pageBoxEquals(box, { x: 50.2, y: 70.1, width: 100, height: 140 })).toBe(true)
    expect(() =>
      cropBoxFromContentBounds(
        { width: 40, height: 40 },
        { width: 40, height: 40 },
        { minX: 18, minY: 18, maxX: 19, maxY: 19 },
        0,
      ),
    ).toThrow(/quá nhỏ/)

    const cropped = await autoCropPages(
      bytes,
      [0],
      [{ index: 0, data: pixels, width: 4, height: 4 }],
      contentBoundsFromRgba,
    )
    const cropDoc = await PDFDocument.load(cropped)
    const next = cropDoc.getPage(0).getCropBox()
    expect(next.width).toBeLessThan(200)
    expect(next.height).toBeLessThan(280)
    expect(cropDoc.getPage(1).getCropBox().width).toBe(200)
    await expect(autoCropPages(bytes, [], [], contentBoundsFromRgba)).rejects.toThrow(/cắt lề trắng/)
    await expect(
      autoCropPages(
        bytes,
        [0],
        [{ index: 0, data: new Uint8ClampedArray(16).fill(255), width: 2, height: 2 }],
        contentBoundsFromRgba,
      ),
    ).rejects.toThrow(/Không tìm thấy nội dung/)
    const same = await applyContentCrops(bytes, [
      { index: 0, box: { x: 0, y: 0, width: 200, height: 280 } },
    ])
    expect(same).toBe(bytes)
    expect(AUTO_CROP_PADDING).toBe(8)
  })

  it('writes metadata and builds pages from PNG images', async () => {
    const bytes = await samplePdf(['A', 'B'])
    expect(trimMetadataField('  Xin   chào  ')).toBe('Xin chào')
    expect(trimMetadataField('x'.repeat(MAX_METADATA_LENGTH + 8))).toHaveLength(MAX_METADATA_LENGTH)
    const labeled = await setMetadata(bytes, {
      title: 'Báo cáo',
      author: 'Phú',
      subject: 'PDF',
    })
    await expect(readMetadata(labeled)).resolves.toEqual({
      title: 'Báo cáo',
      author: 'Phú',
      subject: 'PDF',
    })
    expect(imagePageSize(100, 50)).toEqual({ width: 100, height: 50 })
    expect(imagePageSize(2000, 1000)).toEqual({
      width: IMAGE_PAGE_MAX_EDGE,
      height: IMAGE_PAGE_MAX_EDGE / 2,
    })
    const png = tinyPng()
    const fromImage = await imagesToPdf([{ bytes: png, kind: 'png' }])
    expect(await pageCount(fromImage)).toBe(1)
    const pulled = await extractEmbeddedImages(fromImage, [0])
    expect(pulled).toHaveLength(1)
    expect(pulled[0]?.kind).toBe('png')
    expect(pulled[0]?.bytes.byteLength).toBeGreaterThan(8)
    expect(pulled[0]?.bytes[0]).toBe(0x89)
    await expect(imagesToPdf([])).rejects.toThrow(/ảnh PNG/)
    const inserted = await insertImages(bytes, [{ bytes: png, kind: 'png' }], 1)
    expect(await pageCount(inserted)).toBe(3)
    const covered = await replacePagesWithPngs(bytes, [{ index: 0, png }])
    expect(await pageCount(covered)).toBe(2)
    await expect(replacePagesWithPngs(bytes, [])).rejects.toThrow(/ảnh/)
  })

  it('fits selected pages onto A4 while leaving others', async () => {
    expect(fittedPageRect({ width: 200, height: 100 }, { width: 400, height: 400 })).toEqual({
      x: 0,
      y: 100,
      width: 400,
      height: 200,
    })
    expect(a4SizeForPage({ width: 800, height: 400 })).toEqual({
      width: A4_HEIGHT,
      height: A4_WIDTH,
    })
    expect(a4SizeForPage({ width: 400, height: 800 })).toEqual({
      width: A4_WIDTH,
      height: A4_HEIGHT,
    })
    const bytes = await samplePdf(['A', 'B'])
    const fitted = await fitPagesToA4(bytes, [0])
    const doc = await PDFDocument.load(fitted)
    expect(doc.getPageCount()).toBe(2)
    const first = doc.getPage(0).getSize()
    expect(first.width).toBeCloseTo(A4_WIDTH)
    expect(first.height).toBeCloseTo(A4_HEIGHT)
    const second = doc.getPage(1).getSize()
    expect(second.width).toBe(200)
    expect(second.height).toBe(280)
    await expect(fitPagesToA4(bytes, [])).rejects.toThrow(/A4/)
  })

  it('fits selected pages onto Letter or A5', async () => {
    expect(paperSizeForPage({ width: 800, height: 400 }, 'letter')).toEqual({
      width: LETTER_HEIGHT,
      height: LETTER_WIDTH,
    })
    expect(paperSizeForPage({ width: 400, height: 800 }, 'a5')).toEqual({
      width: A5_WIDTH,
      height: A5_HEIGHT,
    })
    expect(PAPER_LABELS.letter).toBe('Letter')
    const bytes = await samplePdf(['A', 'B'])
    const letter = await fitPagesToPaper(bytes, [0], 'letter')
    const letterDoc = await PDFDocument.load(letter)
    expect(letterDoc.getPage(0).getSize().width).toBeCloseTo(LETTER_WIDTH)
    expect(letterDoc.getPage(0).getSize().height).toBeCloseTo(LETTER_HEIGHT)
    expect(letterDoc.getPage(1).getSize()).toEqual({ width: 200, height: 280 })
    const a5 = await fitPagesToPaper(bytes, [1], 'a5')
    const a5Doc = await PDFDocument.load(a5)
    expect(a5Doc.getPage(1).getSize().width).toBeCloseTo(A5_WIDTH)
    expect(a5Doc.getPage(1).getSize().height).toBeCloseTo(A5_HEIGHT)
    await expect(fitPagesToPaper(bytes, [], 'letter')).rejects.toThrow(/Letter/)
  })

  it('interleaves halves and splits odd/even pages', async () => {
    expect(interleaveHalvesOrder(1)).toEqual([0])
    expect(interleaveHalvesOrder(2)).toEqual([0, 1])
    expect(interleaveHalvesOrder(4)).toEqual([0, 2, 1, 3])
    expect(interleaveHalvesOrder(5)).toEqual([0, 3, 1, 4, 2])
    expect(deinterleaveOddEvenOrder(4)).toEqual([0, 2, 1, 3])
    expect(deinterleaveOddEvenOrder(5)).toEqual([0, 2, 4, 1, 3])
    expect(remapAfterOrder([0, 3, 1, 4, 2], [0, 2])).toEqual([0, 4])
    expect(isIdentityOrder(interleaveHalvesOrder(2))).toBe(true)
    const bytes = await samplePdf(['A', 'B', 'C', 'D'])
    const collated = await interleaveHalves(bytes)
    expect(await pageCount(collated)).toBe(4)
    const split = await deinterleaveOddEven(bytes)
    expect(await pageCount(split)).toBe(4)
    const small = await samplePdf(['A', 'B'])
    expect(await interleaveHalves(small)).toBe(small)
  })

  it('packs pages onto 2-up and 4-up A4 sheets', async () => {
    expect(nUpSheetCount(5, 2)).toBe(3)
    expect(nUpSheetCount(5, 4)).toBe(2)
    expect(nUpSheetCount(0, 2)).toBe(0)
    expect(nUpSheetSize(2)).toEqual({ width: A4_HEIGHT, height: A4_WIDTH })
    expect(nUpSheetSize(4)).toEqual({ width: A4_WIDTH, height: A4_HEIGHT })
    expect(nUpCellRects(2, A4_LANDSCAPE)).toHaveLength(2)
    expect(nUpCellRects(4, A4_PORTRAIT)).toHaveLength(4)
    const bytes = await samplePdf(['A', 'B', 'C'])
    const twoUp = await nUpPages(bytes, 2)
    const twoDoc = await PDFDocument.load(twoUp)
    expect(twoDoc.getPageCount()).toBe(2)
    expect(twoDoc.getPage(0).getSize().width).toBeCloseTo(A4_HEIGHT)
    const selected = await nUpPages(bytes, 2, [0, 2])
    expect(await pageCount(selected)).toBe(1)
    const fourUp = await nUpPages(bytes, 4)
    expect(await pageCount(fourUp)).toBe(1)
    await expect(nUpPages(bytes, 2, [])).rejects.toThrow(/gộp/)
  })

  it('imposes a saddle-stitch booklet and mirrors selected pages', async () => {
    expect(bookletSlotOrder(4)).toEqual([3, 0, 1, 2])
    expect(bookletSlotOrder(8)).toEqual([7, 0, 1, 6, 5, 2, 3, 4])
    expect(bookletSlotOrder(5)).toEqual([null, 0, 1, null, null, 2, 3, 4])
    expect(bookletSheetCount(5)).toBe(4)
    expect(bookletSlotLabel(null)).toBe('trắng')
    expect(bookletSlotLabel(0)).toBe('1')
    expect(bookletPreviewSheets(4)).toEqual([
      { sheet: 1, front: { left: 3, right: 0 }, back: { left: 1, right: 2 } },
    ])
    expect(bookletPreviewSheets(5)).toEqual([
      { sheet: 1, front: { left: null, right: 0 }, back: { left: 1, right: null } },
      { sheet: 2, front: { left: null, right: 2 }, back: { left: 3, right: 4 } },
    ])
    const bytes = await samplePdf(['A', 'B', 'C', 'D'])
    const booklet = await imposeBooklet(bytes)
    const bookletDoc = await PDFDocument.load(booklet)
    expect(bookletDoc.getPageCount()).toBe(2)
    expect(bookletDoc.getPage(0).getSize().width).toBeCloseTo(A4_HEIGHT)
    const flipped = await flipPages(bytes, [0], 'horizontal')
    expect(await pageCount(flipped)).toBe(4)
    const flippedAll = await flipPages(bytes, [1, 3], 'vertical')
    expect(await pageCount(flippedAll)).toBe(4)
    await expect(flipPages(bytes, [])).rejects.toThrow(/lật/)
  })

  it('splits selected pages in half and remaps the selection', async () => {
    expect(remapAfterSplitHalf(3, [1], [1])).toEqual([1, 2])
    expect(remapAfterSplitHalf(3, [0, 2], [0, 2])).toEqual([0, 1, 3, 4])
    expect(remapAfterSplitHalf(3, [1], [0])).toEqual([2])
    const bytes = await samplePdf(['A', 'B', 'C'])
    const splitH = await splitPagesInHalf(bytes, [0], 'horizontal')
    const splitHDoc = await PDFDocument.load(splitH)
    expect(splitHDoc.getPageCount()).toBe(4)
    expect(splitHDoc.getPage(0).getSize().height).toBeCloseTo(140)
    expect(splitHDoc.getPage(1).getSize().height).toBeCloseTo(140)
    expect(splitHDoc.getPage(2).getSize().height).toBeCloseTo(280)
    const splitV = await splitPagesInHalf(bytes, [1, 2], 'vertical')
    expect(await pageCount(splitV)).toBe(5)
    const splitVDoc = await PDFDocument.load(splitV)
    expect(splitVDoc.getPage(1).getSize().width).toBeCloseTo(100)
    await expect(splitPagesInHalf(bytes, [], 'horizontal')).rejects.toThrow(/cắt đôi/)
    const tiny = await PDFDocument.create()
    tiny.addPage([40, 40])
    await expect(
      splitPagesInHalf(new Uint8Array(await tiny.save()), [0], 'horizontal'),
    ).rejects.toThrow(/quá nhỏ/)
  })

  it('orients selected pages to portrait or landscape', async () => {
    expect(pageOrientation({ width: 200, height: 280 })).toBe('portrait')
    expect(pageOrientation({ width: 280, height: 200 })).toBe('landscape')
    expect(needsOrientation({ width: 200, height: 280 }, 'portrait')).toBe(false)
    expect(needsOrientation({ width: 200, height: 280 }, 'landscape')).toBe(true)
    expect(needsOrientation({ width: 200, height: 200 }, 'landscape')).toBe(false)
    const bytes = await samplePdf(['A', 'B'])
    const landscape = await orientPages(bytes, [0], 'landscape')
    const landscapeDoc = await PDFDocument.load(landscape)
    expect(displayedPageSize(landscapeDoc.getPage(0))).toEqual({ width: 280, height: 200 })
    expect(displayedPageSize(landscapeDoc.getPage(1))).toEqual({ width: 200, height: 280 })
    const already = await orientPages(landscape, [0], 'landscape')
    expect(already).toBe(landscape)
    const back = await orientPages(landscape, [0], 'portrait')
    expect(displayedPageSize((await PDFDocument.load(back)).getPage(0))).toEqual({
      width: 200,
      height: 280,
    })
    await expect(orientPages(bytes, [], 'portrait')).rejects.toThrow(/xoay khổ/)
  })

  it('scales selected pages by a percent', async () => {
    expect(SCALE_PERCENTS).toEqual([50, 75, 125, 150])
    expect(scaleFactor(50)).toBe(0.5)
    expect(scaleFactor(150)).toBe(1.5)
    expect(() => scaleFactor(10)).toThrow(/25%/)
    const bytes = await samplePdf(['A', 'B'])
    const identity = await scalePages(bytes, [0], 100)
    expect(identity).toBe(bytes)
    const grown = await scalePages(bytes, [0], 150)
    const grownDoc = await PDFDocument.load(grown)
    expect(grownDoc.getPage(0).getSize()).toEqual({ width: 300, height: 420 })
    expect(grownDoc.getPage(1).getSize()).toEqual({ width: 200, height: 280 })
    const shrunk = await scalePages(bytes, [1], 50)
    expect((await PDFDocument.load(shrunk)).getPage(1).getSize()).toEqual({
      width: 100,
      height: 140,
    })
    await expect(scalePages(bytes, [], 125)).rejects.toThrow(/tỷ lệ/)
    const tiny = await PDFDocument.create()
    tiny.addPage([40, 40])
    await expect(scalePages(new Uint8Array(await tiny.save()), [0], 50)).rejects.toThrow(/quá nhỏ/)
  })
})

describe('conversion helpers', () => {
  it('builds text and html from page strings', () => {
    const pages = ['Xin chào', 'Trang hai']
    expect(toTxt(pages)).toContain('Trang 2')
    expect(toMarkdown('Demo', pages)).toContain('# Demo')
    expect(toMarkdown('Demo', pages)).toContain('## Trang 2')
    expect(toHtml('Demo', pages)).toContain('<h2>Trang 1</h2>')
    expect(toHtml('Demo', pages)).toContain('<article>')
    expect(escapeHtml('<b>x</b>')).toBe('&lt;b&gt;x&lt;/b&gt;')
    expect(slicePageRange(['A', 'B', 'C'], 2, 3)).toEqual(['B', 'C'])
    expect(slicePagesByIndexes(['A', 'B', 'C'], [0, 2])).toEqual(['A', 'C'])
    expect(() => slicePagesByIndexes(['A'], [])).toThrow(/đã chọn/)
    expect(() => slicePageRange(['A'], 2, 1)).toThrow(/Khoảng trang/)
    expect(pagesFromPlainText('--- Trang 1 ---\nA\n--- Trang 2 ---\nB')).toEqual(['A', 'B'])
    expect(pagesFromMarkdown('# Demo\n\n## Trang 1\nMột\n\n## Trang 2\nHai')).toEqual(['Một', 'Hai'])
    expect(pagesFromHtml('<section>Một</section><section>Hai</section>')).toEqual(['Một', 'Hai'])
    expect(stripMarkup('<p>Hi<br/>there</p>')).toContain('Hi')
    expect(pagesFromImportedText('txt', 'Chỉ một đoạn.')).toEqual(['Chỉ một đoạn.'])
    expect(swapExtension('notes.md', 'pdf')).toBe('notes.pdf')
    expect(toRtf('Demo', ['Xin chào', 'Hai'])).toContain('{\\rtf1')
    expect(toRtf('Demo', ['Xin chào'])).toContain('Demo')
    expect(escapeRtf('a{b}\\c')).toBe('a\\{b\\}\\\\c')
    expect(escapeRtf('Xin chào')).toMatch(/\\u/)
    expect(isImageFormat('png')).toBe(true)
    expect(isImageFormat('jpg')).toBe(true)
    expect(isImageFormat('webp')).toBe(true)
    expect(isImageFormat('docx')).toBe(false)
    expect(isComicFormat('cbz')).toBe(true)
    expect(isComicFormat('png')).toBe(false)
    expect(comicPageName(0)).toBe('001.jpg')
    expect(comicPageName(9, 'png')).toBe('010.png')
    expect(embeddedImageName('demo.pdf', 0, 1, 'jpg')).toBe('demo-trang-1-anh-2.jpg')
    expect(embeddedImageZipName('demo.pdf')).toBe('demo-anh-nhung.zip')
    expect(imagePageName('demo.pdf', 0, 'webp')).toBe('demo-trang-1.webp')
    expect(imageZipName('demo.pdf', 'webp')).toBe('demo-anh-webp.zip')
    expect(toJson('Demo', ['Một', 'Hai'])).toContain('"page": 2')
    expect(JSON.parse(toJson('Demo', ['Một'])).pages[0].text).toBe('Một')
    expect(toCsv(['Một', 'Hai,ba'])).toContain('page,text')
    expect(toCsv(['a"b'])).toContain('"a""b"')
    expect(escapeCsv('a,b')).toBe('"a,b"')
    expect(isImageKind('png')).toBe(true)
    expect(imageKindFromFile({ name: 'scan.JPEG', type: '' })).toBe('jpg')
    expect(imageKindFromFile({ name: 'x.png', type: 'image/png' })).toBe('png')
    expect(swapExtension('photo.png', 'pdf')).toBe('photo.pdf')
    expect(imagePageName('demo.pdf', 2, 'png')).toBe('demo-trang-3.png')
    expect(imageZipName('demo.pdf', 'jpg')).toBe('demo-anh-jpg.zip')
    expect(indexesFromPageRange(2, 4)).toEqual([1, 2, 3])
    expect(() => indexesFromPageRange(3, 1)).toThrow(/Khoảng trang/)
    expect(pagesFromJson(toJson('Demo', ['Một', 'Hai']))).toEqual(['Một', 'Hai'])
    expect(toYaml('Demo', ['Một', 'Hai\ndòng'])).toContain('title: "Demo"')
    expect(escapeYaml('a"b')).toContain('\\"')
    expect(pagesFromYaml(toYaml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromYaml('pages:\n  - text: |-\n      Một\n      Hai')).toEqual(['Một\nHai'])
    expect(() => pagesFromYaml('title: Demo\n')).toThrow(/YAML/)
    expect(toXml('Demo', ['Một', 'Hai <ba>'])).toContain('<page n="1">Một</page>')
    expect(pagesFromXml(toXml('Demo', ['Một', 'Hai <ba>']))).toEqual(['Một', 'Hai <ba>'])
    expect(() => pagesFromXml('<document/>')).toThrow(/XML/)
    expect(pagesFromImportedText('yaml', toYaml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromImportedText('xml', toXml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(toTsv(['Một', 'Hai\tba'])).toContain('page\ttext')
    expect(toTsv(['a"b'])).toContain('"a""b"')
    expect(escapeTsv('a\tb')).toBe('"a\tb"')
    expect(pagesFromTsv(toTsv(['Một', 'Hai\tba']))).toEqual(['Một', 'Hai\tba'])
    expect(pagesFromImportedText('tsv', toTsv(['Hi']))).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.tsv', { type: '' }))).toBe('tsv')
    expect(swapExtension('notes.tsv', 'pdf')).toBe('notes.pdf')
    expect(toToml('Demo', ['Một', 'Hai\ndòng'])).toContain('title = "Demo"')
    expect(toToml('Demo', ['Một'])).toContain('[[pages]]')
    expect(escapeToml('a"b')).toContain('\\"')
    expect(pagesFromToml(toToml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(() => pagesFromToml('title = "Demo"\n')).toThrow(/TOML/)
    expect(pagesFromImportedText('toml', toToml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromToml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.toml', { type: 'application/toml' }))).toBe(
      'toml',
    )
    expect(swapExtension('notes.toml', 'pdf')).toBe('notes.pdf')
    expect(toOrg('Demo', ['Một', 'Hai\ndòng'])).toContain('* Demo')
    expect(toOrg('Demo', ['Một'])).toContain('** Trang 1')
    expect(pagesFromOrg(toOrg('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('org', toOrg('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromOrg('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.org', { type: '' }))).toBe('org')
    expect(swapExtension('notes.org', 'pdf')).toBe('notes.pdf')
    expect(toLatex('Demo', ['Một', 'Hai & ba'])).toContain('\\title{Demo}')
    expect(toLatex('Demo', ['Một'])).toContain('\\section*{Trang 1}')
    expect(escapeLatex('a&b_c')).toBe('a\\&b\\_c')
    expect(pagesFromLatex(toLatex('Demo', ['Một', 'Hai & ba']))).toEqual(['Một', 'Hai & ba'])
    expect(() => pagesFromLatex('\\documentclass{article}\\begin{document}\\end{document}')).toThrow(
      /LaTeX/,
    )
    expect(pagesFromImportedText('tex', toLatex('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromLatex('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'paper.tex', { type: '' }))).toBe('tex')
    expect(sourceKindFromFile(new File(['x'], 'paper.latex', { type: 'application/x-latex' }))).toBe(
      'tex',
    )
    expect(swapExtension('paper.tex', 'pdf')).toBe('paper.pdf')
    expect(toJsonl(['Một', 'Hai\ndòng'])).toContain('"page":1')
    expect(toJsonl(['Một'])).toContain('"text":"Một"')
    expect(pagesFromJsonl(toJsonl(['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('jsonl', toJsonl(['Hi']))).toEqual(['Hi'])
    expect(pagesFromJsonl('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(() => pagesFromJsonl('{"page":1}\nnot-json')).toThrow(/JSONL/)
    expect(sourceKindFromFile(new File(['x'], 'notes.jsonl', { type: '' }))).toBe('jsonl')
    expect(sourceKindFromFile(new File(['x'], 'notes.ndjson', { type: 'application/x-ndjson' }))).toBe(
      'jsonl',
    )
    expect(swapExtension('notes.jsonl', 'pdf')).toBe('notes.pdf')
    expect(toIni('Demo', ['Một', 'Hai\ndòng'])).toContain('[document]')
    expect(toIni('Demo', ['Một'])).toContain('[page.1]')
    expect(escapeIni('a"b')).toContain('\\"')
    expect(pagesFromIni(toIni('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(() => pagesFromIni('[document]\ntitle = "Demo"\n')).toThrow(/INI/)
    expect(pagesFromImportedText('ini', toIni('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromIni('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.ini', { type: '' }))).toBe('ini')
    expect(sourceKindFromFile(new File(['x'], 'notes.cfg', { type: 'text/ini' }))).toBe('ini')
    expect(swapExtension('notes.ini', 'pdf')).toBe('notes.pdf')
    expect(toAdoc('Demo', ['Một', 'Hai\ndòng'])).toContain('= Demo')
    expect(toAdoc('Demo', ['Một'])).toContain('== Trang 1')
    expect(pagesFromAdoc(toAdoc('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('adoc', toAdoc('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromAdoc('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.adoc', { type: '' }))).toBe('adoc')
    expect(sourceKindFromFile(new File(['x'], 'notes.asciidoc', { type: 'text/asciidoc' }))).toBe(
      'adoc',
    )
    expect(swapExtension('notes.adoc', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.asciidoc', 'pdf')).toBe('notes.pdf')
    expect(toRst('Demo', ['Một', 'Hai\ndòng'])).toContain('Demo\n====')
    expect(toRst('Demo', ['Một'])).toContain('Trang 1\n-------')
    expect(pagesFromRst(toRst('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('rst', toRst('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromRst('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.rst', { type: '' }))).toBe('rst')
    expect(sourceKindFromFile(new File(['x'], 'notes.rest', { type: 'text/x-rst' }))).toBe('rst')
    expect(swapExtension('notes.rst', 'pdf')).toBe('notes.pdf')
    expect(toTextile('Demo', ['Một', 'Hai\ndòng'])).toContain('h1. Demo')
    expect(toTextile('Demo', ['Một'])).toContain('h2. Trang 1')
    expect(pagesFromTextile(toTextile('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('textile', toTextile('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromTextile('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.textile', { type: '' }))).toBe('textile')
    expect(sourceKindFromFile(new File(['x'], 'notes.txtl', { type: 'text/x-textile' }))).toBe(
      'textile',
    )
    expect(swapExtension('notes.textile', 'pdf')).toBe('notes.pdf')
    expect(toWiki('Demo', ['Một', 'Hai\ndòng'])).toContain('= Demo =')
    expect(toWiki('Demo', ['Một'])).toContain('== Trang 1 ==')
    expect(pagesFromWiki(toWiki('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('wiki', toWiki('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromWiki('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.wiki', { type: '' }))).toBe('wiki')
    expect(sourceKindFromFile(new File(['x'], 'notes.mediawiki', { type: 'text/x-mediawiki' }))).toBe(
      'wiki',
    )
    expect(swapExtension('notes.wiki', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.mediawiki', 'pdf')).toBe('notes.pdf')
    expect(toDokuwiki('Demo', ['Một', 'Hai\ndòng'])).toContain('====== Demo ======')
    expect(toDokuwiki('Demo', ['Một'])).toContain('=== Trang 1 ===')
    expect(pagesFromDokuwiki(toDokuwiki('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('dokuwiki', toDokuwiki('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromDokuwiki('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.dokuwiki', { type: '' }))).toBe('dokuwiki')
    expect(sourceKindFromFile(new File(['x'], 'notes.dw', { type: 'text/x-dokuwiki' }))).toBe(
      'dokuwiki',
    )
    expect(swapExtension('notes.dokuwiki', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.dw', 'pdf')).toBe('notes.pdf')
    expect(toDocbook('Demo', ['Một', 'Hai\ndòng'])).toContain('<article')
    expect(toDocbook('Demo', ['Một'])).toContain('<title>Trang 1</title>')
    expect(pagesFromDocbook(toDocbook('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('dbk', toDocbook('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromDocbook('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.dbk', { type: '' }))).toBe('dbk')
    expect(sourceKindFromFile(new File(['x'], 'notes.docbook', { type: 'application/docbook+xml' }))).toBe(
      'dbk',
    )
    expect(swapExtension('notes.dbk', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.docbook', 'pdf')).toBe('notes.pdf')
    expect(toOpml('Demo', ['Một', 'Hai\ndòng'])).toContain('<opml version="2.0">')
    expect(toOpml('Demo', ['Một'])).toContain('_note="Một"')
    expect(pagesFromOpml(toOpml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('opml', toOpml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromOpml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.opml', { type: '' }))).toBe('opml')
    expect(sourceKindFromFile(new File(['x'], 'notes.opml', { type: 'text/x-opml' }))).toBe('opml')
    expect(swapExtension('notes.opml', 'pdf')).toBe('notes.pdf')
    expect(toAtom('Demo', ['Một', 'Hai\ndòng'])).toContain('<feed xmlns="http://www.w3.org/2005/Atom">')
    expect(toAtom('Demo', ['Một'])).toContain('<title>Trang 1</title>')
    expect(pagesFromAtom(toAtom('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('atom', toAtom('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromAtom('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromAtom(
        '<rss><channel><item><description>Một</description></item><item><description>Hai</description></item></channel></rss>',
      ),
    ).toEqual(['Một', 'Hai'])
    expect(sourceKindFromFile(new File(['x'], 'notes.atom', { type: '' }))).toBe('atom')
    expect(sourceKindFromFile(new File(['x'], 'notes.rss', { type: 'application/rss+xml' }))).toBe(
      'atom',
    )
    expect(swapExtension('notes.atom', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.rss', 'pdf')).toBe('notes.pdf')
    expect(escapeTypst('A "B"')).toBe('A \\"B\\"')
    expect(toTypst('Demo', ['Một', 'Hai\ndòng'])).toContain('#set document(title: "Demo")')
    expect(toTypst('Demo', ['Một'])).toContain('== Trang 1')
    expect(pagesFromTypst(toTypst('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('typ', toTypst('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromTypst('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.typ', { type: '' }))).toBe('typ')
    expect(sourceKindFromFile(new File(['x'], 'notes.typ', { type: 'text/x-typst' }))).toBe('typ')
    expect(swapExtension('notes.typ', 'pdf')).toBe('notes.pdf')
    expect(toGemtext('Demo', ['Một', 'Hai\ndòng'])).toContain('# Demo')
    expect(toGemtext('Demo', ['Một'])).toContain('## Trang 1')
    expect(pagesFromGemtext(toGemtext('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('gmi', toGemtext('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromGemtext('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.gmi', { type: '' }))).toBe('gmi')
    expect(sourceKindFromFile(new File(['x'], 'notes.gemini', { type: 'text/gemini' }))).toBe('gmi')
    expect(swapExtension('notes.gmi', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.gemini', 'pdf')).toBe('notes.pdf')
    expect(toPod('Demo', ['Một', 'Hai\ndòng'])).toContain('=head1 Demo')
    expect(toPod('Demo', ['Một'])).toContain('=head2 Trang 1')
    expect(pagesFromPod(toPod('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('pod', toPod('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromPod('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.pod', { type: '' }))).toBe('pod')
    expect(sourceKindFromFile(new File(['x'], 'notes.pod', { type: 'text/x-pod' }))).toBe('pod')
    expect(swapExtension('notes.pod', 'pdf')).toBe('notes.pdf')
    expect(toBbcode('Demo', ['Một', 'Hai\ndòng'])).toContain('[h1]Demo[/h1]')
    expect(toBbcode('Demo', ['Một'])).toContain('[h2]Trang 1[/h2]')
    expect(pagesFromBbcode(toBbcode('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('bbcode', toBbcode('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromBbcode('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.bbcode', { type: '' }))).toBe('bbcode')
    expect(sourceKindFromFile(new File(['x'], 'notes.bb', { type: 'text/x-bbcode' }))).toBe('bbcode')
    expect(swapExtension('notes.bbcode', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.bb', 'pdf')).toBe('notes.pdf')
    expect(toFountain('Demo', ['Một', 'Hai\ndòng'])).toContain('Title: Demo')
    expect(toFountain('Demo', ['Một'])).toContain('# Trang 1')
    expect(pagesFromFountain(toFountain('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('fountain', toFountain('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromFountain('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.fountain', { type: '' }))).toBe('fountain')
    expect(sourceKindFromFile(new File(['x'], 'notes.spmd', { type: 'text/x-fountain' }))).toBe(
      'fountain',
    )
    expect(swapExtension('notes.fountain', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.spmd', 'pdf')).toBe('notes.pdf')
    expect(toTid('Demo', ['Một', 'Hai\ndòng'])).toContain('! Demo')
    expect(toTid('Demo', ['Một'])).toContain('!! Trang 1')
    expect(pagesFromTid(toTid('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('tid', toTid('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromTid('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.tid', { type: '' }))).toBe('tid')
    expect(sourceKindFromFile(new File(['x'], 'notes.tiddlywiki', { type: 'text/x-tiddlywiki' }))).toBe(
      'tid',
    )
    expect(swapExtension('notes.tid', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.tiddly', 'pdf')).toBe('notes.pdf')
    expect(toTexinfo('Demo', ['Một', 'Hai\ndòng'])).toContain('\\input texinfo')
    expect(toTexinfo('Demo', ['Một'])).toContain('@settitle Demo')
    expect(toTexinfo('Demo', ['Một'])).toContain('@section Trang 1')
    expect(pagesFromTexinfo(toTexinfo('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('texinfo', toTexinfo('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromTexinfo('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.texinfo', { type: '' }))).toBe('texinfo')
    expect(sourceKindFromFile(new File(['x'], 'notes.texi', { type: 'text/x-texinfo' }))).toBe(
      'texinfo',
    )
    expect(sourceKindFromFile(new File(['x'], 'notes.txi', { type: '' }))).toBe('texinfo')
    expect(swapExtension('notes.texinfo', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.texi', 'pdf')).toBe('notes.pdf')
    expect(toRoff('Demo', ['Một', 'Hai\ndòng'])).toContain('.TH Demo')
    expect(toRoff('Demo', ['Một'])).toContain('.SH Trang 1')
    expect(pagesFromRoff(toRoff('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('roff', toRoff('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromRoff('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.roff', { type: '' }))).toBe('roff')
    expect(sourceKindFromFile(new File(['x'], 'notes.man', { type: 'text/troff' }))).toBe('roff')
    expect(swapExtension('notes.roff', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.man', 'pdf')).toBe('notes.pdf')
    expect(toIpynb('Demo', ['Một', 'Hai\ndòng'])).toContain('"nbformat": 4')
    expect(toIpynb('Demo', ['Một'])).toContain('## Trang 1')
    expect(pagesFromIpynb(toIpynb('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('ipynb', toIpynb('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromIpynb('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.ipynb', { type: '' }))).toBe('ipynb')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.ipynb', { type: 'application/x-ipynb+json' })),
    ).toBe('ipynb')
    expect(swapExtension('notes.ipynb', 'pdf')).toBe('notes.pdf')
    expect(escapeBibtex('a{b}')).toBe('a\\{b\\}')
    expect(toBibtex('Demo', ['Một', 'Hai\ndòng'])).toContain('@comment{Demo}')
    expect(toBibtex('Demo', ['Một'])).toContain('@misc{page1')
    expect(pagesFromBibtex(toBibtex('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('bib', toBibtex('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromBibtex('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.bib', { type: '' }))).toBe('bib')
    expect(sourceKindFromFile(new File(['x'], 'notes.bibtex', { type: 'application/x-bibtex' }))).toBe(
      'bib',
    )
    expect(swapExtension('notes.bib', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.bibtex', 'pdf')).toBe('notes.pdf')
    expect(formatSrtTime(0)).toBe('00:00:00,000')
    expect(formatSrtTime(4)).toBe('00:00:04,000')
    expect(formatVttTime(4)).toBe('00:00:04.000')
    expect(toSrt(['Một', 'Hai\ndòng'])).toContain('1\n00:00:00,000 --> 00:00:04,000\nMột')
    expect(toSrt(['Một'])).toContain('00:00:00,000 --> 00:00:04,000')
    expect(pagesFromSrt(toSrt(['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('srt', toSrt(['Hi']))).toEqual(['Hi'])
    expect(pagesFromSrt('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.srt', { type: '' }))).toBe('srt')
    expect(sourceKindFromFile(new File(['x'], 'notes.srt', { type: 'application/x-subrip' }))).toBe(
      'srt',
    )
    expect(swapExtension('notes.srt', 'pdf')).toBe('notes.pdf')
    expect(toVtt('Demo', ['Một', 'Hai\ndòng'])).toContain('WEBVTT')
    expect(toVtt('Demo', ['Một'])).toContain('NOTE Demo')
    expect(pagesFromVtt(toVtt('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vtt', toVtt('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVtt('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vtt', { type: '' }))).toBe('vtt')
    expect(sourceKindFromFile(new File(['x'], 'notes.vtt', { type: 'text/vtt' }))).toBe('vtt')
    expect(swapExtension('notes.vtt', 'pdf')).toBe('notes.pdf')
    expect(formatLrcTime(4)).toBe('00:04.00')
    expect(toLrc('Demo', ['Một', 'Hai\ndòng'])).toContain('[ti:Demo]')
    expect(toLrc('Demo', ['Một'])).toContain('[00:00.00]Một')
    expect(pagesFromLrc(toLrc('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai dòng'])
    expect(pagesFromImportedText('lrc', toLrc('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromLrc('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.lrc', { type: '' }))).toBe('lrc')
    expect(sourceKindFromFile(new File(['x'], 'notes.lrc', { type: 'text/x-lrc' }))).toBe('lrc')
    expect(swapExtension('notes.lrc', 'pdf')).toBe('notes.pdf')
    expect(formatIcsDate(4)).toBe('19700101T000004Z')
    expect(escapeIcs('a;b,c\nd')).toBe('a\\;b\\,c\\nd')
    expect(toIcs('Demo', ['Một', 'Hai\ndòng'])).toContain('BEGIN:VCALENDAR')
    expect(toIcs('Demo', ['Một'])).toContain('X-WR-CALNAME:Demo')
    expect(pagesFromIcs(toIcs('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('ics', toIcs('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromIcs('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.ics', { type: '' }))).toBe('ics')
    expect(sourceKindFromFile(new File(['x'], 'notes.ics', { type: 'text/calendar' }))).toBe('ics')
    expect(swapExtension('notes.ics', 'pdf')).toBe('notes.pdf')
    expect(formatCueIndex(4)).toBe('00:04:00')
    expect(escapeCue('a"b\nc')).toBe("a'b c")
    expect(toCue('Demo', ['Một', 'Hai\ndòng'])).toContain('TITLE "Demo"')
    expect(toCue('Demo', ['Một'])).toContain('TRACK 01 AUDIO')
    expect(pagesFromCue(toCue('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai dòng'])
    expect(pagesFromImportedText('cue', toCue('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromCue('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.cue', { type: '' }))).toBe('cue')
    expect(sourceKindFromFile(new File(['x'], 'notes.cue', { type: 'application/x-cue' }))).toBe(
      'cue',
    )
    expect(swapExtension('notes.cue', 'pdf')).toBe('notes.pdf')
    expect(formatAssTime(4)).toBe('0:00:04.00')
    expect(escapeAss('Một\nhai {x}')).toBe('Một\\Nhai \\{x\\}')
    expect(toAss('Demo', ['Một', 'Hai\ndòng'])).toContain('[Script Info]')
    expect(toAss('Demo', ['Một'])).toContain('Title: Demo')
    expect(pagesFromAss(toAss('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('ass', toAss('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromAss('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.ass', { type: '' }))).toBe('ass')
    expect(sourceKindFromFile(new File(['x'], 'notes.ssa', { type: 'text/x-ssa' }))).toBe('ass')
    expect(swapExtension('notes.ass', 'pdf')).toBe('notes.pdf')
    expect(
      pagesFromAss(`[Events]
Format: Marked, Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: Marked=0,0,0:00:00.00,0:00:04.00,Default,,0,0,0,,Hello, world
Dialogue: Marked=0,0,0:00:04.00,0:00:08.00,Default,,0,0,0,,Hai`),
    ).toEqual(['Hello, world', 'Hai'])
    expect(
      pagesFromAss(`[Events]
Style: Dialogue
Dialogue: Marked=0,0,0:00:00.00,0:00:04.00,Default,,0,0,0,,Hello, world
Dialogue: Marked=0,0,0:00:04.00,0:00:08.00,Default,,0,0,0,,Hai`),
    ).toEqual(['Hello, world', 'Hai'])
    expect(formatSamiTime(4)).toBe('4000')
    expect(toSami('Demo', ['Một', 'Hai\ndòng'])).toContain('<SAMI>')
    expect(toSami('Demo', ['Một'])).toContain('<TITLE>Demo</TITLE>')
    expect(pagesFromSami(toSami('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('sami', toSami('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromSami('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.sami', { type: '' }))).toBe('sami')
    expect(sourceKindFromFile(new File(['x'], 'notes.smi', { type: 'application/x-sami' }))).toBe(
      'sami',
    )
    expect(swapExtension('notes.sami', 'pdf')).toBe('notes.pdf')
    expect(formatSubTime(4)).toBe('00:00:04.00')
    expect(toSub('Demo', ['Một', 'Hai\ndòng'])).toContain('[INFORMATION]')
    expect(toSub('Demo', ['Một'])).toContain('[TITLE]Demo')
    expect(pagesFromSub(toSub('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('sub', toSub('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromSub('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromSub('{0}{96}Một\n{96}{192}Hai|dòng')).toEqual(['Một', 'Hai\ndòng'])
    expect(sourceKindFromFile(new File(['x'], 'notes.sub', { type: '' }))).toBe('sub')
    expect(sourceKindFromFile(new File(['x'], 'notes.sub', { type: 'text/x-microdvd' }))).toBe(
      'sub',
    )
    expect(swapExtension('notes.sub', 'pdf')).toBe('notes.pdf')
    expect(formatStlTime(4)).toBe('00:00:04:00')
    expect(toStl('Demo', ['Một', 'Hai\ndòng'])).toContain('$FontName')
    expect(toStl('Demo', ['Một'])).toContain('$Title              = Demo')
    expect(pagesFromStl(toStl('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('stl', toStl('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromStl('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.stl', { type: '' }))).toBe('stl')
    expect(sourceKindFromFile(new File(['x'], 'notes.stl', { type: 'text/x-spruce' }))).toBe('stl')
    expect(swapExtension('notes.stl', 'pdf')).toBe('notes.pdf')
    expect(formatSccTime(4)).toBe('00:00:04:00')
    expect(toScc(['Một', 'Hai\ndòng'])).toContain('Scenarist_SCC V1.0')
    expect(toScc(['Một'])).toContain('00:00:00:00')
    expect(pagesFromScc(toScc(['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('scc', toScc(['Hi']))).toEqual(['Hi'])
    expect(pagesFromScc('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.scc', { type: '' }))).toBe('scc')
    expect(sourceKindFromFile(new File(['x'], 'notes.scc', { type: 'text/x-scc' }))).toBe('scc')
    expect(swapExtension('notes.scc', 'pdf')).toBe('notes.pdf')
    expect(formatUsfTime(4)).toBe('00:00:04.000')
    expect(toUsf('Demo', ['Một', 'Hai\ndòng'])).toContain('<USFSubtitles')
    expect(toUsf('Demo', ['Một'])).toContain('<title>Demo</title>')
    expect(pagesFromUsf(toUsf('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('usf', toUsf('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromUsf('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.usf', { type: '' }))).toBe('usf')
    expect(sourceKindFromFile(new File(['x'], 'notes.usf', { type: 'application/x-usf+xml' }))).toBe(
      'usf',
    )
    expect(swapExtension('notes.usf', 'pdf')).toBe('notes.pdf')

    expect(formatRtTime(0)).toBe('0.0')
    expect(formatRtTime(4)).toBe('4.0')
    expect(toRt('Demo', ['Một', 'Hai\ndòng'])).toContain('<window type="generic"')
    expect(toRt('Demo', ['Một'])).toContain('<!-- Demo -->')
    expect(pagesFromRt(toRt('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('rt', toRt('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromRt('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.rt', { type: '' }))).toBe('rt')
    expect(sourceKindFromFile(new File(['x'], 'notes.rt', { type: 'text/vnd.rn-realtext' }))).toBe(
      'rt',
    )
    expect(sourceKindFromFile(new File(['x'], 'notes.rtf', { type: '' }))).toBe('rtf')
    expect(swapExtension('notes.rt', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.rtf', 'pdf')).toBe('notes.pdf')

    expect(formatMplTime(0)).toBe('0')
    expect(formatMplTime(4)).toBe('40')
    expect(toMpl(['Một', 'Hai\ndòng'])).toContain('[0][40]')
    expect(toMpl(['Một'])).toContain('[0][40]Một')
    expect(pagesFromMpl(toMpl(['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('mpl', toMpl(['Hi']))).toEqual(['Hi'])
    expect(pagesFromMpl('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.mpl', { type: '' }))).toBe('mpl')
    expect(sourceKindFromFile(new File(['x'], 'notes.mpl', { type: 'text/x-mpl2' }))).toBe('mpl')
    expect(swapExtension('notes.mpl', 'pdf')).toBe('notes.pdf')

    expect(toDjvu('Demo', ['Một', 'Hai\ndòng'])).toContain('DJVU-TEXT 1.0')
    expect(toDjvu('Demo', ['Một'])).toContain('title: Demo')
    expect(toDjvu('Demo', ['Một'])).toContain('@page 1')
    expect(pagesFromDjvu(toDjvu('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('djvu', toDjvu('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromDjvu('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.djvu', { type: '' }))).toBe('djvu')
    expect(sourceKindFromFile(new File(['x'], 'notes.djv', { type: 'image/vnd.djvu' }))).toBe('djvu')
    expect(swapExtension('notes.djvu', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.djv', 'pdf')).toBe('notes.pdf')

    expect(escapePs('(hi)')).toBe('\\(hi\\)')
    expect(toPs('Demo', ['Một', 'Hai\ndòng'])).toContain('%!PS-Adobe-3.0')
    expect(toPs('Demo', ['Một'])).toContain('%%Title: Demo')
    expect(toPs('Demo', ['Một'])).toContain('(Một) =')
    expect(pagesFromPs(toPs('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('ps', toPs('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromPs('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.ps', { type: '' }))).toBe('ps')
    expect(sourceKindFromFile(new File(['x'], 'notes.eps', { type: 'application/postscript' }))).toBe(
      'ps',
    )
    expect(swapExtension('notes.ps', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.eps', 'pdf')).toBe('notes.pdf')

    expect(toTei('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.tei-c.org/ns/1.0"')
    expect(toTei('Demo', ['Một'])).toContain('<title>Demo</title>')
    expect(toTei('Demo', ['Một'])).toContain('type="page"')
    expect(pagesFromTei(toTei('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('tei', toTei('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromTei('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.tei', { type: '' }))).toBe('tei')
    expect(sourceKindFromFile(new File(['x'], 'notes.tei', { type: 'application/tei+xml' }))).toBe(
      'tei',
    )
    expect(swapExtension('notes.tei', 'pdf')).toBe('notes.pdf')

    expect(toJats('Demo', ['Một', 'Hai\ndòng'])).toContain('article-type="other"')
    expect(toJats('Demo', ['Một'])).toContain('<article-title>Demo</article-title>')
    expect(toJats('Demo', ['Một'])).toContain('id="page-1"')
    expect(pagesFromJats(toJats('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('jats', toJats('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromJats('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.jats', { type: '' }))).toBe('jats')
    expect(sourceKindFromFile(new File(['x'], 'notes.nxml', { type: 'application/vnd.jats+xml' }))).toBe(
      'jats',
    )
    expect(swapExtension('notes.jats', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.nxml', 'pdf')).toBe('notes.pdf')

    expect(escapeRis('Hai\ndòng')).toBe('Hai|dòng')
    expect(toRis('Demo', ['Một', 'Hai\ndòng'])).toContain('TY  - GEN')
    expect(toRis('Demo', ['Một'])).toContain('T2  - Demo')
    expect(toRis('Demo', ['Một'])).toContain('N1  - Một')
    expect(pagesFromRis(toRis('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('ris', toRis('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromRis('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.ris', { type: '' }))).toBe('ris')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.ris', { type: 'application/x-research-info-systems' })),
    ).toBe('ris')
    expect(swapExtension('notes.ris', 'pdf')).toBe('notes.pdf')

    expect(escapeEnw('Hai\ndòng')).toBe('Hai|dòng')
    expect(toEnw('Demo', ['Một', 'Hai\ndòng'])).toContain('%0 Generic')
    expect(toEnw('Demo', ['Một'])).toContain('%B Demo')
    expect(toEnw('Demo', ['Một'])).toContain('%Z Một')
    expect(pagesFromEnw(toEnw('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('enw', toEnw('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromEnw('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.enw', { type: '' }))).toBe('enw')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.enw', { type: 'application/x-endnote-refer' })),
    ).toBe('enw')
    expect(swapExtension('notes.enw', 'pdf')).toBe('notes.pdf')

    expect(toCsljson('Demo', ['Một', 'Hai\ndòng'])).toContain('"type": "document"')
    expect(toCsljson('Demo', ['Một'])).toContain('"container-title": "Demo"')
    expect(toCsljson('Demo', ['Một'])).toContain('"note": "Một"')
    expect(pagesFromCsljson(toCsljson('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('csljson', toCsljson('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromCsljson('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromCsljson('[{"title":"Một"},{"abstract":"Hai"}]')).toEqual(['Một', 'Hai'])
    expect(sourceKindFromFile(new File(['x'], 'notes.csljson', { type: '' }))).toBe('csljson')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.csl.json', { type: 'application/vnd.citationstyles.csl+json' }),
      ),
    ).toBe('csljson')
    expect(swapExtension('notes.csljson', 'pdf')).toBe('notes.pdf')

    expect(escapeNbib('Hai\ndòng')).toBe('Hai|dòng')
    expect(toNbib('Demo', ['Một', 'Hai\ndòng'])).toContain('PMID- 1')
    expect(toNbib('Demo', ['Một'])).toContain('JT  - Demo')
    expect(toNbib('Demo', ['Một'])).toContain('AB  - Một')
    expect(pagesFromNbib(toNbib('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('nbib', toNbib('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromNbib('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.nbib', { type: '' }))).toBe('nbib')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.nbib', { type: 'application/x-nbib' })),
    ).toBe('nbib')
    expect(swapExtension('notes.nbib', 'pdf')).toBe('notes.pdf')

    expect(toCslyaml('Demo', ['Một', 'Hai\ndòng'])).toContain('type: document')
    expect(toCslyaml('Demo', ['Một'])).toContain('container-title: "Demo"')
    expect(toCslyaml('Demo', ['Một'])).toContain('note: "Một"')
    expect(pagesFromCslyaml(toCslyaml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('cslyaml', toCslyaml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromCslyaml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromCslyaml('- title: Một\n- abstract: Hai')).toEqual(['Một', 'Hai'])
    expect(sourceKindFromFile(new File(['x'], 'notes.cslyaml', { type: '' }))).toBe('cslyaml')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.csl.yaml', { type: 'application/vnd.citationstyles.csl+yaml' }),
      ),
    ).toBe('cslyaml')
    expect(sourceKindFromFile(new File(['x'], 'notes.csl.yml', { type: '' }))).toBe('cslyaml')
    expect(swapExtension('notes.cslyaml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.csl.yaml', 'pdf')).toBe('notes.pdf')

    expect(toEnxml('Demo', ['Một', 'Hai\ndòng'])).toContain('<xml>')
    expect(toEnxml('Demo', ['Một'])).toContain('<secondary-title>Demo</secondary-title>')
    expect(toEnxml('Demo', ['Một'])).toContain('<notes>Một</notes>')
    expect(pagesFromEnxml(toEnxml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('enxml', toEnxml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromEnxml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromEnxml('<xml><records><record><title>Một</title></record></records></xml>')).toEqual([
      'Một',
    ])
    expect(sourceKindFromFile(new File(['x'], 'notes.enxml', { type: '' }))).toBe('enxml')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.endnote.xml', { type: 'application/x-endnote+xml' })),
    ).toBe('enxml')
    expect(swapExtension('notes.enxml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.endnote.xml', 'pdf')).toBe('notes.pdf')

    expect(toMods('Demo', ['Một', 'Hai\ndòng'])).toContain('<modsCollection')
    expect(toMods('Demo', ['Một'])).toContain('<title>Demo</title>')
    expect(toMods('Demo', ['Một'])).toContain('<note>Một</note>')
    expect(pagesFromMods(toMods('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('mods', toMods('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromMods('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromMods('<modsCollection><mods><title>Một</title></mods></modsCollection>')).toEqual([
      'Một',
    ])
    expect(sourceKindFromFile(new File(['x'], 'notes.mods', { type: '' }))).toBe('mods')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.mods.xml', { type: 'application/mods+xml' })),
    ).toBe('mods')
    expect(swapExtension('notes.mods', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.mods.xml', 'pdf')).toBe('notes.pdf')

    expect(toCff('Demo', ['Một', 'Hai\ndòng'])).toContain('cff-version: 1.2.0')
    expect(toCff('Demo', ['Một'])).toContain('title: "Demo"')
    expect(toCff('Demo', ['Một'])).toContain('notes: "Một"')
    expect(pagesFromCff(toCff('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('cff', toCff('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromCff('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromCff('- title: Một\n- abstract: Hai')).toEqual(['Một', 'Hai'])
    expect(sourceKindFromFile(new File(['x'], 'notes.cff', { type: '' }))).toBe('cff')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.citation.cff', { type: 'application/citation-file+yaml' }),
      ),
    ).toBe('cff')
    expect(swapExtension('notes.cff', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.citation.cff', 'pdf')).toBe('notes.pdf')

    expect(toDatacite('Demo', ['Một', 'Hai\ndòng'])).toContain('<resources')
    expect(toDatacite('Demo', ['Một'])).toContain('<publisher>Demo</publisher>')
    expect(toDatacite('Demo', ['Một'])).toContain('<description descriptionType="Other">Một</description>')
    expect(pagesFromDatacite(toDatacite('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('datacite', toDatacite('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromDatacite('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromDatacite('<resources><resource><title>Một</title></resource></resources>'),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.datacite', { type: '' }))).toBe('datacite')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.datacite.xml', { type: 'application/vnd.datacite.datacite+xml' }),
      ),
    ).toBe('datacite')
    expect(swapExtension('notes.datacite', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.datacite.xml', 'pdf')).toBe('notes.pdf')

    expect(toMarcxml('Demo', ['Một', 'Hai\ndòng'])).toContain('<collection')
    expect(toMarcxml('Demo', ['Một'])).toContain('<subfield code="a">Demo</subfield>')
    expect(toMarcxml('Demo', ['Một'])).toContain('<datafield tag="520"')
    expect(pagesFromMarcxml(toMarcxml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('marcxml', toMarcxml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromMarcxml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromMarcxml(
        '<collection><record><datafield tag="245" ind1="0" ind2="0"><subfield code="a">Một</subfield></datafield></record></collection>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.marcxml', { type: '' }))).toBe('marcxml')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.mrcx', { type: 'application/marcxml+xml' })),
    ).toBe('marcxml')
    expect(sourceKindFromFile(new File(['x'], 'notes.marc.xml', { type: '' }))).toBe('marcxml')
    expect(swapExtension('notes.marcxml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.mrcx', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.marc.xml', 'pdf')).toBe('notes.pdf')

    expect(toDublincore('Demo', ['Một', 'Hai\ndòng'])).toContain('<dublinCore')
    expect(toDublincore('Demo', ['Một'])).toContain('<dc:publisher>Demo</dc:publisher>')
    expect(toDublincore('Demo', ['Một'])).toContain('<dc:description>Một</dc:description>')
    expect(pagesFromDublincore(toDublincore('Demo', ['Một', 'Hai\ndòng']))).toEqual([
      'Một',
      'Hai\ndòng',
    ])
    expect(pagesFromImportedText('dublincore', toDublincore('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromDublincore('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromDublincore('<dublinCore><dc><dc:title>Một</dc:title></dc></dublinCore>'),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.dublincore', { type: '' }))).toBe(
      'dublincore',
    )
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.dublincore.xml', { type: 'application/vnd.dublincore+xml' }),
      ),
    ).toBe('dublincore')
    expect(sourceKindFromFile(new File(['x'], 'notes.dc.xml', { type: '' }))).toBe('dublincore')
    expect(swapExtension('notes.dublincore', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.dublincore.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.dc.xml', 'pdf')).toBe('notes.pdf')

    expect(toOnix('Demo', ['Một', 'Hai\ndòng'])).toContain('<ONIXMessage')
    expect(toOnix('Demo', ['Một'])).toContain('<TitleText>Demo</TitleText>')
    expect(toOnix('Demo', ['Một'])).toContain('<Text>Một</Text>')
    expect(pagesFromOnix(toOnix('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('onix', toOnix('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromOnix('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromOnix(
        '<ONIXMessage><Product><TitleText>Một</TitleText></Product></ONIXMessage>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.onix', { type: '' }))).toBe('onix')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.onix.xml', { type: 'application/onix+xml' })),
    ).toBe('onix')
    expect(swapExtension('notes.onix', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.onix.xml', 'pdf')).toBe('notes.pdf')

    expect(toUnixref('Demo', ['Một', 'Hai\ndòng'])).toContain('<doi_records')
    expect(toUnixref('Demo', ['Một'])).toContain('<full_title>Demo</full_title>')
    expect(toUnixref('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromUnixref(toUnixref('Demo', ['Một', 'Hai\ndòng']))).toEqual([
      'Một',
      'Hai\ndòng',
    ])
    expect(pagesFromImportedText('unixref', toUnixref('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromUnixref('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromUnixref('<doi_records><doi_record><title>Một</title></doi_record></doi_records>'),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.unixref', { type: '' }))).toBe('unixref')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.unixref.xml', { type: 'application/vnd.crossref.unixref+xml' }),
      ),
    ).toBe('unixref')
    expect(sourceKindFromFile(new File(['x'], 'notes.crossref.xml', { type: '' }))).toBe('unixref')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromUnixref('<doi_records></doi_records>')).toThrow(/doi_record/)
    expect(swapExtension('notes.unixref', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.unixref.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.crossref.xml', 'pdf')).toBe('notes.pdf')

    expect(toBibjson('Demo', ['Một', 'Hai\ndòng'])).toContain('"type": "article"')
    expect(toBibjson('Demo', ['Một'])).toContain('"name": "Demo"')
    expect(toBibjson('Demo', ['Một'])).toContain('"note": "Một"')
    expect(pagesFromBibjson(toBibjson('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('bibjson', toBibjson('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromBibjson('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromBibjson('[{"title":"Một"}]')).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.json', { type: '' }))).toBe('json')
    expect(sourceKindFromFile(new File(['x'], 'notes.bibjson', { type: '' }))).toBe('bibjson')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.bib.json', { type: 'application/vnd.citationstyles.bibjson+json' }),
      ),
    ).toBe('bibjson')
    expect(swapExtension('notes.bibjson', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.bib.json', 'pdf')).toBe('notes.pdf')

    expect(toPubmed('Demo', ['Một', 'Hai\ndòng'])).toContain('<PubmedArticleSet')
    expect(toPubmed('Demo', ['Một'])).toContain('<Title>Demo</Title>')
    expect(toPubmed('Demo', ['Một'])).toContain('<AbstractText>Một</AbstractText>')
    expect(pagesFromPubmed(toPubmed('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('pubmed', toPubmed('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromPubmed('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromPubmed(
        '<PubmedArticleSet><PubmedArticle><ArticleTitle>Một</ArticleTitle></PubmedArticle></PubmedArticleSet>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.pubmed', { type: '' }))).toBe('pubmed')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.pubmed.xml', { type: 'application/vnd.nlm.pubmed+xml' }),
      ),
    ).toBe('pubmed')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromPubmed('<PubmedArticleSet></PubmedArticleSet>')).toThrow(/PubmedArticle/)
    expect(swapExtension('notes.pubmed', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.pubmed.xml', 'pdf')).toBe('notes.pdf')

    expect(toJsonld('Demo', ['Một', 'Hai\ndòng'])).toContain('"@type": "CreativeWork"')
    expect(toJsonld('Demo', ['Một'])).toContain('"name": "Demo"')
    expect(toJsonld('Demo', ['Một'])).toContain('"description": "Một"')
    expect(pagesFromJsonld(toJsonld('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('jsonld', toJsonld('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromJsonld('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromJsonld('[{"name":"Một"}]')).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.json', { type: '' }))).toBe('json')
    expect(sourceKindFromFile(new File(['x'], 'notes.jsonld', { type: '' }))).toBe('jsonld')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.json-ld', { type: 'application/ld+json' })),
    ).toBe('jsonld')
    expect(swapExtension('notes.jsonld', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.json-ld', 'pdf')).toBe('notes.pdf')

    expect(toBibframe('Demo', ['Một', 'Hai\ndòng'])).toContain('<rdf:RDF')
    expect(toBibframe('Demo', ['Một'])).toContain('<bf:mainTitle>Demo</bf:mainTitle>')
    expect(toBibframe('Demo', ['Một'])).toContain('<bf:note>Một</bf:note>')
    expect(pagesFromBibframe(toBibframe('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('bibframe', toBibframe('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromBibframe('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromBibframe(
        '<rdf:RDF xmlns:bf="http://id.loc.gov/ontologies/bibframe/"><bf:Work><bf:title>Một</bf:title></bf:Work></rdf:RDF>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.bibframe', { type: '' }))).toBe('bibframe')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.bibframe.xml', { type: 'application/bibframe+xml' }),
      ),
    ).toBe('bibframe')
    expect(sourceKindFromFile(new File(['x'], 'notes.bf.xml', { type: '' }))).toBe('bibframe')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromBibframe('<rdf:RDF></rdf:RDF>')).toThrow(/bf:Work/)
    expect(swapExtension('notes.bibframe', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.bibframe.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.bf.xml', 'pdf')).toBe('notes.pdf')

    expect(toCrossref('Demo', ['Một', 'Hai\ndòng'])).toContain('"message-type": "work-list"')
    expect(toCrossref('Demo', ['Một'])).toContain('"Demo"')
    expect(toCrossref('Demo', ['Một'])).toContain('"abstract": "Một"')
    expect(pagesFromCrossref(toCrossref('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('crossref', toCrossref('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromCrossref('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromCrossref('[{"title":["Một"]}]')).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.json', { type: '' }))).toBe('json')
    expect(sourceKindFromFile(new File(['x'], 'notes.crossref', { type: '' }))).toBe('crossref')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.crossref.json', { type: 'application/vnd.crossref+json' }),
      ),
    ).toBe('crossref')
    expect(sourceKindFromFile(new File(['x'], 'notes.crossref.xml', { type: '' }))).toBe('unixref')
    expect(swapExtension('notes.crossref', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.crossref.json', 'pdf')).toBe('notes.pdf')

    expect(toEad('Demo', ['Một', 'Hai\ndòng'])).toContain('<ead>')
    expect(toEad('Demo', ['Một'])).toContain('<titleproper>Demo</titleproper>')
    expect(toEad('Demo', ['Một'])).toContain('<p>Một</p>')
    expect(pagesFromEad(toEad('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('ead', toEad('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromEad('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromEad(
        '<ead><dsc><c><did><unittitle>Một</unittitle></did></c></dsc></ead>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.ead', { type: '' }))).toBe('ead')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.ead.xml', { type: 'application/ead+xml' })),
    ).toBe('ead')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromEad('<ead></ead>')).toThrow(/<c>/)
    expect(swapExtension('notes.ead', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.ead.xml', 'pdf')).toBe('notes.pdf')

    expect(toMets('Demo', ['Một', 'Hai\ndòng'])).toContain('<mets')
    expect(toMets('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toMets('Demo', ['Một'])).toContain('<abstract>Một</abstract>')
    expect(pagesFromMets(toMets('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('mets', toMets('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromMets('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromMets(
        '<mets><dmdSec ID="dmd1"><mdWrap><xmlData><title>Một</title></xmlData></mdWrap></dmdSec></mets>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.mets', { type: '' }))).toBe('mets')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.mets.xml', { type: 'application/mets+xml' })),
    ).toBe('mets')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromMets('<mets><metsHdr></metsHdr></mets>')).toThrow(/dmdSec/)
    expect(swapExtension('notes.mets', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.mets.xml', 'pdf')).toBe('notes.pdf')

    expect(toPremis('Demo', ['Một', 'Hai\ndòng'])).toContain('<premis')
    expect(toPremis('Demo', ['Một'])).toContain('<agentName>Demo</agentName>')
    expect(toPremis('Demo', ['Một'])).toContain(
      '<significantPropertiesValue>Một</significantPropertiesValue>',
    )
    expect(pagesFromPremis(toPremis('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('premis', toPremis('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromPremis('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromPremis(
        '<premis><object><originalName>Một</originalName></object></premis>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.premis', { type: '' }))).toBe('premis')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.premis.xml', { type: 'application/premis+xml' })),
    ).toBe('premis')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromPremis('<premis></premis>')).toThrow(/<object>/)
    expect(swapExtension('notes.premis', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.premis.xml', 'pdf')).toBe('notes.pdf')

    expect(toMix('Demo', ['Một', 'Hai\ndòng'])).toContain('<mix')
    expect(toMix('Demo', ['Một'])).toContain('<imageProducer>Demo</imageProducer>')
    expect(toMix('Demo', ['Một'])).toContain('<note>Một</note>')
    expect(pagesFromMix(toMix('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('mix', toMix('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromMix('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromMix(
        '<mix><ImageCaptureMetadata><sourceType>Một</sourceType></ImageCaptureMetadata></mix>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.mix', { type: '' }))).toBe('mix')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.mix.xml', { type: 'application/mix+xml' })),
    ).toBe('mix')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromMix('<mix><BasicDigitalObjectInformation></BasicDigitalObjectInformation></mix>')).toThrow(
      /ImageCaptureMetadata/,
    )
    expect(swapExtension('notes.mix', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.mix.xml', 'pdf')).toBe('notes.pdf')

    expect(toAlto('Demo', ['Một', 'Hai\ndòng'])).toContain('<alto')
    expect(toAlto('Demo', ['Một'])).toContain('<fileName>Demo</fileName>')
    expect(toAlto('Demo', ['Một'])).toContain('<String>Một</String>')
    expect(pagesFromAlto(toAlto('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('alto', toAlto('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromAlto('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromAlto(
        '<alto><Layout><Page ID="P1"><PrintSpace><TextLine>Một</TextLine></PrintSpace></Page></Layout></alto>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.alto', { type: '' }))).toBe('alto')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.alto.xml', { type: 'application/alto+xml' })),
    ).toBe('alto')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromAlto('<alto><Description></Description></alto>')).toThrow(/<Page>/)
    expect(swapExtension('notes.alto', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.alto.xml', 'pdf')).toBe('notes.pdf')

    expect(toPage('Demo', ['Một', 'Hai\ndòng'])).toContain('<PcGts')
    expect(toPage('Demo', ['Một'])).toContain('<Creator>Demo</Creator>')
    expect(toPage('Demo', ['Một'])).toContain('<Unicode>Một</Unicode>')
    expect(pagesFromPage(toPage('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('page', toPage('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromPage('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromPage(
        '<PcGts><Page imageFilename="Trang 1"><TextRegion><TextEquiv>Một</TextEquiv></TextRegion></Page></PcGts>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.page', { type: '' }))).toBe('page')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.page.xml', { type: 'application/vnd.prima.page+xml' })),
    ).toBe('page')
    expect(sourceKindFromFile(new File(['x'], 'notes.pcgts', { type: '' }))).toBe('page')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromPage('<PcGts><Metadata></Metadata></PcGts>')).toThrow(/<Page>/)
    expect(swapExtension('notes.page', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.page.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.pcgts', 'pdf')).toBe('notes.pdf')

    expect(toFoxml('Demo', ['Một', 'Hai\ndòng'])).toContain('<digitalObject')
    expect(toFoxml('Demo', ['Một'])).toContain('VALUE="Demo"')
    expect(toFoxml('Demo', ['Một'])).toContain('<text>Một</text>')
    expect(pagesFromFoxml(toFoxml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('foxml', toFoxml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromFoxml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromFoxml(
        '<digitalObject><datastreamVersion><xmlContent>Một</xmlContent></datastreamVersion></digitalObject>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.foxml', { type: '' }))).toBe('foxml')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.foxml.xml', { type: 'application/foxml+xml' })),
    ).toBe('foxml')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() =>
      pagesFromFoxml('<digitalObject><objectProperties></objectProperties></digitalObject>'),
    ).toThrow(/datastreamVersion/)
    expect(swapExtension('notes.foxml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.foxml.xml', 'pdf')).toBe('notes.pdf')

    expect(toEdm('Demo', ['Một', 'Hai\ndòng'])).toContain('<rdf:RDF')
    expect(toEdm('Demo', ['Một'])).toContain('<dc:publisher>Demo</dc:publisher>')
    expect(toEdm('Demo', ['Một'])).toContain('<dc:description>Một</dc:description>')
    expect(pagesFromEdm(toEdm('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('edm', toEdm('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromEdm('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromEdm(
        '<rdf:RDF><edm:ProvidedCHO><dc:title>Một</dc:title></edm:ProvidedCHO></rdf:RDF>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.edm', { type: '' }))).toBe('edm')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.edm.xml', { type: 'application/vnd.europeana.edm+xml' })),
    ).toBe('edm')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromEdm('<rdf:RDF></rdf:RDF>')).toThrow(/ProvidedCHO/)
    expect(swapExtension('notes.edm', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.edm.xml', 'pdf')).toBe('notes.pdf')

    expect(toLido('Demo', ['Một', 'Hai\ndòng'])).toContain('<lidoWrap')
    expect(toLido('Demo', ['Một'])).toContain('<appellationValue>Demo</appellationValue>')
    expect(toLido('Demo', ['Một'])).toContain('<descriptiveNoteValue>Một</descriptiveNoteValue>')
    expect(pagesFromLido(toLido('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('lido', toLido('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromLido('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromLido('<lidoWrap><lido><appellationValue>Một</appellationValue></lido></lidoWrap>'),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.lido', { type: '' }))).toBe('lido')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.lido.xml', { type: 'application/lido+xml' })),
    ).toBe('lido')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromLido('<lidoWrap></lidoWrap>')).toThrow(/<lido>/)
    expect(swapExtension('notes.lido', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.lido.xml', 'pdf')).toBe('notes.pdf')

    expect(toVra('Demo', ['Một', 'Hai\ndòng'])).toContain('<vra')
    expect(toVra('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVra('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVra(toVra('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vra', toVra('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVra('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromVra('<vra><work><title>Một</title></work></vra>')).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vra', { type: '' }))).toBe('vra')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vra.xml', { type: 'application/vra+xml' })),
    ).toBe('vra')
    expect(sourceKindFromFile(new File(['x'], 'notes.vracore', { type: '' }))).toBe('vra')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromVra('<vra></vra>')).toThrow(/<work>/)
    expect(swapExtension('notes.vra', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vra.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vracore', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vracore.xml', 'pdf')).toBe('notes.pdf')

    expect(toCdwa('Demo', ['Một', 'Hai\ndòng'])).toContain('<cdwalite')
    expect(toCdwa('Demo', ['Một'])).toContain('<displayCreator>Demo</displayCreator>')
    expect(toCdwa('Demo', ['Một'])).toContain('<descriptiveNote>Một</descriptiveNote>')
    expect(pagesFromCdwa(toCdwa('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('cdwa', toCdwa('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromCdwa('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromCdwa('<cdwalite><object><title>Một</title></object></cdwalite>')).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.cdwa', { type: '' }))).toBe('cdwa')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.cdwa.xml', { type: 'application/cdwa+xml' })),
    ).toBe('cdwa')
    expect(sourceKindFromFile(new File(['x'], 'notes.cdwalite', { type: '' }))).toBe('cdwa')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromCdwa('<cdwalite></cdwalite>')).toThrow(/<object>/)
    expect(swapExtension('notes.cdwa', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.cdwa.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.cdwalite', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.cdwalite.xml', 'pdf')).toBe('notes.pdf')

    expect(toSpectrum('Demo', ['Một', 'Hai\ndòng'])).toContain('<spectrum')
    expect(toSpectrum('Demo', ['Một'])).toContain('<objectName>Demo</objectName>')
    expect(toSpectrum('Demo', ['Một'])).toContain('<briefDescription>Một</briefDescription>')
    expect(pagesFromSpectrum(toSpectrum('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('spectrum', toSpectrum('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromSpectrum('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromSpectrum('<spectrum><record><objectName>Một</objectName></record></spectrum>')).toEqual([
      'Một',
    ])
    expect(sourceKindFromFile(new File(['x'], 'notes.spectrum', { type: '' }))).toBe('spectrum')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.spectrum.xml', { type: 'application/spectrum+xml' })),
    ).toBe('spectrum')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromSpectrum('<spectrum></spectrum>')).toThrow(/<record>/)
    expect(swapExtension('notes.spectrum', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.spectrum.xml', 'pdf')).toBe('notes.pdf')

    expect(toDwc('Demo', ['Một', 'Hai\ndòng'])).toContain('<dwr:DarwinRecordSet')
    expect(toDwc('Demo', ['Một'])).toContain('<dwc:institutionName>Demo</dwc:institutionName>')
    expect(toDwc('Demo', ['Một'])).toContain('<dcterms:description>Một</dcterms:description>')
    expect(pagesFromDwc(toDwc('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('dwc', toDwc('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromDwc('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromDwc(
        '<dwr:DarwinRecordSet><dwr:SimpleDarwinRecord><dwc:scientificName>Một</dwc:scientificName></dwr:SimpleDarwinRecord></dwr:DarwinRecordSet>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.dwc', { type: '' }))).toBe('dwc')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.dwc.xml', { type: 'application/vnd.tdwg.dwc+xml' })),
    ).toBe('dwc')
    expect(sourceKindFromFile(new File(['x'], 'notes.darwincore', { type: '' }))).toBe('dwc')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromDwc('<dwr:DarwinRecordSet></dwr:DarwinRecordSet>')).toThrow(/<SimpleDarwinRecord>/)
    expect(swapExtension('notes.dwc', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.dwc.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.darwincore', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.darwincore.xml', 'pdf')).toBe('notes.pdf')

    expect(toObjectid('Demo', ['Một', 'Hai\ndòng'])).toContain('<objectid')
    expect(toObjectid('Demo', ['Một'])).toContain('<title>Demo</title>')
    expect(toObjectid('Demo', ['Một'])).toContain('<distinguishingFeatures>Một</distinguishingFeatures>')
    expect(pagesFromObjectid(toObjectid('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('objectid', toObjectid('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromObjectid('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromObjectid('<objectid><object><title>Một</title></object></objectid>')).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.objectid', { type: '' }))).toBe('objectid')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.objectid.xml', { type: 'application/objectid+xml' })),
    ).toBe('objectid')
    expect(sourceKindFromFile(new File(['x'], 'notes.oid', { type: '' }))).toBe('objectid')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromObjectid('<objectid></objectid>')).toThrow(/<object>/)
    expect(swapExtension('notes.objectid', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.objectid.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.oid', 'pdf')).toBe('notes.pdf')

    expect(toEac('Demo', ['Một', 'Hai\ndòng'])).toContain('<eac-cpf')
    expect(toEac('Demo', ['Một'])).toContain('<date>Demo</date>')
    expect(toEac('Demo', ['Một'])).toContain('<p>Một</p>')
    expect(pagesFromEac(toEac('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('eac', toEac('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromEac('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromEac('<eac-cpf><cpfDescription><identity><nameEntry><part>Một</part></nameEntry></identity></cpfDescription></eac-cpf>'),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.eac', { type: '' }))).toBe('eac')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.eac.xml', { type: 'application/eac-cpf+xml' })),
    ).toBe('eac')
    expect(sourceKindFromFile(new File(['x'], 'notes.eac-cpf', { type: '' }))).toBe('eac')
    expect(sourceKindFromFile(new File(['x'], 'notes.cpf', { type: '' }))).toBe('eac')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromEac('<eac-cpf></eac-cpf>')).toThrow(/<cpfDescription>/)
    expect(swapExtension('notes.eac', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.eac.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.eac-cpf', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.eac-cpf.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.cpf', 'pdf')).toBe('notes.pdf')

    expect(toCrm('Demo', ['Một', 'Hai\ndòng'])).toContain('<rdf:RDF')
    expect(toCrm('Demo', ['Một'])).toContain('<crm:P102_has_title>Demo</crm:P102_has_title>')
    expect(toCrm('Demo', ['Một'])).toContain('<crm:P3_has_note>Một</crm:P3_has_note>')
    expect(pagesFromCrm(toCrm('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('crm', toCrm('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromCrm('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromCrm(
        '<rdf:RDF><crm:E31_Document><crm:P102_has_title>Một</crm:P102_has_title></crm:E31_Document></rdf:RDF>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.crm', { type: '' }))).toBe('crm')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.crm.xml', { type: 'application/cidoc-crm+xml' })),
    ).toBe('crm')
    expect(sourceKindFromFile(new File(['x'], 'notes.cidoc', { type: '' }))).toBe('crm')
    expect(sourceKindFromFile(new File(['x'], 'notes.cidoc-crm', { type: '' }))).toBe('crm')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromCrm('<rdf:RDF></rdf:RDF>')).toThrow(/<E31_Document>/)
    expect(swapExtension('notes.crm', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.crm.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.cidoc', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.cidoc.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.cidoc-crm', 'pdf')).toBe('notes.pdf')

    expect(toRights('Demo', ['Một', 'Hai\ndòng'])).toContain('<RightsDeclarationMD')
    expect(toRights('Demo', ['Một'])).toContain('<RightsHolderName>Demo</RightsHolderName>')
    expect(toRights('Demo', ['Một'])).toContain('<ConstraintDescription>Một</ConstraintDescription>')
    expect(pagesFromRights(toRights('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('rights', toRights('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromRights('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromRights(
        '<RightsDeclarationMD><RightsDeclaration><RightsHolder><RightsHolderName>Một</RightsHolderName></RightsHolder></RightsDeclaration></RightsDeclarationMD>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.rights', { type: '' }))).toBe('rights')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.rights.xml', { type: 'application/metsrights+xml' })),
    ).toBe('rights')
    expect(sourceKindFromFile(new File(['x'], 'notes.metsrights', { type: '' }))).toBe('rights')
    expect(sourceKindFromFile(new File(['x'], 'notes.rmd', { type: '' }))).toBe('rights')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromRights('<RightsDeclarationMD></RightsDeclarationMD>')).toThrow(
      /<RightsDeclaration>/,
    )
    expect(swapExtension('notes.rights', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.rights.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.metsrights', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.metsrights.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.rmd', 'pdf')).toBe('notes.pdf')

    expect(toTextmd('Demo', ['Một', 'Hai\ndòng'])).toContain('<textMD')
    expect(toTextmd('Demo', ['Một'])).toContain('<encoding_platform>Demo</encoding_platform>')
    expect(toTextmd('Demo', ['Một'])).toContain('<textNote>Một</textNote>')
    expect(pagesFromTextmd(toTextmd('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('textmd', toTextmd('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromTextmd('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromTextmd(
        '<textMD><encoding><encoding_platform>Một</encoding_platform></encoding></textMD>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.textmd', { type: '' }))).toBe('textmd')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.textmd.xml', { type: 'application/textmd+xml' })),
    ).toBe('textmd')
    expect(sourceKindFromFile(new File(['x'], 'notes.tmd', { type: '' }))).toBe('textmd')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromTextmd('<textMD></textMD>')).toThrow(/<encoding>/)
    expect(swapExtension('notes.textmd', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.textmd.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.tmd', 'pdf')).toBe('notes.pdf')

    expect(toPbcore('Demo', ['Một', 'Hai\ndòng'])).toContain('<pbcoreCollection')
    expect(toPbcore('Demo', ['Một'])).toContain('<pbcoreTitle>Demo</pbcoreTitle>')
    expect(toPbcore('Demo', ['Một'])).toContain('<pbcoreDescription>Một</pbcoreDescription>')
    expect(pagesFromPbcore(toPbcore('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('pbcore', toPbcore('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromPbcore('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromPbcore(
        '<pbcoreCollection><pbcoreDescriptionDocument><pbcoreTitle>Một</pbcoreTitle></pbcoreDescriptionDocument></pbcoreCollection>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.pbcore', { type: '' }))).toBe('pbcore')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.pbcore.xml', { type: 'application/pbcore+xml' })),
    ).toBe('pbcore')
    expect(sourceKindFromFile(new File(['x'], 'notes.pbc', { type: '' }))).toBe('pbcore')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromPbcore('<pbcoreCollection></pbcoreCollection>')).toThrow(
      /<pbcoreDescriptionDocument>/,
    )
    expect(swapExtension('notes.pbcore', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.pbcore.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.pbc', 'pdf')).toBe('notes.pdf')

    expect(toEbucore('Demo', ['Một', 'Hai\ndòng'])).toContain('<ebuCoreMain')
    expect(toEbucore('Demo', ['Một'])).toContain('<title>Demo</title>')
    expect(toEbucore('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromEbucore(toEbucore('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('ebucore', toEbucore('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromEbucore('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromEbucore(
        '<ebuCoreMain><coreMetadata><title><title>Một</title></title></coreMetadata></ebuCoreMain>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.ebucore', { type: '' }))).toBe('ebucore')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.ebucore.xml', { type: 'application/ebucore+xml' })),
    ).toBe('ebucore')
    expect(sourceKindFromFile(new File(['x'], 'notes.ebu', { type: '' }))).toBe('ebucore')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromEbucore('<ebuCoreMain></ebuCoreMain>')).toThrow(/<coreMetadata>/)
    expect(swapExtension('notes.ebucore', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.ebucore.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.ebu', 'pdf')).toBe('notes.pdf')

    expect(toMpeg7('Demo', ['Một', 'Hai\ndòng'])).toContain('<Mpeg7')
    expect(toMpeg7('Demo', ['Một'])).toContain('<Title>Demo</Title>')
    expect(toMpeg7('Demo', ['Một'])).toContain('<FreeTextAnnotation>Một</FreeTextAnnotation>')
    expect(pagesFromMpeg7(toMpeg7('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('mpeg7', toMpeg7('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromMpeg7('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromMpeg7(
        '<Mpeg7><Description><MultimediaContent><Title>Một</Title></MultimediaContent></Description></Mpeg7>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.mpeg7', { type: '' }))).toBe('mpeg7')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.mpeg7.xml', { type: 'application/mpeg7+xml' })),
    ).toBe('mpeg7')
    expect(sourceKindFromFile(new File(['x'], 'notes.mp7', { type: '' }))).toBe('mpeg7')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromMpeg7('<Mpeg7></Mpeg7>')).toThrow(/<MultimediaContent>/)
    expect(swapExtension('notes.mpeg7', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.mpeg7.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.mp7', 'pdf')).toBe('notes.pdf')

    expect(toAes57('Demo', ['Một', 'Hai\ndòng'])).toContain('<aes')
    expect(toAes57('Demo', ['Một'])).toContain('<title>Demo</title>')
    expect(toAes57('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromAes57(toAes57('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('aes57', toAes57('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromAes57('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromAes57('<aes><audioObject><title>Một</title></audioObject></aes>'),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.aes57', { type: '' }))).toBe('aes57')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.aes57.xml', { type: 'application/aes57+xml' })),
    ).toBe('aes57')
    expect(sourceKindFromFile(new File(['x'], 'notes.aes', { type: '' }))).toBe('aes57')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromAes57('<aes></aes>')).toThrow(/<audioObject>/)
    expect(swapExtension('notes.aes57', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.aes57.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.aes', 'pdf')).toBe('notes.pdf')

    expect(toLom('Demo', ['Một', 'Hai\ndòng'])).toContain('<lomCollection')
    expect(toLom('Demo', ['Một'])).toContain('<string>Demo</string>')
    expect(toLom('Demo', ['Một'])).toContain('<string>Một</string>')
    expect(pagesFromLom(toLom('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('lom', toLom('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromLom('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromLom('<lomCollection><lom><general><title><string>Một</string></title></general></lom></lomCollection>'),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.lom', { type: '' }))).toBe('lom')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.lom.xml', { type: 'application/lom+xml' })),
    ).toBe('lom')
    expect(sourceKindFromFile(new File(['x'], 'notes.ieee-lom', { type: '' }))).toBe('lom')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromLom('<lomCollection></lomCollection>')).toThrow(/<lom>/)
    expect(swapExtension('notes.lom', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.lom.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.ieee-lom', 'pdf')).toBe('notes.pdf')

    expect(toImscp('Demo', ['Một', 'Hai\ndòng'])).toContain('<manifest')
    expect(toImscp('Demo', ['Một'])).toContain('<title>Demo</title>')
    expect(toImscp('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromImscp(toImscp('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('imscp', toImscp('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromImscp('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromImscp('<manifest><organizations><organization><item><title>Một</title></item></organization></organizations></manifest>'),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.imscp', { type: '' }))).toBe('imscp')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.imscp.xml', { type: 'application/imscp+xml' })),
    ).toBe('imscp')
    expect(sourceKindFromFile(new File(['x'], 'notes.ims', { type: '' }))).toBe('imscp')
    expect(sourceKindFromFile(new File(['x'], 'imsmanifest.xml', { type: '' }))).toBe('imscp')
    expect(sourceKindFromFile(new File(['x'], 'course.imsmanifest.xml', { type: '' }))).toBe(
      'imscp',
    )
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromImscp('<manifest></manifest>')).toThrow(/<item>/)
    expect(swapExtension('notes.imscp', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.imscp.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.ims', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('imsmanifest.xml', 'pdf')).toBe('imsmanifest.pdf')

    expect(toNewsml('Demo', ['Một', 'Hai\ndòng'])).toContain('<newsML')
    expect(toNewsml('Demo', ['Một'])).toContain('<HeadLine>Demo</HeadLine>')
    expect(toNewsml('Demo', ['Một'])).toContain('<DataContent>Một</DataContent>')
    expect(pagesFromNewsml(toNewsml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('newsml', toNewsml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromNewsml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromNewsml('<newsML><newsItem><newsLines><HeadLine>Một</HeadLine></newsLines></newsItem></newsML>'),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.newsml', { type: '' }))).toBe('newsml')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.newsml.xml', { type: 'application/newsml+xml' })),
    ).toBe('newsml')
    expect(sourceKindFromFile(new File(['x'], 'notes.nml', { type: '' }))).toBe('newsml')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromNewsml('<newsML></newsML>')).toThrow(/<newsItem>/)
    expect(swapExtension('notes.newsml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.newsml.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.nml', 'pdf')).toBe('notes.pdf')

    expect(toNitf('Demo', ['Một', 'Hai\ndòng'])).toContain('<nitfCollection')
    expect(toNitf('Demo', ['Một'])).toContain('<title>Demo</title>')
    expect(toNitf('Demo', ['Một'])).toContain('<p>Một</p>')
    expect(pagesFromNitf(toNitf('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('nitf', toNitf('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromNitf('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromNitf('<nitfCollection><nitf><head><title>Một</title></head></nitf></nitfCollection>'),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.nitf', { type: '' }))).toBe('nitf')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.nitf.xml', { type: 'application/nitf+xml' })),
    ).toBe('nitf')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromNitf('<nitfCollection></nitfCollection>')).toThrow(/<nitf>/)
    expect(swapExtension('notes.nitf', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.nitf.xml', 'pdf')).toBe('notes.pdf')

    expect(toSportsml('Demo', ['Một', 'Hai\ndòng'])).toContain('<sportsML')
    expect(toSportsml('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toSportsml('Demo', ['Một'])).toContain('<narrative>Một</narrative>')
    expect(pagesFromSportsml(toSportsml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('sportsml', toSportsml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromSportsml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromSportsml(
        '<sportsML><sportsEvent><eventMetadata><name>Một</name></eventMetadata></sportsEvent></sportsML>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.sportsml', { type: '' }))).toBe('sportsml')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.sportsml.xml', { type: 'application/sportsml+xml' })),
    ).toBe('sportsml')
    expect(sourceKindFromFile(new File(['x'], 'notes.sml', { type: '' }))).toBe('sportsml')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromSportsml('<sportsML></sportsML>')).toThrow(/<sportsEvent>/)
    expect(swapExtension('notes.sportsml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.sportsml.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.sml', 'pdf')).toBe('notes.pdf')

    expect(toEventsml('Demo', ['Một', 'Hai\ndòng'])).toContain('<eventsML')
    expect(toEventsml('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toEventsml('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromEventsml(toEventsml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('eventsml', toEventsml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromEventsml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromEventsml(
        '<eventsML><eventsItem><eventDetails><name>Một</name></eventDetails></eventsItem></eventsML>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.eventsml', { type: '' }))).toBe('eventsml')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.eventsml.xml', { type: 'application/eventsml+xml' })),
    ).toBe('eventsml')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromEventsml('<eventsML></eventsML>')).toThrow(/<eventsItem>/)
    expect(swapExtension('notes.eventsml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.eventsml.xml', 'pdf')).toBe('notes.pdf')

    expect(toNewsmlg2('Demo', ['Một', 'Hai\ndòng'])).toContain('<newsMessage')
    expect(toNewsmlg2('Demo', ['Một'])).toContain('<headline>Demo</headline>')
    expect(toNewsmlg2('Demo', ['Một'])).toContain('<body>Một</body>')
    expect(pagesFromNewsmlg2(toNewsmlg2('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('newsmlg2', toNewsmlg2('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromNewsmlg2('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromNewsmlg2(
        '<newsMessage><packageItem><itemMeta><headline>Một</headline></itemMeta></packageItem></newsMessage>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.newsmlg2', { type: '' }))).toBe('newsmlg2')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.newsmlg2.xml', { type: 'application/vnd.iptc.g2+xml' }),
      ),
    ).toBe('newsmlg2')
    expect(sourceKindFromFile(new File(['x'], 'notes.newsml-g2', { type: '' }))).toBe('newsmlg2')
    expect(sourceKindFromFile(new File(['x'], 'notes.nar', { type: '' }))).toBe('newsmlg2')
    expect(sourceKindFromFile(new File(['x'], 'notes.newsml', { type: '' }))).toBe('newsml')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromNewsmlg2('<newsMessage></newsMessage>')).toThrow(/<packageItem>/)
    expect(swapExtension('notes.newsmlg2', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.newsmlg2.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.newsml-g2', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.nar', 'pdf')).toBe('notes.pdf')

    expect(toRnews('Demo', ['Một', 'Hai\ndòng'])).toContain('<rNews')
    expect(toRnews('Demo', ['Một'])).toContain('<headline>Demo</headline>')
    expect(toRnews('Demo', ['Một'])).toContain('<articleBody>Một</articleBody>')
    expect(pagesFromRnews(toRnews('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('rnews', toRnews('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromRnews('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromRnews(
        '<rNews><NewsArticle><headline>Một</headline></NewsArticle></rNews>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.rnews', { type: '' }))).toBe('rnews')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.rnews.xml', { type: 'application/vnd.iptc.rnews+xml' })),
    ).toBe('rnews')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromRnews('<rNews></rNews>')).toThrow(/<NewsArticle>/)
    expect(swapExtension('notes.rnews', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.rnews.xml', 'pdf')).toBe('notes.pdf')

    expect(toPrism('Demo', ['Một', 'Hai\ndòng'])).toContain('<prism')
    expect(toPrism('Demo', ['Một'])).toContain('<title>Demo</title>')
    expect(toPrism('Demo', ['Một'])).toContain('<body>Một</body>')
    expect(pagesFromPrism(toPrism('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('prism', toPrism('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromPrism('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromPrism('<prism><article><title>Một</title></article></prism>'),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.prism', { type: '' }))).toBe('prism')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.prism.xml', { type: 'application/prism+xml' })),
    ).toBe('prism')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromPrism('<prism></prism>')).toThrow(/<article>/)
    expect(swapExtension('notes.prism', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.prism.xml', 'pdf')).toBe('notes.pdf')

    expect(toHnews('Demo', ['Một', 'Hai\ndòng'])).toContain('<hnews')
    expect(toHnews('Demo', ['Một'])).toContain('<headline>Demo</headline>')
    expect(toHnews('Demo', ['Một'])).toContain('<content>Một</content>')
    expect(pagesFromHnews(toHnews('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('hnews', toHnews('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromHnews('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromHnews('<hnews><entry><headline>Một</headline></entry></hnews>'),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.hnews', { type: '' }))).toBe('hnews')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.hnews.xml', { type: 'application/hnews+xml' })),
    ).toBe('hnews')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromHnews('<hnews></hnews>')).toThrow(/<entry>/)
    expect(swapExtension('notes.hnews', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.hnews.xml', 'pdf')).toBe('notes.pdf')

    expect(toIptc('Demo', ['Một', 'Hai\ndòng'])).toContain('<iptc')
    expect(toIptc('Demo', ['Một'])).toContain('<headline>Demo</headline>')
    expect(toIptc('Demo', ['Một'])).toContain('<body>Một</body>')
    expect(pagesFromIptc(toIptc('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('iptc', toIptc('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromIptc('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromIptc('<iptc><iptcItem><headline>Một</headline></iptcItem></iptc>'),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.iptc', { type: '' }))).toBe('iptc')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.iptc.xml', { type: 'application/iptc+xml' })),
    ).toBe('iptc')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromIptc('<iptc></iptc>')).toThrow(/<iptcItem>/)
    expect(swapExtension('notes.iptc', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.iptc.xml', 'pdf')).toBe('notes.pdf')

    expect(toAnpa('Demo', ['Một', 'Hai\ndòng'])).toContain('<anpa')
    expect(toAnpa('Demo', ['Một'])).toContain('<headline>Demo</headline>')
    expect(toAnpa('Demo', ['Một'])).toContain('<text>Một</text>')
    expect(pagesFromAnpa(toAnpa('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('anpa', toAnpa('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromAnpa('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromAnpa('<anpa><anpaStory><headline>Một</headline></anpaStory></anpa>'),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.anpa', { type: '' }))).toBe('anpa')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.anpa.xml', { type: 'application/anpa+xml' })),
    ).toBe('anpa')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromAnpa('<anpa></anpa>')).toThrow(/<anpaStory>/)
    expect(swapExtension('notes.anpa', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.anpa.xml', 'pdf')).toBe('notes.pdf')

    expect(toNinjs('Demo', ['Một', 'Hai\ndòng'])).toContain('"ninjs": "1.4"')
    expect(toNinjs('Demo', ['Một'])).toContain('"headline": "Demo"')
    expect(toNinjs('Demo', ['Một'])).toContain('"body_text": "Một"')
    expect(pagesFromNinjs(toNinjs('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('ninjs', toNinjs('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromNinjs('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromNinjs('{"ninjs":"1.4","items":[{"headline":"Một"}]}'),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.json', { type: '' }))).toBe('json')
    expect(sourceKindFromFile(new File(['x'], 'notes.ninjs', { type: '' }))).toBe('ninjs')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.ninjs.json', { type: 'application/vnd.iptc.ninjs+json' }),
      ),
    ).toBe('ninjs')
    expect(() => pagesFromNinjs('{"ninjs":"1.4","items":[]}')).toThrow(/body_text/)
    expect(swapExtension('notes.ninjs', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.ninjs.json', 'pdf')).toBe('notes.pdf')

    expect(toJsonfeed('Demo', ['Một', 'Hai\ndòng'])).toContain('jsonfeed.org/version/1.1')
    expect(toJsonfeed('Demo', ['Một'])).toContain('"title": "Demo"')
    expect(toJsonfeed('Demo', ['Một'])).toContain('"content_text": "Một"')
    expect(pagesFromJsonfeed(toJsonfeed('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('jsonfeed', toJsonfeed('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromJsonfeed('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromJsonfeed(
        '{"version":"https://jsonfeed.org/version/1.1","items":[{"title":"Một"}]}',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.json', { type: '' }))).toBe('json')
    expect(sourceKindFromFile(new File(['x'], 'notes.jsonfeed', { type: '' }))).toBe('jsonfeed')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.jsonfeed.json', { type: 'application/feed+json' }),
      ),
    ).toBe('jsonfeed')
    expect(() =>
      pagesFromJsonfeed('{"version":"https://jsonfeed.org/version/1.1","items":[]}'),
    ).toThrow(/content_text/)
    expect(swapExtension('notes.jsonfeed', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.jsonfeed.json', 'pdf')).toBe('notes.pdf')

    expect(toAs2('Demo', ['Một', 'Hai\ndòng'])).toContain('www.w3.org/ns/activitystreams')
    expect(toAs2('Demo', ['Một'])).toContain('"type": "OrderedCollection"')
    expect(toAs2('Demo', ['Một'])).toContain('"content": "Một"')
    expect(pagesFromAs2(toAs2('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('as2', toAs2('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromAs2('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromAs2(
        '{"@context":"https://www.w3.org/ns/activitystreams","type":"OrderedCollection","orderedItems":[{"name":"Một"}]}',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.json', { type: '' }))).toBe('json')
    expect(sourceKindFromFile(new File(['x'], 'notes.as2', { type: '' }))).toBe('as2')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.as2.json', { type: 'application/activity+json' }),
      ),
    ).toBe('as2')
    expect(() =>
      pagesFromAs2(
        '{"@context":"https://www.w3.org/ns/activitystreams","type":"OrderedCollection","orderedItems":[]}',
      ),
    ).toThrow(/orderedItems/)
    expect(swapExtension('notes.as2', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.as2.json', 'pdf')).toBe('notes.pdf')

    expect(toGeojson('Demo', ['Một', 'Hai\ndòng'])).toContain('"type": "FeatureCollection"')
    expect(toGeojson('Demo', ['Một'])).toContain('"name": "Demo"')
    expect(toGeojson('Demo', ['Một'])).toContain('"description": "Một"')
    expect(pagesFromGeojson(toGeojson('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('geojson', toGeojson('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromGeojson('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromGeojson(
        '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{"name":"Một"},"geometry":null}]}',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.json', { type: '' }))).toBe('json')
    expect(sourceKindFromFile(new File(['x'], 'notes.geojson', { type: '' }))).toBe('geojson')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.geojson.json', { type: 'application/geo+json' }),
      ),
    ).toBe('geojson')
    expect(() => pagesFromGeojson('{"type":"FeatureCollection","features":[]}')).toThrow(
      /features/,
    )
    expect(swapExtension('notes.geojson', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.geojson.json', 'pdf')).toBe('notes.pdf')

    expect(toKml('Demo', ['Một', 'Hai\ndòng'])).toContain('http://www.opengis.net/kml/2.2')
    expect(toKml('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toKml('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromKml(toKml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('kml', toKml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromKml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromKml('<kml><Placemark><name>Một</name></Placemark></kml>')).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(sourceKindFromFile(new File(['x'], 'notes.kml', { type: '' }))).toBe('kml')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.kml.xml', { type: 'application/vnd.google-earth.kml+xml' }),
      ),
    ).toBe('kml')
    expect(() => pagesFromKml('<kml></kml>')).toThrow(/<Placemark>/)
    expect(swapExtension('notes.kml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.kml.xml', 'pdf')).toBe('notes.pdf')

    expect(toGpx('Demo', ['Một', 'Hai\ndòng'])).toContain('www.topografix.com/GPX/1/1')
    expect(toGpx('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toGpx('Demo', ['Một'])).toContain('<desc>Một</desc>')
    expect(pagesFromGpx(toGpx('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('gpx', toGpx('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromGpx('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromGpx('<gpx><wpt lat="0" lon="0"><name>Một</name></wpt></gpx>')).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(sourceKindFromFile(new File(['x'], 'notes.gpx', { type: '' }))).toBe('gpx')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.gpx.xml', { type: 'application/gpx+xml' })),
    ).toBe('gpx')
    expect(() => pagesFromGpx('<gpx></gpx>')).toThrow(/<wpt>/)
    expect(swapExtension('notes.gpx', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.gpx.xml', 'pdf')).toBe('notes.pdf')

    expect(toOsm('Demo', ['Một', 'Hai\ndòng'])).toContain('osm version="0.6"')
    expect(toOsm('Demo', ['Một'])).toContain('<note>Demo</note>')
    expect(toOsm('Demo', ['Một'])).toContain('k="text" v="Một"')
    expect(pagesFromOsm(toOsm('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('osm', toOsm('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromOsm('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromOsm('<osm><node id="1" lat="0" lon="0"><tag k="name" v="Một"/></node></osm>')).toEqual(
      ['Một'],
    )
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(sourceKindFromFile(new File(['x'], 'notes.osm', { type: '' }))).toBe('osm')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.osm.xml', { type: 'application/vnd.osm+xml' }),
      ),
    ).toBe('osm')
    expect(() => pagesFromOsm('<osm></osm>')).toThrow(/<node>/)
    expect(swapExtension('notes.osm', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.osm.xml', 'pdf')).toBe('notes.pdf')

    expect(toGeorss('Demo', ['Một', 'Hai\ndòng'])).toContain('http://www.georss.org/georss')
    expect(toGeorss('Demo', ['Một'])).toContain('<title>Demo</title>')
    expect(toGeorss('Demo', ['Một'])).toContain('<summary>Một</summary>')
    expect(pagesFromGeorss(toGeorss('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('georss', toGeorss('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromGeorss('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromGeorss('<feed><entry><title>Một</title></entry></feed>'),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(sourceKindFromFile(new File(['x'], 'notes.georss', { type: '' }))).toBe('georss')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.georss.xml', { type: 'application/georss+xml' }),
      ),
    ).toBe('georss')
    expect(() => pagesFromGeorss('<feed></feed>')).toThrow(/<entry>/)
    expect(swapExtension('notes.georss', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.georss.xml', 'pdf')).toBe('notes.pdf')

    expect(toWkt('Demo', ['Một', 'Hai\ndòng'])).toContain('POINT (0 0)')
    expect(toWkt('Demo', ['Một'])).toContain('# Demo')
    expect(toWkt('Demo', ['Một'])).toContain('Một')
    expect(pagesFromWkt(toWkt('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('wkt', toWkt('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromWkt('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromWkt('POINT (1 2)\nMột')).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.txt', { type: '' }))).toBe('txt')
    expect(sourceKindFromFile(new File(['x'], 'notes.wkt', { type: '' }))).toBe('wkt')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.wkt.txt', { type: 'application/wkt' })),
    ).toBe('wkt')
    expect(() => pagesFromWkt('# Demo\n')).toThrow(/POINT/)
    expect(swapExtension('notes.wkt', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.wkt.txt', 'pdf')).toBe('notes.pdf')

    expect(toGml('Demo', ['Một', 'Hai\ndòng'])).toContain('http://www.opengis.net/gml/3.2')
    expect(toGml('Demo', ['Một'])).toContain('<gml:name>Demo</gml:name>')
    expect(toGml('Demo', ['Một'])).toContain('<gml:description>Một</gml:description>')
    expect(pagesFromGml(toGml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('gml', toGml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromGml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromGml(
        '<gml:FeatureCollection xmlns:gml="http://www.opengis.net/gml/3.2"><gml:featureMember><gml:name>Một</gml:name></gml:featureMember></gml:FeatureCollection>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(sourceKindFromFile(new File(['x'], 'notes.gml', { type: '' }))).toBe('gml')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.gml.xml', { type: 'application/gml+xml' })),
    ).toBe('gml')
    expect(() => pagesFromGml('<gml:FeatureCollection></gml:FeatureCollection>')).toThrow(
      /<featureMember>/,
    )
    expect(swapExtension('notes.gml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.gml.xml', 'pdf')).toBe('notes.pdf')

    expect(toTopojson('Demo', ['Một', 'Hai\ndòng'])).toContain('"type": "Topology"')
    expect(toTopojson('Demo', ['Một'])).toContain('"name": "Demo"')
    expect(toTopojson('Demo', ['Một'])).toContain('"text": "Một"')
    expect(pagesFromTopojson(toTopojson('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('topojson', toTopojson('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromTopojson('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromTopojson(
        '{"type":"Topology","objects":{"pages":{"type":"GeometryCollection","geometries":[{"type":"Point","properties":{"name":"Một"}}]}}}',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.json', { type: '' }))).toBe('json')
    expect(sourceKindFromFile(new File(['x'], 'notes.topojson', { type: '' }))).toBe('topojson')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.topo.json', { type: 'application/topo+json' }),
      ),
    ).toBe('topojson')
    expect(() => pagesFromTopojson('{"type":"Topology","objects":{}}')).toThrow(/geometries/)
    expect(swapExtension('notes.topojson', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.topo.json', 'pdf')).toBe('notes.pdf')

    expect(toSvg('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(toSvg('Demo', ['Một'])).toContain('<title>Demo</title>')
    expect(toSvg('Demo', ['Một'])).toContain('<desc>Một</desc>')
    expect(pagesFromSvg(toSvg('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('svg', toSvg('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromSvg('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromSvg(
        '<svg xmlns="http://www.w3.org/2000/svg"><g><title>Một</title></g></svg>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(sourceKindFromFile(new File(['x'], 'notes.svg', { type: '' }))).toBe('svg')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.svg.xml', { type: 'image/svg+xml' })),
    ).toBe('svg')
    expect(() => pagesFromSvg('<svg xmlns="http://www.w3.org/2000/svg"></svg>')).toThrow(/<g>/)
    expect(swapExtension('notes.svg', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.svg.xml', 'pdf')).toBe('notes.pdf')

    expect(toDxf('Demo', ['Một', 'Hai\ndòng'])).toContain('0\nTEXT')
    expect(toDxf('Demo', ['Một'])).toContain('999\nDemo')
    expect(toDxf('Demo', ['Một'])).toContain('1\nMột')
    expect(pagesFromDxf(toDxf('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('dxf', toDxf('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromDxf('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromDxf('0\nTEXT\n8\n0\n1\nMột')).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.txt', { type: '' }))).toBe('txt')
    expect(sourceKindFromFile(new File(['x'], 'notes.dxf', { type: '' }))).toBe('dxf')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.dxf.txt', { type: 'application/dxf' })),
    ).toBe('dxf')
    expect(() => pagesFromDxf('0\nSECTION\n2\nENTITIES\n0\nENDSEC\n0\nEOF\n')).toThrow(/TEXT/)
    expect(swapExtension('notes.dxf', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.dxf.txt', 'pdf')).toBe('notes.pdf')

    expect(toMapml('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.w3.org/1999/xhtml/mapml"')
    expect(toMapml('Demo', ['Một'])).toContain('<title>Demo</title>')
    expect(toMapml('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromMapml(toMapml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('mapml', toMapml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromMapml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromMapml(
        '<mapml xmlns="http://www.w3.org/1999/xhtml/mapml"><feature><name>Một</name></feature></mapml>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(sourceKindFromFile(new File(['x'], 'notes.mapml', { type: '' }))).toBe('mapml')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.mapml.xml', { type: 'text/mapml' }),
      ),
    ).toBe('mapml')
    expect(() => pagesFromMapml('<mapml xmlns="http://www.w3.org/1999/xhtml/mapml"></mapml>')).toThrow(
      /<feature>/,
    )
    expect(swapExtension('notes.mapml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.mapml.xml', 'pdf')).toBe('notes.pdf')

    expect(toCityjson('Demo', ['Một', 'Hai\ndòng'])).toContain('"type": "CityJSON"')
    expect(toCityjson('Demo', ['Một'])).toContain('"title": "Demo"')
    expect(toCityjson('Demo', ['Một'])).toContain('"description": "Một"')
    expect(pagesFromCityjson(toCityjson('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('cityjson', toCityjson('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromCityjson('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromCityjson(
        '{"type":"CityJSON","CityObjects":{"page-1":{"attributes":{"name":"Một"}}}}',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.json', { type: '' }))).toBe('json')
    expect(sourceKindFromFile(new File(['x'], 'notes.cityjson', { type: '' }))).toBe('cityjson')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.city.json', { type: 'application/city+json' })),
    ).toBe('cityjson')
    expect(() => pagesFromCityjson('{"type":"CityJSON","CityObjects":{}}')).toThrow(/CityObjects/)
    expect(swapExtension('notes.cityjson', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.city.json', 'pdf')).toBe('notes.pdf')

    expect(toIndoorgml('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.opengis.net/indoorgml/1.0/core"')
    expect(toIndoorgml('Demo', ['Một'])).toContain('<gml:name>Demo</gml:name>')
    expect(toIndoorgml('Demo', ['Một'])).toContain('<gml:description>Một</gml:description>')
    expect(pagesFromIndoorgml(toIndoorgml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('indoorgml', toIndoorgml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromIndoorgml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromIndoorgml(
        '<IndoorFeatures xmlns="http://www.opengis.net/indoorgml/1.0/core"><CellSpace><name>Một</name></CellSpace></IndoorFeatures>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(sourceKindFromFile(new File(['x'], 'notes.indoorgml', { type: '' }))).toBe('indoorgml')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.indoorgml.xml', { type: 'application/indoorgml+xml' }),
      ),
    ).toBe('indoorgml')
    expect(() =>
      pagesFromIndoorgml('<IndoorFeatures xmlns="http://www.opengis.net/indoorgml/1.0/core"></IndoorFeatures>'),
    ).toThrow(/cellSpaceMember/)
    expect(swapExtension('notes.indoorgml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.indoorgml.xml', 'pdf')).toBe('notes.pdf')

    expect(toCitygml('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.opengis.net/citygml/2.0"')
    expect(toCitygml('Demo', ['Một'])).toContain('<gml:name>Demo</gml:name>')
    expect(toCitygml('Demo', ['Một'])).toContain('<gml:description>Một</gml:description>')
    expect(pagesFromCitygml(toCitygml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('citygml', toCitygml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromCitygml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromCitygml(
        '<CityModel xmlns="http://www.opengis.net/citygml/2.0"><Building><name>Một</name></Building></CityModel>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(sourceKindFromFile(new File(['x'], 'notes.citygml', { type: '' }))).toBe('citygml')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.citygml.xml', { type: 'application/citygml+xml' }),
      ),
    ).toBe('citygml')
    expect(() =>
      pagesFromCitygml('<CityModel xmlns="http://www.opengis.net/citygml/2.0"></CityModel>'),
    ).toThrow(/cityObjectMember/)
    expect(swapExtension('notes.citygml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.citygml.xml', 'pdf')).toBe('notes.pdf')

    expect(toLandxml('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.landxml.org/schema/LandXML-1.2"')
    expect(toLandxml('Demo', ['Một'])).toContain('name="Demo"')
    expect(toLandxml('Demo', ['Một'])).toContain('<Desc>Một</Desc>')
    expect(pagesFromLandxml(toLandxml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('landxml', toLandxml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromLandxml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromLandxml(
        '<LandXML xmlns="http://www.landxml.org/schema/LandXML-1.2"><CgPoint name="Một">0 0</CgPoint></LandXML>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(sourceKindFromFile(new File(['x'], 'notes.landxml', { type: '' }))).toBe('landxml')
    expect(
      sourceKindFromFile(
        new File(['x'], 'notes.landxml.xml', { type: 'application/landxml+xml' }),
      ),
    ).toBe('landxml')
    expect(() =>
      pagesFromLandxml('<LandXML xmlns="http://www.landxml.org/schema/LandXML-1.2"></LandXML>'),
    ).toThrow(/Parcel/)
    expect(swapExtension('notes.landxml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.landxml.xml', 'pdf')).toBe('notes.pdf')

    expect(toIfcxml('Demo', ['Một', 'Hai\ndòng'])).toContain(
      'xmlns="https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/XML/SCHEMA"',
    )
    expect(toIfcxml('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toIfcxml('Demo', ['Một'])).toContain('<Description>Một</Description>')
    expect(pagesFromIfcxml(toIfcxml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('ifcxml', toIfcxml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromIfcxml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromIfcxml(
        '<ifcXML xmlns="https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/XML/SCHEMA"><IfcSpace Name="Một"><Name>Một</Name></IfcSpace></ifcXML>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(sourceKindFromFile(new File(['x'], 'notes.ifcxml', { type: '' }))).toBe('ifcxml')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.ifc.xml', { type: 'application/ifcxml+xml' })),
    ).toBe('ifcxml')
    expect(() =>
      pagesFromIfcxml(
        '<ifcXML xmlns="https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/XML/SCHEMA"></ifcXML>',
      ),
    ).toThrow(/IfcBuilding/)
    expect(swapExtension('notes.ifcxml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.ifc.xml', 'pdf')).toBe('notes.pdf')

    expect(toGbxml('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.gbxml.org/schema"')
    expect(toGbxml('Demo', ['Một'])).toContain('<Name>Demo</Name>')
    expect(toGbxml('Demo', ['Một'])).toContain('<Description>Một</Description>')
    expect(pagesFromGbxml(toGbxml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('gbxml', toGbxml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromGbxml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromGbxml(
        '<gbXML xmlns="http://www.gbxml.org/schema"><Space><Name>Một</Name></Space></gbXML>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(sourceKindFromFile(new File(['x'], 'notes.gbxml', { type: '' }))).toBe('gbxml')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.gbxml.xml', { type: 'application/gbxml+xml' })),
    ).toBe('gbxml')
    expect(() => pagesFromGbxml('<gbXML xmlns="http://www.gbxml.org/schema"></gbXML>')).toThrow(
      /BuildingStorey/,
    )
    expect(swapExtension('notes.gbxml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.gbxml.xml', 'pdf')).toBe('notes.pdf')

    expect(toBcfxml('Demo', ['Một', 'Hai\ndòng'])).toContain('<Markup')
    expect(toBcfxml('Demo', ['Một'])).toContain('<Filename>Demo</Filename>')
    expect(toBcfxml('Demo', ['Một'])).toContain('<Description>Một</Description>')
    expect(pagesFromBcfxml(toBcfxml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('bcfxml', toBcfxml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromBcfxml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromBcfxml(
        '<Markup xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><Comment><Title>Một</Title></Comment></Markup>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(sourceKindFromFile(new File(['x'], 'notes.bcfxml', { type: '' }))).toBe('bcfxml')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.bcf.xml', { type: 'application/bcfxml+xml' })),
    ).toBe('bcfxml')
    expect(() =>
      pagesFromBcfxml('<Markup xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"></Markup>'),
    ).toThrow(/Topic/)
    expect(swapExtension('notes.bcfxml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.bcf.xml', 'pdf')).toBe('notes.pdf')

    expect(toCobiexml('Demo', ['Một', 'Hai\ndòng'])).toContain(
      'xmlns="http://docs.buildingsmartalliance.org/nbims03/cobie"',
    )
    expect(toCobiexml('Demo', ['Một'])).toContain('<Name>Demo</Name>')
    expect(toCobiexml('Demo', ['Một'])).toContain('<Description>Một</Description>')
    expect(pagesFromCobiexml(toCobiexml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('cobiexml', toCobiexml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromCobiexml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromCobiexml(
        '<COBie xmlns="http://docs.buildingsmartalliance.org/nbims03/cobie"><Facility><Name>Một</Name></Facility></COBie>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(sourceKindFromFile(new File(['x'], 'notes.cobiexml', { type: '' }))).toBe('cobiexml')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.cobie.xml', { type: 'application/cobiexml+xml' })),
    ).toBe('cobiexml')
    expect(() =>
      pagesFromCobiexml('<COBie xmlns="http://docs.buildingsmartalliance.org/nbims03/cobie"></COBie>'),
    ).toThrow(/Component/)
    expect(swapExtension('notes.cobiexml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.cobie.xml', 'pdf')).toBe('notes.pdf')

    expect(toLandinfra('Demo', ['Một', 'Hai\ndòng'])).toContain(
      'xmlns="http://www.opengis.net/landinfra/2.0"',
    )
    expect(toLandinfra('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toLandinfra('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromLandinfra(toLandinfra('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('landinfra', toLandinfra('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromLandinfra('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromLandinfra(
        '<LandInfra xmlns="http://www.opengis.net/landinfra/2.0"><Alignment><name>Một</name></Alignment></LandInfra>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(sourceKindFromFile(new File(['x'], 'notes.landinfra', { type: '' }))).toBe('landinfra')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.landinfra.xml', { type: 'application/landinfra+xml' })),
    ).toBe('landinfra')
    expect(() =>
      pagesFromLandinfra('<LandInfra xmlns="http://www.opengis.net/landinfra/2.0"></LandInfra>'),
    ).toThrow(/Feature/)
    expect(swapExtension('notes.landinfra', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.landinfra.xml', 'pdf')).toBe('notes.pdf')

    expect(toInfragml('Demo', ['Một', 'Hai\ndòng'])).toContain(
      'xmlns="http://www.opengis.net/infragml/1.0"',
    )
    expect(toInfragml('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toInfragml('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromInfragml(toInfragml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('infragml', toInfragml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromInfragml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromInfragml(
        '<InfraGML xmlns="http://www.opengis.net/infragml/1.0"><Road><name>Một</name></Road></InfraGML>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(sourceKindFromFile(new File(['x'], 'notes.infragml', { type: '' }))).toBe('infragml')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.infragml.xml', { type: 'application/infragml+xml' })),
    ).toBe('infragml')
    expect(() =>
      pagesFromInfragml('<InfraGML xmlns="http://www.opengis.net/infragml/1.0"></InfraGML>'),
    ).toThrow(/featureMember/)
    expect(swapExtension('notes.infragml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.infragml.xml', 'pdf')).toBe('notes.pdf')

    expect(toOpendrive('Demo', ['Một', 'Hai\ndòng'])).toContain('<OpenDRIVE>')
    expect(toOpendrive('Demo', ['Một'])).toContain('name="Demo"')
    expect(toOpendrive('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromOpendrive(toOpendrive('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('opendrive', toOpendrive('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromOpendrive('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromOpendrive(
        '<OpenDRIVE><junction name="Một"><description></description></junction></OpenDRIVE>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.opendrive', { type: '' }))).toBe('opendrive')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.opendrive.xml', { type: 'application/vnd.opendrive+xml' })),
    ).toBe('opendrive')
    expect(sourceKindFromFile(new File(['x'], 'notes.xodr', { type: '' }))).toBe('opendrive')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.od', { type: '' }))).toThrow()
    expect(() => pagesFromOpendrive('<OpenDRIVE></OpenDRIVE>')).toThrow(/OpenDRIVE/)
    expect(swapExtension('notes.opendrive', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.opendrive.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.xodr', 'pdf')).toBe('notes.pdf')

    expect(toRailml('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="https://www.railml.org/schemas/3.2"')
    expect(toRailml('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toRailml('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromRailml(toRailml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('railml', toRailml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromRailml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromRailml('<railml xmlns="https://www.railml.org/schemas/3.2"><track><name>Một</name></track></railml>'),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.railml', { type: '' }))).toBe('railml')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.railml.xml', { type: 'application/railml+xml' })),
    ).toBe('railml')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.rail', { type: '' }))).toThrow()
    expect(() => pagesFromRailml('<railml xmlns="https://www.railml.org/schemas/3.2"></railml>')).toThrow(
      /RailML/,
    )
    expect(swapExtension('notes.railml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.railml.xml', 'pdf')).toBe('notes.pdf')

    expect(toTransxml('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.transxml.org/schema/1.0"')
    expect(toTransxml('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toTransxml('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromTransxml(toTransxml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('transxml', toTransxml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromTransxml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromTransxml(
        '<TransXML xmlns="http://www.transxml.org/schema/1.0"><Facility><name>Một</name></Facility></TransXML>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.transxml', { type: '' }))).toBe('transxml')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.transxml.xml', { type: 'application/transxml+xml' })),
    ).toBe('transxml')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.trans', { type: '' }))).toThrow()
    expect(() =>
      pagesFromTransxml('<TransXML xmlns="http://www.transxml.org/schema/1.0"></TransXML>'),
    ).toThrow(/Project/)
    expect(swapExtension('notes.transxml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.transxml.xml', 'pdf')).toBe('notes.pdf')

    expect(toDatex2('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://datex2.eu/schema/2/2_0"')
    expect(toDatex2('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toDatex2('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromDatex2(toDatex2('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('datex2', toDatex2('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromDatex2('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromDatex2(
        '<d2LogicalModel xmlns="http://datex2.eu/schema/2/2_0"><situation><name>Một</name></situation></d2LogicalModel>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.datex2', { type: '' }))).toBe('datex2')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.datex2.xml', { type: 'application/datex2+xml' })),
    ).toBe('datex2')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.d2', { type: '' }))).toThrow()
    expect(() =>
      pagesFromDatex2('<d2LogicalModel xmlns="http://datex2.eu/schema/2/2_0"></d2LogicalModel>'),
    ).toThrow(/situationRecord/)
    expect(swapExtension('notes.datex2', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.datex2.xml', 'pdf')).toBe('notes.pdf')

    expect(toNetex('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.netex.org.uk/netex"')
    expect(toNetex('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toNetex('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromNetex(toNetex('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('netex', toNetex('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromNetex('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromNetex(
        '<PublicationDelivery xmlns="http://www.netex.org.uk/netex"><ScheduledStopPoint><name>Một</name></ScheduledStopPoint></PublicationDelivery>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.netex', { type: '' }))).toBe('netex')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.netex.xml', { type: 'application/netex+xml' })),
    ).toBe('netex')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.nx', { type: '' }))).toThrow()
    expect(() =>
      pagesFromNetex('<PublicationDelivery xmlns="http://www.netex.org.uk/netex"></PublicationDelivery>'),
    ).toThrow(/StopPlace/)
    expect(swapExtension('notes.netex', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.netex.xml', 'pdf')).toBe('notes.pdf')

    expect(toSiri('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.siri.org.uk/siri"')
    expect(toSiri('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toSiri('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromSiri(toSiri('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('siri', toSiri('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromSiri('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromSiri(
        '<Siri xmlns="http://www.siri.org.uk/siri"><VehicleJourney><name>Một</name></VehicleJourney></Siri>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.siri', { type: '' }))).toBe('siri')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.siri.xml', { type: 'application/siri+xml' })),
    ).toBe('siri')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.sr', { type: '' }))).toThrow()
    expect(() => pagesFromSiri('<Siri xmlns="http://www.siri.org.uk/siri"></Siri>')).toThrow(/StopPoint/)
    expect(swapExtension('notes.siri', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.siri.xml', 'pdf')).toBe('notes.pdf')

    expect(toTransxchange('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.transxchange.org.uk/"')
    expect(toTransxchange('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toTransxchange('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromTransxchange(toTransxchange('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('transxchange', toTransxchange('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromTransxchange('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromTransxchange(
        '<TransXChange xmlns="http://www.transxchange.org.uk/"><JourneyPattern><name>Một</name></JourneyPattern></TransXChange>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.transxchange', { type: '' }))).toBe('transxchange')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.transxchange.xml', { type: 'application/transxchange+xml' })),
    ).toBe('transxchange')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.txc', { type: '' }))).toThrow()
    expect(() =>
      pagesFromTransxchange('<TransXChange xmlns="http://www.transxchange.org.uk/"></TransXChange>'),
    ).toThrow(/StopPoint/)
    expect(swapExtension('notes.transxchange', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.transxchange.xml', 'pdf')).toBe('notes.pdf')

    expect(toNaptan('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.naptan.org.uk/"')
    expect(toNaptan('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toNaptan('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromNaptan(toNaptan('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('naptan', toNaptan('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromNaptan('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromNaptan(
        '<NaPTAN xmlns="http://www.naptan.org.uk/"><StopArea><name>Một</name></StopArea></NaPTAN>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.naptan', { type: '' }))).toBe('naptan')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.naptan.xml', { type: 'application/naptan+xml' })),
    ).toBe('naptan')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.npt', { type: '' }))).toThrow()
    expect(() => pagesFromNaptan('<NaPTAN xmlns="http://www.naptan.org.uk/"></NaPTAN>')).toThrow(/StopPoint/)
    expect(swapExtension('notes.naptan', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.naptan.xml', 'pdf')).toBe('notes.pdf')

    expect(toGtfs('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://gtfs.org/"')
    expect(toGtfs('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toGtfs('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromGtfs(toGtfs('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('gtfs', toGtfs('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromGtfs('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromGtfs('<GTFS xmlns="http://gtfs.org/"><Route><name>Một</name></Route></GTFS>'),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.gtfs', { type: '' }))).toBe('gtfs')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.gtfs.xml', { type: 'application/gtfs+xml' })),
    ).toBe('gtfs')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.gt', { type: '' }))).toThrow()
    expect(() => pagesFromGtfs('<GTFS xmlns="http://gtfs.org/"></GTFS>')).toThrow(/Stop/)
    expect(swapExtension('notes.gtfs', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.gtfs.xml', 'pdf')).toBe('notes.pdf')

    expect(toIfopt('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.ifopt.org.uk/"')
    expect(toIfopt('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toIfopt('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromIfopt(toIfopt('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('ifopt', toIfopt('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromIfopt('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromIfopt(
        '<IFOPT xmlns="http://www.ifopt.org.uk/"><StopPoint><name>Một</name></StopPoint></IFOPT>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.ifopt', { type: '' }))).toBe('ifopt')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.ifopt.xml', { type: 'application/ifopt+xml' })),
    ).toBe('ifopt')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.ifo', { type: '' }))).toThrow()
    expect(() => pagesFromIfopt('<IFOPT xmlns="http://www.ifopt.org.uk/"></IFOPT>')).toThrow(/StopPlace/)
    expect(swapExtension('notes.ifopt', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.ifopt.xml', 'pdf')).toBe('notes.pdf')

    expect(toOjp('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/ojp"')
    expect(toOjp('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toOjp('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromOjp(toOjp('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('ojp', toOjp('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromOjp('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromOjp('<OJP xmlns="http://www.vdv.de/ojp"><Trip><name>Một</name></Trip></OJP>'),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.ojp', { type: '' }))).toBe('ojp')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.ojp.xml', { type: 'application/ojp+xml' })),
    ).toBe('ojp')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.oj', { type: '' }))).toThrow()
    expect(() => pagesFromOjp('<OJP xmlns="http://www.vdv.de/ojp"></OJP>')).toThrow(/StopPoint/)
    expect(swapExtension('notes.ojp', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.ojp.xml', 'pdf')).toBe('notes.pdf')

    expect(toTrias('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/trias"')
    expect(toTrias('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toTrias('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromTrias(toTrias('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('trias', toTrias('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromTrias('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromTrias('<Trias xmlns="http://www.vdv.de/trias"><Trip><name>Một</name></Trip></Trias>'),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.trias', { type: '' }))).toBe('trias')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.trias.xml', { type: 'application/trias+xml' })),
    ).toBe('trias')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.tri', { type: '' }))).toThrow()
    expect(() => pagesFromTrias('<Trias xmlns="http://www.vdv.de/trias"></Trias>')).toThrow(/StopPoint/)
    expect(swapExtension('notes.trias', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.trias.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv453('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv453"')
    expect(toVdv453('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv453('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv453(toVdv453('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv453', toVdv453('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv453('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv453(
        '<VDV453 xmlns="http://www.vdv.de/vdv453"><Trip><name>Một</name></Trip></VDV453>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv453', { type: '' }))).toBe('vdv453')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv453.xml', { type: 'application/vdv453+xml' })),
    ).toBe('vdv453')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv453('<VDV453 xmlns="http://www.vdv.de/vdv453"></VDV453>')).toThrow(
      /IstFahrt/,
    )
    expect(swapExtension('notes.vdv453', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv453.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv454('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv454"')
    expect(toVdv454('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv454('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv454(toVdv454('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv454', toVdv454('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv454('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv454(
        '<VDV454 xmlns="http://www.vdv.de/vdv454"><Trip><name>Một</name></Trip></VDV454>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv454', { type: '' }))).toBe('vdv454')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv454.xml', { type: 'application/vdv454+xml' })),
    ).toBe('vdv454')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv454('<VDV454 xmlns="http://www.vdv.de/vdv454"></VDV454>')).toThrow(
      /Linienfahrplan/,
    )
    expect(swapExtension('notes.vdv454', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv454.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv452('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv452"')
    expect(toVdv452('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv452('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv452(toVdv452('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv452', toVdv452('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv452('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv452(
        '<VDV452 xmlns="http://www.vdv.de/vdv452"><Trip><name>Một</name></Trip></VDV452>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv452', { type: '' }))).toBe('vdv452')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv452.xml', { type: 'application/vdv452+xml' })),
    ).toBe('vdv452')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv452('<VDV452 xmlns="http://www.vdv.de/vdv452"></VDV452>')).toThrow(
      /Fahrplan/,
    )
    expect(swapExtension('notes.vdv452', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv452.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv462('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv462"')
    expect(toVdv462('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv462('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv462(toVdv462('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv462', toVdv462('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv462('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv462(
        '<VDV462 xmlns="http://www.vdv.de/vdv462"><Trip><name>Một</name></Trip></VDV462>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv462', { type: '' }))).toBe('vdv462')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv462.xml', { type: 'application/vdv462+xml' })),
    ).toBe('vdv462')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv462('<VDV462 xmlns="http://www.vdv.de/vdv462"></VDV462>')).toThrow(
      /Haltestelle/,
    )
    expect(swapExtension('notes.vdv462', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv462.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv455('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv455"')
    expect(toVdv455('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv455('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv455(toVdv455('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv455', toVdv455('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv455('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv455(
        '<VDV455 xmlns="http://www.vdv.de/vdv455"><Trip><name>Một</name></Trip></VDV455>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv455', { type: '' }))).toBe('vdv455')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv455.xml', { type: 'application/vdv455+xml' })),
    ).toBe('vdv455')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv455('<VDV455 xmlns="http://www.vdv.de/vdv455"></VDV455>')).toThrow(
      /Fahrt/,
    )
    expect(swapExtension('notes.vdv455', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv455.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv731('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv731"')
    expect(toVdv731('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv731('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv731(toVdv731('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv731', toVdv731('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv731('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv731(
        '<VDV731 xmlns="http://www.vdv.de/vdv731"><Trip><name>Một</name></Trip></VDV731>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv731', { type: '' }))).toBe('vdv731')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv731.xml', { type: 'application/vdv731+xml' })),
    ).toBe('vdv731')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv731('<VDV731 xmlns="http://www.vdv.de/vdv731"></VDV731>')).toThrow(
      /Anzeige/,
    )
    expect(swapExtension('notes.vdv731', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv731.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv301('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv301"')
    expect(toVdv301('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv301('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv301(toVdv301('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv301', toVdv301('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv301('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv301(
        '<VDV301 xmlns="http://www.vdv.de/vdv301"><Trip><name>Một</name></Trip></VDV301>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv301', { type: '' }))).toBe('vdv301')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv301.xml', { type: 'application/vdv301+xml' })),
    ).toBe('vdv301')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv301('<VDV301 xmlns="http://www.vdv.de/vdv301"></VDV301>')).toThrow(
      /Fahrzeug/,
    )
    expect(swapExtension('notes.vdv301', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv301.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv423('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv423"')
    expect(toVdv423('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv423('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv423(toVdv423('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv423', toVdv423('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv423('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv423(
        '<VDV423 xmlns="http://www.vdv.de/vdv423"><Trip><name>Một</name></Trip></VDV423>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv423', { type: '' }))).toBe('vdv423')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv423.xml', { type: 'application/vdv423+xml' })),
    ).toBe('vdv423')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv423('<VDV423 xmlns="http://www.vdv.de/vdv423"></VDV423>')).toThrow(
      /Ticket/,
    )
    expect(swapExtension('notes.vdv423', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv423.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv431('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv431"')
    expect(toVdv431('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv431('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv431(toVdv431('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv431', toVdv431('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv431('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv431(
        '<VDV431 xmlns="http://www.vdv.de/vdv431"><Trip><name>Một</name></Trip></VDV431>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv431', { type: '' }))).toBe('vdv431')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv431.xml', { type: 'application/vdv431+xml' })),
    ).toBe('vdv431')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv431('<VDV431 xmlns="http://www.vdv.de/vdv431"></VDV431>')).toThrow(
      /Berechtigung/,
    )
    expect(swapExtension('notes.vdv431', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv431.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv300('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv300"')
    expect(toVdv300('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv300('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv300(toVdv300('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv300', toVdv300('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv300('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv300(
        '<VDV300 xmlns="http://www.vdv.de/vdv300"><Trip><name>Một</name></Trip></VDV300>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv300', { type: '' }))).toBe('vdv300')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv300.xml', { type: 'application/vdv300+xml' })),
    ).toBe('vdv300')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv300('<VDV300 xmlns="http://www.vdv.de/vdv300"></VDV300>')).toThrow(
      /Objekt/,
    )
    expect(swapExtension('notes.vdv300', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv300.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv451('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv451"')
    expect(toVdv451('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv451('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv451(toVdv451('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv451', toVdv451('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv451('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv451(
        '<VDV451 xmlns="http://www.vdv.de/vdv451"><Trip><name>Một</name></Trip></VDV451>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv451', { type: '' }))).toBe('vdv451')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv451.xml', { type: 'application/vdv451+xml' })),
    ).toBe('vdv451')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv451('<VDV451 xmlns="http://www.vdv.de/vdv451"></VDV451>')).toThrow(
      /Nachricht/,
    )
    expect(swapExtension('notes.vdv451', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv451.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv432('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv432"')
    expect(toVdv432('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv432('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv432(toVdv432('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv432', toVdv432('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv432('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv432(
        '<VDV432 xmlns="http://www.vdv.de/vdv432"><Trip><name>Một</name></Trip></VDV432>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv432', { type: '' }))).toBe('vdv432')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv432.xml', { type: 'application/vdv432+xml' })),
    ).toBe('vdv432')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv432('<VDV432 xmlns="http://www.vdv.de/vdv432"></VDV432>')).toThrow(
      /SAM/,
    )
    expect(swapExtension('notes.vdv432', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv432.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv433('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv433"')
    expect(toVdv433('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv433('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv433(toVdv433('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv433', toVdv433('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv433('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv433(
        '<VDV433 xmlns="http://www.vdv.de/vdv433"><Trip><name>Một</name></Trip></VDV433>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv433', { type: '' }))).toBe('vdv433')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv433.xml', { type: 'application/vdv433+xml' })),
    ).toBe('vdv433')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv433('<VDV433 xmlns="http://www.vdv.de/vdv433"></VDV433>')).toThrow(
      /Kontrolle/,
    )
    expect(swapExtension('notes.vdv433', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv433.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv434('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv434"')
    expect(toVdv434('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv434('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv434(toVdv434('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv434', toVdv434('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv434('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv434(
        '<VDV434 xmlns="http://www.vdv.de/vdv434"><Trip><name>Một</name></Trip></VDV434>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv434', { type: '' }))).toBe('vdv434')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv434.xml', { type: 'application/vdv434+xml' })),
    ).toBe('vdv434')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv434('<VDV434 xmlns="http://www.vdv.de/vdv434"></VDV434>')).toThrow(
      /Sperre/,
    )
    expect(swapExtension('notes.vdv434', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv434.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv435('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv435"')
    expect(toVdv435('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv435('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv435(toVdv435('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv435', toVdv435('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv435('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv435(
        '<VDV435 xmlns="http://www.vdv.de/vdv435"><Trip><name>Một</name></Trip></VDV435>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv435', { type: '' }))).toBe('vdv435')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv435.xml', { type: 'application/vdv435+xml' })),
    ).toBe('vdv435')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv435('<VDV435 xmlns="http://www.vdv.de/vdv435"></VDV435>')).toThrow(
      /Broker/,
    )
    expect(swapExtension('notes.vdv435', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv435.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv436('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv436"')
    expect(toVdv436('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv436('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv436(toVdv436('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv436', toVdv436('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv436('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv436(
        '<VDV436 xmlns="http://www.vdv.de/vdv436"><Trip><name>Một</name></Trip></VDV436>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv436', { type: '' }))).toBe('vdv436')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv436.xml', { type: 'application/vdv436+xml' })),
    ).toBe('vdv436')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv436('<VDV436 xmlns="http://www.vdv.de/vdv436"></VDV436>')).toThrow(
      /Plattform/,
    )
    expect(swapExtension('notes.vdv436', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv436.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv456('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv456"')
    expect(toVdv456('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv456('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv456(toVdv456('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv456', toVdv456('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv456('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv456(
        '<VDV456 xmlns="http://www.vdv.de/vdv456"><Trip><name>Một</name></Trip></VDV456>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv456', { type: '' }))).toBe('vdv456')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv456.xml', { type: 'application/vdv456+xml' })),
    ).toBe('vdv456')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv456('<VDV456 xmlns="http://www.vdv.de/vdv456"></VDV456>')).toThrow(
      /Infrastruktur/,
    )
    expect(swapExtension('notes.vdv456', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv456.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv457('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv457"')
    expect(toVdv457('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv457('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv457(toVdv457('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv457', toVdv457('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv457('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv457(
        '<VDV457 xmlns="http://www.vdv.de/vdv457"><Trip><name>Một</name></Trip></VDV457>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv457', { type: '' }))).toBe('vdv457')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv457.xml', { type: 'application/vdv457+xml' })),
    ).toBe('vdv457')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv457('<VDV457 xmlns="http://www.vdv.de/vdv457"></VDV457>')).toThrow(
      /Zaehlung/,
    )
    expect(swapExtension('notes.vdv457', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv457.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv459('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv459"')
    expect(toVdv459('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv459('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv459(toVdv459('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv459', toVdv459('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv459('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv459(
        '<VDV459 xmlns="http://www.vdv.de/vdv459"><Trip><name>Một</name></Trip></VDV459>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv459', { type: '' }))).toBe('vdv459')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv459.xml', { type: 'application/vdv459+xml' })),
    ).toBe('vdv459')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv459('<VDV459 xmlns="http://www.vdv.de/vdv459"></VDV459>')).toThrow(
      /Auftrag/,
    )
    expect(swapExtension('notes.vdv459', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv459.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv461('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv461"')
    expect(toVdv461('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv461('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv461(toVdv461('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv461', toVdv461('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv461('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv461(
        '<VDV461 xmlns="http://www.vdv.de/vdv461"><Trip><name>Một</name></Trip></VDV461>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv461', { type: '' }))).toBe('vdv461')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv461.xml', { type: 'application/vdv461+xml' })),
    ).toBe('vdv461')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv461('<VDV461 xmlns="http://www.vdv.de/vdv461"></VDV461>')).toThrow(
      /Betriebshof/,
    )
    expect(swapExtension('notes.vdv461', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv461.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv458('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv458"')
    expect(toVdv458('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv458('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv458(toVdv458('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv458', toVdv458('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv458('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv458(
        '<VDV458 xmlns="http://www.vdv.de/vdv458"><Trip><name>Một</name></Trip></VDV458>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv458', { type: '' }))).toBe('vdv458')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv458.xml', { type: 'application/vdv458+xml' })),
    ).toBe('vdv458')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv458('<VDV458 xmlns="http://www.vdv.de/vdv458"></VDV458>')).toThrow(
      /Fahrplanlage/,
    )
    expect(swapExtension('notes.vdv458', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv458.xml', 'pdf')).toBe('notes.pdf')

    expect(toVdv460('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.vdv.de/vdv460"')
    expect(toVdv460('Demo', ['Một'])).toContain('<name>Demo</name>')
    expect(toVdv460('Demo', ['Một'])).toContain('<description>Một</description>')
    expect(pagesFromVdv460(toVdv460('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vdv460', toVdv460('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVdv460('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromVdv460(
        '<VDV460 xmlns="http://www.vdv.de/vdv460"><Trip><name>Một</name></Trip></VDV460>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vdv460', { type: '' }))).toBe('vdv460')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.vdv460.xml', { type: 'application/vdv460+xml' })),
    ).toBe('vdv460')
    expect(() => sourceKindFromFile(new File(['x'], 'notes.vdv', { type: '' }))).toThrow()
    expect(() => pagesFromVdv460('<VDV460 xmlns="http://www.vdv.de/vdv460"></VDV460>')).toThrow(
      /Anschluss/,
    )
    expect(swapExtension('notes.vdv460', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vdv460.xml', 'pdf')).toBe('notes.pdf')

    expect(toXliff('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="urn:oasis:names:tc:xliff:document:1.2"')
    expect(toXliff('Demo', ['Một'])).toContain('original="Demo"')
    expect(toXliff('Demo', ['Một'])).toContain('<source>Một</source>')
    expect(pagesFromXliff(toXliff('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('xliff', toXliff('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromXliff('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(
      pagesFromXliff(
        '<xliff xmlns="urn:oasis:names:tc:xliff:document:1.2"><file original="Một"></file></xliff>',
      ),
    ).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.xliff', { type: '' }))).toBe('xliff')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.xliff.xml', { type: 'application/xliff+xml' })),
    ).toBe('xliff')
    expect(sourceKindFromFile(new File(['x'], 'notes.xlf', { type: '' }))).toBe('xliff')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromXliff('<xliff xmlns="urn:oasis:names:tc:xliff:document:1.2"></xliff>')).toThrow(
      /trans-unit/,
    )
    expect(swapExtension('notes.xliff', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.xliff.xml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.xlf', 'pdf')).toBe('notes.pdf')

    expect(toTmx('Demo', ['Một', 'Hai\ndòng'])).toContain('<tmx version="1.4">')
    expect(toTmx('Demo', ['Một'])).toContain('<prop type="title">Demo</prop>')
    expect(toTmx('Demo', ['Một'])).toContain('<seg>Một</seg>')
    expect(pagesFromTmx(toTmx('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('tmx', toTmx('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromTmx('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromTmx('<tmx version="1.4"><body><seg>Một</seg></body></tmx>')).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.tmx', { type: '' }))).toBe('tmx')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.tmx.xml', { type: 'application/tmx+xml' })),
    ).toBe('tmx')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromTmx('<tmx version="1.4"></tmx>')).toThrow(/tu/)
    expect(swapExtension('notes.tmx', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.tmx.xml', 'pdf')).toBe('notes.pdf')

    expect(toTbx('Demo', ['Một', 'Hai\ndòng'])).toContain('<tbx type="TBX-Basic"')
    expect(toTbx('Demo', ['Một'])).toContain('<sourceDesc>Demo</sourceDesc>')
    expect(toTbx('Demo', ['Một'])).toContain('<term>Một</term>')
    expect(pagesFromTbx(toTbx('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('tbx', toTbx('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromTbx('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromTbx('<tbx type="TBX-Basic"><term>Một</term></tbx>')).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.tbx', { type: '' }))).toBe('tbx')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.tbx.xml', { type: 'application/tbx+xml' })),
    ).toBe('tbx')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromTbx('<tbx type="TBX-Basic"></tbx>')).toThrow(/termEntry/)
    expect(swapExtension('notes.tbx', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.tbx.xml', 'pdf')).toBe('notes.pdf')

    expect(toPo('Demo', ['Một', 'Hai\ndòng'])).toContain('Project-Id-Version: Demo')
    expect(toPo('Demo', ['Một'])).toContain('msgid "Một"')
    expect(toPo('Demo', ['Một'])).toContain('msgstr "Một"')
    expect(pagesFromPo(toPo('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('po', toPo('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromPo('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromPo('msgstr "Một"\n')).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.po', { type: '' }))).toBe('po')
    expect(sourceKindFromFile(new File(['x'], 'notes.pot', { type: 'text/x-po' }))).toBe('po')
    expect(sourceKindFromFile(new File(['x'], 'notes.txt', { type: '' }))).toBe('txt')
    expect(() => pagesFromPo('msgid ""\nmsgstr ""\n')).toThrow(/msgid/)
    expect(swapExtension('notes.po', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.pot', 'pdf')).toBe('notes.pdf')

    expect(toDita('Demo', ['Một', 'Hai\ndòng'])).toContain('<dita>')
    expect(toDita('Demo', ['Một'])).toContain('<title>Demo</title>')
    expect(toDita('Demo', ['Một'])).toContain('<p>Một</p>')
    expect(pagesFromDita(toDita('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('dita', toDita('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromDita('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromDita('<dita><p>Một</p></dita>')).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.dita', { type: '' }))).toBe('dita')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.dita.xml', { type: 'application/dita+xml' })),
    ).toBe('dita')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromDita('<dita></dita>')).toThrow(/topic/)
    expect(swapExtension('notes.dita', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.dita.xml', 'pdf')).toBe('notes.pdf')

    expect(toVcard('Demo', ['Một', 'Hai\ndòng'])).toContain('BEGIN:VCARD')
    expect(toVcard('Demo', ['Một'])).toContain('PRODID:-//Smart-Read//Demo//EN')
    expect(toVcard('Demo', ['Một'])).toContain('NOTE:Một')
    expect(pagesFromVcard(toVcard('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vcard', toVcard('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVcard('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromVcard('NOTE:Một\n')).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vcf', { type: '' }))).toBe('vcard')
    expect(sourceKindFromFile(new File(['x'], 'notes.vcard', { type: 'text/vcard' }))).toBe('vcard')
    expect(sourceKindFromFile(new File(['x'], 'notes.txt', { type: '' }))).toBe('txt')
    expect(() => pagesFromVcard('BEGIN:VCARD\nVERSION:3.0\nEND:VCARD\n')).toThrow(/NOTE/)
    expect(swapExtension('notes.vcf', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.vcard', 'pdf')).toBe('notes.pdf')

    expect(toRdf('Demo', ['Một', 'Hai\ndòng'])).toContain('<rdf:RDF')
    expect(toRdf('Demo', ['Một'])).toContain('<dc:title>Demo</dc:title>')
    expect(toRdf('Demo', ['Một'])).toContain('<dc:description>Một</dc:description>')
    expect(pagesFromRdf(toRdf('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('rdf', toRdf('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromRdf('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromRdf('<rdf:RDF><dc:description>Một</dc:description></rdf:RDF>')).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.rdf', { type: '' }))).toBe('rdf')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.rdf.xml', { type: 'application/rdf+xml' })),
    ).toBe('rdf')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(() => pagesFromRdf('<rdf:RDF></rdf:RDF>')).toThrow(/Description/)
    expect(swapExtension('notes.rdf', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.rdf.xml', 'pdf')).toBe('notes.pdf')

    expect(toOpds('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns:opds=')
    expect(toOpds('Demo', ['Một'])).toContain('<title>Demo</title>')
    expect(toOpds('Demo', ['Một'])).toContain('<content type="text">Một</content>')
    expect(pagesFromOpds(toOpds('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('opds', toOpds('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromOpds('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromOpds('<feed xmlns="http://www.w3.org/2005/Atom"><content>Một</content></feed>')).toEqual(
      ['Một'],
    )
    expect(sourceKindFromFile(new File(['x'], 'notes.opds', { type: '' }))).toBe('opds')
    expect(
      sourceKindFromFile(new File(['x'], 'notes.opds.xml', { type: 'application/opds+xml' })),
    ).toBe('opds')
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: '' }))).toBe('xml')
    expect(sourceKindFromFile(new File(['x'], 'notes.atom', { type: '' }))).toBe('atom')
    expect(() => pagesFromOpds('<feed xmlns="http://www.w3.org/2005/Atom"></feed>')).toThrow(/entry/)
    expect(swapExtension('notes.opds', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.opds.xml', 'pdf')).toBe('notes.pdf')

    expect(toVtodo('Demo', ['Một', 'Hai\ndòng'])).toContain('BEGIN:VTODO')
    expect(toVtodo('Demo', ['Một'])).toContain('X-WR-CALNAME:Demo')
    expect(toVtodo('Demo', ['Một'])).toContain('DESCRIPTION:Một')
    expect(pagesFromVtodo(toVtodo('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vtodo', toVtodo('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVtodo('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromVtodo('DESCRIPTION:Một\n')).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vtodo', { type: '' }))).toBe('vtodo')
    expect(sourceKindFromFile(new File(['x'], 'notes.todo', { type: 'text/x-vtodo' }))).toBe('vtodo')
    expect(sourceKindFromFile(new File(['x'], 'notes.ics', { type: '' }))).toBe('ics')
    expect(sourceKindFromFile(new File(['x'], 'notes.txt', { type: '' }))).toBe('txt')
    expect(() => pagesFromVtodo('BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR\n')).toThrow(/VTODO/)
    expect(swapExtension('notes.vtodo', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.todo', 'pdf')).toBe('notes.pdf')

    expect(toVjournal('Demo', ['Một', 'Hai\ndòng'])).toContain('BEGIN:VJOURNAL')
    expect(toVjournal('Demo', ['Một'])).toContain('X-WR-CALNAME:Demo')
    expect(toVjournal('Demo', ['Một'])).toContain('DESCRIPTION:Một')
    expect(pagesFromVjournal(toVjournal('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vjournal', toVjournal('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVjournal('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromVjournal('DESCRIPTION:Một\n')).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vjournal', { type: '' }))).toBe('vjournal')
    expect(sourceKindFromFile(new File(['x'], 'notes.journal', { type: 'text/x-vjournal' }))).toBe(
      'vjournal',
    )
    expect(sourceKindFromFile(new File(['x'], 'notes.ics', { type: '' }))).toBe('ics')
    expect(sourceKindFromFile(new File(['x'], 'notes.vtodo', { type: '' }))).toBe('vtodo')
    expect(sourceKindFromFile(new File(['x'], 'notes.txt', { type: '' }))).toBe('txt')
    expect(() => pagesFromVjournal('BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR\n')).toThrow(
      /VJOURNAL/,
    )
    expect(swapExtension('notes.vjournal', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.journal', 'pdf')).toBe('notes.pdf')

    expect(toVfreebusy('Demo', ['Một', 'Hai\ndòng'])).toContain('BEGIN:VFREEBUSY')
    expect(toVfreebusy('Demo', ['Một'])).toContain('X-WR-CALNAME:Demo')
    expect(toVfreebusy('Demo', ['Một'])).toContain('COMMENT:Một')
    expect(toVfreebusy('Demo', ['Một'])).toContain('FREEBUSY:')
    expect(pagesFromVfreebusy(toVfreebusy('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vfreebusy', toVfreebusy('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVfreebusy('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromVfreebusy('COMMENT:Một\n')).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vfreebusy', { type: '' }))).toBe('vfreebusy')
    expect(sourceKindFromFile(new File(['x'], 'notes.freebusy', { type: 'text/x-vfreebusy' }))).toBe(
      'vfreebusy',
    )
    expect(sourceKindFromFile(new File(['x'], 'notes.ics', { type: '' }))).toBe('ics')
    expect(sourceKindFromFile(new File(['x'], 'notes.vjournal', { type: '' }))).toBe('vjournal')
    expect(sourceKindFromFile(new File(['x'], 'notes.txt', { type: '' }))).toBe('txt')
    expect(() => pagesFromVfreebusy('BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR\n')).toThrow(
      /VFREEBUSY/,
    )
    expect(swapExtension('notes.vfreebusy', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.freebusy', 'pdf')).toBe('notes.pdf')

    expect(toVavailability('Demo', ['Một', 'Hai\ndòng'])).toContain('BEGIN:VAVAILABILITY')
    expect(toVavailability('Demo', ['Một'])).toContain('X-WR-CALNAME:Demo')
    expect(toVavailability('Demo', ['Một'])).toContain('COMMENT:Một')
    expect(toVavailability('Demo', ['Một'])).toContain('BEGIN:AVAILABLE')
    expect(pagesFromVavailability(toVavailability('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('vavailability', toVavailability('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromVavailability('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(pagesFromVavailability('COMMENT:Một\n')).toEqual(['Một'])
    expect(sourceKindFromFile(new File(['x'], 'notes.vavailability', { type: '' }))).toBe(
      'vavailability',
    )
    expect(
      sourceKindFromFile(new File(['x'], 'notes.availability', { type: 'text/x-vavailability' })),
    ).toBe('vavailability')
    expect(sourceKindFromFile(new File(['x'], 'notes.ics', { type: '' }))).toBe('ics')
    expect(sourceKindFromFile(new File(['x'], 'notes.vfreebusy', { type: '' }))).toBe('vfreebusy')
    expect(sourceKindFromFile(new File(['x'], 'notes.txt', { type: '' }))).toBe('txt')
    expect(() => pagesFromVavailability('BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR\n')).toThrow(
      /VAVAILABILITY/,
    )
    expect(swapExtension('notes.vavailability', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.availability', 'pdf')).toBe('notes.pdf')

    expect(formatTtmlTime(4)).toBe('00:00:04.000')
    expect(toTtml('Demo', ['Một', 'Hai\ndòng'])).toContain('xmlns="http://www.w3.org/ns/ttml"')
    expect(toTtml('Demo', ['Một'])).toContain('<title>Demo</title>')
    expect(pagesFromTtml(toTtml('Demo', ['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('ttml', toTtml('Demo', ['Hi']))).toEqual(['Hi'])
    expect(pagesFromTtml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.ttml', { type: '' }))).toBe('ttml')
    expect(sourceKindFromFile(new File(['x'], 'notes.dfxp', { type: 'application/ttml+xml' }))).toBe(
      'ttml',
    )
    expect(swapExtension('notes.ttml', 'pdf')).toBe('notes.pdf')
    expect(formatSbvTime(4)).toBe('0:00:04.000')
    expect(toSbv(['Một', 'Hai\ndòng'])).toContain('0:00:00.000,0:00:04.000')
    expect(pagesFromSbv(toSbv(['Một', 'Hai\ndòng']))).toEqual(['Một', 'Hai\ndòng'])
    expect(pagesFromImportedText('sbv', toSbv(['Hi']))).toEqual(['Hi'])
    expect(pagesFromSbv('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'notes.sbv', { type: '' }))).toBe('sbv')
    expect(sourceKindFromFile(new File(['x'], 'notes.sbv', { type: 'text/x-sbv' }))).toBe('sbv')
    expect(swapExtension('notes.sbv', 'pdf')).toBe('notes.pdf')
    expect(sourceKindFromFile(new File(['x'], 'comic.cbz', { type: '' }))).toBe('cbz')
    expect(sourceKindFromFile(new File(['x'], 'comic.cbz', { type: 'application/vnd.comicbook+zip' }))).toBe(
      'cbz',
    )
    expect(swapExtension('comic.cbz', 'pdf')).toBe('comic.pdf')
    expect(sourceKindFromFile(new File(['x'], 'notes.yaml', { type: '' }))).toBe('yaml')
    expect(sourceKindFromFile(new File(['x'], 'notes.yml', { type: 'application/yaml' }))).toBe(
      'yaml',
    )
    expect(sourceKindFromFile(new File(['x'], 'notes.xml', { type: 'application/xml' }))).toBe('xml')
    expect(swapExtension('notes.yaml', 'pdf')).toBe('notes.pdf')
    expect(swapExtension('notes.xml', 'pdf')).toBe('notes.pdf')
    expect(pagesFromJson('["A","B"]')).toEqual(['A', 'B'])
    expect(() => pagesFromJson('{')).toThrow(/JSON không hợp lệ/)
    expect(parseCsv('page,text\n1,"a,b"')).toEqual([
      ['page', 'text'],
      ['1', 'a,b'],
    ])
    expect(pagesFromCsv(toCsv(['Một', 'Hai,ba']))).toEqual(['Một', 'Hai,ba'])
    expect(pagesFromImportedText('json', '{"pages":[{"page":1,"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['{}'], 'notes.json', { type: 'application/json' }))).toBe(
      'json',
    )
    expect(pagesFromYaml('{"pages":[{"text":"Hi"}]}')).toEqual(['Hi'])
    expect(sourceKindFromFile(new File(['x'], 'book.epub', { type: '' }))).toBe('epub')
    expect(sourceKindFromFile(new File(['x'], 'paper.docx', { type: '' }))).toBe('docx')
    expect(swapExtension('paper.docx', 'pdf')).toBe('paper.pdf')
    expect(foldSearch('Xin chào')).toBe(foldSearch('xin chao'))
    expect(findPagesWithText(['Xin chào', 'Trang hai'], 'chao')).toEqual([0])
    expect(findPagesWithText(['A', 'B'], '   ')).toEqual([])
    expect(blankPageIndexes(['Hello', '  ', ''])).toEqual([1, 2])
    expect(repeatedPageIndexes(['Hello', 'hello', 'Hai'])).toEqual([1])
    expect(repeatedPageIndexes(['A', 'B', 'C'])).toEqual([])
    expect(repeatedPageIndexes(['  ', '', 'x'])).toEqual([1])
    expect(toFb2('Demo', ['Một', 'Hai'])).toContain('<FictionBook')
    expect(toFb2('Demo', ['Một'])).toContain('<book-title>Demo</book-title>')
    expect(pagesFromFb2(toFb2('Demo', ['Một', 'Hai']))).toEqual(['Một', 'Hai'])
    expect(() => pagesFromFb2('<xml/>')).toThrow(/FB2/)
    expect(rtfToPlain(toRtf('Demo', ['Xin chào', 'Hai']))).toMatch(/Xin chào/)
    expect(pagesFromRtf(toRtf('Demo', ['Một', 'Hai']))).toEqual(['Một', 'Hai'])
    expect(pagesFromImportedText('rtf', toRtf('Demo', ['Chỉ một đoạn.']))).toEqual(['Chỉ một đoạn.'])
    expect(sourceKindFromFile(new File(['{\\rtf1}'], 'note.rtf', { type: 'application/rtf' }))).toBe(
      'rtf',
    )
    expect(sourceKindFromFile(new File(['<FictionBook/>'], 'book.fb2', { type: '' }))).toBe('fb2')
    expect(sourceKindFromFile(new File(['x'], 'paper.odt', { type: '' }))).toBe('odt')
    expect(sourceKindFromFile(new File(['x'], 'table.ods', { type: '' }))).toBe('ods')
    expect(sourceKindFromFile(new File(['x'], 'table.xlsx', { type: '' }))).toBe('xlsx')
    expect(sourceKindFromFile(new File(['x'], 'deck.pptx', { type: '' }))).toBe('pptx')
    expect(sourceKindFromFile(new File(['x'], 'deck.odp', { type: '' }))).toBe('odp')
    expect(sourceKindFromFile(new File(['x'], 'scan.webp', { type: 'image/webp' }))).toBe('webp')
    expect(swapExtension('paper.odt', 'pdf')).toBe('paper.pdf')
    expect(swapExtension('table.ods', 'pdf')).toBe('table.pdf')
    expect(swapExtension('table.xlsx', 'pdf')).toBe('table.pdf')
    expect(swapExtension('deck.pptx', 'pdf')).toBe('deck.pdf')
    expect(swapExtension('deck.odp', 'pdf')).toBe('deck.pdf')
    expect(swapExtension('scan.webp', 'pdf')).toBe('scan.pdf')
    expect(() => sourceKindFromFile(new File(['x'], 'old.xls', { type: '' }))).toThrow(/XLSX/)
    expect(() => sourceKindFromFile(new File(['x'], 'old.ppt', { type: '' }))).toThrow(/PPTX/)
  })

  it('round-trips XLSX workbooks', async () => {
    const xlsx = await toXlsx('Demo', ['Một', 'Hai,ba'])
    expect(xlsx.type).toContain('spreadsheetml')
    const zip = await JSZip.loadAsync(await xlsx.arrayBuffer())
    expect(zip.file('xl/worksheets/sheet1.xml')).toBeTruthy()
    expect(await pagesFromXlsx(new Uint8Array(await xlsx.arrayBuffer()))).toEqual(['Một', 'Hai,ba'])
  })

  it('packs and unpacks CBZ comic archives', async () => {
    const png = tinyPng()
    const blob = await toCbz([
      { bytes: png },
      { name: 'cover.png', bytes: png },
    ])
    expect(blob.type).toContain('comicbook')
    const images = await imagesFromCbz(new Uint8Array(await blob.arrayBuffer()))
    expect(images.map((image) => image.name)).toEqual(['001.jpg', 'cover.png'])
    expect(images[1]?.kind).toBe('png')
    await expect(toCbz([])).rejects.toThrow(/CBZ/)
    await expect(imagesFromCbz(new Uint8Array([1, 2, 3]))).rejects.toThrow(/CBZ/)
  })

  it('round-trips PPTX decks', async () => {
    const pptx = await toPptx('Demo', ['Một', 'Hai\ndòng'])
    expect(pptx.type).toContain('presentationml')
    const zip = await JSZip.loadAsync(await pptx.arrayBuffer())
    expect(zip.file('ppt/presentation.xml')).toBeTruthy()
    expect(zip.file('ppt/slides/slide1.xml')).toBeTruthy()
    expect(zip.file('ppt/slides/slide2.xml')).toBeTruthy()
    expect(await pagesFromPptx(new Uint8Array(await pptx.arrayBuffer()))).toEqual(['Một', 'Hai\ndòng'])
  })

  it('round-trips ODS workbooks', async () => {
    const ods = await toOds('Demo', ['Một', 'Hai\ndòng'])
    expect(ods.type).toContain('opendocument.spreadsheet')
    const zip = await JSZip.loadAsync(await ods.arrayBuffer())
    expect(zip.file('mimetype')).toBeTruthy()
    expect(zip.file('content.xml')).toBeTruthy()
    expect(await pagesFromOds(new Uint8Array(await ods.arrayBuffer()))).toEqual(['Một', 'Hai\ndòng'])
  })

  it('round-trips ODP decks', async () => {
    const odp = await toOdp('Demo', ['Một', 'Hai\ndòng'])
    expect(odp.type).toContain('opendocument.presentation')
    const zip = await JSZip.loadAsync(await odp.arrayBuffer())
    expect(zip.file('content.xml')).toBeTruthy()
    expect(await pagesFromOdp(new Uint8Array(await odp.arrayBuffer()))).toEqual(['Một', 'Hai\ndòng'])
  })

  it('round-trips ODT packages', async () => {
    const odt = await toOdt('Demo', ['Một', 'Hai'])
    expect(odt.type).toContain('opendocument')
    const zip = await JSZip.loadAsync(await odt.arrayBuffer())
    expect(zip.file('mimetype')).toBeTruthy()
    expect(zip.file('content.xml')).toBeTruthy()
    expect(await pagesFromOdt(new Uint8Array(await odt.arrayBuffer()))).toEqual(['Một', 'Hai'])
  })

  it('rebuilds pages from a DOCX zip and from an EPUB package', async () => {
    const docxZip = new JSZip()
    docxZip.file(
      'word/document.xml',
      `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Trang 1</w:t></w:r></w:p><w:p><w:r><w:t>Một</w:t></w:r></w:p><w:p><w:r><w:t>Trang 2</w:t></w:r></w:p><w:p><w:r><w:t>Hai</w:t></w:r></w:p></w:body></w:document>`,
    )
    const docxBytes = new Uint8Array(await docxZip.generateAsync({ type: 'uint8array' }))
    expect(await pagesFromDocx(docxBytes)).toEqual(['Một', 'Hai'])
    const epub = await toEpub('Demo', ['Một', 'Hai'], {
      identifier: 'urn:uuid:import-book',
      modified: '2026-10-20T00:00:00Z',
    })
    expect(await pagesFromEpub(new Uint8Array(await epub.arrayBuffer()))).toEqual(['Một', 'Hai'])
  })

  it('builds an EPUB 3 package with nav, ncx, and per-page documents', async () => {
    const blob = await toEpub('Demo', ['Một', 'Hai'], {
      identifier: 'urn:uuid:test-book',
      modified: '2026-10-19T00:00:00Z',
      creator: 'Smart-Read',
    })
    const zip = await JSZip.loadAsync(await blob.arrayBuffer())
    expect(zip.file('mimetype')).toBeTruthy()
    expect(zip.file('OEBPS/nav.xhtml')).toBeTruthy()
    expect(zip.file('OEBPS/toc.ncx')).toBeTruthy()
    expect(zip.file('OEBPS/page-0001.xhtml')).toBeTruthy()
    expect(zip.file('OEBPS/page-0002.xhtml')).toBeTruthy()
    const opf = await zip.file('OEBPS/content.opf')!.async('string')
    expect(opf).toContain('properties="nav"')
    expect(opf).toContain('dcterms:modified')
    expect(opf).toContain('urn:uuid:test-book')
    const nav = await zip.file('OEBPS/nav.xhtml')!.async('string')
    expect(nav).toContain('epub:type="toc"')
    expect(nav).toContain('page-0002.xhtml')
  })
})

describe('page selection', () => {
  it('builds ranges, toggles, and maps the next page after a delete', () => {
    expect(pageRange(3, 1)).toEqual([1, 2, 3])
    expect(togglePage([0, 2], 2)).toEqual([0])
    expect(togglePage([0], 2)).toEqual([0, 2])
    expect(nextPageAfterDelete(2, [1, 2], 2)).toBe(1)
    expect(nextPageAfterDelete(0, [0], 2)).toBe(0)
    expect(clampPageRange(0, 99, 4)).toEqual({ fromPage: 1, toPage: 4 })
    expect(movingIndexesForDrag([0, 2, 3], 2)).toEqual([0, 2, 3])
    expect(movingIndexesForDrag([0, 2], 1)).toEqual([1])
    expect(blockNudgeDropTo([1, 2], -1, 4)).toBe(0)
    expect(blockNudgeDropTo([1, 2], 1, 4)).toBe(3)
    expect(blockNudgeDropTo([0, 1], -1, 4)).toBeNull()
    expect(oddPageIndexes(4)).toEqual([0, 2])
    expect(evenPageIndexes(4)).toEqual([1, 3])
    expect(evenPageIndexes(1)).toEqual([])
    expect(invertPageIndexes(4, [0, 2])).toEqual([1, 3])
    expect(invertPageIndexes(3, [0, 1, 2])).toEqual([])
    expect(invertPageIndexes(1, [0])).toEqual([])
    expect(blockEdgeDropTo([2, 3], 'start', 4)).toBe(0)
    expect(blockEdgeDropTo([0, 1], 'start', 4)).toBeNull()
    expect(blockEdgeDropTo([0, 1], 'end', 4)).toBe(3)
    expect(blockEdgeDropTo([2, 3], 'end', 4)).toBeNull()
  })

  it('rejects empty, inverted, and out-of-range convert bounds', () => {
    expect(parsePageRange('', '', 4)).toEqual({
      ok: false,
      message: 'Nhập số trang bắt đầu và kết thúc.',
    })
    expect(parsePageRange('', '2', 4).ok).toBe(false)
    expect(parsePageRange('1', '', 4).ok).toBe(false)
    expect(parsePageRange('1.5', '2', 4)).toEqual({
      ok: false,
      message: 'Khoảng trang phải là số nguyên.',
    })
    const tooLow = parsePageRange('0', '2', 4)
    expect(tooLow.ok).toBe(false)
    if (!tooLow.ok) {
      expect(tooLow.message).toMatch(/từ 1/)
    }
    const tooHigh = parsePageRange('1', '9', 4)
    expect(tooHigh.ok).toBe(false)
    if (!tooHigh.ok) {
      expect(tooHigh.message).toMatch(/vượt quá 4/)
    }
    const inverted = parsePageRange('3', '1', 4)
    expect(inverted.ok).toBe(false)
    if (!inverted.ok) {
      expect(inverted.message).toMatch(/không được lớn hơn/)
    }
    expect(parsePageRange('2', '3', 4)).toEqual({ ok: true, fromPage: 2, toPage: 3 })
    expect(parseSplitSize('', 4)).toEqual({ ok: false, message: 'Nhập số trang mỗi tệp.' })
    expect(parseSplitSize('1.5', 4).ok).toBe(false)
    expect(parseSplitSize('0', 4).ok).toBe(false)
    expect(parseSplitSize('9', 4).ok).toBe(false)
    expect(parseSplitSize('2', 4)).toEqual({ ok: true, size: 2 })
    expect(parseGotoPage('', 4)).toEqual({ ok: false, message: 'Nhập số trang cần tới.' })
    expect(parseGotoPage('1.5', 4).ok).toBe(false)
    expect(parseGotoPage('0', 4).ok).toBe(false)
    expect(parseGotoPage('9', 4).ok).toBe(false)
    expect(parseGotoPage('3', 4)).toEqual({ ok: true, index: 2 })
    expect(parseGotoPage('ii', 4, ['i', 'ii', '1', '2'])).toEqual({ ok: true, index: 1 })
    expect(parseGotoPage('1', 4, ['i', 'ii', '1', '2'])).toEqual({ ok: true, index: 2 })
    expect(parseGotoPage('4', 4, ['i', 'ii', '1', '2'])).toEqual({ ok: true, index: 3 })
    expect(parseGotoPage('Trang 2', 2, ['Trang 1', 'Trang 2'])).toEqual({ ok: true, index: 1 })
    expect(parseGotoPage('iv', 4, ['i', 'ii', '1', '2']).ok).toBe(false)
    expect(
      parseGotoPage('ChapTwo', 2, undefined, [{ name: 'ChapTwo', pageIndex: 1 }]),
    ).toEqual({ ok: true, index: 1 })
    expect(
      parseGotoPage('chaptwo', 2, ['1', '2'], [{ name: 'ChapTwo', pageIndex: 1 }]),
    ).toEqual({ ok: true, index: 1 })
    expect(parseGotoPage('Missing', 2, undefined, [{ name: 'ChapTwo', pageIndex: 1 }]).ok).toBe(
      false,
    )
    expect(gotoSuggestions(['i', 'ii', '1'], [{ name: 'ChapTwo' }, { name: 'i' }])).toEqual([
      'i',
      'ii',
      '1',
      'ChapTwo',
    ])
    expect(gotoSuggestions(['Trang 1', 'Trang 2'])).toEqual(['Trang 1', 'Trang 2'])
    expect(gotoSuggestions(undefined, [{ name: 'ChapTwo' }])).toEqual(['ChapTwo'])
  })

  it('caps undo snapshots and pops the latest first', () => {
    const first = snapshotOf(new Uint8Array([1]), 0, [0], 0)
    const second = snapshotOf(new Uint8Array([2]), 1, [1], 1)
    const stacked = pushSnapshot(pushSnapshot([], first, 1), second, 1)
    expect(stacked).toHaveLength(1)
    expect(stacked[0]?.page).toBe(1)
    const popped = popSnapshot(stacked)
    expect(popped?.snapshot.page).toBe(1)
    expect(popped?.rest).toEqual([])
    expect(popSnapshot([])).toBeNull()
    expect(MAX_EDITOR_HISTORY).toBeGreaterThan(0)
    const encoded = encodeSnapshots(
      [snapshotOf(new Uint8Array([9, 8]), 2, [1, 2], 1), snapshotOf(new Uint8Array([7]), 0, [0], 0)],
      1,
    )
    expect(encoded).toHaveLength(1)
    const decoded = decodeSnapshots(encoded)
    expect(decoded[0]?.page).toBe(0)
    expect([...decoded[0]!.bytes]).toEqual([7])
    expect(decodeSnapshots(null)).toEqual([])
  })

  it('converts pixels to grayscale luminance', () => {
    expect(luma(255, 0, 0)).toBeGreaterThan(0)
    const pixels = new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255])
    grayscaleRgba(pixels)
    expect(pixels[0]).toBe(pixels[1])
    expect(pixels[1]).toBe(pixels[2])
    expect(pixels[3]).toBe(255)
    expect(pixels[4]).toBe(pixels[5])
    expect(pixels[5]).toBe(pixels[6])
  })

  it('scales sparse pages more strongly than letter-size pages', () => {
    const letter = previewScaleForPage(612, 792)
    const sparse = previewScaleForPage(200, 280)
    expect(letter).toBe(BASE_PREVIEW_SCALE)
    expect(sparse).toBeGreaterThan(letter)
    expect(sparse).toBe(MAX_PREVIEW_SCALE)
    expect(thumbnailScaleForPage(200, 280)).toBeGreaterThan(thumbnailScaleForPage(612, 792))
    expect(thumbnailContrastForPage(200, 280)).toBe(SPARSE_THUMB_CONTRAST)
    expect(thumbnailContrastForPage(612, 792)).toBe(BASE_THUMB_CONTRAST)
  })

  it('restores a clamped editor view when session storage is empty', () => {
    expect(restoreEditorView(3)).toEqual({ page: 0, selected: [0], anchor: 0 })
    expect(restoreEditorView(0)).toEqual({ page: 0, selected: [0], anchor: 0 })
    expect(editorExportSelection(3)).toBeNull()
    expect(formatPageList([0, 2])).toBe('1, 3')
    expect(extractedPdfName('demo.pdf', [0, 2])).toBe('demo-trang-1+3.pdf')
    expect(extractedPdfName('demo.pdf', [0, 1, 2])).toBe('demo-trang-1-3.pdf')
    expect(extractedPdfName('demo.pdf', [1])).toBe('demo-trang-2.pdf')
  })
})

describe('pdf-lib degrees helper', () => {
  it('keeps a 90-degree increment', () => {
    expect(degrees(90).angle).toBe(90)
  })
})

function tinyPng(): Uint8Array {
  return Uint8Array.from(
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    ),
  )
}

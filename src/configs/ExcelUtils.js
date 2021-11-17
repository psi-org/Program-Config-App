import { splitPosition, character2Number, number2Character, columnCharacters } from "./Utils";
import { thinBorder } from "./TemplateConstants";
export function printArray2Column(sheet, array, header, startPosition, headerBgColor) {
  let coordinates = splitPosition(startPosition);
  sheet.getColumn(coordinates[0]).width = 20;
  sheet.getCell(startPosition).value = header;
  sheet.getCell(startPosition).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: headerBgColor
    }
  };
  let pos;

  for (let i = 0; i < array.length; i++) {
    pos = coordinates[0] + (parseInt(coordinates[1]) + parseInt(i) + parseInt(1));
    sheet.getCell(pos).value = array[i];
  }

  applyBorderToRange(sheet, character2Number(coordinates[0]), coordinates[1], character2Number(coordinates[0]), parseInt(coordinates[1]) + parseInt(array.length));
}
export function printObjectArray(sheet, datas, position, headerBgColor) {
  let excelColumns = columnCharacters(splitPosition(position)[0], datas[0]);
  let headerRow = splitPosition(position)[1];
  let row = parseInt(headerRow) + parseInt(1);
  let keys = Object.keys(datas[0]);
  keys.forEach((key, index) => {
    let cell = sheet.getCell(excelColumns[index] + headerRow);
    cell.value = key;
    cell.font = {
      size: 12,
      bold: true
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: headerBgColor
      }
    };
    sheet.getColumn(excelColumns[index]).width = 20;
  });
  datas.forEach(data => {
    keys.forEach((key, index) => {
      let cell = sheet.getCell(excelColumns[index] + row);
      cell.value = data[key];
    });
    row = parseInt(row) + parseInt(1);
  });
  applyBorderToRange(sheet, character2Number(excelColumns.at(0)), headerRow, character2Number(excelColumns.at(-1)), parseInt(row) - 1);
}
export function applyBorderToRange(sheet, startCol, startRow, endCol, endRow) {
  for (let i = startRow; i <= endRow; i++) {
    for (let j = startCol; j <= endCol; j++) {
      const colChar = number2Character(j);
      const cellAxis = colChar + i.toString();
      sheet.getCell(cellAxis).border = thinBorder;
    }
  }
}
export function fillBackgroundToRange(sheet, range, backgroundColor) {
  let rangeParts = range.split(":");
  let start = splitPosition(rangeParts[0]);
  let end = splitPosition(rangeParts[1]);

  for (let i = start[1]; i <= end[1]; i++) {
    for (let j = character2Number(start[0]); j <= character2Number(end[0]); j++) {
      const colChar = number2Character(j);
      const cellAxis = colChar + i.toString();
      sheet.getCell(cellAxis).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: backgroundColor
        }
      };
    }
  }
}
export function dataValidation(sheet, range, validationRule) {
  let rangeParts = range.split(":");
  let start = splitPosition(rangeParts[0]);
  let end = splitPosition(rangeParts[1]);

  for (let i = start[1]; i <= end[1]; i++) {
    for (let j = character2Number(start[0]); j <= character2Number(end[0]); j++) {
      const colChar = number2Character(j);
      const cellAxis = colChar + i.toString();
      sheet.getCell(cellAxis).dataValidation = validationRule;
    }
  }
}
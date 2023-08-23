import { splitPosition, character2Number, number2Character, columnCharacters, DeepCopy } from "./Utils";
import { saveAs } from 'file-saver';
import { thinBorder } from "./TemplateConstants";
import { METADATA, SHORT_DATE_FORMAT_OPTIONS } from "./Constants";

export function printArray2Column(sheet, array, header, startPosition, headerBgColor) {
    let coordinates = splitPosition(startPosition);
    sheet.getColumn(coordinates[0]).width = 20;
    sheet.getCell(startPosition).value = header;
    sheet.getCell(startPosition).font = {
        size: 12,
        bold: true
    };
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
        cell.alignment = { wrapText: true };
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
export function applyBorderToRange(sheet, startCol, startRow, endCol, endRow, border = thinBorder) {
    for (let i = startRow; i <= endRow; i++) {
        for (let j = startCol; j <= endCol; j++) {
            const colChar = number2Character(j);
            const cellAxis = colChar + i.toString();
            sheet.getCell(cellAxis).border = DeepCopy( border );
        }
    }
}
export function fillBackgroundToRange(sheet, range, backgroundColor) {
    let rangeParts = range.split(":");
    let start = splitPosition(rangeParts[0]);
    let end = splitPosition(rangeParts[1]);
    for (let i = parseInt(start[1]); i <= parseInt(end[1]); i++) {
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

export function defineName(sheet, range, rangeName) {
    let rangeParts = range.split(":");
    let start = splitPosition(rangeParts[0]);
    let end = splitPosition(rangeParts[1]);
    for (let i = parseInt(start[1]); i <= parseInt(end[1]); i++) {
        for (let j = character2Number(start[0]); j <= character2Number(end[0]); j++) {
            const colChar = number2Character(j);
            const cellAxis = colChar + i.toString();
            sheet.getCell(cellAxis).name = rangeName;
        }
    }
}

export function applyStyleToRange(sheet, range, userStyle) {
    let rangeParts = range.split(":");
    let start = splitPosition(rangeParts[0]);
    let end = splitPosition(rangeParts[1]);
    for (let i = parseInt(start[1]); i <= parseInt(end[1]); i++) {
        for (let j = character2Number(start[0]); j <= character2Number(end[0]); j++) {
            const colChar = number2Character(j);
            const cellAxis = colChar + i.toString();
            sheet.getCell(cellAxis).style = userStyle;
        }
    }
}

export function dataValidation(sheet, range, validationRule) {
    if (range.indexOf(":") > 0) {
        validateRange(sheet, range, validationRule)
    }
    validateCell(sheet, range, validationRule);
}

function validateCell(sheet, cell, validationRule) {
    sheet.getCell(cell).dataValidation = validationRule;
}

function validateRange(sheet, range, validationRule) {
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

export const formatDate = (date) => {
    let formattedDate = date.toLocaleString("en-US", SHORT_DATE_FORMAT_OPTIONS).split(', ');

    /*let d = date.split('.')[0].split('T')
    */
    let dateYMD = formattedDate[0].replaceAll('/', '-');
    let dateHMS = formattedDate[1].split(":")
    return `${dateYMD} [${dateHMS[0]}h ${dateHMS[1]}m]`
}

export const writeWorkbook = async (wb, name, setStatus, isLoading) => {
    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `${name} - ${formatDate(new Date())}.xlsx`);

    setStatus("Download Template");
    isLoading(false);
};

export const enableCellEditing = async (ws, cells) => {
    cells.forEach((cell) => {
        ws.getCell(cell).protection = { locked: false }
    });
}

export const hideColumns = (ws, columnsList) => {
    columnsList.forEach(
        column => ws.getColumn(column).hidden = true
    )
}; 

export const addProtection = async (ws, start, end, password) => {
    for (let i = start; i <= end; i++) {
        ws.getRow(i).protection = {
            locked: false
        };
    }

    await ws.protect(password, {
        insertRows: true,
        deleteRows: true
    });
};

export const addReleaseNotes = async (ws, releaseNotes, password) => {
    ws.columns = [
        { header: "Version", key: "version", width: 15 },
        { header: "Date", key: "date", width: 12 },
        { header: "New Features / Bug Fixes", key: "description", width: 100 }
    ];

    ws.duplicateRow(1, 1, false);

    for (let i = 1; i < 2; i++) {
        ws.getRow(i).value = [];
    }

    ws.getCell("A1").value = "Release Notes";
    ws.mergeCells("A1:C1");

    let row = 2;

    for (let i = 0; i < releaseNotes.length; i++) {
        row = row + 1;
        ws.getRow(row).values = releaseNotes[i];
    }

    ws.getColumn('version').alignment = { vertical: "middle" };
    ws.getColumn('date').alignment = { vertical: "middle" };
    ws.getColumn('description').alignment = { wrapText: true };
    applyBorderToRange(ws, 0, 2, 2, parseInt(ws.lastRow._number));
    await ws.protect(password);
}

export const addCreator = wb => {
    wb.creator = 'KnowTechTure Ltd';
    wb.created = new Date();
};

export const buildCellObject = (ws, cell) => ({
    cell: ws.getCell(cell),
    ref: cell,
    merge: () => ws.mergeCells(cell)
})

export const generateBorderObject = (borderSchema, style = "thin") => {
    let result = {};

    while (borderSchema.length < 4) {
        borderSchema = borderSchema+"0";
    }

    borderSchema = borderSchema.substring(0, 4);

    if (borderSchema[0] === "1") result.top = { style }
    if (borderSchema[1] === "1") result.right = { style }
    if (borderSchema[2] === "1") result.bottom = { style }
    if (borderSchema[3] === "1") result.left = { style }

    return result;
}

export const getMappedValues = (ws, startRow, refColumn, dataMap) => {
    let i = startRow;
    let mappedValues = [];

    while (ws.getCell(refColumn + i).value !== null) {
        let value = {};
        for (const [key, column] of Object.entries(dataMap)) {
            value[key] = ws.getCell(column + i).value
        }
        mappedValues.push(value);
        i++;
    }

    return mappedValues;
}

export const getTrackerMappingList = (ws) => {
    return {
        trackedEntityAttributes: getMappedValues(ws, 3, "D", { id: 'D', tea: 'C', aggType: 'F', valueType: 'G' }),
        optionSets: getMappedValues(ws, 3, "K", { id: 'K', optionSet: 'J', valueType: 'L' }),
        legendSets: getMappedValues(ws, 3, "P", { id: 'P', legendSet: 'O' })
    };
}

export const getHNQIS2MappingList = (ws) => {
    return {
        optionSets: getMappedValues(ws, 3, "I", { id: 'I', optionSet: 'H', valueType: 'J' }),
        legendSets: getMappedValues(ws, 3, "P", { id: 'P', legendSet: 'O' }),
        healthAreas: getMappedValues(ws, 3, "L", { code: 'L', name: 'M' }),
        programs: getMappedValues(ws, 3, "R", { id: 'S', name: 'R' })
    };
}

export const getVarNameFromParentUid = (parentUid, programStage, removeStagePrefix = true) => {
    let parentDe = programStage.programStageSections.map(pss => pss.dataElements).flat().find(de => de.id == parentUid);
    let deMetadata = JSON.parse(parentDe?.attributeValues?.find(av => av.attribute.id === METADATA)?.value || "{}");
    if(removeStagePrefix)
        return deMetadata.varName?.replace(/_PS\d+/g, '');
    return deMetadata.varName;
}
export function printArray2Column(sheet, array, header, startPosition, headerBgColor)
{
    let coordinates = Utils.splitPosition(startPosition);
    sheet.getColumn(coordinates[0]).width = 20;
    sheet.getCell(startPosition).value = header;
    sheet.getCell(startPosition).fill = {type: "pattern", pattern: "solid", fgColor: {argb: headerBgColor}}

    let pos;
    for(i = 0; i<array.length; i++)
    {
        pos = coordinates[0] + (parseInt(coordinates[1])+parseInt(i)+parseInt(1));
        me.mapping.getCell(pos).value = array[i];
    }

    me.applyBorderToRange(sheet, Utils.character2Number(coordinates[0]), coordinates[1], Utils.character2Number(coordinates[0]), parseInt(coordinates[1]) + parseInt(array.length));
}
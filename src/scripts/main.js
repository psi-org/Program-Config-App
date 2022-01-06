function completeBlueprint() {
  let master =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DE Master");

  let totalRows = master.getDataRange().getValues().length;
  let prefixCell = configS.getRange(fixedCells.dePrefix);

  let flag = true;

  let dataMatrix = [];

  for (let row = 2; row <= totalRows; row++) {
    let sectionCell = master.getRange(row, idx.section);
    let questionCell = master.getRange(row, idx.question);

    let formNameCell = master.getRange(row, idx.formName);

    let compositeScoreCell = master.getRange(row, idx.compositeScore);
    let feedbackOrderCell = master.getRange(row, idx.feedbackOrder);

    if (compositeScoreCell.getValue() == "Yes") {
      flag =
        !prefixCell.isBlank() &&
        !formNameCell.isBlank() &&
        !feedbackOrderCell.isBlank();
    } else {
      flag =
        !prefixCell.isBlank() &&
        !sectionCell.isBlank() &&
        !questionCell.isBlank() &&
        !formNameCell.isBlank();
    }

    if (flag) {
      let prgVarCode =
        compositeScoreCell.getValue() == "Yes"
          ? "CS" + feedbackOrderCell.getValue()
          : "S" + sectionCell.getValue() + "Q" + questionCell.getValue();

      let code = prefixCell.getValue() + "_" + prgVarCode;
      let shortName = code + "_" + formNameCell.getValue().substr(0, 20);
      let name = code + "_" + formNameCell.getValue();

      dataMatrix.push([name, shortName, code, prgVarCode]);
    } else {
      dataMatrix.push(["", "", "", ""]);
    }
  }
  master.getRange(2, 2, dataMatrix.length, 4).setValues(dataMatrix);
}

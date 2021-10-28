import ExcelJS from 'exceljs/dist/es5/exceljs.browser.js'
import { saveAs } from 'file-saver'
import { activeTabNumber, valueType, renderType, aggOperator, thinBorder } from "../../configs/TemplateConstants"
import { printArray2Column } from "../../configs/ExcelUtils"

export default class ConfigurationGenerator
{

    constructor(ps)
    {
        this.programSection_id = ps;
    }

    async init() 
    {
        const workbook = new ExcelJS.Workbook();
        this.addCreator(workbook);
        
        const instructionWS = workbook.addWorksheet("Instructions");
        const templateWS = workbook.addWorksheet("Template", {views: [{ showGridLines: false, state: 'frozen', xSplit: 3, ySplit: 2}]});
        const mappingWS = workbook.addWorksheet("Mapping", {views: [{showGridLines: false}]});
        const realeaseNotesWS = workbook.addWorksheet("Release Notes");

        workbook.views = [{activeTab: activeTabNumber}];

        this.addInstructions(instructionWS);

        this.addMapping(mappingWS);

        this.writeWorkbook(workbook);
    }
    
    addCreator(wb)
    {
        wb.creator = 'Utsav Ashish Koju';
        wb.created = new Date();
    }

    addInstructions(ws)
    {
        ws.getCell("A1").value = "Instruction";
        ws.getCell("A2").value = "(WIP)";
    }

    addMapping(ws)
    {
        printArray2Column(ws, valueType, "Value Type", "B2", "b6d7a8");
        printArray2Column(ws, renderType, "Render Type", "D2", "b6d7a8");
        printArray2Column(ws, aggOperator, "Agg. Operator", "F2", "a2c4c9");
    }

    async writeWorkbook(wb)
    {
        const buf = await wb.xlsx.writeBuffer()
        saveAs(new Blob([buf]), `HNQIS Config.xlsx`);
    }
}
//**************************************************************************************
//**************************************************************************************
//**************************************************************************************
//**************************************************************************************
//************░█▀▀▄░▒█░░░░▒█▀▀█░▒█▀▀▀█░▒█▀▀▄░█▀▀▄░▒█▀▀▀█░▒█░▄▀░▒█▀▀▀░▀▀█▀▀**************
//************▒█▄▄█░▒█░░░░▒█░▄▄░▒█░░▒█░▒█▀▀▄▒█▄▄█░░▀▀▀▄▄░▒█▀▄░░▒█▀▀▀░░▒█░░**************
//************▒█░▒█░▒█▄▄█░▒█▄▄▀░▒█▄▄▄█░▒█▄▄█▒█░▒█░▒█▄▄▄█░▒█░▒█░▒█▄▄▄░░▒█░░**************
//**************************************************************************************
//************************** ▀▄▀▄▀▄GitHub - algobasket▄▀▄▀▄▀ ***************************
//**************************************************************************************
//**************************************************************************************
//************************************************************************************** 


import puppeteer from 'puppeteer'; 
import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec, spawn, spawnSync } from 'child_process';
import fs from 'fs';
import ExcelJS from 'exceljs';
import Table from 'cli-table3';
import chalk from 'chalk'; 

// Define the extract_section function
function extract_section(inputstring, start, end) {
  const startIndex = inputstring.indexOf(start);
  if (startIndex === -1) return null;
  const endIndex = inputstring.indexOf(end, startIndex + start.length);
  if (endIndex === -1) return null;
  return inputstring.substring(startIndex + start.length, endIndex); 
}

// Define a function to strip HTML tags
function stripHtmlTags(html) {
  if (!html) {
    return ''; // Return an empty string if html is null or undefined
  }
  return html.replace(/<[^>]*>?/gm, '');
}  

(async () => {
  const inputExcel  = 'input-excel.xlsx';

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename); 
  const filePath = path.resolve(__dirname, inputExcel); 
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.readFile(filePath);

  // Assuming the first sheet is the one you want to work with
  const sheet = workbook.getWorksheet(1);
  const values = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const cellA = sheet.getCell(`A${rowNumber}`);
    values.push(cellA.value);
  });  

  function runPythonScript(args) {
    const { stdout, stderr, status } = spawnSync('python', ['script.py', ...args], { encoding: 'utf-8' });

    if (status === 0) {
      return stdout.trim();  
    } else {
      return 0; // Return 0 in case of error
    }
  }

  async function processAckNumber(ackNumber, iterationCount, maxIterations) {
            if (iterationCount >= maxIterations) {
              return { captchaCode: null, statusContent: null }; // Exit the function if maxIterations is reached
            }

            const browser = await puppeteer.launch({ headless: false });  
            const page = await browser.newPage();

            await page.goto('https://tin.tin.nsdl.com/pantan/StatusTrack.html');
            const imgHandle = await page.waitForSelector('img#imgCode');

            await page.evaluate(element => {
              element.setAttribute('width', '500');
              element.removeAttribute('height');
            }, imgHandle);

            const screenshotPath = 'captcha-codes/' + ackNumber + '-captcha-a.png'; 
            await imgHandle.screenshot({ path: screenshotPath });

            await page.select('select[name="ST_SEARCH_TYPE"]', 'P'); // or 'T' for TAN
            await page.type('input[name="ST_ACK_NUM"]', String(ackNumber)); 

            const captchaCode = await getCaptchaCode(page, ackNumber);
            if (!captchaCode) {
              await browser.close();
              return { captchaCode: null, statusContent: null }; // Exit the function if captcha code couldn't be retrieved
            }

            await page.type('input[name="imgText"]', captchaCode);         
            await page.click('input[type="submit"]');        

            await new Promise(resolve => setTimeout(resolve, 3000));      

            const pageContent = await page.content();
            let statusContent;

            if (pageContent.includes("Wrong captcha entered. Kindly enter correct Captcha")) {
              await browser.close();
              // Retry with the same ackNumber
              return await processAckNumber(ackNumber, iterationCount + 1, maxIterations);
            }

            const extractedHTML = extract_section(pageContent, '<font color="RED"><b>', 'Please select type of application:</b>'); 
            let textContent = stripHtmlTags(extractedHTML);
            statusContent = textContent.trim(); 

            if(statusContent == "" || statusContent == null) {
              const extractedHTML2 = extract_section(pageContent, '<font color="#A52A2A" size="+1"><i>', '<td align="CENTER" colspan="3"><b>');  
              let textContent2 = stripHtmlTags(extractedHTML2);
              statusContent = textContent2.trim(); 
            }

            await page.screenshot({ path: 'screenshots/' + ackNumber + '-screenshot.png' });

            await browser.close();

            return { captchaCode, statusContent };
  }


  async function getCaptchaCode(page, ackNumber) {
    const args = [ackNumber];
    const captchaCode = await runPythonScript(args);
    if (typeof captchaCode === 'string') {
        return captchaCode.trim().replace(/\s/g, '');
    } else {
        return ''; // or any default value you prefer
    }
  } 

  const table = new Table({ style: { head: ['green'], border: ['green'] } });
  const headerText = 'Script Developed By Algobasket';
  const styledHeaderText = chalk.bold(headerText);
  table.push([{ colSpan: 3, content: styledHeaderText, hAlign: 'center', vAlign: 'center' }]);
  table.push([`ACKNOWLEDGEMENT NUMBER`,`CAPTCHA CODE`, `STATUS`]);

  const maxIterations = 3; 
  let excelCell = 1; 

  for (const ackNumber of values) { 
    const { captchaCode, statusContent } = await processAckNumber(ackNumber, 0, maxIterations);
    if (!statusContent) continue;
  
    const truncatedStatusContent = statusContent.split(' ').slice(0, 20).join(' ');
    table.push([ackNumber, captchaCode, truncatedStatusContent]); 

  
    const cellB = 'B' + excelCell;    
    sheet.getCell(cellB).value = statusContent;  
  
    if (captchaCode) {
      await workbook.xlsx.writeFile(filePath);         
      excelCell++;
    }
    // Output the values in real-time
    console.log(`${ackNumber}, ${captchaCode}, ${truncatedStatusContent}`);
  } 

  //console.log(table.toString());   
})();

import {jsPDF} from 'jspdf';
import ExcelJS from 'exceljs';
import {calculate,formatMoney,lineTotal,type Estimate,type Category} from './estimate';

type Lang='uk'|'en';
const categories:Record<Category,[string,string]>={work:['Роботи','Labor'],material:['Матеріали','Materials'],transport:['Транспорт','Transport'],extra:['Додаткові витрати','Other expenses']};
const txt=(lang:Lang,uk:string,en:string)=>lang==='uk'?uk:en;
const money=(kop:number)=>Number((kop/100).toFixed(2));
const filename=(estimate:Estimate,extension:string)=>`estimate-${estimate.id.replace(/[^a-zA-Z0-9_-]/g,'_')}.${extension}`;
const download=(blob:Blob,name:string)=>{const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),15000)};

export async function exportPDF(estimate:Estimate,lang:Lang){
 const response=await fetch(`${import.meta.env.BASE_URL}fonts/Go-Regular.ttf`);
 if(!response.ok)throw new Error('PDF font unavailable');
 const bytes=new Uint8Array(await response.arrayBuffer());
 let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 const pdf=new jsPDF({unit:'mm',format:'a4'});
 pdf.addFileToVFS('Go-Regular.ttf',btoa(binary));pdf.addFont('Go-Regular.ttf','Go','normal');pdf.setFont('Go');
 const width=210,margin=14;let y=18;
 const line=(value:string,size=10,spacing=7)=>{pdf.setFontSize(size);const rows=pdf.splitTextToSize(value,width-margin*2) as string[];for(const row of rows){if(y>278){pdf.addPage();y=18}pdf.text(row,margin,y);y+=spacing}};
 line('DevStudio | Electrical Estimator',17,11);
 line(txt(lang,'КОШТОРИС ЕЛЕКТРОМОНТАЖНИХ РОБІТ','ELECTRICAL WORK ESTIMATE'),12,9);
 line(`${txt(lang,'Проєкт','Project')}: ${estimate.title}`,10);
 line(`${txt(lang,'Замовник','Client')}: ${estimate.client}`,10);
 line(`${txt(lang,'Дата','Date')}: ${estimate.createdAt}`,10,11);
 for(const [index,item] of estimate.lines.entries()){
  const label=`${index+1}. ${item.name}`;
  line(label,10,6);
  line(`   ${item.quantity} ${item.unit} × ${formatMoney(item.priceKop,lang)} = ${formatMoney(lineTotal(item),lang)}`,9,8);
 }
 y+=3;const result=calculate(estimate);
 for(const category of ['work','material','transport','extra'] as Category[])line(`${categories[category][lang==='uk'?0:1]}: ${formatMoney(result.groups[category],lang)}`);
 line(`${txt(lang,'Проміжна сума','Subtotal')}: ${formatMoney(result.subtotal,lang)}`);
 line(`${txt(lang,'Знижка','Discount')} (${estimate.discountPercent}%): -${formatMoney(result.discount,lang)}`);
 line(`${txt(lang,'Націнка','Markup')} (${estimate.markupPercent}%): ${formatMoney(result.markup,lang)}`);
 line(`${txt(lang,'Податок','Tax')} (${estimate.taxPercent}%): ${formatMoney(result.tax,lang)}`);
 line(`${txt(lang,'РАЗОМ','TOTAL')}: ${formatMoney(result.total,lang)}`,13,10);
 line(txt(lang,'Демонстраційні розцінки. Не є комерційною пропозицією.','Demo rates. Not a binding quotation.'),8);
 pdf.save(filename(estimate,'pdf'));
}

export async function exportExcel(estimate:Estimate,lang:Lang){
 const wb=new ExcelJS.Workbook();wb.creator='DevStudio OS';
 const sheet=wb.addWorksheet(txt(lang,'Кошторис','Estimate'));
 sheet.columns=[{width:9},{width:46},{width:19},{width:13},{width:16},{width:16},{width:20}];
 sheet.mergeCells('A1:G1');sheet.getCell('A1').value='DevStudio | Electrical Estimator';sheet.getCell('A1').font={bold:true,size:16};
 sheet.mergeCells('A2:G2');sheet.getCell('A2').value=estimate.title;
 sheet.getCell('A3').value=txt(lang,'Замовник','Client');sheet.getCell('B3').value=estimate.client;
 sheet.getCell('A4').value=txt(lang,'Дата','Date');sheet.getCell('B4').value=estimate.createdAt;
 const header=sheet.addRow([txt(lang,'№','No.'),txt(lang,'Найменування','Description'),txt(lang,'Категорія','Category'),txt(lang,'Од.','Unit'),txt(lang,'Кількість','Quantity'),txt(lang,'Ціна, ₴','Unit price, UAH'),txt(lang,'Сума, ₴','Amount, UAH')]);
 header.font={bold:true};header.eachCell(c=>{c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFE5EDF5'}}});
 for(const [i,item] of estimate.lines.entries()){
  const excelRow=sheet.rowCount+1;
  const row=sheet.addRow([i+1,item.name,categories[item.category][lang==='uk'?0:1],item.unit,item.quantity,money(item.priceKop),{formula:`ROUND(E${excelRow}*F${excelRow},2)`,result:money(lineTotal(item))}]);
  row.getCell(6).numFmt='#,##0.00';row.getCell(7).numFmt='#,##0.00';
 }
 const result=calculate(estimate);
 const summary:[string,number][]=[
  [txt(lang,'Роботи','Labor'),result.groups.work],[txt(lang,'Матеріали','Materials'),result.groups.material],
  [txt(lang,'Транспорт','Transport'),result.groups.transport],[txt(lang,'Додаткові витрати','Other expenses'),result.groups.extra],
  [txt(lang,'Проміжна сума','Subtotal'),result.subtotal],[`${txt(lang,'Знижка','Discount')} (${estimate.discountPercent}%)`,-result.discount],
  [`${txt(lang,'Націнка','Markup')} (${estimate.markupPercent}%)`,result.markup],[`${txt(lang,'Податок','Tax')} (${estimate.taxPercent}%)`,result.tax],
  [txt(lang,'РАЗОМ','TOTAL'),result.total]];
 for(const [label,value] of summary){const row=sheet.addRow(['',label,'','','','',money(value)]);row.getCell(7).numFmt='#,##0.00';if(label===txt(lang,'РАЗОМ','TOTAL'))row.font={bold:true};}
 sheet.views=[{state:'frozen',ySplit:6}];
 const buffer=await wb.xlsx.writeBuffer();download(new Blob([buffer as BlobPart],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),filename(estimate,'xlsx'));
}

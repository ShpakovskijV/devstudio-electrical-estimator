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
 const margin=16,right=194,pageBottom=276;
 const unit=(u:string)=>lang==='uk'?({m:'м',pcs:'шт.',set:'компл.',hour:'год.'} as Record<string,string>)[u]??u:u;
 const fmt=(n:number)=>new Intl.NumberFormat(lang==='uk'?'uk-UA':'en-US',{maximumFractionDigits:3}).format(n);
 let y=20;
 const newPage=()=>{pdf.addPage();y=20;};
 const ensure=(height:number)=>{if(y+height>pageBottom)newPage();};
 const write=(value:string,x:number,at:number,size=9,align:'left'|'right'='left')=>{pdf.setFontSize(size);pdf.setTextColor(24,40,62);pdf.text(value,x,at,{align});};
 const rule=()=>{pdf.setDrawColor(213,223,234);pdf.line(margin,y,right,y);};
 const wrapped=(value:string,x:number,maxWidth:number,size=9,leading=5)=>{
  pdf.setFontSize(size);
  const rows=pdf.splitTextToSize(value,maxWidth) as string[];
  for(const row of rows){ensure(leading);write(row,x,y,size);y+=leading;}
 };
 const section=(label:string)=>{ensure(12);y+=3;pdf.setFillColor(235,241,249);pdf.rect(margin,y-5,right-margin,9,'F');write(label,margin+3,y+1,9);y+=10;};
 // Document heading and customer details.
 pdf.setFillColor(28,49,79);pdf.rect(0,0,210,12,'F');
 pdf.setTextColor(255,255,255);pdf.setFontSize(10);pdf.text('DevStudio | Electrical Estimator',margin,8);
 y=24;write(txt(lang,'КОШТОРИС ЕЛЕКТРОМОНТАЖНИХ РОБІТ','ELECTRICAL WORK ESTIMATE'),margin,y,15);y+=10;
 wrapped(`${txt(lang,'Проєкт','Project')}: ${estimate.title}`,margin,178,10,6);
 wrapped(`${txt(lang,'Замовник','Client')}: ${estimate.client}`,margin,178,10,6);
 write(`${txt(lang,'Дата','Date')}: ${estimate.createdAt}`,margin,y,9);y+=10;
 section(txt(lang,'ПЕРЕЛІК РОБІТ ТА ВИТРАТ','ITEMIZED WORK AND COSTS'));
 // Each item is kept together where possible; long descriptions wrap naturally.
 for(const [i,item] of estimate.lines.entries()){
  pdf.setFontSize(9);
  const nameRows=pdf.splitTextToSize(`${i+1}. ${item.name}`,174) as string[];
  const height=nameRows.length*5+8;
  if(height<pageBottom-20)ensure(height);
  for(const row of nameRows){ensure(5);write(row,margin+2,y,9);y+=5;}
  const detail=`${fmt(item.quantity)} ${unit(item.unit)} × ${formatMoney(item.priceKop,lang)}`;
  ensure(7);write(detail,margin+7,y,8);write(formatMoney(lineTotal(item),lang),right-2,y,9,'right');y+=6;rule();y+=4;
 }
 const result=calculate(estimate);
 section(txt(lang,'ПІДСУМОК','SUMMARY'));
 const summaryRow=(label:string,value:string,emphasis=false)=>{
  ensure(8);
  if(emphasis){pdf.setFillColor(227,236,252);pdf.rect(margin,y-5,right-margin,9,'F');}
  write(label,margin+3,y,emphasis?12:9);write(value,right-3,y,emphasis?12:9,'right');y+=8;
 };
 for(const category of ['work','material','transport','extra'] as Category[])
  summaryRow(categories[category][lang==='uk'?0:1],formatMoney(result.groups[category],lang));
 rule();y+=6;
 summaryRow(txt(lang,'Проміжна сума','Subtotal'),formatMoney(result.subtotal,lang));
 summaryRow(`${txt(lang,'Знижка','Discount')} (${estimate.discountPercent}%)`,result.discount===0?formatMoney(0,lang):`−${formatMoney(result.discount,lang)}`);
 summaryRow(`${txt(lang,'Націнка','Markup')} (${estimate.markupPercent}%)`,formatMoney(result.markup,lang));
 summaryRow(`${txt(lang,'Податок','Tax')} (${estimate.taxPercent}%)`,formatMoney(result.tax,lang));
 ensure(12);y+=3;summaryRow(txt(lang,'РАЗОМ','TOTAL'),formatMoney(result.total,lang),true);
 y+=5;wrapped(txt(lang,'Демонстраційні розцінки. Не є комерційною пропозицією.','Demo rates. Not a binding quotation.'),margin,178,8,5);
 const pages=pdf.getNumberOfPages();
 for(let page=1;page<=pages;page++){
  pdf.setPage(page);pdf.setDrawColor(215,223,232);pdf.line(margin,285,right,285);
  pdf.setTextColor(105,119,139);pdf.setFontSize(8);
  pdf.text('DevStudio OS',margin,290);
  pdf.text(`${page} / ${pages}`,right,290,{align:'right'});
 }
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
 // Category totals use the editable category column and line amount formulas.
 const first=6,last=5+estimate.lines.length;
 const summaryStart=sheet.rowCount+1;
 const categoryTotals:[Category,number][]=[
  ['work',result.groups.work],['material',result.groups.material],
  ['transport',result.groups.transport],['extra',result.groups.extra]];
 for(const [category,cachedKop] of categoryTotals){
  const rowNo=sheet.rowCount+1;
  const label=categories[category][lang==='uk'?0:1];
  const formula=last>=first?`SUMIF(C${first}:C${last},B${rowNo},G${first}:G${last})`:'0';
  const row=sheet.addRow(['',label,'','','','',{formula,result:money(cachedKop)}]);
  row.getCell(7).numFmt='#,##0.00';
 }
 const subtotalRow=sheet.rowCount+1;
 sheet.addRow(['',txt(lang,'Проміжна сума','Subtotal'),'','','','',{formula:`SUM(G${summaryStart}:G${subtotalRow-1})`,result:money(result.subtotal)}]);
 const discountRow=sheet.rowCount+1;
 sheet.addRow(['',txt(lang,'Знижка','Discount'),'','','',estimate.discountPercent,{formula:`-ROUND(G${subtotalRow}*F${discountRow}/100,2)`,result:-money(result.discount)}]);
 const markupRow=sheet.rowCount+1;
 sheet.addRow(['',txt(lang,'Націнка','Markup'),'','','',estimate.markupPercent,{formula:`ROUND((G${subtotalRow}+G${discountRow})*F${markupRow}/100,2)`,result:money(result.markup)}]);
 const taxRow=sheet.rowCount+1;
 sheet.addRow(['',txt(lang,'Податок','Tax'),'','','',estimate.taxPercent,{formula:`ROUND((G${subtotalRow}+G${discountRow}+G${markupRow})*F${taxRow}/100,2)`,result:money(result.tax)}]);
 const totalRow=sheet.rowCount+1;
 const total=sheet.addRow(['',txt(lang,'РАЗОМ','TOTAL'),'','','','',{formula:`SUM(G${subtotalRow},G${discountRow}:G${taxRow})`,result:money(result.total)}]);
 total.font={bold:true};
 for(let r=summaryStart;r<=totalRow;r++)sheet.getRow(r).getCell(7).numFmt='#,##0.00';
 for(const r of [discountRow,markupRow,taxRow])sheet.getRow(r).getCell(6).numFmt='0.##"%"';
 wb.calcProperties.fullCalcOnLoad=true;
 sheet.views=[{state:'frozen',ySplit:6}];
 const buffer=await wb.xlsx.writeBuffer();download(new Blob([buffer as BlobPart],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),filename(estimate,'xlsx'));
}

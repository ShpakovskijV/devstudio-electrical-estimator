export type Unit = 'm' | 'pcs' | 'set' | 'hour';
export type Category = 'work' | 'material' | 'transport' | 'extra';
export interface CatalogItem { id:string; nameUk:string; nameEn:string; unit:Unit; priceKop:number; category:Category }
export interface EstimateLine { id:string; catalogId?:string; name:string; unit:Unit; quantity:number; priceKop:number; category:Category }
export interface Estimate { id:string; title:string; client:string; createdAt:string; lines:EstimateLine[]; discountPercent:number; markupPercent:number; taxPercent:number }
export const toKop = (uah:number):number => { if(!Number.isFinite(uah)||uah<0||uah>Number.MAX_SAFE_INTEGER/100) throw new Error('Invalid price'); return Math.round((uah+Number.EPSILON)*100); };
export const lineTotal = (line:EstimateLine):number => { if(!Number.isFinite(line.quantity)||line.quantity<0||!Number.isInteger(line.priceKop)||line.priceKop<0) throw new Error('Invalid line'); const result=Math.round(line.quantity*line.priceKop); if(!Number.isSafeInteger(result)) throw new Error('Line total overflow'); return result; };
export function calculate(estimate:Estimate){
 const groups:Record<Category,number>={work:0,material:0,transport:0,extra:0};
 for(const line of estimate.lines) {
  if(!(line.category in groups)) throw new Error('Invalid category');
  const next=groups[line.category]+lineTotal(line);
  if(!Number.isSafeInteger(next)) throw new Error('Category total overflow');
  groups[line.category]=next;
 }
 const subtotal=Object.values(groups).reduce((a,b)=>a+b,0);
 for(const rate of [estimate.discountPercent,estimate.markupPercent,estimate.taxPercent]) if(!Number.isFinite(rate)||rate<0||rate>100) throw new Error('Invalid percentage');
 if(!Number.isSafeInteger(subtotal)) throw new Error('Subtotal overflow');
 const discount=Math.round(subtotal*estimate.discountPercent/100);
 const afterDiscount=subtotal-discount;
 const markup=Math.round(afterDiscount*estimate.markupPercent/100);
 const tax=Math.round((afterDiscount+markup)*estimate.taxPercent/100);
 const total=afterDiscount+markup+tax;
 if(![discount,markup,tax,total].every(Number.isSafeInteger)) throw new Error('Total overflow');
 return {groups,subtotal,discount,markup,tax,total};
}
export const formatMoney=(kop:number,lang:'uk'|'en'='uk')=>new Intl.NumberFormat(lang==='uk'?'uk-UA':'en-US',{style:'currency',currency:'UAH'}).format(kop/100);

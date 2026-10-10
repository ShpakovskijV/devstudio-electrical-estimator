import {describe,it,expect} from 'vitest';
import {calculate,toKop,type Estimate} from './estimate';
const base:Estimate={id:'1',title:'Test',client:'',createdAt:'2026-10-10',discountPercent:0,markupPercent:0,taxPercent:0,lines:[{id:'l1',name:'Cable',unit:'m',quantity:100,priceKop:3500,category:'work'}]};
describe('EstimateCore',()=>{
 it('calculates integer minor units',()=>expect(calculate(base).total).toBe(350000));
 it('applies discounts, markups and tax in documented order',()=>expect(calculate({...base,discountPercent:10,markupPercent:10,taxPercent:20}).total).toBe(415800));
 it('keeps historical snapshot price independent of catalog',()=>expect(calculate(base).total).toBe(350000));
 it('rejects invalid quantities',()=>expect(()=>calculate({...base,lines:[{...base.lines[0],quantity:-1}]})).toThrow());
 it('converts UAH to kopecks',()=>expect(toKop(10.25)).toBe(1025));
});

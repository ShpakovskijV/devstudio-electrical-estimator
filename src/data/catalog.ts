import type {CatalogItem} from '../core/estimate';
const catalogRows: [string,string,string,CatalogItem['unit'],number,CatalogItem['category']][] = [
 ['cable','Прокладання кабелю','Cable installation','m',35,'work'],
 ['conduit','Монтаж металорукава','Metal conduit installation','m',55,'work'],
 ['socket','Монтаж розетки','Socket installation','pcs',180,'work'],
 ['switch','Монтаж вимикача','Switch installation','pcs',180,'work'],
 ['box','Монтаж розподільчої коробки','Junction box installation','pcs',220,'work'],
 ['panel','Монтаж електрощита','Electrical panel assembly','set',4500,'work'],
 ['breaker','Монтаж автомата','Circuit breaker installation','pcs',250,'work'],
 ['light','Монтаж світильника','Light fixture installation','pcs',450,'work'],
 ['chase','Штроблення стіни','Wall chasing','m',150,'work'],
 ['drill','Буріння отвору','Hole drilling','pcs',250,'work'],
 ['cablemat','Кабель електричний','Electrical cable','m',42,'material'],
 ['socketmat','Розетка','Socket material','pcs',120,'material'],
 ['transport','Транспортні витрати','Transport costs','set',1000,'transport'],
 ['consumables','Витратні матеріали','Consumables','set',500,'extra']
];
export const catalog: CatalogItem[] = catalogRows.map(([id,nameUk,nameEn,unit,price,category])=>({id,nameUk,nameEn,unit,priceKop:price*100,category}));

export type Status = 'confirmado' | 'por-verificar' | 'opcional';
export type Place = { id:string; name:string; detail:string; map:string; official?:string; image?:string; status:Status; duration?:string; hours?:string; price?:string; practical?:string };
export type Transport = { id:string; title:string; route:string; detail:string; duration?:string; booking?:string; provider?:string; status:Status };
export type Day = { id:string; date:string; city:string; title:string; summary:string; image:string; schedule:string[]; places:Place[]; transports:Transport[]; notes:string[]; hotelId?:string };
export type Hotel = { id:string; name:string; dates:string; address:string; map:string; official?:string; status:Status; note?:string };
export type Trip = { schemaVersion:1; title:string; subtitle:string; updatedAt:string; days:Day[]; hotels:Hotel[]; providers:{name:string; description:string; url:string}[] };

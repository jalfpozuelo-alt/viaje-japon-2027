export type RouteStage = {
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  dayIds: string[];
  onward?: { date: string; route: string; coverage: string };
};

// WGS84 city/station anchors. Kumano uses the Kawayu Onsen bus stop and Kii-Katsuura Station.
export const routeStages: RouteStage[] = [
  { name: 'Osaka', area: 'Base inicial', latitude: 34.69379, longitude: 135.50107, dayIds: ['13', '14'], onward: { date: '15 mayo', route: 'Metro o taxi + Limited Express Kuroshio + autobús local a Kawayu', coverage: 'Billetes aparte · ICOCA para el metro compatible' } },
  { name: 'Kawayu · Hongu', area: 'Kumano Kodo', latitude: 33.81296, longitude: 135.77086, dayIds: ['15'], onward: { date: '16 mayo', route: 'Autobús local + JR a Kii-Katsuura + autobús hacia Nachi', coverage: 'Autobuses y JR de este día fuera del pase iniciado el 17' } },
  { name: 'Nachi · Kii-Katsuura', area: 'Nachi y costa de Kumano', latitude: 33.62813, longitude: 135.94181, dayIds: ['16'], onward: { date: '17 mayo', route: 'Limited Express Kuroshio + enlace JR a Kioto', coverage: 'Cubierto por Japan Rail Pass desde el 17 de mayo' } },
  { name: 'Kioto', area: 'Base cultural', latitude: 35.01161, longitude: 135.76811, dayIds: ['17', '18', '19', '20'], onward: { date: '21 mayo', route: 'Shinkansen Hikari + Limited Express Hida vía Nagoya', coverage: 'Cubierto por Japan Rail Pass' } },
  { name: 'Takayama', area: 'Alpes japoneses', latitude: 36.141062, longitude: 137.251454, dayIds: ['21'], onward: { date: '22 mayo', route: 'Limited Express Hida + Shinkansen vía Nagoya', coverage: 'Cubierto por Japan Rail Pass' } },
  { name: 'Tokio', area: 'Última etapa', latitude: 35.6895, longitude: 139.69171, dayIds: ['22', '23', '24', '25'] },
];

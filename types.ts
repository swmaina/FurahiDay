
export enum City {
  Nairobi = 'Nairobi',
  Kisumu = 'Kisumu',
  Mombasa = 'Mombasa',
  Kampala = 'Kampala',
  DarEsSalaam = 'Dar es Salaam',
  Nakuru = 'Nakuru',
}

export enum Genre {
  Mugithi = 'Mugithi',
  HipHop = 'Hip Hop',
  Outdoor = 'Outdoor',
  WineBeer = 'Wine & Beer',
  Ohangla = 'Ohangla',
  LiveBand = 'Live Band',
  CarShow = 'Car Show',
  Cultural = 'Cultural',
}

export interface Event {
  id: number;
  title: string;
  flyerImageUrl: string;
  date: Date;
  venue: string;
  cost: string;
  city: City;
  genre: Genre;
  description: string;
  latitude: number;
  longitude: number;
  isPromoted: boolean;
}

export interface CityInfo {
  name: City;
  latitude: number;
  longitude: number;
}

export type Screen = 'home' | 'saved' | 'search' | 'details';

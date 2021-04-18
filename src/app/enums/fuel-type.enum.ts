export enum FuelType {
  Electric = 100,
  Diesel = 200,
  DieselHybrid = 210,
  Petrol = 300,
  PetrolHybrid = 310,
  PetrolCNG = 320,
  PetrolE85 = 330,
  PetrolLPG = 340
}

export function getFuelTypeName(value:FuelType, short:boolean = false):string
{
  let result =
    value == FuelType.Electric ? "Elektriskā" :
    value == FuelType.Diesel ? "Dīzelis" :
    value == FuelType.DieselHybrid ? "Dīzelis / Hibrīds" :
    value == FuelType.Petrol ? "Benzīns" :
    value == FuelType.PetrolHybrid ? "Benzīns / Hibrīds" :
    value == FuelType.PetrolCNG ? (short ? "Benzīns / CNG" : "Benzīns / Saspiesta dabasgāze") :
    value == FuelType.PetrolE85 ? (short ? "Benzīns / E-85" : "Benzīns / Etanols(E-85)") :
    value == FuelType.PetrolLPG ? (short ? "Benzīns / LPG" : "Benzīns / Sašķidrināta naftas gāze") :
    "<nezinama vērtība>";
  return result;
}

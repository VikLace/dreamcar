export enum BodyType {
  Cabriolet	= 10,
  Coupe	= 20,
  Crossover	= 30,
  Hatchback	= 40,
  Minivan	= 50,
  Pickup = 60,
  Sedan = 70,
  Van	= 80,
  Wagon	= 90
}

export function getBodyTypeName(value: BodyType):string 
{
  let result =
    value == BodyType.Cabriolet ? "Kabriolets" :
    value == BodyType.Coupe ? "Kupeja" :
    value == BodyType.Crossover ? "Krosoveris" :
    value == BodyType.Hatchback ? "Hečbeks" :
    value == BodyType.Minivan ? "Minivens" :
    value == BodyType.Pickup ? "Pikaps" :
    value == BodyType.Sedan ? "Sedans" :
    value == BodyType.Van ? "Vens" :
    value == BodyType.Wagon ? "Universāls" :
    "<nezinama vērtība>";
  return result;
}

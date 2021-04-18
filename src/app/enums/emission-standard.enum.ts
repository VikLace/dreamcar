export enum EmissionStandard {
  Euro5 = 5,
  Euro6 = 6
}

export function getEmissionStandardName(value:EmissionStandard):string
{
  let result =
    value == EmissionStandard.Euro5 ? "EURO 5" :
    value == EmissionStandard.Euro6 ? "EURO 6" :
    "<nezinama vērtība>";
  return result;
}

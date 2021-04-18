export enum Transmission {
  Manual = 1,
  Automatic = 2,
  Dualclutch = 3
}

export function getTransmissionName(value:Transmission):string
{
  let result =
    value == Transmission.Manual ? "Manuālā" :
    value == Transmission.Automatic ? "Automātiskā" :
    value == Transmission.Dualclutch ? "Divkāršā sajūga" :
    "<nezinama vērtība>";
  return result;
}

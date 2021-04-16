import { EnumFilter } from "app/filters/enum-filter";
import { Transmission } from "app/enums/transmission.enum";

export class TransmissionFilter extends EnumFilter<Transmission> {

  constructor()
  {
    super(Transmission);
  }

  public getName(): string{
    return "Pārnesumkārba";
  }

  public getValueName(value: number): string{
    let result =
      value == Transmission.Manual ? "Manuālā" :
      value == Transmission.Automatic ? "Automātiskā" :
      value == Transmission.Dualclutch ? "Divkāršā sajūga" :
      "<nezinama vērtība>";
    return result;
  }

}

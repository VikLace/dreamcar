import { EnumFilter } from "app/filters/enum-filter";
import { DriveWheelConfiguration } from "app/enums/drive-wheel-configuration.enum";

export class DriveWheelConfigurationFilter extends EnumFilter<DriveWheelConfiguration> {

  constructor()
  {
    super(DriveWheelConfiguration);
  }

  public getName(): string{
    return "Piedziņas riteņu konfigurācija";
  }

  public getValueName(value: number): string{
    let result =
      value == DriveWheelConfiguration.Front ? "Priekšējā piedziņa" :
      value == DriveWheelConfiguration.Rear ? "Aizmugures piedziņa" :
      value == DriveWheelConfiguration.All ? "Pilnpiedziņa" :
      "<nezinama vērtība>";
    return result;
  }

}

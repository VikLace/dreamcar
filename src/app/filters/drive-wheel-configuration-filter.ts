import { EnumFilter } from "app/filters/enum-filter";
import { DriveWheelConfiguration, getDriveWheelConfigurationName } from "app/enums/drive-wheel-configuration.enum";

export class DriveWheelConfigurationFilter extends EnumFilter<DriveWheelConfiguration> {

  constructor(filterField: string)
  {
    super(filterField, DriveWheelConfiguration);
  }

  public getName(): string{
    return "Piedziņa";
  }

  public getValueName(value: DriveWheelConfiguration): string{
    return getDriveWheelConfigurationName(value);
  }

}

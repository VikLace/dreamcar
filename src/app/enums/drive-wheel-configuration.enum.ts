export enum DriveWheelConfiguration {
  Front = 1,
  Rear = 2,
  All = 3
}

export function getDriveWheelConfigurationName(value: DriveWheelConfiguration):string
{
  let result =
    value == DriveWheelConfiguration.Front ? "Priekšējā" :
    value == DriveWheelConfiguration.Rear ? "Aizmugurējā" :
    value == DriveWheelConfiguration.All ? "Pilnā" :
    "<nezinama vērtība>";
  return result;
}

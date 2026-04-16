import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

export function StartTimeBeforeEndTime(
  startTimeField: string,
  endTimeField: string,
  validationOptions?: ValidationOptions,
) {
  return function (constructor: new (...args: unknown[]) => object) {
    registerDecorator({
      name: 'startTimeBeforeEndTime',
      target: constructor,
      propertyName: startTimeField,
      options: {
        message: 'Start time must be before end time',
        ...validationOptions,
      },
      validator: {
        validate(_value: unknown, args: ValidationArguments): boolean {
          const object = args.object as Record<string, string | undefined>;
          const startTime = object[startTimeField];
          const endTime = object[endTimeField];

          if (!startTime || !endTime) {
            return true;
          }

          return startTime < endTime;
        },
      },
    });
  };
}

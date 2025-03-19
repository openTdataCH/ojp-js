export class DateHelpers {
  // 2021-06-03 21:38:04
  public static formatDate(d: Date) {
    const date_parts = [
      d.getFullYear(),
      '-',
      ('00' + (d.getMonth() + 1)).slice(-2),
      '-',
      ('00' + d.getDate()).slice(-2),
      ' ',
      ('00' + d.getHours()).slice(-2),
      ':',
      ('00' + d.getMinutes()).slice(-2),
      ':',
      ('00' + d.getSeconds()).slice(-2)
    ];

    return date_parts.join('');
  }

  // 21:38
  public static formatTimeHHMM(d: Date = new Date()): string {
    const dateFormatted = DateHelpers.formatDate(d)
    return dateFormatted.substring(11,16);
  }

  public static computeDelayMinutes(timetableTimeS: Date | string, estimatedTimeS: Date | string | null): number | null {
    if (estimatedTimeS === null) {
      return null;
    }

    const timetableTime = typeof timetableTimeS === 'string' ? new Date(timetableTimeS) : timetableTimeS;
    const estimatedTime = typeof estimatedTimeS === 'string' ? new Date(estimatedTimeS) : estimatedTimeS;

    const dateDiffSeconds = (estimatedTime.getTime() - timetableTime.getTime()) / 1000;
    const delayMinutes = Math.floor(dateDiffSeconds / 60);

    return delayMinutes;
  }
}

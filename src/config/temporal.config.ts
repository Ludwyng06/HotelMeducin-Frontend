import '@js-temporal/polyfill';
import { Temporal } from '@js-temporal/polyfill';

export const temporalConfig = {
  defaultTimeZone: 'America/Bogota',
  dateFormat: 'YYYY-MM-DD',
  dateTimeFormat: 'YYYY-MM-DDTHH:mm:ss[Z]',
};

export type TemporalDate = Temporal.PlainDate;
export type TemporalDateTime = Temporal.ZonedDateTime;
export type TemporalTime = Temporal.PlainTime;


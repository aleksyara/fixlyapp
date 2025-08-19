import { useMemo } from 'react';
import { normalizeZip, isOrangeCountyZip, feeForZip } from '@/lib/zipUtils';

export default function useServiceFee(zipInput: string) {
  const zip = normalizeZip(zipInput);
  const valid = zip.length === 5;

  const fee = useMemo(() => (valid ? feeForZip(zip) : undefined), [zip, valid]);
  const isOC = useMemo(() => (valid ? isOrangeCountyZip(zip) : false), [zip, valid]);

  return { zip, valid, fee, isOC };
}

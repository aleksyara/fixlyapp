// Keep everything as NAMED exports (no default export).
export const ORANGE_COUNTY_ZIPS = new Set<string>([
  '90620','90621','90623','90630','90680',
  '90720','90740',
  '92801','92802','92804','92805','92806','92807','92808',
  '92821','92822','92823',
  '92831','92832','92833','92835',
  '92840','92841','92842','92843','92844','92845','92846',
  '92861','92865','92866','92867','92868','92869',
  '92870','92871',
  '92886','92887',
  '92602','92603','92604','92606','92610','92612','92614','92617','92618','92620','92697',
  '92630','92610',
  '92651','92652','92653','92656','92677','92637',
  '92691','92692','92694',
  '92625','92626','92627','92657','92658','92659','92660','92661','92662','92663',
  '92646','92647','92648','92649',
  '92683','92684','92685',
  '92708',
  '92701','92703','92704','92705','92706','92707','92711','92712','92735','92799',
  '92780','92782',
  '92672','92673','92674','92629','92675','92679',
]);

export const digitsOnly = (v: string) => (v.match(/\d/g) || []).join('');

export function normalizeZip(z: string): string {
  return digitsOnly(z).slice(0, 5);
}

export function normalizePhone(p: string): string {
  return digitsOnly(p).slice(0, 10);
}

export function isOrangeCountyZip(z: string): boolean {
  return ORANGE_COUNTY_ZIPS.has(normalizeZip(z));
}

export function feeForZip(z: string): number {
  return isOrangeCountyZip(z) ? 80 : 125;
}

export const checkedCellValue = (key: string) => {
  if (
    key !== 'issued_id' &&
    key !== 'submitted_id' &&
    key !== 'deferred_id' &&
    key.toLowerCase() !== 'jwt' &&
    key.toLowerCase() !== 'acceptancetoken' &&
    !key.includes('nametag') &&
    !key.includes('issuerDID')
  ) {
    return key;
  }
};

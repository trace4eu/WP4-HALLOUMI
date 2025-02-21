import DateConverter from '../helpers/DateConverter';

export const formatUnixTimestamp = (unixTimestamp: string): string => {
  const timestamp = parseInt(unixTimestamp, 16);

  // Convert Unix timestamp (in seconds) to milliseconds
  const date = new Date(timestamp * 1000);

  // Format the date to a readable string
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  // Return the formatted date string
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};


export const transformString = (initinput: string): string => {
  const input = initinput.includes('userData.')
    ? initinput.replace('userData.', '').trim()
    : initinput.trim();

  switch (input) {
    case 'legalName':
      return 'Legal Name';
    case 'allowedEvent':
      return 'Allowed Event';
    case 'issuedDate':
      return 'Issued Date';
    case 'customerName':
      return 'Customer Name';
    case 'productName':
      return 'Product Name';
    case 'issuanceDate':
      return 'Issuance Date';
    case 'expiryDate':
      return 'Expiry Date';
    case 'issuer':
      return 'Issuer';
    case 'issuerDID':
      return 'Issuer DID';
    case 'actorDID':
        return 'Actor DID';
    case 'vctype':
      return 'VC Type';
    case 'type':
      return 'VC Type';
    case 'status':
      return 'Status';
    case 'firstName':
      return 'First Name';
    case 'familyName':
      return 'Family Name';
    case 'dateOfBirth':
      return 'Date Of Birth';
    case 'personalIdentifier':
      return 'Personal Identifier';
    case 'downloaded':
      return 'Downloaded';
    case 'title':
      return 'Title';
    case 'grade':
      return 'Grade';
    case 'identifierValue':
      return 'Identifier Value';
    case 'acceptancetoken':
      return 'Acceptance Token';
    case 'validityPeriod':
      return 'Validity Period';
    case 'bachelorDegree':
      return 'Bachelor Degree';
    case 'CitizenId':
      return 'Citizen ID';
    case 'registrationNumber':
      return 'Registration Number';
    case 'licenseCode':
      return 'License Code';
    case 'licensedFor':
      return 'Licensed For. Please separate by comma.';
    case 'LicenseToPractice':
      return 'License To Practice';
      case 'lastInChain':
        return 'Last In Chain';
        case 'batchId':
          return 'Batch ID';
          case 'createdOnBehalfOfName':
            return 'Requested By';
            case 'fromName':
              return 'From Actor';
              case 'eventDetails':
              return 'Event Details';
    default:
      return input;
  }
};

const isValidDate = (dateString: string) => {
  const dateObject = new Date(dateString);
  return !isNaN(dateObject.getTime());
};

export const transformDataArray = (dataArray: Record<string, unknown>[]) =>
  dataArray.map((obj) => {
    const transformedObj: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key.toLowerCase() === 'downloaded') {
        if (value === false) {
          transformedObj[transformString(key)] = 'no';
        } else {
          transformedObj[transformString(key)] = 'yes';
        }
      } else if (typeof value === 'string' && typeof value !== 'object') {
        if (
          key !== 'issued_id' &&
          key !== 'submitted_id' &&
          key !== 'deferred_id' &&
          key.toLowerCase() !== 'acceptancetoken' &&
          key.toLowerCase() !== 'jwt' &&
          !key.includes('nametag')
        ) { if (key.toLocaleLowerCase().includes('date') && isValidDate(value)) {
              const tableValue =  DateConverter.dateToString(value);
              transformedObj[transformString(key)] = tableValue;
            } else if (key.toLowerCase() == 'createdat') {
               const tableValue = formatUnixTimestamp(value);
               transformedObj[transformString(key)] = tableValue;
            } else 
            transformedObj[transformString(key)] = value;
        } else
        transformedObj[key] = value;
      }
    }
    return transformedObj;
  });

  export const transformDataArray2 = (dataArray: Record<string, unknown>[]) =>
    dataArray.map((obj) => {
      const transformedObj: Record<string, string> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key.toLowerCase() === 'downloaded') {
          if (value === false) {
            transformedObj[transformString(key)] = 'no';
          } else {
            transformedObj[transformString(key)] = 'yes';
          }
        } else if (typeof value === 'string' && typeof value !== 'object') {
          if (
            key !== 'issued_id' &&
            key !== 'submitted_id' &&
            key !== 'deferred_id' &&
            key.toLowerCase() !== 'acceptancetoken' &&
            key.toLowerCase() !== 'jwt' &&
            !key.includes('nametag')
          ) { if (key.toLocaleLowerCase().includes('date') && isValidDate(value)) {
                const tableValue =  DateConverter.dateToString(value);
                transformedObj[transformString(key)] = tableValue;
              } else if (key.toLowerCase() == 'createdat') {
                 const tableValue = formatUnixTimestamp(value);
                 transformedObj[transformString(key)] = tableValue;
              } else 
              transformedObj[transformString(key)] = value;
          } else
          transformedObj[key] = value;
        } else if (typeof value === 'object') {
          transformedObj[transformString(key)] = JSON.stringify(value)
          .replace(/{/g,'').replace(/}/g,'').replace(/"/g,'').replace(/:/g,": ");
        }
      }
      return transformedObj;
    });

export const transformTableValue = (itemKey: string, value: string | boolean) => {
  let tableValue = value;

  if (itemKey.toLowerCase() === 'downloaded') {
    if (value === false) {
      tableValue = 'no';
    } else {
      tableValue = 'yes';
    }
  }

  

  if (
    typeof value === 'string' &&
    itemKey.toLocaleLowerCase().includes('date') &&
    isValidDate(value)
    //  &&
    // !itemKey.includes('identifierValue') &&
    // !itemKey.includes('personalIdentifier') && 
    // !itemKey.includes('statusListIndex')
  ) {
    tableValue = DateConverter.dateToString(value);
  }
  if (typeof value !== 'string' || (typeof value === 'string' && itemKey.includes('nametag'))) {
    return null;
  }

  return tableValue;
};

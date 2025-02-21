import { DisplayedIWalletCapabilities, IWalletCapabilities } from '../screens/WalletCapabilities';

function replaceNullsAndEmptyArrays(
  data: IWalletCapabilities | DisplayedIWalletCapabilities
): DisplayedIWalletCapabilities {
  const replace = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.length === 0 ? 'n/a' : obj.map(replace);
    } else if (obj === null) {
      return 'n/a';
    } else if (typeof obj === 'object') {
      const newObj: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          newObj[key] = replace(obj[key]);
        }
      }
      return newObj;
    }
    return obj;
  };

  return replace(data);
}

export default replaceNullsAndEmptyArrays;

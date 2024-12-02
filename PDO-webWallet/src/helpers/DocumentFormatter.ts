import {formatUnixTimestamp} from './formatUnixTimestamp';

type FormattedEventDetails = Record<string, string>;

type LastInChainType = 'Yes' | 'No';

type FormattedCompletedEventWithStatus = {
  Type: string;
  From: string;
  'Last in Chain'?: LastInChainType | boolean;
  //'VC JWT'?: string;
  'License Status'?: string;
  'Event Details'?: FormattedEventDetails;
  'Created At'?: string;
};

type FormattedPendingRequiredEvent = {
  Type: string;
  From: string;
  'Notes to Actor'?: string;
};

type FormattedDocument = {
  'Batch ID'?: string;
  'Created At'?: string;
  'Requested By'?: string;
  'Completed Batch'?: string;
  'Pending Required Events'?: FormattedPendingRequiredEvent[];
  'Completed Events'?: FormattedCompletedEventWithStatus[];
};

class DocumentFormatter {
  private obj: Record<string, any>;

  constructor(obj: Record<string, any>) {
    this.obj = obj;
  }

  /**
   * Filters and formats the keys and values of the object
   * @returns A formatted object with transformed keys and values
   */
  public format(): FormattedDocument {
    const formattedDoc: FormattedDocument = {};

    for (const [key, value] of Object.entries(this.obj)) {
      // Special key transformations
      let formattedKey = this.formatKey(key);
      if (key === 'createdOnBehalfOfName') {
        formattedKey = 'Requested By';
      }

      // Skip unwanted keys
      const unwantedKeys = ['documentId', 'from', 'vcJwt'];
      if (unwantedKeys.includes(key)) {
        continue;
      }

      // Handle specific keys
      if (key === 'createdOnBehalfOfName') {
        formattedDoc['Requested By'] = value;
      }
      if (key === 'batchId') {
        formattedDoc['Batch ID'] = value ?? 'n/a';
      } else if (key === 'createdAt') {
        formattedDoc['Created At'] = formatUnixTimestamp(value) ?? 'n/a';
      } else if (key === 'batchCompleted') {
        formattedDoc['Completed Batch'] = value ? 'Yes' : 'No';
      } else if (key === 'pendingRequiredEvents') {
        formattedDoc['Pending Required Events'] = (value as any[]).map((event: any) => ({
          Type: event.type ?? 'n/a',
          From: event.fromName ?? 'n/a',
          'Notes to Actor':
            !event.notesToActor || event.notesToActor.trim() === ''
              ? 'no notes'
              : event.notesToActor.trim(),
        }));
      } else if (key === 'completedEvents') {
        formattedDoc['Completed Events'] = (value as any[]).map((event: any) => ({
          Type: event.type ?? 'n/a',
          From: event.fromName ?? 'n/a',
          'Last in Chain': event.lastInChain === null ? false : event.lastInChain ? 'Yes' : 'No',
          // 'License Status': event.licenseStatus || null, // Only add if not null
          'Event Details': this.formatEventDetails(event.eventDetails),
          'Created At': event.createdAt ? formatUnixTimestamp(event.createdAt) : 'n/a',
        }));
      }
    }

    return formattedDoc;
  }

  /**
   * Converts camelCase to Title Case
   * @param key The camelCase string
   * @returns A Title Case string
   */
  private formatKey(key: string): string {
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert space before uppercase letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
  }

  /**
   * Formats event details, converting keys to Title Case
   * @param eventDetails The eventDetails object
   * @returns A formatted eventDetails object
   */
  // private formatEventDetails(eventDetails: Record<string, any>): FormattedEventDetails {
  //   const formattedDetails: FormattedEventDetails = {};

  //   for (const [key, value] of Object.entries(eventDetails)) {
  //     const formattedKey = this.formatKey(key);
  //     formattedDetails[formattedKey] = value ?? 'n/a';
  //   }

  //   return formattedDetails;
  // }
  private formatEventDetails(eventDetails: Record<string, any>): FormattedEventDetails {
    const formattedDetails: FormattedEventDetails = {};

    for (const [key, value] of Object.entries(eventDetails)) {
      const formattedKey = key.replace(/_/g, ' '); // Remove underscores from labels
      formattedDetails[this.formatKey(formattedKey)] = value ?? 'n/a';
    }

    return formattedDetails;
  }
}

export default DocumentFormatter;

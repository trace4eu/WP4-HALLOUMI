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

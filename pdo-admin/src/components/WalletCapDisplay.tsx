import React from 'react';
import { Typography, Box, Grid } from '@mui/material';
import { IWalletCapabilities } from '../screens/WalletCapabilities';
import replaceNullsAndEmptyArrays from '../helpers/replaceNullsAndEmptyArrays';

interface WalletCapDisplayProps {
  data: IWalletCapabilities;
  parentKey?: string;
  level?: number;
}

// Utility to format the key by replacing underscores with spaces
const beautifyKey = (key: string) => key.replace(/_/g, ' ');

// Beautify the value for display
const beautifyValue = (value: IWalletCapabilities) => {
  if (value === null || (Array.isArray(value) && value.length === 0)) return 'n/a';
  return value.toString();
};

// Define valid Typography variants based on the level
const getTypographyVariant = (level: number): 'h6' | 'body1' | 'body2' => {
  if (level === 0) return 'h6';
  if (level === 1) return 'body1';
  return 'body2';
};

const getFontSize = (fontVariant: 'h6' | 'body1' | 'body2') => {
  if (fontVariant === 'body1') return '1.1rem';
  if (fontVariant === 'body2') return '1.0rem';
  return '1.15rem';
};

// Recursive component to handle rendering of nested objects and arrays
const WalletCapDisplay: React.FC<WalletCapDisplayProps> = ({ data, parentKey = '', level = 0 }) => {
  const fontVariant = getTypographyVariant(level);
  const color = ['#1fb1e6', '#4caf50', '#ff9800'][level] || '#ff9800';
  const fontSize = getFontSize(fontVariant);

  const renderKeyValue = (key: string, value: any) => (
    <Grid container spacing={1} key={key} pb={0.5} alignItems="flex-start">
      {/* Keys Column */}
      <Grid item xs={fontVariant === 'h6' ? 3 : 2}>
        <Typography
          variant={fontVariant}
          fontSize={fontSize}
          color={color}
          style={{
            wordWrap: 'break-word',
            whiteSpace: 'nowrap',
            textAlign: 'left',
          }}
        >
          {key}:
        </Typography>
      </Grid>
      {/* Values Column */}
      <Grid item xs={8}>
        {/* Handle arrays */}
        {Array.isArray(value) ? (
          value.map((item, index) => (
            <Box key={`${key}-${index}`} mt={2} /* Ensure clear separation between objects */>
              {typeof item === 'object' ? (
                <WalletCapDisplay data={item} parentKey={key} level={level + 1} />
              ) : (
                <Typography variant="body1" style={{ wordBreak: 'break-word' }}>
                  {beautifyValue(item)}
                </Typography>
              )}
            </Box>
          ))
        ) : typeof value === 'object' && value !== null ? (
          // Recursively handle nested objects
          <Box pl={1.5}>
            {' '}
            <WalletCapDisplay data={value} parentKey={key} level={level + 1} />
          </Box>
        ) : (
          // Handle primitive values (display key and value in the same row)
          <Typography variant="body1" style={{ textAlign: 'left', wordBreak: 'break-word' }}>
            {beautifyValue(value)}
          </Typography>
        )}
      </Grid>
    </Grid>
  );

  const displayData = replaceNullsAndEmptyArrays(data) as unknown as IWalletCapabilities;

  return (
    <Box pl={1.5}>
      {' '}
      {Object.entries(displayData).map(([key, value]) => {
        const displayKey = beautifyKey(key);

        // Handle arrays with nested objects or primitive values
        if (Array.isArray(value)) {
          return (
            <Box key={displayKey} mt={0.5} display={value.length === 0 ? 'flex' : 'block'}>
              <Typography variant={fontVariant} fontSize={fontSize} color={color}>
                {displayKey}:
              </Typography>
              {value.length === 0 ? (
                <Typography variant="body2" pl={1}>
                  n/a
                </Typography>
              ) : (
                value.map((item, index) => (
                  <Box
                    key={`${displayKey}-${index}`}
                    pl={2}
                    pb={2}
                    mt={typeof item === 'object' ? 2 : 0}
                  >
                    {typeof item === 'object' ? (
                      // Recursively render the object's key-value pairs with new line between objects
                      <WalletCapDisplay data={item} parentKey={key} level={level + 1} />
                    ) : (
                      <Typography variant="body1" pl={1.5}>
                        {beautifyValue(item)}
                      </Typography>
                    )}
                  </Box>
                ))
              )}
            </Box>
          );
        }

        // Handle nested objects (recursive rendering)
        if (typeof value === 'object' && value !== null) {
          return (
            <Box key={displayKey} mt={0.5}>
              <Typography variant={fontVariant} fontSize={fontSize} color={color}>
                {displayKey}:
              </Typography>
              <Box pl={1.5}>
                {' '}
                <WalletCapDisplay data={value} parentKey={key} level={level + 1} />
              </Box>
            </Box>
          );
        }

        // Handle primitive values (key and value in separate columns)
        return renderKeyValue(displayKey, value);
      })}
      {parentKey === 'TIR Registry' && <Box pb={2} />}
    </Box>
  );
};

export default WalletCapDisplay;

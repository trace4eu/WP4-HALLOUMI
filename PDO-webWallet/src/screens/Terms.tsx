import {ChangeEvent, MouseEvent, useState} from 'react';
import TermsModal from '../components/TermsModal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

interface PropsTerms {
  onTermsAccepted: () => void;
}

const Terms = ({onTermsAccepted}: PropsTerms) => {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsDisabled((prevState) => !prevState);
    setIsChecked(event.target.checked);
  };

  const onShowTerms = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsOpen(true);
  };

  const onContinue = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    isChecked && onTermsAccepted();
  };

  return (
    <Box
      sx={{
        px: 6,
        height: '50vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        maxHeight: '700px',
      }}
    >
      <Typography variant="h3">Welcome to PDO Wallet</Typography>
      <Typography>
        {' '}
        Find more information by{' '}
        <span className="terms-link" onClick={onShowTerms}>
          clicking here
        </span>
        .
      </Typography>

      <FormControlLabel
        required
        control={<Checkbox size="medium" onChange={handleCheckboxChange} color={'info'} />}
        label="I agree to the Terms and Conditions"
        id="terms"
        name="terms"
        checked={isChecked}
      />

      <Button
        variant="contained"
        size="medium"
        sx={{padding: 2, width: '15vw'}}
        onClick={onContinue}
        disabled={isDisabled}
      >
        Continue
      </Button>

      <TermsModal setIsOpen={setIsOpen} isOpen={isOpen} />
    </Box>
  );
};

export default Terms;

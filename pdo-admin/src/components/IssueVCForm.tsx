import React, { useState } from 'react';
import { TextField, Button, Grid, Paper, Typography } from '@mui/material';
import { cardType } from '../types';
import { transformString } from '../helpers/transformStringAndData';

export interface INewVCIssueData {
  deferred_id: string;
  type: cardType; // 'CitizenId' | 'bachelorDegree' | 'LicenseToPractice';
  firstName: string;
  familyName: string;
  personalIdentifier?: string;
  dateOfBirth?: string;
  identifierValue?: string;
  title?: string;
  grade?: string;
  registrationNumber?: string;
  licenseCode?: string;
  licensedFor?: string;
}

interface VCIssueFormData {
  validityPeriod: string;
  firstName: string;
  familyName: string;
  personalIdentifier?: string;
  dateOfBirth?: string;
  identifierValue?: string;
  title?: string;
  grade?: string;
  registrationNumber?: string;
  licenseCode?: string;
  licensedFor?: string;
}

export interface IVCdataId {
  firstName: VCIssueFormData['firstName'];
  familyName: VCIssueFormData['familyName'];
  personalIdentifier: VCIssueFormData['personalIdentifier'];
  dateOfBirth: VCIssueFormData['dateOfBirth'];
}

export interface IVCDataDegree {
  firstName: VCIssueFormData['firstName'];
  familyName: VCIssueFormData['familyName'];
  identifierValue: VCIssueFormData['identifierValue'];
  title: VCIssueFormData['title'];
  grade: VCIssueFormData['grade'];
}

export interface IVCDataLicenseToPractice {
  firstName: VCIssueFormData['firstName'];
  familyName: VCIssueFormData['familyName'];
  registrationNumber: VCIssueFormData['registrationNumber'];
  licenseCode: VCIssueFormData['licenseCode'];
  licensedFor: VCIssueFormData['licensedFor'][];
}

export interface IIssuePreAuthVC {
  actorDID:string;
  productName:string|undefined;
  legalName:string;
  allowedEvent:string|undefined
}

export interface IVCIssueData {
  validity: number;
  vcdata: IVCdataId | IVCDataDegree | IVCDataLicenseToPractice;
  deferred_id: INewVCIssueData['deferred_id'];
}

interface IVCIssueFormProps {
  data: INewVCIssueData;
  onIssueVC: (formData: IVCIssueData) => void;
  onDeleteRequest: (deferred_id: string) => void;
}

interface VCIssueFormErrors {
  validityPeriod?: string;
  firstName?: string;
  familyName?: string;
  personalIdentifier?: string;
  dateOfBirth?: string;
  identifierValue?: string;
  title?: string;
  grade?: string;
  registrationNumber?: string;
  licenseCode?: string;
  licensedFor?: string;
}

const VCIssueForm: React.FC<IVCIssueFormProps> = ({ onIssueVC, onDeleteRequest, data }) => {
  const [errors, setErrors] = useState<VCIssueFormErrors | null>(null);

  let initialFormDataState: VCIssueFormData = {
    validityPeriod: '',
    firstName: (data && data.firstName) ? data.firstName : '',
    familyName: ( data && data.familyName ) ? data.familyName : '',
    // nvcField1: '',
    // nvcField2: '',
  };
  if (data.type === 'bachelorDegree') {
    const { identifierValue, title, grade } = data;

    initialFormDataState = {
      ...initialFormDataState,
      identifierValue,
      title,
      grade,
    };
  }
  if (data.type === 'CitizenId') {
    const { personalIdentifier, dateOfBirth } = data;

    initialFormDataState = {
      ...initialFormDataState,
      personalIdentifier,
      dateOfBirth,
    };
  }
  if (data.type === 'LicenseToPractice') {
    const { registrationNumber, licenseCode, licensedFor } = data;

    initialFormDataState = {
      ...initialFormDataState,
      registrationNumber,
      licenseCode,
      licensedFor,
    };
  }

  const [formData, setFormData] = useState<VCIssueFormData>(initialFormDataState);

  const handleChange = (field: keyof VCIssueFormData, value: string) => {
    errors !== null &&
      setErrors((prevData) => ({
        ...prevData,
        [field]: null,
      }));

    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleDeleteReq = () => {
    const { deferred_id } = data;

    onDeleteRequest(deferred_id);
  };

  const handleIssueVC = (e: React.MouseEvent) => {
    e.preventDefault();
    const getVcdata = () => {
      if (data.type === 'CitizenId') {
        const { firstName, familyName, personalIdentifier, dateOfBirth } = formData;

        return {
          firstName: firstName,
          familyName: familyName,
          personalIdentifier: personalIdentifier as string | '',
          dateOfBirth: dateOfBirth as string | '',
        } as IVCdataId;
      }
      if (data.type === 'bachelorDegree') {
        const { firstName, familyName, identifierValue, title, grade } = formData;

        return {
          firstName: firstName,
          familyName: familyName,
          identifierValue: identifierValue as string | '',
          title: title as string | '',
          grade: grade as string | '',
        } as IVCDataDegree;
      }
      if (data.type === 'LicenseToPractice') {
        const { firstName, familyName, registrationNumber, licenseCode, licensedFor } = formData;
        const licensedForArray = (licensedFor as string).split(', ');

        return {
          firstName: firstName,
          familyName: familyName,
          registrationNumber: registrationNumber as string | '',
          licenseCode: licenseCode as string | '',
          licensedFor: licensedForArray,
        } as IVCDataLicenseToPractice;
      }
    };

    let hasErrors = false;
    const newErrors: VCIssueFormErrors = {};

    if (!formData.validityPeriod || formData.validityPeriod.trim() === '') {
      hasErrors = true;
      newErrors.validityPeriod = 'Validity Period is required.';
    }
    if (formData.firstName.trim() === '') {
      hasErrors = true;
      newErrors.firstName = 'First Name is required.';
    }
    if (formData.familyName.trim() === '') {
      hasErrors = true;
      newErrors.familyName = 'Family Name is required.';
    }
    if (data.type === 'bachelorDegree') {
      if (!formData.identifierValue || formData.identifierValue.trim() === '') {
        hasErrors = true;
        newErrors.identifierValue = 'Identifier Value is required.';
      }
      if (!formData.title || formData.title.trim() === '') {
        hasErrors = true;
        newErrors.title = 'Title is required.';
      }
      if (!formData.grade || formData.grade.trim() === '') {
        hasErrors = true;
        newErrors.grade = 'Grade is required.';
      }
    }
    if (data.type === 'CitizenId') {
      if (!formData.personalIdentifier || formData.personalIdentifier.trim() === '') {
        hasErrors = true;
        newErrors.personalIdentifier = 'Personal Identifier is required.';
      }
      if (!formData.dateOfBirth || formData.dateOfBirth.trim() === '') {
        hasErrors = true;
        newErrors.dateOfBirth = 'Date Of Birth is required.';
      }
    }
    if (data.type === 'LicenseToPractice') {
      if (!formData.registrationNumber || formData.registrationNumber.trim() === '') {
        hasErrors = true;
        newErrors.registrationNumber = 'Registration Number is required.';
      }
      if (!formData.licenseCode || formData.licenseCode.trim() === '') {
        hasErrors = true;
        newErrors.licenseCode = 'License Code  is required.';
      }
      if (!formData.licensedFor || formData.licensedFor.trim() === '') {
        hasErrors = true;
        newErrors.licensedFor = 'Licensed For information is required.';
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
    } else {
      const formattedFormData: IVCIssueData = {
        validity: +formData.validityPeriod,
        vcdata: getVcdata() as IVCdataId | IVCDataDegree | IVCDataLicenseToPractice,
        deferred_id: data.deferred_id,
      };

      onIssueVC(formattedFormData);
      setErrors(null);
    }
  };

  return (
    <Paper elevation={3} style={{ padding: 50, marginTop: 50 }}>
      <Typography variant="h5" gutterBottom color={'orange'}>
        Data for new VC
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(formData).map(([property, value]) => {
          return (
            property !== 'deferred_id' && (
              <Grid item xs={12} key={property}>
                <TextField
                  label={transformString(property)}
                  value={formData[property as keyof VCIssueFormData] || ''}
                  onChange={(e) => handleChange(property as keyof VCIssueFormData, e.target.value)}
                  fullWidth
                  margin="normal"
                  required={true}
                  error={errors !== null && !!errors[property as keyof VCIssueFormErrors]} // Display error if present
                  helperText={errors !== null && errors[property as keyof VCIssueFormErrors]} // Display error message
                />
              </Grid>
            )
          );
        })}
      </Grid>
      <Grid container spacing={2} justifyContent="space-around" style={{ paddingTop: 30 }}>
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleIssueVC}>
            ISSUE VC
          </Button>
        </Grid>
        <Grid item>
          <Button variant="outlined" color="primary" onClick={handleDeleteReq}>
            DELETE REQ
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default VCIssueForm;

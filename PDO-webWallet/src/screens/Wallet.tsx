import React, {useEffect, useState} from 'react';
import WalletModel from '../models/WalletModel';
import {nanoid} from '@reduxjs/toolkit';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import Container from '@mui/material/Container';
import WalletCard from '../components/WalletCard';
import {CredentialStoredType, vcIssuer} from '../types/typeCredential';
import {useAppDispatch} from '../features/hooks';
import {credentialsAddAll} from '../features/credentialSlice';

interface PropsWallet {
  walletModel: WalletModel;
}

export type VCtype = {
  format: 'jwt_vc';
  credential: string;
};

export interface IVC {
  jti: string;
  sub: string;
  iss: string;
  nbf: number;
  exp: number;
  iat: number;
  vc: {
    '@context'?: [string];
    id: string;
    type: string[];
    issuer: string | vcIssuer;
    issuanceDate: Date;
    issued: Date;
    validFrom: Date;
    expirationDate?: Date;
    credentialSubject: {
      id: string;
      identifier?: {
        value: string;
      };
      personalIdentifier?: string;
      legalName?: string;
      productName?: string;
      allowedEvent?: string;
      lastInChain?: boolean;
      familyName?: string;
      firstName?: string;
      dateOfBirth?: string;
      registrationNumber?: string;
      licensedFor?: string[];
      licenseCode?: string;
      achieved?: [
        {
          id: string;
          title: string;
          wasDerivedFrom?: [
            {
              id: string;
              title: string;
              grade: string;
            }
          ];
        }
      ];
    };
    credentialSchema: {
      id: string;
      type: 'FullJsonSchemaValidator2021' | string;
    };
    termsOfUse?: {
      id: string;
      type: string;
    };
  };
}

export const vcCardTypes = {
  CITIZEN_ID: 'CitizenId',
  BACHELOR_DEGREE: 'bachelorDegree',
  WALLET_CREDENTIAL: 'WalletCredential',
  LICENSE_TO_PRACTICE: 'LicenseToPractice',
  LICENSE_TO_OPERATE: 'LicenseToOperate',
};

interface ICardsDisplay {
  id: [] | CredentialStoredType[];
  education: [] | CredentialStoredType[];
  selfCertificates: [] | CredentialStoredType[];
  professional: [] | CredentialStoredType[];
  issuanceCertificate: [] | CredentialStoredType[];
}

interface IElementMap {
  [key: string]: JSX.Element | undefined;
}

const Wallet = ({walletModel}: PropsWallet) => {
  const [vcArray, setVCArray] = useState<ICardsDisplay | null>(null);

  // const initState = () => {
  //   const storedVCs: CredentialStoredType[] = walletModel.getStoredCredentials();
  //   const dispatch = useAppDispatch();
  //   dispatch(credentialsAddAll(storedVCs));
  // }
  const dispatch = useAppDispatch();
  useEffect(() => {
    // let testCredentialsArray = [
    //   {
    //     id: '4ea48cfa3c80f378e66bc1c440792786d5bb9d88a9a8623cef16749f38bf24ae',
    //     jwt: 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRpZDplYnNpOnp2V0JuTkZzOWp3V2lSYmhyUjZSVloyI2tleXMtMyJ9.eyJqdGkiOiJ2YzpjeWVic2kjZDNjODNmY2UtZjNiMy00ZDIxLWI2ODctMDZiZGVlN2MxN2JhIiwic3ViIjoiZGlkOmtleTp6MmRtekQ4MWNnUHg4VmtpN0pidXVNbUZZcldQZ1lveXR5a1VaM2V5cWh0MWo5S2JuczhWOXkxREV5b1Y5blJSRXNCUzhNb3NQRHhmOFRaSzVCY3dLc1R2RlNkOUJiN3Q1TVlOcFRoNVdIdVlYRWlTR1NhWDlOUGZ4WjJadVJZTFJYMlhZQ0ZlTHB0Tko1OTUzc0tybllhVzJwazU3Y2tBRkR1cXdySEZTYzQzRVFpNmtMIiwiaXNzIjoiZGlkOmVic2k6enZXQm5ORnM5andXaVJiaHJSNlJWWjIiLCJuYmYiOjE3MTc1OTQ2MjUsImV4cCI6MTg3NTI3NDYyNSwiaWF0IjoxNzE3NTk0NjI1LCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJpZCI6InZjOmN5ZWJzaSNkM2M4M2ZjZS1mM2IzLTRkMjEtYjY4Ny0wNmJkZWU3YzE3YmEiLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiVmVyaWZpYWJsZUF0dGVzdGF0aW9uIiwiYmFjaGVsb3JEZWdyZWUiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOmVic2k6enZXQm5ORnM5andXaVJiaHJSNlJWWjIiLCJsZWdhbE5hbWUiOiJVbml2ZXJzaXR5IG9mIE5pY29zaWEifSwiaXNzdWFuY2VEYXRlIjoiMjAyNC0wNi0wNVQxNjozNzowNSIsImlzc3VlZCI6IjIwMjQtMDYtMDVUMTY6Mzc6MDUiLCJ2YWxpZEZyb20iOiIyMDI0LTA2LTA1VDE2OjM3OjA1IiwiZXhwaXJhdGlvbkRhdGUiOiIyMDI5LTA2LTA0VDE2OjM3OjA1IiwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJkaWQ6a2V5OnoyZG16RDgxY2dQeDhWa2k3SmJ1dU1tRllyV1BnWW95dHlrVVozZXlxaHQxajlLYm5zOFY5eTFERXlvVjluUlJFc0JTOE1vc1BEeGY4VFpLNUJjd0tzVHZGU2Q5QmI3dDVNWU5wVGg1V0h1WVhFaVNHU2FYOU5QZnhaMlp1UllMUlgyWFlDRmVMcHROSjU5NTNzS3JuWWFXMnBrNTdja0FGRHVxd3JIRlNjNDNFUWk2a0wiLCJpZGVudGlmaWVyIjp7InZhbHVlIjoiVU5JQy04ODg4In0sImZhbWlseU5hbWUiOiJDb25zdGFudGlub3UiLCJmaXJzdE5hbWUiOiJHZW9yZ2UiLCJhY2hpZXZlZCI6W3siaWQiOiJ1cm46ZXBhc3M6bGVhcm5pbmdBY2hpZXZlbWVudDoxIiwidGl0bGUiOiJCU2MgaW4gQ29tcHV0ZXIgU2NpZW5jZSIsIndhc0Rlcml2ZWRGcm9tIjpbeyJpZCI6InVybjplcGFzczphc3Nlc3NtZW50OjEiLCJ0aXRsZSI6Ik92ZXJhbGwgRGlwbG9tYSBBc3Nlc3NtZW50IiwiZ3JhZGUiOiJleGNlbGxlbnQgKDUpIn1dfV19LCJjcmVkZW50aWFsU2NoZW1hIjp7ImlkIjoiaHR0cHM6Ly9hcGktdGVzdC5lYnNpLmV1L3RydXN0ZWQtc2NoZW1hcy1yZWdpc3RyeS92Mi9zY2hlbWFzLzB4MjI2OTFmOWQxMTJmNDIxM2I3MTdhNmQ5NTRjMGZlNGE3ZDJkYmJiMTgzOWEzMWMyOWI0OGEzNWZkYTM2YjEzZiIsInR5cGUiOiJGdWxsSnNvblNjaGVtYVZhbGlkYXRvcjIwMjEifSwidGVybXNPZlVzZSI6eyJpZCI6Imh0dHBzOi8vYXBpLXBpbG90LmVic2kuZXUvdHJ1c3RlZC1pc3N1ZXJzLXJlZ2lzdHJ5L3Y0L2lzc3VlcnMvZGlkOmVic2k6enZXQm5ORnM5andXaVJiaHJSNlJWWjIvYXR0cmlidXRlcy8yYWYxM2ZjODc2YmEzYjUwNTI2NDk5ODA1OTYxN2M3YmU4NDdmZTJiOTVmZjgyOTQ2NDJkMWM0MGNjOGU5NTY2IiwidHlwZSI6Iklzc3VhbmNlQ2VydGlmaWNhdGUifX19.ciDP9hl6rhxype5eGwPknSMHgVAd5nPVIL6eHINBBYTFpl_NnXvhcENDMS22vZ6kDMhvzYVBeC6F8MMHQYfUrw',
    //     type: 'bachelorDegree',
    //     category: 'education',
    //     image: '/images/cardbachelorDegree.jpg',
    //     issuerName: 'University of Nicosia',
    //     issuer: {
    //       id: 'did:ebsi:zvWBnNFs9jwWiRbhrR6RVZ2',
    //       legalName: 'University of Nicosia',
    //     },
    //     issuerDID: 'did:ebsi:zvWBnNFs9jwWiRbhrR6RVZ2',
    //     issuanceDate: '2024-06-05T16:37:05',
    //     expirationDate: '2029-06-04T16:37:05',
    //     vcDetails: {
    //       ownerDID:
    //         'did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9Kbns8V9y1DEyoV9nRREsBS8MosPDxf8TZK5BcwKsTvFSd9Bb7t5MYNpTh5WHuYXEiSGSaX9NPfxZ2ZuRYLRX2XYCFeLptNJ5953sKrnYaW2pk57ckAFDuqwrHFSc43EQi6kL',
    //       familyName: 'Constantinou',
    //       firstName: 'George',
    //       identifier: 'UNIC-8888',
    //       title: 'BSc in Computer Science',
    //       grade: 'excellent (5)',
    //     },
    //   },
    // ];

    // walletModel.storeVerifiedCredentials(JSON.stringify(testCredentialsArray));

    const storedVCs1: CredentialStoredType[] = walletModel.getStoredCredentials();
    const storedVCs: CredentialStoredType[] | null =
      storedVCs1 && storedVCs1 !== null && storedVCs1.length > 0 ? storedVCs1 : null;
    console.log('local storage storedVCs:', storedVCs ? storedVCs : '');
    if (storedVCs) dispatch(credentialsAddAll(storedVCs));

    const typedCards =
      storedVCs &&
      storedVCs.reduce(
        (cardsDisplay, card) => {
          if (card.type === vcCardTypes.CITIZEN_ID) {
            cardsDisplay['id'].push(card);
            //dispatch(credentialAdded(card));
          } else if (card.type === vcCardTypes.BACHELOR_DEGREE) {
            cardsDisplay['education'].push(card);
            // dispatch(credentialAdded(card));
          } else if (card.type === vcCardTypes.LICENSE_TO_PRACTICE) {
            cardsDisplay['professional'].push(card);
          }
          // TODO once we have 3rd category
          // else if (card.type === vcCardTypes.WALLET_CREDENTIAL){
          //   cardsDisplay['selfCertificates'].push(card);
          // }
          // TODO to show error if type is not supported
          // else {}

          return cardsDisplay;
        },
        {
          id: [] as CredentialStoredType[],
          education: [] as CredentialStoredType[],
          selfCertificates: [] as CredentialStoredType[],
          professional: [] as CredentialStoredType[],
        }
      );

    console.log('typedCards in setVCArray: ', typedCards);

    setVCArray(typedCards as unknown as ICardsDisplay);
  }, []);

  console.log('typedCards in wallet: ', vcArray);

  return (
    <Container>
      <Box sx={{px: 6}}>
        <Typography
          sx={{textAlign: 'center'}}
          variant="h2"
          className="govcy-h2"
          fontWeight="fontWeightBold"
        >
          My wallet
        </Typography>
        {!vcArray ? (
          <Typography sx={{textAlign: 'center', py: 4, fontSize: '1.3rem'}}>
            You have no credentials. Please visit an issuers's site to request one.
          </Typography>
        ) : (
          <Grid
            container
            spacing={4}
            justifyContent="start"
            alignItems="center"
            paddingTop={'20px'}
          >
            {vcArray &&
              Object.keys(vcArray as ICardsDisplay).map((cardId) => {
                const cardTitle: IElementMap = {
                  id: (
                    <Grid xs={12}>
                      <Typography variant="h3" className="govcy-h3" fontWeight="fontWeightBold">
                        My identity credentials
                      </Typography>
                      <Typography fontSize={'1.4rem'}>
                        Prove things about yourself while protecting your data
                      </Typography>
                    </Grid>
                  ),
                  education: (
                    <Grid xs={12}>
                      <Typography variant="h3" className="govcy-h3" fontWeight="fontWeightBold">
                        My education credentials
                      </Typography>
                      <Typography>
                        University degrees and other diplomas you have obtained
                      </Typography>
                    </Grid>
                  ),
                  professional: (
                    <Grid xs={12}>
                      <Typography variant="h3" className="govcy-h3" fontWeight="fontWeightBold">
                        My professional credentials
                      </Typography>
                      <Typography>Prove things about your profession.</Typography>
                    </Grid>
                  ),
                  selfCertificates: (
                    <Grid xs={12}>
                      <Typography variant="h3" className="govcy-h3" fontWeight="fontWeightBold">
                        My self issued credentials
                      </Typography>
                      <Typography fontSize={'1.4rem'}>
                        Credentials that you have issued yourself.
                      </Typography>
                    </Grid>
                  ),
                };

                let areCardsPresent = vcArray && (vcArray as any)[cardId].length > 0 ? true : false;
                return (
                  areCardsPresent && (
                    <Grid
                      container
                      spacing={2}
                      sx={{px: 2, paddingTop: 3}}
                      key={nanoid()}
                      // display={'flex'}
                      // flexDirection={'column'}
                    >
                      {cardTitle[cardId] as JSX.Element}

                      {
                        // TODO resolve any to type like  ICardsDisplay[]
                        (vcArray as any)[cardId].map((c: CredentialStoredType) => {
                          return <WalletCard card={c} key={c.id} />;
                        })
                      }
                    </Grid>
                  )
                );
              })}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Wallet;

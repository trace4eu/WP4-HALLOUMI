import React from 'react';

import './govcy.uds.min.css';

const Footer = () => {
  return (
    <footer id="footerContainer" className="govcy-footer" style={{width: '100vw'}}>
      <div className="govcy-container">
        <div className="govcy-d-flex govcy-justify-content-between govcy-align-items-end govcy-flex-wrap">
          <div className="govcy-my-4">
            <ul>
              <li>
                <a
                  href="/privacy"
                  style={{
                    textDecoration: 'underline',
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  }}
                >
                  Privacy statement
                </a>
              </li>
              <li>
                <a
                  href="/cookie"
                  style={{
                    textDecoration: 'underline',
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  }}
                >
                  Cookie policy
                </a>
              </li>
              <li>
                <a
                  href="/accessibility"
                  style={{
                    textDecoration: 'underline',
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  }}
                >
                  Accessibility statement
                </a>
              </li>
            </ul>
            <div className="govcy-d-flex govcy-align-items-center govcy-flex-wrap">
              <span className="govcy-fs-2 govcy-fw-bold govcy-mr-6">gov.cx</span>
              <span className="govcy-mr-6 govcy-mt-2">&copy; Ministry of Agriculture, 2024</span>
              {/* <a href="https://europa.eu/" title="Go to EU Website" target="_blank"><img className="govcy-eu-logo" src="/assets/images/eu_cofounded_en.png" alt="Co-funded by the European Union"></a> */}
            </div>
          </div>
          {/* <div className="govcy-my-4">
                <a href="/" className="govcy-footer-logo" title="Go to the GOV.CY homepage"><img alt="gov.cy Logo"/></a>
            </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

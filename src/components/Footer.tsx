import React from 'react';
import { Grid, Column, Link as CarbonLink } from '@carbon/react';
import { Link } from 'react-router-dom';
import { 
  Chat, 
  LogoTwitter, 
  LogoFacebook, 
  LogoLinkedin, 
  LogoGithub,
  Email,
  Phone,
  Location,
  ChevronDown
} from '@carbon/icons-react';

export const Footer = () => {
  // State for mobile accordion sections
  const [openSection, setOpenSection] = React.useState<string | null>(null);

  // Toggle accordion section
  const toggleSection = (section: string) => {
    if (openSection === section) {
      setOpenSection(null);
    } else {
      setOpenSection(section);
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          {/* Main Footer Content */}
          <Grid>
            {/* Company Info */}
            <Column lg={8} md={4} sm={4} className="mb-8 md:mb-0">
              <div className="flex items-center gap-2 mb-6">
                <Chat size={32} className="text-blue-400" />
                <span className="cds--type-productive-heading-03">Mobiwave</span>
              </div>
              <p className="cds--type-body-01 text-gray-400 mb-6 max-w-md">
                The most reliable messaging platform for businesses of all sizes. 
                Send SMS, emails, and push notifications at scale.
              </p>
              
              {/* Contact Information */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Email size={20} className="text-blue-400" />
                  <CarbonLink href="mailto:info@mobiwave.io" className="text-gray-400 hover:text-white">
                    info@mobiwave.io
                  </CarbonLink>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-blue-400" />
                  <CarbonLink href="tel:+254700000000" className="text-gray-400 hover:text-white">
                    +254 700 000 000
                  </CarbonLink>
                </div>
                <div className="flex items-start gap-3">
                  <Location size={20} className="text-blue-400 flex-shrink-0 mt-1" />
                  <span className="cds--type-body-01 text-gray-400">
                    Westlands Business Park, Nairobi, Kenya
                  </span>
                </div>
              </div>
              
              {/* Social Media */}
              <div className="flex space-x-4">
                <CarbonLink href="https://twitter.com/mobiwave" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <LogoTwitter size={24} className="text-gray-400 hover:text-white cursor-pointer" />
                </CarbonLink>
                <CarbonLink href="https://facebook.com/mobiwave" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <LogoFacebook size={24} className="text-gray-400 hover:text-white cursor-pointer" />
                </CarbonLink>
                <CarbonLink href="https://linkedin.com/company/mobiwave" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <LogoLinkedin size={24} className="text-gray-400 hover:text-white cursor-pointer" />
                </CarbonLink>
                <CarbonLink href="https://github.com/mobiwave" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <LogoGithub size={24} className="text-gray-400 hover:text-white cursor-pointer" />
                </CarbonLink>
              </div>
            </Column>
            
            {/* Product Links - Desktop */}
            <Column lg={4} md={2} sm={0} className="hidden md:block">
              <h3 className="cds--type-productive-heading-02 mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/services" className="cds--type-body-01 text-gray-400 hover:text-white">Features</Link></li>
                <li><Link to="/pricing" className="cds--type-body-01 text-gray-400 hover:text-white">Pricing</Link></li>
                <li><CarbonLink href="https://docs.mobiwave.io" className="cds--type-body-01 text-gray-400 hover:text-white">API Docs</CarbonLink></li>
                <li><CarbonLink href="https://status.mobiwave.io" className="cds--type-body-01 text-gray-400 hover:text-white">Status</CarbonLink></li>
                <li><Link to="/help" className="cds--type-body-01 text-gray-400 hover:text-white">Support</Link></li>
              </ul>
            </Column>
            
            {/* Company Links - Desktop */}
            <Column lg={4} md={2} sm={0} className="hidden md:block">
              <h3 className="cds--type-productive-heading-02 mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="cds--type-body-01 text-gray-400 hover:text-white">About</Link></li>
                <li><CarbonLink href="https://blog.mobiwave.io" className="cds--type-body-01 text-gray-400 hover:text-white">Blog</CarbonLink></li>
                <li><Link to="/about#careers" className="cds--type-body-01 text-gray-400 hover:text-white">Careers</Link></li>
                <li><Link to="/contact" className="cds--type-body-01 text-gray-400 hover:text-white">Contact</Link></li>
                <li><Link to="/about#privacy" className="cds--type-body-01 text-gray-400 hover:text-white">Privacy</Link></li>
              </ul>
            </Column>
            
            {/* Mobile Accordion Sections */}
            <Column lg={0} md={0} sm={4} className="md:hidden space-y-4">
              {/* Product Section */}
              <div className="border-b border-gray-800 pb-4">
                <button 
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => toggleSection('product')}
                  aria-expanded={openSection === 'product'}
                >
                  <h3 className="cds--type-productive-heading-02">Product</h3>
                  <ChevronDown 
                    size={20}
                    className={`text-gray-400 transition-transform ${
                      openSection === 'product' ? 'transform rotate-180' : ''
                    }`} 
                  />
                </button>
                {openSection === 'product' && (
                  <ul className="space-y-2 mt-4 pl-2">
                    <li><Link to="/services" className="cds--type-body-01 text-gray-400 hover:text-white">Features</Link></li>
                    <li><Link to="/pricing" className="cds--type-body-01 text-gray-400 hover:text-white">Pricing</Link></li>
                    <li><CarbonLink href="https://docs.mobiwave.io" className="cds--type-body-01 text-gray-400 hover:text-white">API Docs</CarbonLink></li>
                    <li><CarbonLink href="https://status.mobiwave.io" className="cds--type-body-01 text-gray-400 hover:text-white">Status</CarbonLink></li>
                    <li><Link to="/help" className="cds--type-body-01 text-gray-400 hover:text-white">Support</Link></li>
                  </ul>
                )}
              </div>
              
              {/* Company Section */}
              <div className="border-b border-gray-800 pb-4">
                <button 
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => toggleSection('company')}
                  aria-expanded={openSection === 'company'}
                >
                  <h3 className="cds--type-productive-heading-02">Company</h3>
                  <ChevronDown 
                    size={20}
                    className={`text-gray-400 transition-transform ${
                      openSection === 'company' ? 'transform rotate-180' : ''
                    }`} 
                  />
                </button>
                {openSection === 'company' && (
                  <ul className="space-y-2 mt-4 pl-2">
                    <li><Link to="/about" className="cds--type-body-01 text-gray-400 hover:text-white">About</Link></li>
                    <li><CarbonLink href="https://blog.mobiwave.io" className="cds--type-body-01 text-gray-400 hover:text-white">Blog</CarbonLink></li>
                    <li><Link to="/about#careers" className="cds--type-body-01 text-gray-400 hover:text-white">Careers</Link></li>
                    <li><Link to="/contact" className="cds--type-body-01 text-gray-400 hover:text-white">Contact</Link></li>
                    <li><Link to="/about#privacy" className="cds--type-body-01 text-gray-400 hover:text-white">Privacy</Link></li>
                  </ul>
                )}
              </div>
            </Column>
          </Grid>
          
          {/* Footer Bottom */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <Grid>
              <Column lg={8} md={4} sm={4}>
                <p className="cds--type-body-01 text-gray-400 mb-4 md:mb-0">
                  © {new Date().getFullYear()} Mobiwave. All rights reserved.
                </p>
              </Column>
              <Column lg={8} md={4} sm={4}>
                <div className="flex flex-wrap justify-end gap-4 text-sm">
                  <Link to="/about#terms" className="cds--type-body-01 text-gray-400 hover:text-white">Terms of Service</Link>
                  <Link to="/about#privacy" className="cds--type-body-01 text-gray-400 hover:text-white">Privacy Policy</Link>
                  <Link to="/about#cookies" className="cds--type-body-01 text-gray-400 hover:text-white">Cookie Policy</Link>
                </div>
              </Column>
            </Grid>
          </div>
        </Column>
      </Grid>
    </footer>
  );
};

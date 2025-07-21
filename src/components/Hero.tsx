import React from 'react';
import { Button, Grid, Column } from '@carbon/react';
import { Link } from 'react-router-dom';
import { Chat, Email, Group } from '@carbon/icons-react';
import { useAuth } from './auth/AuthProvider';

export const Hero = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="carbon-layer py-16 md:py-20">
      <Grid>
        <Column lg={16} md={8} sm={4} className="text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="cds--type-display-04 carbon-text-primary mb-6 leading-tight">
              Powerful Messaging
              <span className="text-blue-600"> Platform</span>
            </h1>
            <p className="cds--type-expressive-heading-02 carbon-text-secondary mb-8 max-w-2xl mx-auto">
              Send SMS, emails, and push notifications at scale. Reach your audience instantly with our reliable messaging infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                kind="primary"
                size="lg"
                as={Link}
                to={isAuthenticated ? "/dashboard" : "/auth"}
                renderIcon={Chat}
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
              </Button>
              <Button
                kind="secondary"
                size="lg"
                as={Link}
                to="/services"
              >
                Learn More
              </Button>
            </div>
            
            <Grid className="mt-16">
              <Column lg={5} md={3} sm={4} className="mb-8 md:mb-0">
                <div className="flex items-center justify-center gap-3">
                  <Chat size={32} className="text-blue-600" />
                  <span className="cds--type-productive-heading-02">SMS Messaging</span>
                </div>
              </Column>
              <Column lg={5} md={3} sm={4} className="mb-8 md:mb-0">
                <div className="flex items-center justify-center gap-3">
                  <Email size={32} className="text-green-600" />
                  <span className="cds--type-productive-heading-02">Email Campaigns</span>
                </div>
              </Column>
              <Column lg={6} md={2} sm={4}>
                <div className="flex items-center justify-center gap-3">
                  <Group size={32} className="text-purple-600" />
                  <span className="cds--type-productive-heading-02">Bulk Messaging</span>
                </div>
              </Column>
            </Grid>
          </div>
        </Column>
      </Grid>
    </section>
  );
};
